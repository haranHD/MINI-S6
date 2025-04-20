from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import pymongo
from gtts import gTTS
from deep_translator import GoogleTranslator
import os

app = Flask(__name__)
CORS(app)

# MongoDB Setup
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["farming_chatbot"]
collection = db["faqs"]

# Weather API
@app.route('/weather')
def get_weather():
    try:
        city = "Erode"
        api_key = "9d1198dc9b128ddc8d64d8edfeae5ec6"
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
        res = requests.get(url)
        data = res.json()
        weather_info = {
            "city": city,
            "temperature": data["main"]["temp"],
            "description": data["weather"][0]["description"].title()
        }
        return jsonify(weather_info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/market')
def get_market_prices():
    try:
        prices = [
            {
                "commodity": "Tomato",
                "market": "Erode",
                "state": "Tamil Nadu",
                "price": "1550",  # Predicted slight increase due to weekend demand
                "date": "12/04/2025"
            },
            {
                "commodity": "Onion",
                "market": "Salem",
                "state": "Tamil Nadu",
                "price": "930",  # Stable price
                "date": "12/04/2025"
            },
            {
                "commodity": "Carrot",
                "market": "Ooty",
                "state": "Tamil Nadu",
                "price": "1850",
                "date": "12/04/2025"
            },
            {
                "commodity": "Potato",
                "market": "Coimbatore",
                "state": "Tamil Nadu",
                "price": "1240",
                "date": "12/04/2025"
            },
            {
                "commodity": "Brinjal",
                "market": "Trichy",
                "state": "Tamil Nadu",
                "price": "980",
                "date": "12/04/2025"
            }
        ]
        return jsonify({"market_prices": prices})
    except Exception as e:
        return jsonify({"error": str(e), "market_prices": []}), 500

# Chat route using MongoDB FAQ lookup
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        language = data.get('language', 'en')

        if not question:
            return jsonify({"answer": "Please enter a question."}), 400

        # Translate Tamil question to English before lookup
        if language == 'ta':
            english_question = GoogleTranslator(source='ta', target='en').translate(question).lower()
        else:
            english_question = question.lower()

        # Search in MongoDB
        faq = collection.find_one({"question": {"$regex": english_question, "$options": "i"}})
        if faq:
            answer = faq.get('answer', 'No answer found.')
        else:
            answer = "Sorry, I don't have an answer for that question."

        # Translate answer to Tamil if needed
        if language == 'ta':
            answer = GoogleTranslator(source='en', target='ta').translate(answer)

        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Text-to-Speech
@app.route('/tts', methods=['POST'])
def tts():
    try:
        data = request.get_json()
        text = data.get('text', '')
        language = data.get('language', 'en')

        if not text:
            return jsonify({"error": "No text provided"}), 400

        lang_code = 'ta' if language == 'ta' else 'en'
        tts = gTTS(text=text, lang=lang_code)
        tts.save("output.mp3")

        return send_file("output.mp3", mimetype="audio/mpeg")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
