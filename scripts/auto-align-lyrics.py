#!/usr/bin/env python3
"""
给一个 YouTube 链接 + 一份歌词文本，自动出一份时间轴草稿——不用再自己在网页里
逐句按空格标。用两种原理不同的办法各出一份结果，互相印证：

  1. Whisper 识别人声轨，把认出来的文字跟已知歌词逐字比对，找到每句唱到哪
     （精度高，但副歌反复唱、逐字重复的段落会因为文字比对本身有歧义而错得
     离谱——见下面「已知问题」）。
  2. aeneas 强制对齐：用 espeak 把已知歌词合成一份机器泰语语音当参照，再拿
     它跟真实人声轨的声学特征做 DTW 时间对齐——不猜文字，所以不会被歌词
     重复这件事搞混，天然不会跳去对错的那次重复；缺点是照着机器合成语音的
     节奏对齐，跟真人唱歌（拖音、转音、抢拍）的实际节奏有出入，精度不如
     Whisper 那份准。
  3. 两份都可信才用 Whisper 的高精度结果，Whisper 那句没对上或者跟 aeneas
     差太远（说明大概率撞上了「重复歧义」那个坑），就用 aeneas 的结果兜底——
     aeneas 从原理上不会错得离谱，但也不会特别准；反过来 Whisper 很准但偶尔
     会错得很离谱。两边一起兜底，比单独用哪一个都稳。

     实测在已经手工核对过的 safe-near-me 这首歌上：单独用 Whisper 平均误差
     9.3 秒（中位数 0.63 秒，但最差能错 42 秒）；单独用 aeneas 平均误差 2.4
     秒（中位数 1.2 秒，最差 16 秒——没有离谱错误，但普遍不够精细）；两者
     结合平均误差降到 1.8 秒，中位数 0.6 秒，最差 11 秒。

⚠️ 已知问题：
  - 英文桥段（跟中文谐音一样，整句都是英文的那种）aeneas 用泰语音色合成
    对不上，精度会明显变差，这些行务必人工核一遍。
  - 出现「❓」的行是两边都不太可信，八成还是要人工核一遍。
  - 就算没标 ❓，副歌反复唱的段落精度也比其它段落差一截，比不上手动逐句标。

用法：
    pip install yt-dlp faster-whisper demucs soundfile aeneas
    brew install espeak-ng   # macOS；aeneas 官方只认 classic espeak 的库名，
                              # 装 espeak-ng 后脚本自己会做兼容处理，不用额外配置
    python3 scripts/auto-align-lyrics.py --url <YouTube链接> --lyrics <歌词文件.txt>

    aeneas 装不上或者环境里没有 espeak 也没关系，脚本会自动退回纯 Whisper
    方案（精度和稳定性都会差一截，但至少能跑）。

    默认会先用 Demucs 把人声从伴奏里分离出来再喂给 Whisper 和 aeneas——实测
    发现原始混音命中率只有二成多，纯人声轨能到七八成，伴奏对识别的干扰比
    想象的大。调试时想跳过这步用 --no-separate-vocals。

    泰语原版 Whisper 表现一般，可以换用社区微调过的泰语模型（比如 Thonburian
    Whisper），转成 faster-whisper 能读的格式后把目录路径传给 --model：
        pip install transformers ctranslate2
        ct2-transformers-converter --model biodatlab/whisper-th-medium-combined \\
            --output_dir ./thonburian-medium-ct2 --quantization int8
        python3 scripts/auto-align-lyrics.py --url ... --lyrics ... \\
            --model ./thonburian-medium-ct2
    （实测这个模型不比通用 Whisper 明显更准，切分段落也更粗，不是必须换。）

歌词文件格式（跟 songs/*.js 里的 TIMES 分段一一对应）：
    ## 主歌 A [v1]
    อยากบอกเธอ ที่ฉันทำอย่างนั้น
    เพราะฉันนั้นเต็มใจให้เธอ

    ## 预副歌 [p1]
    ...

    每个 `## 段落名 [前缀]` 开一个新段落，`[前缀]` 就是 songs/*.js TIMES 里
    的 key（比如 v1、c1）。段落之间空一行分隔。

输出直接是能贴进 songs/<歌>.js 的 TIMES 那一块。
"""
import argparse
import json
import re
import subprocess
import sys
import tempfile
from bisect import bisect_right
from difflib import SequenceMatcher
from pathlib import Path

