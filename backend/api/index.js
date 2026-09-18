// Vercel 서버리스 함수 진입점
// backend/src/app.js가 export하는 Express 앱을 그대로 재노출한다.
// app.listen()을 호출하는 src/server.js는 로컬 전용 엔트리포인트이며,
// Vercel은 요청마다 이 핸들러(Express app)를 직접 호출하므로 listen()이
// 필요 없다 (Express app 자체가 (req, res) => {...} 형태의 요청 핸들러라
// Vercel의 Node.js 런타임과 그대로 호환된다).
module.exports = require('../src/app');
