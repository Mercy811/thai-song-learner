#!/usr/bin/env python3
"""
把 js/lessons-data.js 里的讲解段落 + 单词卡片，预先合成成真人感更强的语音文件，
存进 audio/lessons/ 下，网页播放时优先放这些文件，不用浏览器自带的机械语音。

用的是 edge-tts（https://github.com/rany2/edge-tts）—— 一个免费、不用 API Key
的第三方库，调的是 Microsoft Edge 浏览器「朗读」功能背后同一套神经网络语音，
音质比系统自带的 Web Speech API 好很多。

用法：
    pip install edge-tts
    python3 scripts/generate-lesson-audio.py

改了 js/lessons-data.js 的文字内容之后，重跑一遍这个脚本，把新内容对应的
音频文件更新掉就行——脚本每次都会全量重新生成，不用自己对着改了哪几条。
"""
import asyncio
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LESSONS_DATA = ROOT / "js" / "lessons-data.js"
AUDIO_DIR = ROOT / "audio" / "lessons"

ZH_VOICE = "zh-CN-XiaoxiaoNeural"
TH_VOICE = "th-TH-PremwadeeNeural"
CONCURRENCY = 8


def extract_manifest(only_lesson=None):
    """拿 Node 把 window.LESSONS 摊平成一份「要合成哪些片段」的清单——
    跟网页里 lessons.js 的 buildQueue() 逻辑保持一致：讲解段落整段一条，
    单词卡片拆成「泰语原词」+「中文联想」两条。"""
    script = r"""
    global.window = global;
    const fs = require('fs');
    eval(fs.readFileSync(process.argv[1], 'utf8'));
    const manifest = [];
    window.LESSONS.forEach(l => {
      l.blocks.forEach((b, bi) => {
        if (b.type === 'p') {
          manifest.push({ lesson: l.id, bi, kind: 'p', lang: 'zh', text: b.text });
        } else {
          if (b.th) manifest.push({ lesson: l.id, bi, kind: 'th', lang: 'th', text: b.th });
          if (b.hook) manifest.push({ lesson: l.id, bi, kind: 'hook', lang: 'zh', text: b.hook });
        }
      });
    });
    process.stdout.write(JSON.stringify(manifest));
    """
    out = subprocess.run(
        ["node", "-e", script, str(LESSONS_DATA)],
        capture_output=True, text=True, check=True,
    )
    manifest = json.loads(out.stdout)
    if only_lesson:
        manifest = [m for m in manifest if m["lesson"] == only_lesson]
    return manifest


async def synth_one(item, sem, edge_tts):
    async with sem:
        out_path = AUDIO_DIR / item["lesson"] / f"{item['bi']}-{item['kind']}.mp3"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        voice = TH_VOICE if item["lang"] == "th" else ZH_VOICE
        text = item["text"]
        if not text or not text.strip():
            return
        for attempt in range(3):
            try:
                communicate = edge_tts.Communicate(text, voice)
                await communicate.save(str(out_path))
                print(f"  ✓ {out_path.relative_to(ROOT)}")
                return
            except Exception as e:  # noqa: BLE001 — 网络请求，重试几次就够
                if attempt == 2:
                    print(f"  ✗ 失败：{out_path.relative_to(ROOT)} —— {e}", file=sys.stderr)
                else:
                    await asyncio.sleep(1.5)


async def main():
    try:
        import edge_tts
    except ImportError:
        print("先装依赖：pip install edge-tts", file=sys.stderr)
        sys.exit(1)

    only_lesson = sys.argv[1] if len(sys.argv) > 1 else None
    manifest = extract_manifest(only_lesson)
    print(f"共 {len(manifest)} 段要合成，并发 {CONCURRENCY}……")
    sem = asyncio.Semaphore(CONCURRENCY)
    await asyncio.gather(*(synth_one(item, sem, edge_tts) for item in manifest))
    print("全部完成。")


if __name__ == "__main__":
    asyncio.run(main())
