import re
from typing import Optional, Tuple

from models import Track

TRACK_KEYWORDS = {
    "ML Engineer": {
        "ml", "machine", "learning", "ai", "artificial", "intelligence",
        "data", "scientist", "science", "deep", "neural", "network",
        "pytorch", "tensorflow", "mlops", "nlp", "computer", "vision",
        "statistics", "model", "models",
    },
    "MERN Stack Developer": {
        "mern", "react", "reactjs", "node", "nodejs", "javascript", "js",
        "frontend", "front-end", "backend", "back-end", "fullstack",
        "full-stack", "web", "express", "mongodb", "developer",
    },
    "Java Developer (Spring Boot)": {
        "java", "spring", "springboot", "boot", "microservices",
        "enterprise", "backend", "developer", "hibernate", "spring boot developer"
    },
}

_STOPWORDS = {
    "i", "a", "an", "the", "to", "and", "of", "in", "on", "for", "with",
    "want", "become", "eventually", "be", "am", "is", "are", "my", "me",
    "months", "month", "year", "years", "know", "basic", "weak",
}


def _tokenize(text: Optional[str]) -> set:
    if not text:
        return set()
    return {w.lower() for w in re.findall(r"[a-zA-Z]+", text)} - _STOPWORDS


def resolve_track(goal_text: str) -> Tuple[Optional[Track], float]:
    goal_words = _tokenize(goal_text)
    if not goal_words:
        return None, 0.0

    best_track, best_score = None, 0.0
    for track in Track.query.all():
        keyword_set = TRACK_KEYWORDS.get(track.name, set())
        fallback_words = _tokenize(track.name) | _tokenize(track.description)
        combined = keyword_set | fallback_words
        if not combined:
            continue

        overlap = goal_words & combined
        score = len(overlap) / len(goal_words)

        if score > best_score:
            best_track, best_score = track, score

    return best_track, round(best_score, 3)