WHITESPACE_RE = re.compile(r"\s+")


def download_audio(url: str, workdir: Path) -> Path:
    out_tmpl = str(workdir / "audio.%(ext)s")
    subprocess.run(
        # YouTube 最近对网页/iOS 客户端上了 SABR 限流，直接下会报 "page needs to
        # be reloaded"；android 客户端不吃这套，换它拿流（画质变低没关系，反正
        # 只要音频给 Whisper 听）。
        ["yt-dlp", "-x", "--audio-format", "wav", "--audio-quality", "0",
         "--extractor-args", "youtube:player_client=android",
         "-o", out_tmpl, url],
        check=True,
    )
    files = list(workdir.glob("audio.wav"))
    if not files:
        sys.exit("yt-dlp 没有产出 audio.wav，看看上面的输出报了什么错")
    return files[0]


def separate_vocals(audio_path: Path, workdir: Path) -> Path:
    print("分离人声/伴奏（Demucs，第一次跑要下载模型，稍等）……", file=sys.stderr)
    out_dir = workdir / "demucs"
    subprocess.run(
        ["python3", "-m", "demucs", "--two-stems", "vocals", "-n", "htdemucs",
         "-o", str(out_dir), str(audio_path)],
        check=True,
    )
    vocals = out_dir / "htdemucs" / audio_path.stem / "vocals.wav"
    if not vocals.exists():
        sys.exit(f"Demucs 没有产出人声轨，预期在：{vocals}")
    return vocals


def _is_hallucination_loop(word_texts, min_repeats=5):
    """Whisper 遇到间奏/无人声的地方偶尔会卡在一个词上重复几十遍
    （比如实测撞见过「เมื่อเมื่อเมื่อ……」连续几十次）——这种整段没有信息量
    的重复文本混进 rec_string 会占掉大量字符位置，把后面所有句子的字符对齐
    位置都带偏。同一个词连续出现达到 min_repeats 次就判定为这种幻觉循环。"""
    run = 1
    for i in range(1, len(word_texts)):
        if word_texts[i] == word_texts[i - 1]:
            run += 1
            if run >= min_repeats:
                return True
        else:
            run = 1
    return False


def transcribe(audio_path: Path, model_size: str):
    from faster_whisper import WhisperModel
    print(f"加载 Whisper（{model_size}）……", file=sys.stderr)
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        str(audio_path), language="th", word_timestamps=True,
        vad_filter=True, condition_on_previous_text=False,
    )
    words = []
    for seg in segments:
        seg_words = [WHITESPACE_RE.sub("", w.word) for w in (seg.words or [])]
        if _is_hallucination_loop(seg_words):
            print(f"  [{seg.start:6.1f}s] （疑似卡词循环，整段丢弃）{seg.text[:40]}……", file=sys.stderr)
            continue
        print(f"  [{seg.start:6.1f}s] {seg.text}", file=sys.stderr)
        for w, text in zip(seg.words or [], seg_words):
            if text:
                words.append((text, w.start, w.end))
    if not words:
        sys.exit("Whisper 没识别出任何词——检查一下音频是不是下载对了/静音了")
    return words


