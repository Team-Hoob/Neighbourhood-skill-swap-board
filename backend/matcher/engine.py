from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import requests
import math

print("Loading NLP model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("NLP model loaded!")

# Cache coordinates so we don't call API repeatedly
_coord_cache = {}

def get_coordinates(pincode):
    """Get lat/long for an Indian pincode"""
    if not pincode:
        return None
    
    if pincode in _coord_cache:
        return _coord_cache[pincode]
    
    try:
        url = f"https://nominatim.openstreetmap.org/search?postalcode={pincode}&country=India&format=json"
        response = requests.get(url, headers={"User-Agent": "SkillSwap/1.0"}, timeout=5)
        data = response.json()
        if data:
            coords = {
                "lat": float(data[0]["lat"]),
                "lon": float(data[0]["lon"])
            }
            _coord_cache[pincode] = coords
            return coords
    except Exception as e:
        print(f"Coord lookup failed for {pincode}: {e}")
    
    return None

def haversine_distance(coord1, coord2):
    """Calculate distance in km between two lat/lon points"""
    R = 6371  # Earth radius in km
    
    lat1, lon1 = math.radians(coord1["lat"]), math.radians(coord1["lon"])
    lat2, lon2 = math.radians(coord2["lat"]), math.radians(coord2["lon"])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

def get_distance_km(pincode1, pincode2):
    """Get distance between two pincodes in km"""
    if not pincode1 or not pincode2:
        return None
    if pincode1 == pincode2:
        return 0
    
    coord1 = get_coordinates(pincode1)
    coord2 = get_coordinates(pincode2)
    
    if coord1 and coord2:
        return haversine_distance(coord1, coord2)
    
    return None

def embed(texts):
    return model.encode(texts, convert_to_numpy=True)

def compute_similarity(text1, text2):
    embeddings = embed([text1, text2])
    sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return float(sim)

def find_matches(user_id, my_offers, my_needs, all_users_skills, my_pincode=None):
    """
    Find best mutual matches with distance-based sorting.
    Priority:
    1. Within 5km — show first
    2. Within 25km — show if not enough nearby
    3. Within 100km — show if still not enough
    4. Anywhere — last resort
    """
    
    RADIUS_LEVELS = [5, 25, 100, 99999]
    NLP_THRESHOLD = 0.25
    TARGET_MATCHES = 5

    # Compute all matches first
    all_matches = []

    for other_id, other_skills in all_users_skills.items():
        if other_id == user_id:
            continue

        other_offers  = other_skills.get('offers', [])
        other_needs   = other_skills.get('needs',  [])
        other_user    = other_skills.get('user',   {})
        other_pincode = other_user.get('pincode')

        if not other_offers and not other_needs:
            continue

        # Calculate distance
        distance_km = get_distance_km(my_pincode, other_pincode)
        print(f"Distance {my_pincode} → {other_pincode}: {distance_km} km")

        best_offer_score = 0
        best_offer_match = ""
        best_need_score  = 0
        best_need_match  = ""

        # My offers vs their needs
        for my_offer in my_offers:
            for their_need in other_needs:
                score = compute_similarity(
                    my_offer['description'],
                    their_need['description']
                )
                if score > best_offer_score:
                    best_offer_score = score
                    best_offer_match = f"{my_offer['description']} ↔ {their_need['description']}"

        # Their offers vs my needs
        for their_offer in other_offers:
            for my_need in my_needs:
                score = compute_similarity(
                    their_offer['description'],
                    my_need['description']
                )
                if score > best_need_score:
                    best_need_score = score
                    best_need_match = f"{their_offer['description']} ↔ {my_need['description']}"

        if best_offer_score < NLP_THRESHOLD and best_need_score < NLP_THRESHOLD:
            continue

        # Combined NLP score
        combined_score = (best_offer_score + best_need_score) / 2
        if best_offer_score > 0 and best_need_score > 0:
            combined_score *= 1.2  # bonus for mutual match

        all_matches.append({
            'other_user_id': other_id,
            'score':         round(combined_score * 100, 1),
            'offer_match':   best_offer_match,
            'need_match':    best_need_match,
            'distance_km':   distance_km,
        })

    if not all_matches:
        return []

    # Sort by distance within each radius level
    result = []
    used_ids = set()

    for radius in RADIUS_LEVELS:
        if len(result) >= TARGET_MATCHES:
            break

        # Get matches within this radius not already added
        in_radius = []
        for m in all_matches:
            if m['other_user_id'] in used_ids:
                continue
            dist = m['distance_km']
            # Include if distance unknown OR within radius
            if dist is None or dist <= radius:
                in_radius.append(m)

        # Sort by score within radius
        in_radius.sort(key=lambda x: x['score'], reverse=True)

        needed = TARGET_MATCHES - len(result)
        for m in in_radius[:needed]:
            result.append(m)
            used_ids.add(m['other_user_id'])

        if in_radius and len(result) < TARGET_MATCHES:
            print(f"Radius {radius}km: found {len(in_radius)} matches")

    return result