// Integration test for Prisma Submission/Feedback
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
});

describe('Prisma Submission/Feedback integration', () => {
  beforeAll(async () => {
    // Reset DB (for SQLite)
    await prisma.feedback.deleteMany();
    await prisma.submission.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates and retrieves Submission and Feedback', async () => {
    const submission = await prisma.submission.create({
      data: {
        title: 'Test Submission',
        description: 'Test description',
      },
    });
    const feedback = await prisma.feedback.create({
      data: {
        submissionId: submission.id,
        prompt: 'Evaluate this',
        responseRaw: '{"score":9}',
        responseJson: { score: 9 },
      },
    });
    const found = await prisma.feedback.findUnique({
      where: { id: feedback.id },
      include: { submission: true },
    });
    expect(found.submission.title).toBe('Test Submission');
    expect(found.responseJson.score).toBe(9);
  });
});
