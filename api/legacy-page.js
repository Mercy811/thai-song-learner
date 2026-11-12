'use strict';

// 旧的 /?page=lessons|freq|science 要 301 到干净路径。
// vercel.json 的 Location 会被边缘节点补上原始查询串，所以改由这个函数自己写 Location。
const DEST = {
  lessons: '/lessons',
  freq: '/freq',
  science: '/science',
};

module.exports = (req, res) => {
  const to = DEST[req.query && req.query.to];
  if (!to) {
    res.statusCode = 404;
    res.end('not found');
    return;
  }
  res.statusCode = 301;
  res.setHeader('Location', to);
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.end();
};
