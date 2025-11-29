import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

// UI Components
import { Alert, Badge, Button, Card, Input, Loading } from '../components/ui';

const AITutorPageModern = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  
  // State management
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);

  // Initialize chat session
  useEffect(() => {
    const initializeSession = () => {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      // Add welcome message
      setMessages([
        {
          id: '1',
          content: `Hello ${user?.firstName || user?.first_name || 'there'}! 👋 I'm your AI tutor. I'm here to help you with your learning journey. You can ask me about programming concepts, get help with challenges, or request personalized learning recommendations.`,
          isBot: true,
          timestamp: new Date(),
        }
      ]);
    };

    initializeSession();
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      content: currentMessage.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setError('');

    try {
      // Call AI feedback API
      const response = await apiService.ai.generateFeedback(
        currentMessage.trim(),
        {
          sessionId,
          userProfile: {
            id: user?.id,
            name: user?.firstName || user?.first_name,
            learningPreferences: user?.learningPreferences || [],
          }
        }
      );

      const botResponse = {
        id: `bot_${Date.now()}`,
        content: response.data?.feedback || response.data?.message || "I'm here to help! Could you please rephrase your question?",
        isBot: true,
        timestamp: new Date(),
        metadata: response.data?.metadata,
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (err) {
      console.error('AI Tutor error:', err);
      
      const errorResponse = {
        id: `error_${Date.now()}`,
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or try rephrasing your question.",
        isBot: true,
        timestamp: new Date(),
        isError: true,
      };

      setMessages(prev => [...prev, errorResponse]);
      setError('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: `Chat cleared! How can I help you today, ${user?.firstName || user?.first_name || 'learner'}?`,
        isBot: true,
        timestamp: new Date(),
      }
    ]);
    setError('');
  };

  const suggestedQuestions = [
    "Explain React hooks to me",
    "How do I optimize my JavaScript code?", 
    "What should I learn next based on my progress?",
    "Help me with algorithm challenges",
    "Give me a personalized study plan"
  ];

  const handleSuggestedQuestion = (question) => {
    setCurrentMessage(question);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page ai-tutor-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">AI Tutor</h1>
          <p className="page-subtitle">
            Get personalized help and feedback from your AI learning assistant
          </p>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={clearChat}>
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="ai-tutor-container">
        {/* Chat Interface */}
        <Card className="chat-card">
          <Card.Header>
            <div className="chat-header">
              <div className="ai-avatar">🤖</div>
              <div>
                <h3>AI Learning Assistant</h3>
                <Badge variant="success" size="small">Online</Badge>
              </div>
            </div>
          </Card.Header>

          <Card.Content className="chat-content">
            <div className="messages-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.isBot ? 'bot-message' : 'user-message'} ${
                    message.isError ? 'error-message' : ''
                  }`}
                >
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-timestamp">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message bot-message">
                  <div className="message-content">
                    <Loading size="small" text="AI is thinking..." />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </Card.Content>

          <Card.Footer>
            <div className="chat-input-container">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question here..."
                className="chat-input"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isLoading}
                className="send-button"
              >
                Send
              </Button>
            </div>
          </Card.Footer>
        </Card>

        {/* Suggested Questions */}
        <Card className="suggestions-card">
          <Card.Header>
            <h3>Suggested Questions</h3>
          </Card.Header>
          <Card.Content>
            <div className="suggestions-list">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="suggestion-button"
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Features Info */}
        <Card className="features-card">
          <Card.Header>
            <h3>What I Can Help With</h3>
          </Card.Header>
          <Card.Content>
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">💡</div>
                <div>
                  <h4>Concept Explanations</h4>
                  <p>Get clear explanations of programming concepts and theories</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <div>
                  <h4>Personalized Guidance</h4>
                  <p>Receive customized learning paths based on your progress</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🔍</div>
                <div>
                  <h4>Code Review</h4>
                  <p>Get feedback on your code and suggestions for improvement</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">📚</div>
                <div>
                  <h4>Study Plans</h4>
                  <p>Get structured learning plans tailored to your goals</p>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default AITutorPageModern;