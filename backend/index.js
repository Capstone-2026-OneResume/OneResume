const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(express.json()); // 프론트에서 보낸 JSON 데이터를 읽기 위해 필수.

app.post('/api/save-resume', (req, res) => {
	const { name, email, education, skills } = req.body; //프론트에서 보낸 데이터 추출
	
	console.log('--- 새로운 이력서 데이터 접수 ---');
	console.log('이름', name);
	console.log('이메일', emial);
	console.log('학력:', education);
	console.log('기술:', skills);

	//지금은 DB가 없으니까 일단 잘 받았다고 응답.
	res.json({
		message: '${name}님의 이력서(학력: ${education}) 데이터가 서버에 잘 전달되었습니다!'
	});
});

app.get('/', (req, res) => {
  res.send('백엔드 서버가 아주 잘 돌아가고 있습니다!');
});

app.listen(port, () => {
	console.log('서버가 실행중 http://localhost:${port}');
});