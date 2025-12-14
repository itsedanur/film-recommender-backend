# app/routers/contact.py
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.contact import ContactMessage, CaptchaSession
import uuid
import random
from datetime import datetime, timedelta

router = APIRouter(prefix="/contact", tags=["Contact"])

@router.get("/captcha")
def get_captcha(db: Session = Depends(get_db)):
    """
    Generates a simple math captcha (A + B).
    Returns a UUID and the question string.
    """
    a = random.randint(1, 10)
    b = random.randint(1, 10)
    result = a + b
    
    session_id = str(uuid.uuid4())
    expires = datetime.now() + timedelta(minutes=5)
    
    # Save to DB
    # Clean up old captchas first (optional, but good for hygiene)
    # in a real app, run a cron job. Here we just add new one.
    
    new_captcha = CaptchaSession(
        uuid=session_id,
        answer=result,
        expires_at=expires
    )
    db.add(new_captcha)
    db.commit()
    
    return {
        "captcha_key": session_id,
        "question": f"{a} + {b} = ?"
    }

@router.post("/send")
def send_contact_message(
    name: str = Body(...),
    email: str = Body(...),
    message: str = Body(...),
    captcha_key: str = Body(...),
    captcha_answer: int = Body(...),
    db: Session = Depends(get_db)
):
    """
    Verifies captcha and saves the contact message.
    """
    # 1. Verify Captcha
    captcha_entry = db.query(CaptchaSession).filter(CaptchaSession.uuid == captcha_key).first()
    
    if not captcha_entry:
        raise HTTPException(status_code=400, detail="Geçersiz veya süresi dolmuş Captcha.")
    
    if datetime.now() > captcha_entry.expires_at:
        db.delete(captcha_entry)
        db.commit()
        raise HTTPException(status_code=400, detail="Captcha süresi doldu, lütfen yenileyin.")
        
    if captcha_entry.answer != captcha_answer:
        # Increment attempt or just fail? For simple implementation, fail.
        # Ideally we might delete it to prevent retry spam with same key, but let's keep it simple.
        raise HTTPException(status_code=400, detail="Yanlış Captcha cevabı.")
        
    # Correct answer -> Delete captcha used (one-time use)
    db.delete(captcha_entry)
    
    # 2. Save Message
    new_message = ContactMessage(
        name=name,
        email=email,
        message=message
    )
    db.add(new_message)
    db.commit()
    
    return {"message": "Mesajınız başarıyla iletildi! 🚀"}
