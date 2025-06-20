import torch
import torch.nn as nn
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from flask import Flask, render_template, request
import numpy as np
import joblib

# Logging configuration
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(message)s")
logger = logging.getLogger(__name__)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Define Models 
class WeatherModel(nn.Module):
    def __init__(self):
        super(WeatherModel, self).__init__()
        self.lstm = nn.LSTM(input_size=3, hidden_size=50, num_layers=2, batch_first=True)
        self.fc = nn.Linear(50, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])

class SentimentAnalysisModel(nn.Module):
    def __init__(self):
        super(SentimentAnalysisModel, self).__init__()
        self.embedding = nn.Embedding(5000, 64)
        self.lstm = nn.LSTM(input_size=64, hidden_size=128, num_layers=2, batch_first=True)
        self.fc = nn.Linear(128, 3)  # Outputs sentiment classes: positive, neutral, negative

    def forward(self, x):
        x = self.embedding(x)
        out, _ = self.lstm(x)
        return torch.softmax(self.fc(out[:, -1, :]), dim=1)

class FraudDetectionModel(nn.Module):
    def __init__(self):
        super(FraudDetectionModel, self).__init__()
        self.fc1 = nn.Linear(10, 50)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(50, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.relu(self.fc1(x))
        return self.sigmoid(self.fc2(x))

class RecommendationModel(nn.Module):
    def __init__(self):
        super(RecommendationModel, self).__init__()
        self.fc1 = nn.Linear(10, 50)
        self.fc2 = nn.Linear(50, 10)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        return torch.sigmoid(self.fc2(x))

class ImageAnalysisModel(nn.Module):
    def __init__(self):
        super(ImageAnalysisModel, self).__init__()
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, stride=1, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1)
        self.fc1 = nn.Linear(64 * 64, 128)
        self.fc2 = nn.Linear(128, 10)  # Outputs probabilities for image classification

    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = torch.relu(self.conv2(x))
        x = torch.flatten(x, start_dim=1)
        x = torch.relu(self.fc1(x))
        return torch.softmax(self.fc2(x), dim=1)

class SpeechRecognitionModel(nn.Module):
    def __init__(self):
        super(SpeechRecognitionModel, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3)
        self.lstm = nn.LSTM(input_size=32, hidden_size=128, num_layers=2, batch_first=True)
        self.fc = nn.Linear(128, 50)  # Outputs text tokens

    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = x.transpose(1, 2)
        out, _ = self.lstm(x)
        return out[:, -1, :]

class StockPriceModel(nn.Module):
    def __init__(self):
        super(StockPriceModel, self).__init__()
        self.lstm = nn.LSTM(input_size=10, hidden_size=50, num_layers=2, batch_first=True)
        self.fc = nn.Linear(50, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])

# Load Pre-trained Models
def load_model(model_class, path):
    model = model_class()
    model.load_state_dict(torch.load(path))
    model.to(DEVICE)
    model.eval()
    return model

weather_model = load_model(WeatherModel, 'models/weather_model.pth')
sentiment_model = load_model(SentimentAnalysisModel, 'models/sentiment_model.pth')
fraud_model = load_model(FraudDetectionModel, 'models/fraud_model.pth')
recommendation_model = load_model(RecommendationModel, 'models/recommendation_model.pth')
image_model = load_model(ImageAnalysisModel, 'models/image_model.pth')
speech_model = load_model(SpeechRecognitionModel, 'models/speech_model.pth')
stock_model = load_model(StockPriceModel, 'models/stock_price_model.pth')

# Flask App
app = Flask(__name__)
CORS(app)

def preprocess_data(data, domain):
    try:
        if domain in ["weather", "fraud", "recommendation", "stock"]:
            return torch.tensor(data).float().unsqueeze(0).to(DEVICE)
        elif domain == "sentiment":
            return torch.tensor(data).long().unsqueeze(0).to(DEVICE)
        elif domain == "image":
            return torch.tensor(data).float().unsqueeze(0).to(DEVICE)
        elif domain == "speech":
            return torch.tensor(data).float().unsqueeze(0).to(DEVICE)
    except Exception as e:
        logger.exception("Error in preprocessing")
        return None

@app.route('/weather/forecast', methods=['POST'])
def weather_forecast():
    try:
        data = preprocess_data(request.json['data'], "weather")
        with torch.no_grad():
            result = weather_model(data)
        return jsonify({"forecast": result.item()})
    except Exception as e:
        logger.exception("Error in weather forecasting")
        return jsonify({"error": str(e)}), 500

@app.route('/sentiment/analyze', methods=['POST'])
def sentiment_analyze():
    try:
        data = preprocess_data(request.json['data'], "sentiment")
        with torch.no_grad():
            result = sentiment_model(data)
        sentiment = ["Positive", "Neutral", "Negative"][result.argmax(dim=1).item()]
        return jsonify({"sentiment": sentiment})
    except Exception as e:
        logger.exception("Error in sentiment analysis")
        return jsonify({"error": str(e)}), 500

@app.route('/fraud/detect', methods=['POST'])
def fraud_detect():
    try:
        data = preprocess_data(request.json['data'], "fraud")
        with torch.no_grad():
            result = fraud_model(data)
        prediction = "Fraudulent" if result.item() > 0.5 else "Non-Fraudulent"
        return jsonify({"fraud_prediction": prediction})
    except Exception as e:
        logger.exception("Error in fraud detection")
        return jsonify({"error": str(e)}), 500

@app.route('/recommendations', methods=['POST'])
def recommend():
    try:
        data = preprocess_data(request.json['data'], "recommendation")
        with torch.no_grad():
            result = recommendation_model(data)
        recommendations = result.topk(k=5).indices.tolist()
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        logger.exception("Error in recommendations")
        return jsonify({"error": str(e)}), 500

@app.route('/image/analyze', methods=['POST'])
def image_analyze():
    try:
        data = preprocess_data(request.json['data'], "image")
        with torch.no_grad():
            result = image_model(data)
        class_prediction = result.argmax(dim=1).item()
        return jsonify({"class": class_prediction})
    except Exception as e:
        logger.exception("Error in image analysis")
        return jsonify({"error": str(e)}), 500

@app.route('/speech/recognize', methods=['POST'])
def speech_recognize():
    try:
        data = preprocess_data(request.json['data'], "speech")
        with torch.no_grad():
            result = speech_model(data)
        return jsonify({"transcription": result.tolist()})
    except Exception as e:
        logger.exception("Error in speech recognition")
        return jsonify({"error": str(e)}), 500

@app.route('/stock/predict', methods=['POST'])
def stock_predict():
    try:
        data = preprocess_data(request.json['data'], "stock")
        with torch.no_grad():
            result = stock_model(data)
        return jsonify({"predicted_stock_price": result.item()})
    except Exception as e:
        logger.exception("Error in stock prediction")
        return jsonify({"error": str(e)}), 500

# Load pre-trained model (example)
model = joblib.load('models/trained_model/your_model.pkl')

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    # Get input from user (data validation should be added)
    input_data = request.form['data']
    input_data = np.array(input_data).reshape(1, -1)  # Example reshaping for the model

    prediction = model.predict(input_data)
    return f"Prediction: {prediction}"

if __name__ == '__main__':
    app.run(debug=True)
