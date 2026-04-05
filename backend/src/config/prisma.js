// DB 연결 담당
// Prisma Client 초기화 (Prisma 7에서는 별도 설정 없이도 config.ts를 참조합니다)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;