import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from models import (
    db,
    User,
    Track,
    Skill,
    Resource,
    ResourceSkill,
    UserSkill,
    Feedback,
    SkillProgress,
    LearningPath,
    LearningPathItem,
)


MASTERY_THRESHOLD = 80  

WEIGHTS = {
    "goal_relevance": 0.25,
    "skill_gap_coverage": 0.25,
    "prerequisite_match": 0.15,
    "difficulty_fit": 0.15,
    "learning_style_match": 0.10,
    "historical_preference": 0.10,
}

_STOPWORDS = {
    "i", "a", "an", "the", "to", "and", "of", "in", "on", "for", "with",
    "want", "become", "eventually", "be", "am", "is", "are", "my", "me",
}


def set_user_track(user: User, track: Track) -> None:
    user.track_id = track.id


def assign_track(user: User, track_name: str) -> Track:
   
    track = Track.query.filter_by(name=track_name).first()
    if track is None:
        raise ValueError(f"No track named '{track_name}' — did you run seed_data.py?")
    set_user_track(user, track)
    db.session.commit()
    return track



def build_track_skill_graph(track: Track) -> dict:
    track_skill_ids = {ts.skill_id for ts in track.required_skills}
    graph = {}
    for ts in track.required_skills:
        skill = ts.skill
        prereq_ids = [p.id for p in skill.prerequisites if p.id in track_skill_ids]
        graph[skill.id] = {"name": skill.name, "prereqs": prereq_ids, "skill": skill}
    return graph


def topo_order(graph: dict) -> List[int]:
    visited, order = set(), []

    def visit(node):
        if node in visited:
            return
        visited.add(node)
        for pre in graph[node]["prereqs"]:
            if pre in graph:
                visit(pre)
        order.append(node)

    for node in graph:
        visit(node)
    return order


def get_proficiency(user: User, skill_id: int) -> int:
    us = UserSkill.query.filter_by(user_id=user.id, skill_id=skill_id).first()
    return us.proficiency if us else 0


def skill_gap(user: User, graph: dict) -> List[int]:
    order = topo_order(graph)
    return [sid for sid in order if get_proficiency(user, sid) < MASTERY_THRESHOLD]




def retrieve_candidates(skill_id: int) -> List[Resource]:
    return (
        Resource.query.join(ResourceSkill, ResourceSkill.resource_id == Resource.id)
        .filter(ResourceSkill.skill_id == skill_id)
        .all()
    )



def _words(text: Optional[str]) -> set:
    if not text:
        return set()
    return {w.lower() for w in re.findall(r"[a-zA-Z]+", text)} - _STOPWORDS


def goal_relevance(resource: Resource, user: User) -> float:
    
    goal_words = _words(user.goal_text)
    resource_words = _words(resource.title) | _words(resource.description) | _words(resource.domain)
    if not goal_words or not resource_words:
        return 0.5
    overlap = goal_words & resource_words
    union = goal_words | resource_words
    return len(overlap) / len(union) if union else 0.5


def skill_gap_coverage(skill_id: int, user: User) -> float:
    proficiency = get_proficiency(user, skill_id)
    return (100 - proficiency) / 100


def prerequisite_match(skill_id: int, user: User, graph: dict) -> float:
    prereqs = graph[skill_id]["prereqs"]
    if not prereqs:
        return 1.0
    met = [get_proficiency(user, p) >= MASTERY_THRESHOLD for p in prereqs]
    return sum(met) / len(met)


def difficulty_fit(resource: Resource, user: User, skill_id: int) -> float:
    proficiency = get_proficiency(user, skill_id)
    expected_level = 1 + proficiency // 25  
    difficulty = resource.difficulty or 1
    return 1 - abs(difficulty - expected_level) / 4


def learning_style_match(resource: Resource, user: User) -> float:
    return 1.0 if user.preferred_style and resource.learning_style == user.preferred_style else 0.0


def historical_preference(resource: Resource, user: User) -> float:
    fb = (
        Feedback.query.filter_by(user_id=user.id, resource_id=resource.id)
        .order_by(Feedback.created_at.desc())
        .first()
    )
    if fb is None:
        return 0.5
    return {"like": 1.0, "dislike": 0.0}.get(fb.type, 0.5)


def score_resource(resource: Resource, user: User, skill_id: int, graph: dict) -> float:
    parts = {
        "goal_relevance": goal_relevance(resource, user),
        "skill_gap_coverage": skill_gap_coverage(skill_id, user),
        "prerequisite_match": prerequisite_match(skill_id, user, graph),
        "difficulty_fit": difficulty_fit(resource, user, skill_id),
        "learning_style_match": learning_style_match(resource, user),
        "historical_preference": historical_preference(resource, user),
    }
    return sum(WEIGHTS[k] * v for k, v in parts.items())


