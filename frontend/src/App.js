import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Globe, 
  Cloud, 
  TrendingUp, 
  RefreshCw, 
  Sparkles,
  Leaf,
  Sun,
  Droplets,
  Wind
} from 'lucide-react';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [language, setLanguage] = useState('en');
  const [weather, setWeather] = useState(null);
  const [marketPrices, setMarketPrices] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    fetchWeather();
    fetchMarketPrices();
  }, []);

  const fetchWeather = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_URL}/weather`);
      setWeather(res.data);
      updateTimestamp();
    } catch (err) {
      console.error('Weather fetch error:', err);
    }
  };

  const fetchMarketPrices = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_URL}/market`);
      setMarketPrices(res.data.market_prices || []);
      updateTimestamp();
    } catch (err) {
      console.error('Market price fetch error:', err);
    }
  };

  const updateTimestamp = () => {
    const now = new Date().toLocaleString();
    setLastUpdated(now);
  };

  const handleAsk = async () => {
    if (!question.trim()) {
      setAnswer('Please type a question before asking.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_URL}/chat`, {
        question,
        language,
      });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error('Chat error:', err);
      setAnswer('Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!answer || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_URL}/tts`,
        { text: answer, language },
        { responseType: 'blob' }
      );
      const audioUrl = URL.createObjectURL(res.data);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => setIsSpeaking(false);
    } catch (err) {
      console.error('TTS error:', err);
      setIsSpeaking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAsk();
    }
  };

  return (
    <div className="app">
      {/* Hero Section */}
      <motion.div 
        className="hero"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="hero-content"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div 
            className="logo"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Leaf size={48} />
          </motion.div>
          <h1>AI Farming Assistant</h1>
          <p>Your intelligent companion for modern farming</p>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="container">
        {/* Language Selection */}
        <motion.div 
          className="language-selector"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Globe size={20} />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-dropdown"
          >
            <option value="en">English</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>
        </motion.div>

        {/* Chat Interface */}
        <motion.div 
          className="chat-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="input-group">
            <input
              type="text"
              placeholder="Ask your farming question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              className="question-input"
              disabled={isLoading}
            />
            <motion.button 
              onClick={handleAsk}
              className="ask-button"
              disabled={isLoading || !question.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw size={20} />
                </motion.div>
              ) : (
                <Bot size={20} />
              )}
              <span>{isLoading ? 'Thinking...' : 'Ask'}</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {answer && (
              <motion.div 
                className="answer-container"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="answer-header">
                  <Sparkles size={20} />
                  <h3>AI Response</h3>
                  <motion.button 
                    onClick={handleSpeak}
                    className="speak-button"
                    disabled={isSpeaking}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isSpeaking ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <MicOff size={18} />
                      </motion.div>
                    ) : (
                      <Mic size={18} />
                    )}
                  </motion.button>
                </div>
                <div className="answer-text">
                  {answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Dashboard */}
        <AnimatePresence>
          {(weather || marketPrices.length > 0) && (
            <motion.div 
              className="dashboard"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="dashboard-header">
                <h2>📊 Today's Farming Dashboard</h2>
                {lastUpdated && (
                  <motion.p 
                    className="last-updated"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    Last updated: {lastUpdated}
                  </motion.p>
                )}
              </div>

              <div className="dashboard-grid">
                {weather && (
                  <motion.div 
                    className="weather-card"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="card-header">
                      <Cloud size={24} />
                      <h3>Weather Info</h3>
                    </div>
                    <div className="weather-details">
                      <div className="weather-item">
                        <Sun size={18} />
                        <span><strong>City:</strong> {weather.city}</span>
                      </div>
                      <div className="weather-item">
                        <Droplets size={18} />
                        <span><strong>Temperature:</strong> {weather.temperature}°C</span>
                      </div>
                      <div className="weather-item">
                        <Wind size={18} />
                        <span><strong>Description:</strong> {weather.description}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {marketPrices.length > 0 && (
                  <motion.div 
                    className="market-card"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="card-header">
                      <TrendingUp size={24} />
                      <h3>Market Prices</h3>
                    </div>
                    <div className="market-list">
                      {marketPrices.slice(0, 5).map((item, index) => (
                        <motion.div 
                          key={index}
                          className="market-item"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 1.4 + (index * 0.1) }}
                        >
                          <div className="commodity-name">
                            <strong>{item.commodity}</strong>
                          </div>
                          <div className="commodity-price">
                            ₹{item.price}
                          </div>
                          <div className="commodity-market">
                            {item.market}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;