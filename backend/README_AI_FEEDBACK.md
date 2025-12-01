# AI Feedback & Submission Persistence

## Migration Steps

1. Edit `backend/prisma/schema.prisma` and add the following models:

```prisma
model Submission {
  id          Int        @id @default(autoincrement())
  userId      Int?
  title       String
  description String
  filePath    String?
  createdAt   DateTime   @default(now())
  feedback    Feedback[]
}

model Feedback {
  id           Int         @id @default(autoincrement())
  submissionId Int
  prompt       String      @db.Text
  responseRaw  String      @db.Text
  responseJson Json?
  createdAt    DateTime    @default(now())
  submission   Submission  @relation(fields: [submissionId], references: [id])
}
```

2. Run the migration:

```sh
cd backend
npx prisma migrate dev --name add_ai_feedback
```

3. (Optional) Generate the Prisma client:

```sh
npx prisma generate
```

## Sample Prisma Usage

```js
// Create a submission
const submission = await prisma.submission.create({
  data: {
    userId: 1,
    title: 'My Solution',
    description: 'My approach...',
    filePath: '/uploads/solution.js',
  },
});

// Create feedback for the submission
const feedback = await prisma.feedback.create({
  data: {
    submissionId: submission.id,
    prompt: 'Evaluate the following...',
    responseRaw: '{ "score": 8, ... }',
    responseJson: { score: 8, summary: '...', strengths: [], improvements: [] },
  },
});
```

## Testing

- Use a test database (e.g., SQLite in-memory) for integration tests.
- Example:

```js
const testSubmission = await prisma.submission.create({ data: { title: 'Test', description: 'desc' } });
const testFeedback = await prisma.feedback.create({ data: { submissionId: testSubmission.id, prompt: '...', responseRaw: '{}', responseJson: {} } });
const found = await prisma.feedback.findUnique({ where: { id: testFeedback.id }, include: { submission: true } });
expect(found.submission.title).toBe('Test');
```
