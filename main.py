from fastapi import FastAPI
from fastapi.responses import JSONResponse
from gtts import gTTS
import base64
from io import BytesIO

app = FastAPI()

@app.get("/")
async def root():
    return JSONResponse(
        content={
            "message": "API running... use /v1/convert."
        }
    )

@app.get("/v1/convert")
async def convert(text: str = None, lang: str = None):
    if not text or not lang or text.strip() == "" or lang.strip() == "":
        return JSONResponse(
            content={
                "status_code": 400,
                "message": "Text and lang are required"
            },
            status_code=400
        )
    
    try:
        tts = gTTS(text=text, lang=lang)
        audio_buffer = BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        audio_bytes = audio_buffer.read()
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return JSONResponse(
            content={
                "developer": "Blind tech visionary",
                "audio": audio_base64
            },
            status_code=200
        )
        
    except Exception as e:
        return JSONResponse(
            content={
                "status_code": 500,
                "message": str(e)
            },
            status_code=500
        )