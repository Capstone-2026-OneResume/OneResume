// 이메일 발송 담당, 메일 전송을 위한 Nodemailer 설정
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, //	이메일 주소
    pass: process.env.EMAIL_PASS, //	앱 비밀번호 (2FA 설정된 계정의 경우)
  },
});
module.exports = transporter;