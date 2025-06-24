# whisper_handler.py
import whisper
model = whisper.load_model("base")
def transcribe(audio_path):
    return model.transcribe(audio_path)

# tts_playback.py
import pyttsx3
def speak(text):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()