def best_resource_for_skill(skill_id: int, user: User, graph: dict) -> Tuple[Optional[Resource], float]:
    candidates = retrieve_candidates(skill_id)
    if not candidates:
        return None, 0.0
    scored = [(r, score_resource(r, user, skill_id, graph)) for r in candidates]
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored[0]




def generate_roadmap(user: User, persist: bool = True) -> List[dict]:
    if user.track is None:
        raise ValueError(f"User '{user.name or user.username}' has no track assigned yet.")

    graph = build_track_skill_graph(user.track)
    gaps = skill_gap(user, graph)

    roadmap = []
    for skill_id in gaps:
        resource, score = best_resource_for_skill(skill_id, user, graph)
        if resource is None:
            continue
        roadmap.append({
            "skill_id": skill_id,
            "skill": graph[skill_id]["name"],
            "resource_id": resource.id,
            "resource": resource.title,
            "resource_url": resource.url,
            "score": round(score, 3),
            "current_proficiency": get_proficiency(user, skill_id),
        })

    if persist:
        _persist_roadmap(user, roadmap)

    return roadmap


def _persist_roadmap(user: User, roadmap: List[dict]) -> None:
   
    LearningPath.query.filter_by(user_id=user.id, is_active=True).update({"is_active": False})
    path = LearningPath(user_id=user.id, is_active=True)
    db.session.add(path)
    db.session.flush()
    for idx, item in enumerate(roadmap):
        db.session.add(LearningPathItem(
            path_id=path.id,
            skill_id=item["skill_id"],
            resource_id=item["resource_id"],
            order_index=idx,
            score=item["score"],
        ))
    db.session.commit()



def complete_skill(user: User, skill_name: str, quiz_score: int) -> int:
    """
    Learner marks the recommended resource(s) for this skill as done ->
    quiz fires -> score lands here. Proficiency is DERIVED, not set
    directly: update_skill_mastery() only flips the skill to mastered
    once EVERY LearningPathItem tied to it (in the active path) has a
    SkillProgress score above MASTERY_THRESHOLD -- an AND across all
    required resources, not just this one quiz attempt. Today that's
    usually a single resource per skill, but this holds if a skill ever
    needs more than one.
    """
    skill = Skill.query.filter_by(name=skill_name).first()
    if skill is None:
        raise ValueError(f"No skill named '{skill_name}'")

    active_path = LearningPath.query.filter_by(user_id=user.id, is_active=True).first()
    if active_path is None:
        raise ValueError("User has no active learning path yet -- call generate_roadmap() first.")

    items = [i for i in active_path.items if i.skill_id == skill.id]
    if not items:
        raise ValueError(
            f"'{skill_name}' is not part of the user's current path "
            "(already mastered, or not reached yet)."
        )

    for item in items:
        item.completed_at = datetime.utcnow()
        db.session.add(SkillProgress(
            user_id=user.id,
            skill_id=skill.id,
            resource_id=item.resource_id,
            score=quiz_score,
        ))

    db.session.commit()
    return update_skill_mastery(user.id, skill.id)


def update_skill_mastery(user_id: int, skill_id: int) -> int:
    """
    A skill is mastered once every LearningPathItem tied to it (in the
    user's active path) has a SkillProgress score above MASTERY_THRESHOLD.
    Returns the resulting UserSkill.proficiency.
    """
    active_path = LearningPath.query.filter_by(user_id=user_id, is_active=True).first()
    if not active_path:
        return 0

    items = [i for i in active_path.items if i.skill_id == skill_id]
    if not items:
        return 0

    all_passed = True
    for item in items:
        best_score = (
            db.session.query(db.func.max(SkillProgress.score))
            .filter_by(user_id=user_id, skill_id=skill_id, resource_id=item.resource_id)
            .scalar()
        )
        if best_score is None or best_score <= MASTERY_THRESHOLD:
            all_passed = False
            break

    user_skill = UserSkill.query.filter_by(user_id=user_id, skill_id=skill_id).first()
    if user_skill is None:
        user_skill = UserSkill(user_id=user_id, skill_id=skill_id, proficiency=0)
        db.session.add(user_skill)

    if all_passed:
        user_skill.proficiency = 100

    db.session.commit()
    return user_skill.proficiency


def get_active_roadmap(user: User) -> List[dict]:
   
    active_path = LearningPath.query.filter_by(user_id=user.id, is_active=True).first()
    if active_path is None:
        
        return generate_roadmap(user, persist=True)

    roadmap = []
    for item in active_path.items:
        roadmap.append({
            "skill_id": item.skill_id,
            "skill": item.skill.name,
            "resource_id": item.resource_id,
            "resource": item.resource.title,
            "resource_url": item.resource.url,
            "score": item.score,
            "current_proficiency": get_proficiency(user, item.skill_id),
            "completed": item.completed_at is not None,
        })
    return roadmap