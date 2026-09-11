const { PrismaClient } = require('./apps/api/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const doc = await prisma.document.findFirst({ where: { displayName: { contains: 'lich-su-dang' } } });
  if (!doc) return console.log('Doc not found');
  const sections = await prisma.documentSection.findMany({ where: { documentId: doc.id }, take: 10 });
  sections.forEach(s => console.log('Title:', s.title, '| Content:', s.contentText.substring(0, 100).replace(/\n/g, ' ')));
}
main().finally(() => prisma.$disconnect());
