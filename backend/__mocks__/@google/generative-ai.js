// Mock for @google/generative-ai
const mockGenerateContent = jest.fn().mockResolvedValue({
  response: {
    text: () => JSON.stringify({ title: 'Mock Challenge', questions: [] }),
  },
});

const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
}));

const GoogleGenerativeAI = jest.fn().mockImplementation(() => ({
  getGenerativeModel: mockGetGenerativeModel,
}));

module.exports = {
  GoogleGenerativeAI,
  mockGenerateContent,
  mockGetGenerativeModel,
};
