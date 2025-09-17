from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.base import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(256), unique=True, index=True, nullable=False)
    hashed_password = Column(String(512), nullable=False)
    is_active = Column(Integer, default=1)

    chats = relationship("ChatLog", back_populates="user")

class ChatLog(Base):
    __tablename__ = "chat_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="chats")

class ImageLog(Base):
    __tablename__ = "image_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    prompt = Column(Text, nullable=False)
    url = Column(String(1024), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TTSLog(Base):
    __tablename__ = "tts_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    text = Column(Text, nullable=False)
    audio_url = Column(String(1024), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
