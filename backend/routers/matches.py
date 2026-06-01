from fastapi import APIRouter, HTTPException
from database import supabase
from matcher.engine import find_matches

router = APIRouter()

@router.get("/matches/{user_id}")
def get_matches(user_id: str):
    try:
        # Get current user with pincode
        my_user = supabase.table("users").select("*").eq("id", user_id).single().execute()
        my_pincode = my_user.data.get("pincode") if my_user.data else None

        print(f"Finding matches for user {user_id} with pincode {my_pincode}")

        # Get current user's offers and needs
        my_offers = supabase.table("skill_offers").select("*").eq("user_id", user_id).execute()
        my_needs  = supabase.table("skill_needs").select("*").eq("user_id", user_id).execute()

        if not my_offers.data and not my_needs.data:
            return []

        # Get all other users
        all_users = supabase.table("users").select("*").neq("id", user_id).execute()

        if not all_users.data:
            return []

        # Build skills dict
        all_users_skills = {}
        for other_user in all_users.data:
            other_id = other_user["id"]
            other_offers = supabase.table("skill_offers").select("*").eq("user_id", other_id).execute()
            other_needs  = supabase.table("skill_needs").select("*").eq("user_id", other_id).execute()

            if other_offers.data or other_needs.data:
                all_users_skills[other_id] = {
                    "offers": other_offers.data or [],
                    "needs":  other_needs.data  or [],
                    "user":   other_user
                }

        # Run NLP matching with distance
        raw_matches = find_matches(
            user_id,
            my_offers.data or [],
            my_needs.data  or [],
            all_users_skills,
            my_pincode=my_pincode
        )

        # Attach full user info
        result = []
        for match in raw_matches:
            other_id   = match['other_user_id']
            other_info = all_users_skills[other_id]['user']
            result.append({
                "user":        other_info,
                "score":       match['score'],
                "offer_match": match['offer_match'],
                "need_match":  match['need_match'],
                "distance_km": match.get('distance_km'),
            })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))