from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase

router = APIRouter()

class SkillCreate(BaseModel):
    user_id: str
    description: str
    category: str = ""
    type: str  # "offer" or "need"

@router.post("/skills")
def create_skill(skill: SkillCreate):
    try:
        table = "skill_offers" if skill.type == "offer" else "skill_needs"
        result = supabase.table(table).insert({
            "user_id": skill.user_id,
            "description": skill.description,
            "category": skill.category
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/skills")
def get_all_skills():
    offers = supabase.table("skill_offers").select("*, users(name, neighbourhood)").execute()
    needs = supabase.table("skill_needs").select("*, users(name, neighbourhood)").execute()
    return {
        "offers": offers.data,
        "needs": needs.data
    }

@router.get("/skills/{user_id}")
def get_user_skills(user_id: str):
    offers = supabase.table("skill_offers").select("*").eq("user_id", user_id).execute()
    needs = supabase.table("skill_needs").select("*").eq("user_id", user_id).execute()
    return {
        "offers": offers.data,
        "needs": needs.data
    }

@router.delete("/skills/{skill_id}")
def delete_skill(skill_id: str, type: str):
    table = "skill_offers" if type == "offer" else "skill_needs"
    supabase.table(table).delete().eq("id", skill_id).execute()
    return {"message": "Skill deleted"}