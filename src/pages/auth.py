from fastapi.security import HTTPBearer
from fastapi import Depends, HTTPException
import jwt, time, os

SECRET = os.getenv("JWT_SECRET")

def create_token(uid):
    return jwt.encode(
        {"uid": uid, "exp": time.time() + 86400},
        SECRET,
        algorithm="HS256"
    )
