const axios = require('axios');

const code = `import string

def get_text_insights(text):
    """
    Analyzes a string and returns a dictionary of statistical insights.
    """
    # 1. Handle Edge Cases (Empty Input)
    if not text or text.strip() == "":
        return {
            "error": "Input text is empty."
        }

    # 2. Calculate Sentence Count
    # We do this before cleaning because we need punctuation to find sentences.
    sentence_terminators = ['.', '!', '?']
    sentence_count = 0
    for char in text:
        if char in sentence_terminators:
            sentence_count += 1
    
    # Fallback: If text exists but has no punctuation, count as 1 sentence.
    if sentence_count == 0:
        sentence_count = 1

    # 3. Clean and Normalize Data
    # Convert to lowercase to ensure 'The' and 'the' are counted as the same word.
    text_lower = text.lower()
    
    # Remove punctuation using a translation table
    translator = str.maketrans('', '', string.punctuation)
    clean_text = text_lower.translate(translator)

    # 4. Tokenization (Split text into a list of words)
    words = clean_text.split()
    total_words = len(words)

    # Safety check for strings containing only symbols
    if total_words == 0:
        return {"error": "No valid words found."}

    # 5. Analyze Frequency and Length
    word_frequency = {}
    total_characters = 0

    for word in words:
        # Sum characters for average length calculation
        total_characters += len(word)
        
        # Build frequency dictionary
        if word in word_frequency:
            word_frequency[word] += 1
        else:
            word_frequency[word] = 1

    # Find the most common word
    most_common_word = max(word_frequency, key=word_frequency.get)
    most_common_count = word_frequency[most_common_word]

    # 6. Compile Results
    results = {
        "total_words": total_words,
        "total_sentences": sentence_count,
        "vocabulary_size": len(word_frequency),  # Unique words
        "avg_word_length": round(total_characters / total_words, 2),
        "most_common_word": (most_common_word, most_common_count)
    }

    return results

# --- Example Usage ---
sample_text = """
Python is an amazing programming language! It is great for data science. 
Do you like Python? Python is powerful.
"""

metrics = get_text_insights(sample_text)

# Print the results nicely
print("--- Text Analysis Results ---")
for key, value in metrics.items():
    print(f"{key.replace('_', ' ').title()}: {value}")`;

const testRequest = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/ai/feedback/direct',
      {
        submissionText: code,
        challengeContext: {
          title: 'Text Analysis Function',
          description:
            'Create a function that analyzes text and returns statistical insights.',
          requirements: 'Handle edge cases, calculate metrics, clean data',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testRequest();
