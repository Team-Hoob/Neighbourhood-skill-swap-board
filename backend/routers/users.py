from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: str
    neighbourhood: str = ""
    avatar_url: str = ""

@router.post("/users/register")
def register_user(user: UserCreate):
    try:
        result = supabase.table("users").insert({
            "name": user.name,
            "email": user.email,
            "neighbourhood": user.neighbourhood,
            "avatar_url": user.avatar_url
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/users/{user_id}")
def get_user(user_id: str):
    result = supabase.table("users").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]