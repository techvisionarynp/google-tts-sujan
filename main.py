from fastapi import FastAPI
from fastapi.responses import JSONResponse, StreamingResponse
from gtts import gTTS
from io import BytesIO

app = FastAPI()

@app.get("/")
async def root():
    return JSONResponse(
        content={
            "message": "API running... use /v1/convert.",
            "developer": "Blind tech visionary"
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
        return StreamingResponse(audio_buffer, media_type="audio/mpeg", headers={
            "Content-Disposition": "inline; filename=output.mp3"
        })
    except Exception as e:
        return JSONResponse(
            content={
                "status_code": 500,
                "message": str(e)
            },
            status_code=500
        )