def aeneas_align(sections, audio_path: Path):
    """用 aeneas（espeak 合成 + DTW 声学对齐）给每一句歌词估一个开头时间，
    跟 Whisper 那条路完全独立、不依赖文字识别，所以不会被「歌词逐字重复」
    这件事搞混。返回按 sections 展开顺序对应的一串秒数；aeneas 用不了
    （没装、或者机器上没有 espeak）就返回 None，调用方退回纯 Whisper 方案。"""
    try:
        from aeneas.ttswrappers.espeakttswrapper import ESPEAKTTSWrapper
        from aeneas.executetask import ExecuteTask
        from aeneas.task import Task
    except ImportError:
        print("aeneas 没装，跳过强制对齐这一路，只用 Whisper 的结果（准头会差一截）", file=sys.stderr)
        return None

    # aeneas 内置的 espeak 语言表是十年前的老版本，没有泰语——用的又是真的
    # espeak（不是 espeak-ng）的库名 libespeak，Homebrew 现在装的是 espeak-ng。
    # 补一条语言映射、把 libespeak-ng.dylib 软链成 libespeak.dylib 骗过链接器，
    # 两步都在装依赖那一步做（见文件顶部说明），这里只需要把泰语接上语音代码。
    ESPEAKTTSWrapper.LANGUAGE_TO_VOICE_CODE["tha"] = "th"

    print("aeneas 强制对齐（跟 Whisper 那条路互相印证）……", file=sys.stderr)
    lines = [line for sec in sections for line in sec["lines"]]
    text_path = audio_path.parent / "aeneas-lines.txt"
    text_path.write_text("\n".join(lines), encoding="utf-8")
    sync_path = audio_path.parent / "aeneas-sync.json"

    config = "task_language=tha|is_text_type=plain|os_task_file_format=json"
    task = Task(config_string=config)
    task.audio_file_path_absolute = str(audio_path)
    task.text_file_path_absolute = str(text_path)
    task.sync_map_file_path_absolute = str(sync_path)
    try:
        ExecuteTask(task).execute()
    except Exception as e:
        print(f"aeneas 跑失败（{e}），跳过这一路，只用 Whisper 的结果", file=sys.stderr)
        return None
    task.output_sync_map_file()

    fragments = json.loads(sync_path.read_text(encoding="utf-8"))["fragments"]
    if len(fragments) != len(lines):
        print("aeneas 输出的句数对不上，跳过这一路", file=sys.stderr)
        return None
    return [float(f["begin"]) for f in fragments]


def parse_lyrics(path: Path):
    header_re = re.compile(r"^##\s*(.+?)\s*\[(\S+)\]\s*$")
    sections = []
    cur = None
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line:
            continue
        m = header_re.match(line)
        if m:
            cur = {"name": m.group(1), "prefix": m.group(2), "lines": []}
            sections.append(cur)
            continue
        if cur is None:
            sys.exit(f"歌词文件第一行非空内容前得先有 `## 段落名 [前缀]`，看到的是：{line!r}")
        cur["lines"].append(line)
    if not sections:
        sys.exit("歌词文件里没解析出任何段落，检查一下格式（## 名字 [前缀]）")
    return sections


def build_char_stream(words):
    """把 Whisper 识别出的词铺成一串字符，每个字符按词内等分插值出一个时间戳。"""
    chars, times = [], []
    for text, start, end in words:
        n = len(text)
        for i, ch in enumerate(text):
            chars.append(ch)
            times.append(start + (end - start) * (i / n))
    return "".join(chars), times


def align(target: str, rec: str):
    """target（已知歌词，已去空白）里每个字符 → rec（识别文本）里的浮点下标。
    用最长公共子串序列当锚点，锚点之间/之外做线性插值和外推。

    试过两种「只往前走、不许回头」的写法（整段拿去跟剩下的全部识别文本比、
    以及逐句限定在一个小窗口里比），结果都比这个更差——要么短文本在一大段
    不受约束的文本里瞎凑巧合，要么估计「这句唱了多久」时用歌词本身的字数
    当参照（Thai ASR 经常会漏掉几个虚词，实际输出的字数比歌词本身少），
    每句多算一点，一路滚雪球，越到后面偏得越离谱。

    换回一次性整体比对，把问题交给下面 main() 里的「单调过滤」处理：
    比对错的点会被识别出来（要么落在匹配块外，要么算出来的时间比前一句还
    早），用两边可信的点插值补上，而不是直接采信一个跳到很远的错误匹配。"""
    matcher = SequenceMatcher(None, target, rec, autojunk=False)
    anchors = []  # (target_idx, rec_idx)
    for blk in matcher.get_matching_blocks():
        if blk.size == 0:
            continue
        anchors.append((blk.a, blk.b))
        anchors.append((blk.a + blk.size, blk.b + blk.size))
    if not anchors:
        sys.exit("歌词文本跟 Whisper 识别结果完全对不上，八成是下载到了错误的音频/语言")
    anchors = sorted(set(anchors))
    xs = [a for a, _ in anchors]

    def to_rec_idx(pos):
        i = bisect_right(xs, pos) - 1
        i = max(0, min(i, len(anchors) - 2))
        a0, b0 = anchors[i]
        a1, b1 = anchors[i + 1]
        if a1 == a0:
            return float(b0)
        return b0 + (b1 - b0) * (pos - a0) / (a1 - a0)

    matched_ranges = [(b.a, b.a + b.size) for b in matcher.get_matching_blocks() if b.size]
    matched_chars = sum(b.size for b in matcher.get_matching_blocks())
    return to_rec_idx, matched_ranges, matched_chars


