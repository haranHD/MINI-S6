# 🌾 AI-Powered Multilingual Farming Chatbot

A smart agriculture assistant built with **Flask** (backend) and **React.js** (frontend) to help farmers get:
- Real-time weather updates
- Predicted vegetable market prices
- Farming FAQs in both **English** and **Tamil**

This chatbot includes voice interaction, multilingual translation, and uses **MongoDB** to store a dynamic knowledge base.

---

## 🔧 Tech Stack

**Frontend**  
- React.js  
- Axios  
- HTML, CSS  

**Backend**  
- Python (Flask)  
- REST APIs  

**Database**  
- MongoDB  

**APIs Integrated**  
- 🌤 [OpenWeatherMap](https://openweathermap.org/) (Live Weather)  
- 🗣 [gTTS](https://pypi.org/project/gTTS/) (Text-to-Speech in Tamil & English)  
- 🌐 [Google Translator](https://pypi.org/project/deep-translator/) (via deep_translator)

**Deployment**  
- 🚀 Hosted on [Render](https://render.com/)

---

## ✅ Features

- 💬 Chatbot for farming FAQs stored in MongoDB
- 🌦 Real-time weather for Erode district
- 📈 Hardcoded & predicted market prices for vegetables like tomato, onion, carrot
- 🌐 Multilingual support (Tamil ↔ English) using `deep_translator`
- 🔊 Voice interaction using gTTS (English and Tamil)
- 🔒 User login system with MongoDB (optional extension)
- ⚡ Clean, responsive UI built with React hooks

---

## 📸 Demo Preview (Optional)

_Add screenshots or link to a live demo here._

---

## 🚀 Setup Instructions

### Backend (Flask)
1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/farming-chatbot.git
   cd backend
