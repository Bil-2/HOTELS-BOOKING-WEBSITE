import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AIAssistant.css';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  const [assistantStats, setAssistantStats] = useState({
    totalSessions: 0,
    activeChats: 0,
    avgResponseTime: 0,
    satisfactionRate: 0
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchAssistantStats();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAssistantStats = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/ai-assistant/stats');
      if (response.data.success) {
        setAssistantStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const startSession = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      toast.error('Please provide your name and email to start');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/ai-assistant/start-session', {
        customerInfo
      });

      if (response.data.success) {
        setSessionId(response.data.sessionId);
        setIsConnected(true);
        setShowCustomerForm(false);

        // Add welcome message
        const welcomeMessage = {
          id: Date.now(),
          text: `Hello ${customerInfo.name}! I'm your AI assistant for Hotel Royal Palace. How can I help you today?`,
          sender: 'ai',
          timestamp: new Date(),
          intent: 'greeting'
        };

        setMessages([welcomeMessage]);
        toast.success('Connected to AI Assistant');

        // Focus input after connection
        setTimeout(() => inputRef.current?.focus(), 500);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to connect to AI Assistant');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/ai-assistant/send-message', {
        sessionId,
        message: inputMessage,
        customerInfo
      });

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          sender: 'ai',
          timestamp: new Date(),
          intent: response.data.intent,
          confidence: response.data.confidence
        };

        setMessages(prev => [...prev, aiMessage]);

        // Handle escalation if needed
        if (response.data.escalated) {
          toast.info('Your query has been escalated to human support');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again or contact our support team.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      await axios.post('http://localhost:5001/api/ai-assistant/end-session', {
        sessionId,
        feedback: { rating: 5, comment: 'Session ended by user' }
      });

      setIsConnected(false);
      setSessionId(null);
      setMessages([]);
      setShowCustomerForm(true);
      setCustomerInfo({ name: '', email: '', phone: '' });
      toast.success('Session ended successfully');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const quickActions = [
    { text: 'Check room availability', icon: 'fa-bed' },
    { text: 'Make a reservation', icon: 'fa-calendar-plus' },
    { text: 'View hotel amenities', icon: 'fa-swimming-pool' },
    { text: 'Contact information', icon: 'fa-phone' },
    { text: 'Cancellation policy', icon: 'fa-info-circle' },
    { text: 'Speak to human agent', icon: 'fa-user-headset' }
  ];

  return (
    <div className="ai-assistant">
      {/* Header */}
      <div className="assistant-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="header-content">
                <h1 className="header-title">
                  <i className="fas fa-robot me-3"></i>
                  AI Assistant
                </h1>
                <p className="header-subtitle">
                  24/7 Intelligent Customer Support for Hotel Royal Palace
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{assistantStats.totalSessions}</div>
                  <div className="stat-label">Total Sessions</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{assistantStats.activeChats}</div>
                  <div className="stat-label">Active Chats</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{assistantStats.avgResponseTime}s</div>
                  <div className="stat-label">Avg Response</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{assistantStats.satisfactionRate}%</div>
                  <div className="stat-label">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          {/* Chat Interface */}
          <div className="col-lg-8">
            <div className="chat-container">
              {showCustomerForm ? (
                <div className="customer-form-container">
                  <div className="form-header">
                    <h3>
                      <i className="fas fa-comments me-2"></i>
                      Start Chat with AI Assistant
                    </h3>
                    <p>Please provide your information to begin</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); startSession(); }}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          <i className="fas fa-user me-2"></i>Full Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          <i className="fas fa-envelope me-2"></i>Email Address *
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-phone me-2"></i>Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg w-100">
                      <i className="fas fa-play me-2"></i>
                      Start Chat
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="chat-header">
                    <div className="chat-status">
                      <div className="status-indicator online"></div>
                      <div className="status-info">
                        <h5>AI Assistant</h5>
                        <small>Online • Instant Response</small>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={endSession}
                    >
                      <i className="fas fa-times me-1"></i>
                      End Chat
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="messages-container">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
                      >
                        <div className="message-avatar">
                          {message.sender === 'ai' ? (
                            <i className="fas fa-robot"></i>
                          ) : (
                            <i className="fas fa-user"></i>
                          )}
                        </div>
                        <div className="message-content">
                          <div className="message-text">{message.text}</div>
                          <div className="message-meta">
                            <span className="message-time">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.intent && (
                              <span className="message-intent">
                                {message.intent}
                              </span>
                            )}
                            {message.confidence && (
                              <span className="message-confidence">
                                {Math.round(message.confidence * 100)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="message ai">
                        <div className="message-avatar">
                          <i className="fas fa-robot"></i>
                        </div>
                        <div className="message-content">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="chat-input">
                    <div className="input-group">
                      <textarea
                        ref={inputRef}
                        className="form-control"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        rows="1"
                        disabled={isLoading}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={sendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="sidebar">
              {/* Quick Actions */}
              <div className="quick-actions">
                <h5>
                  <i className="fas fa-bolt me-2"></i>
                  Quick Actions
                </h5>
                <div className="actions-grid">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="action-btn"
                      onClick={() => {
                        if (isConnected) {
                          setInputMessage(action.text);
                          inputRef.current?.focus();
                        } else {
                          toast.info('Please start a chat session first');
                        }
                      }}
                      disabled={!isConnected}
                    >
                      <i className={`fas ${action.icon}`}></i>
                      <span>{action.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="features-info">
                <h5>
                  <i className="fas fa-star me-2"></i>
                  AI Features
                </h5>
                <ul className="features-list">
                  <li>
                    <i className="fas fa-check text-success me-2"></i>
                    Instant responses 24/7
                  </li>
                  <li>
                    <i className="fas fa-check text-success me-2"></i>
                    Multi-language support
                  </li>
                  <li>
                    <i className="fas fa-check text-success me-2"></i>
                    Booking assistance
                  </li>
                  <li>
                    <i className="fas fa-check text-success me-2"></i>
                    Hotel information
                  </li>
                  <li>
                    <i className="fas fa-check text-success me-2"></i>
                    Human escalation
                  </li>
                  <li>
                    <i className="fas fa-check text-success me-2"></i>
                    Session history
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div className="contact-info">
                <h5>
                  <i className="fas fa-headset me-2"></i>
                  Need Human Help?
                </h5>
                <p>Our support team is available 24/7</p>
                <div className="contact-methods">
                  <div className="contact-item">
                    <i className="fas fa-phone text-primary"></i>
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-envelope text-primary"></i>
                    <span>support@hotelroyalpalace.com</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-comments text-primary"></i>
                    <span>Live Chat Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default AIAssistant;