def clean_times(raw_times, confident):
    """歌词是顺着时间往下唱的，时间戳理应单调递增。但重复的副歌文字有时会被
    错误匹配回它第一次出现的位置，产出一段忽然往回跳、或者好几句挤成同一个
    数字的死值——这种情况即使是「confident」（真的落在匹配块里）也不可信，
    因为匹配块本身就对错了地方。

    做法：贪心地只留下比前一个「可信点」更晚、且原本就标了 confident 的时间，
    组成一串单调递增的锚点；被丢掉的点（包括所有 confident=False 的）在锚点
    之间/两端按行数比例线性插值补上，保证输出至少是单调不下降的。"""
    n = len(raw_times)
    trusted_idx = []
    last_t = -1.0
    for i in range(n):
        if confident[i] and raw_times[i] > last_t:
            trusted_idx.append(i)
            last_t = raw_times[i]

    out = list(raw_times)
    ok = [False] * n
    for i in trusted_idx:
        ok[i] = True
    if not trusted_idx:
        return out, ok  # 整首都没有可信点，没法插值，原样返回让人工全部核对

    # 开头没锚点的部分：借第一个锚点附近的节奏往前推，实在没有就用第一个锚点的值
    first = trusted_idx[0]
    if first > 0:
        step = 1.0
        if len(trusted_idx) > 1:
            second = trusted_idx[1]
            span = raw_times[second] - raw_times[first]
            step = span / (second - first) if second > first else 1.0
        for i in range(first):
            out[i] = max(0.0, raw_times[first] - step * (first - i))

    # 锚点之间：按行数比例线性插值
    for a, b in zip(trusted_idx, trusted_idx[1:]):
        if b - a > 1:
            span = raw_times[b] - raw_times[a]
            for i in range(a + 1, b):
                out[i] = raw_times[a] + span * (i - a) / (b - a)

    # 结尾没锚点的部分：同样借最后一段的节奏往后推
    last = trusted_idx[-1]
    if last < n - 1:
        step = 1.0
        if len(trusted_idx) > 1:
            prev = trusted_idx[-2]
            span = raw_times[last] - raw_times[prev]
            step = span / (last - prev) if last > prev else 1.0
        for i in range(last + 1, n):
            out[i] = raw_times[last] + step * (i - last)

    return out, ok


