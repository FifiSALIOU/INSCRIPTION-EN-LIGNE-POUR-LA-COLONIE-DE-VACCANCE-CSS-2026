from fastapi import FastAPI


app = FastAPI(
    title="API Colonie de vacances CSS 2026",
    description="Backend FastAPI pour l'inscription en ligne à la colonie de vacances 2026.",
    version="0.1.0",
)


@app.get("/", tags=["général"])
def read_root():
    return {"message": "API Colonie de vacances CSS 2026 - backend opérationnel"}


@app.get("/health", tags=["général"])
def health_check():
    return {"status": "ok"}

