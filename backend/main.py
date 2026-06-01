from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, skills, matches

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(skills.router)
app.include_router(matches.router)

@app.get("/")
def root():
    return {"message": "SkillSwap API is running!"}