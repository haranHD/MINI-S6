from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import pymongo
from gtts import gTTS
from deep_translator import GoogleTranslator
import os
import google.generativeai as genai
from pydub import AudioSegment
from pydub import AudioSegment
from gtts import gTTS

# Configure Gemini API
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

app = Flask(__name__)
CORS(app)
# MongoDB Setup
try:
    client = pymongo.MongoClient(os.environ.get("MONGO_URI"))
    db = client["farming_chatbot"]
    collection = db["faqs"]
    
    # Test the connection
    client.server_info()  # Will raise an exception if the connection fails
    print("✅ Database connected successfully!")
except Exception as e:
    print("❌ Failed to connect to the database:", e)


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

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        language = data.get('language', 'en')  # 'ta' for Tamil

        if not question:
            return jsonify({"answer": "Please enter a question."}), 400

        # Step 1: Translate Tamil input to English
        if language == 'ta':
            english_question = GoogleTranslator(source='ta', target='en').translate(question).lower()
        else:
            english_question = question.lower()

        # Step 2: Check MongoDB for matching question
        faq = collection.find_one({"question": {"$regex": english_question, "$options": "i"}})

        if faq:
            answer = faq.get('answer', 'No answer found.')
            source = "database"
        else:
            # Step 3: If not found, use Gemini with brief prompt
            gemini_prompt = f"Answer this farming question briefly in 2 to 3 short lines with only the most important points: {english_question}"
            response = model.generate_content(gemini_prompt)
            answer = response.text.strip()
            source = "gemini"

        # Step 4: Translate answer to Tamil if original question was Tamil
        if language == 'ta':
            answer = GoogleTranslator(source='en', target='ta').translate(answer)

        return jsonify({
            "answer": answer,
            "source": source
        })

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
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