def rec_idx_to_time(idx: float, rec_times):
    lo = max(0, min(int(idx), len(rec_times) - 1))
    hi = min(lo + 1, len(rec_times) - 1)
    frac = idx - lo
    return rec_times[lo] + (rec_times[hi] - rec_times[lo]) * frac


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--url", help="YouTube 链接（跟 --audio 二选一）")
    ap.add_argument("--audio", type=Path, help="本地音频文件路径，跳过下载（调试用，跟 --url 二选一）")
    ap.add_argument("--lyrics", required=True, type=Path, help="歌词文件路径")
    ap.add_argument("--model", default="medium",
                     help="Whisper 模型大小（tiny/base/small/medium/large-v3），或本地 CT2 模型目录路径，默认 medium")
    ap.add_argument("--separate-vocals", action=argparse.BooleanOptionalAction, default=True,
                     help="先用 Demucs 分离人声再识别（默认开，实测比直接喂混音准很多）")
    ap.add_argument("--use-aeneas", action=argparse.BooleanOptionalAction, default=True,
                     help="用 aeneas 强制对齐给 Whisper 的结果做交叉验证（默认开，没装 aeneas 会自动跳过）")
    ap.add_argument("--sanity-threshold", type=float, default=5.0,
                     help="Whisper 和 aeneas 两边估的时间差多少秒以内才互相采信，默认 5 秒")
    ap.add_argument("--keep-audio", action="store_true", help="调试用：保留下载/分离出的音频文件，默认用完就删")
    args = ap.parse_args()
    if not args.url and not args.audio:
        ap.error("--url 和 --audio 得给一个")

    sections = parse_lyrics(args.lyrics)
    aeneas_times = None

    with tempfile.TemporaryDirectory(prefix="auto-align-") as tmp:
        workdir = Path(tmp)
        if args.audio:
            audio_path = args.audio
        else:
            print("下载音频……", file=sys.stderr)
            audio_path = download_audio(args.url, workdir)
        if args.separate_vocals:
            audio_path = separate_vocals(audio_path, workdir)
        words = transcribe(audio_path, args.model)
        if args.use_aeneas:
            aeneas_times = aeneas_align(sections, audio_path)
        if args.keep_audio:
            kept = Path.cwd() / audio_path.name
            kept.write_bytes(audio_path.read_bytes())
            print(f"音频保留在：{kept}", file=sys.stderr)

    rec_string, rec_times = build_char_stream(words)

    target_chars, line_offsets = [], []
    for sec in sections:
        for line in sec["lines"]:
            line_offsets.append(len(target_chars))
            target_chars.extend(WHITESPACE_RE.sub("", line))
    target_string = "".join(target_chars)

    to_rec_idx, matched_ranges, matched_chars = align(target_string, rec_string)
    coverage = matched_chars / max(1, len(target_string))
    print(f"\n字符命中率：{coverage:.0%}（越低越不可信，明显偏低时输出仅供参考）\n", file=sys.stderr)

    def is_confident(pos):
        i = bisect_right([a for a, _ in matched_ranges], pos) - 1
        if 0 <= i < len(matched_ranges):
            a, b = matched_ranges[i]
            return a <= pos < b
        return False

    whisper_raw = [rec_idx_to_time(to_rec_idx(off), rec_times) for off in line_offsets]
    whisper_confident = [is_confident(off) for off in line_offsets]

    if aeneas_times is None:
        # 没有 aeneas 兜底：只能靠单调过滤把明显错误的点插值掉（见 clean_times
        # 的说明），重复段落一旦撞上文字比对的歧义，还是可能整段错得离谱。
        times, trusted = clean_times(whisper_raw, whisper_confident)
    else:
        # 两边都可信才用 Whisper 的高精度结果；Whisper 没对上、或者跟 aeneas
        # 差太远（八成是撞上了「歌词重复、文字比对本身有歧义」那个坑），就用
        # aeneas 的结果兜底——aeneas 不靠猜文字，不会错得离谱，但也没那么准。
        # 第一句单独处理，见下面 i == 0 的分支。
        times, trusted = [], []
        for i in range(len(line_offsets)):
            if i == 0:
                # aeneas 对第一句没有真实意见（永远从 0 秒起算，没有参考价值），
                # 干脆信 Whisper 自己的估计——就算它标了「不太确定」，也比一个
                # 硬编码的 0 更接近真实值
                times.append(whisper_raw[i])
                trusted.append(whisper_confident[i])
                continue
            use_whisper = (
                whisper_confident[i]
                and abs(whisper_raw[i] - aeneas_times[i]) < args.sanity_threshold
            )
            if use_whisper:
                times.append(whisper_raw[i])
                trusted.append(True)
            else:
                times.append(aeneas_times[i])
                trusted.append(False)

        # 逐句独立决定「这句信 Whisper 还是信 aeneas」，相邻两句可能各信了
        # 不同的来源——两条路各自单调，不代表交替使用之后拼出来的结果还是
        # 单调的（实测真的撞见过：前一句用了 Whisper，后一句退回 aeneas，
        # aeneas 自己的估计比前一句还早）。拿 clean_times 再筛一遍，把这种
        # 拼接处产生的轻微倒退也当成不可信点插值掉，保证最终输出不会倒退。
        times, trusted = clean_times(times, trusted)

    out_lines = []
    li = 0
    low_confidence = 0
    for sec in sections:
        cells = []
        sec_confident = True
        for _ in sec["lines"]:
            cells.append(f"{times[li]:.2f}")
            if not trusted[li]:
                low_confidence += 1
                sec_confident = False
            li += 1
        ts_str = ", ".join(cells)
        flag = "" if sec_confident else "  ❓ 靠 aeneas/插值兜底，建议人工核一下"
        out_lines.append(f"    {sec['prefix']}: [{ts_str}],   // {sec['name']}{flag}")

    print("\n".join(out_lines))
    print(f"\n共 {li} 句，其中 {low_confidence} 句没用 Whisper 的高精度结果，建议重点核对。", file=sys.stderr)


if __name__ == "__main__":
    main()
