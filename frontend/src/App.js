import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [language, setLanguage] = useState('en');
  const [weather, setWeather] = useState(null);
  const [marketPrices, setMarketPrices] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

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

    try {
      const res = await axios.post(`${process.env.REACT_APP_URL}/chat`, {
        question,
        language,
      });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error('Chat error:', err);
      setAnswer('Something went wrong. Try again.');
    }
  };

  const handleSpeak = async () => {
    if (!answer) return;
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_URL}/tts`,
        { text: answer, language },
        { responseType: 'blob' }
      );
      const audioUrl = URL.createObjectURL(res.data);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1> 👨‍🌾 AI Farming</h1>

      <div>
        <label>Select Language: </label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="ta">தமிழ் (Tamil)</option>
        </select>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Ask your farming question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ padding: '0.5rem', width: '80%' }}
        />
        <button onClick={handleAsk} style={{ marginLeft: '0.5rem', padding: '0.5rem' }}>
          Ask
        </button>
      </div>

      {answer && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Answer:</h3>
          <p>{answer}</p>
          <button onClick={handleSpeak}>🔊 Speak</button>
        </div>
      )}

      {(weather || marketPrices.length > 0) && (
        <>
          <h2 style={{ marginTop: '2rem' }}>📊 Today's Farming Dashboard</h2>
          {lastUpdated && <p><em>Last updated: {lastUpdated}</em></p>}
        </>
      )}

      <div style={{ display: 'flex', marginTop: '1rem', gap: '2rem' }}>
        {weather && (
          <div style={{ flex: 1, backgroundColor: '#e8f5e9', padding: '1rem', borderRadius: '8px' }}>
            <h3>🌤 Weather Info</h3>
            <p><strong>City:</strong> {weather.city}</p>
            <p><strong>Temperature:</strong> {weather.temperature}°C</p>
            <p><strong>Description:</strong> {weather.description}</p>
          </div>
        )}

        {marketPrices.length > 0 && (
          <div style={{ flex: 1, backgroundColor: '#fff3e0', padding: '1rem', borderRadius: '8px' }}>
            <h3>📈 Market Prices</h3>
            <ul>
              {marketPrices.slice(0, 5).map((item, index) => (
                <li key={index}>
                  <strong>{item.commodity}</strong> - ₹{item.price} ({item.market})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
