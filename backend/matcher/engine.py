from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests
import math

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

        response = requests.get(
            url,
            headers={"User-Agent": "SkillSwap/1.0"},
            timeout=5
        )

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

    R = 6371

    lat1 = math.radians(coord1["lat"])
    lon1 = math.radians(coord1["lon"])

    lat2 = math.radians(coord2["lat"])
    lon2 = math.radians(coord2["lon"])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

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


def compute_similarity(text1, text2):
    """
    Lightweight similarity using TF-IDF.
    Much smaller memory footprint than SentenceTransformers.
    """

    try:
        vectorizer = TfidfVectorizer(stop_words="english")

        vectors = vectorizer.fit_transform([
            str(text1),
            str(text2)
        ])

        similarity = cosine_similarity(
            vectors[0:1],
            vectors[1:2]
        )[0][0]

        return float(similarity)

    except Exception as e:
        print(f"Similarity error: {e}")
        return 0.0


def find_matches(
    user_id,
    my_offers,
    my_needs,
    all_users_skills,
    my_pincode=None
):
    """
    Find best mutual matches with distance-based sorting.
    """

    RADIUS_LEVELS = [5, 25, 100, 99999]
    NLP_THRESHOLD = 0.10
    TARGET_MATCHES = 5

    all_matches = []

    for other_id, other_skills in all_users_skills.items():

        if other_id == user_id:
            continue

        other_offers = other_skills.get("offers", [])
        other_needs = other_skills.get("needs", [])
        other_user = other_skills.get("user", {})
        other_pincode = other_user.get("pincode")

        if not other_offers and not other_needs:
            continue

        distance_km = get_distance_km(
            my_pincode,
            other_pincode
        )

        best_offer_score = 0
        best_offer_match = ""

        best_need_score = 0
        best_need_match = ""

        # My offers vs their needs
        for my_offer in my_offers:
            for their_need in other_needs:

                score = compute_similarity(
                    my_offer["description"],
                    their_need["description"]
                )

                if score > best_offer_score:
                    best_offer_score = score
                    best_offer_match = (
                        f"{my_offer['description']} ↔ "
                        f"{their_need['description']}"
                    )

        # Their offers vs my needs
        for their_offer in other_offers:
            for my_need in my_needs:

                score = compute_similarity(
                    their_offer["description"],
                    my_need["description"]
                )

                if score > best_need_score:
                    best_need_score = score
                    best_need_match = (
                        f"{their_offer['description']} ↔ "
                        f"{my_need['description']}"
                    )

        if (
            best_offer_score < NLP_THRESHOLD
            and best_need_score < NLP_THRESHOLD
        ):
            continue

        combined_score = (
            best_offer_score + best_need_score
        ) / 2

        if best_offer_score > 0 and best_need_score > 0:
            combined_score *= 1.2

        all_matches.append({
            "other_user_id": other_id,
            "score": round(combined_score * 100, 1),
            "offer_match": best_offer_match,
            "need_match": best_need_match,
            "distance_km": distance_km
        })

    if not all_matches:
        return []

    result = []
    used_ids = set()

    for radius in RADIUS_LEVELS:

        if len(result) >= TARGET_MATCHES:
            break

        in_radius = []

        for match in all_matches:

            if match["other_user_id"] in used_ids:
                continue

            dist = match["distance_km"]

            if dist is None or dist <= radius:
                in_radius.append(match)

        in_radius.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        needed = TARGET_MATCHES - len(result)

        for match in in_radius[:needed]:
            result.append(match)
            used_ids.add(match["other_user_id"])

    return result