

import os
import sys

from models import (
    db,
    Track,
    TrackSkill,
    Skill,
    Resource,
    ResourceSkill,
)



ML_ENGINEER_TRACK = {
    "name": "ML Engineer",
    "description": "From math foundations to deploying deep learning models in production.",
    "skills": [
        ("Statistics", "Mathematics", 1, 12, "reading"),
        ("Probability", "Mathematics", 2, 10, "reading"),
        ("Algebra", "Mathematics", 1, 10, "reading"),
        ("Calculus", "Mathematics", 2, 14, "reading"),
        ("Python Programming", "Programming", 2, 20, "hands-on"),
        ("Machine Learning Algorithms", "Machine Learning", 3, 18, "hands-on"),
        ("Scikit-learn with Python", "Machine Learning", 3, 12, "hands-on"),
        ("Deep Learning Models", "Deep Learning", 4, 20, "hands-on"),
        ("PyTorch / Deep Learning", "Deep Learning", 4, 20, "hands-on"),
        ("Docker & Flask APIs", "MLOps", 3, 14, "hands-on"),
        ("MLOps", "MLOps", 5, 18, "hands-on"),
    ],
}

MERN_TRACK = {
    "name": "MERN Stack Developer",
    "description": "MongoDB, Express, React, Node — from HTML basics to a deployed full-stack app.",
    "skills": [
        ("HTML & CSS Fundamentals", "Web Fundamentals", 1, 10, "hands-on"),
        ("JavaScript Fundamentals", "Web Fundamentals", 2, 16, "hands-on"),
        ("ES6+ & Asynchronous JavaScript", "Web Fundamentals", 2, 10, "hands-on"),
        ("React.js", "Frontend", 3, 20, "hands-on"),
        ("Node.js", "Backend", 3, 14, "hands-on"),
        ("Express.js", "Backend", 3, 12, "hands-on"),
        ("MongoDB & Mongoose", "Database", 3, 12, "hands-on"),
        ("REST API Design", "Backend", 3, 10, "hands-on"),
        ("MERN Full-Stack Integration & Deployment", "Full Stack", 4, 16, "hands-on"),
    ],
}

JAVA_TRACK = {
    "name": "Java Developer (Spring Boot)",
    "description": "Core Java through Spring Boot microservices.",
    "skills": [
        ("Java Fundamentals", "Programming", 1, 16, "hands-on"),
        ("Object-Oriented Programming in Java", "Programming", 2, 14, "hands-on"),
        ("Collections & Generics", "Programming", 2, 10, "hands-on"),
        ("Exception Handling & File I/O", "Programming", 2, 8, "hands-on"),
        ("JDBC & SQL Basics", "Database", 3, 12, "hands-on"),
        ("Maven-Gradle & Build Tools", "Tooling", 2, 6, "hands-on"),
        ("Spring Core (IoC & DI)", "Backend", 3, 14, "hands-on"),
        ("Spring MVC", "Backend", 3, 12, "hands-on"),
        ("Spring Boot", "Backend", 3, 16, "hands-on"),
        ("Spring Data JPA & Hibernate", "Backend", 4, 14, "hands-on"),
        ("Spring Security", "Backend", 4, 12, "hands-on"),
        ("Microservices with Spring Boot", "Backend", 5, 18, "hands-on"),
    ],
}

ALL_TRACKS = [ML_ENGINEER_TRACK, MERN_TRACK, JAVA_TRACK]


def get_or_create_skill(name, domain):
    skill = Skill.query.filter_by(name=name).first()
    if skill is None:
        skill = Skill(name=name, domain=domain)
        db.session.add(skill)
        db.session.flush()  
        print(f"  + created skill: {name}")
    return skill


def link_prerequisite(skill: Skill, prerequisite: Skill):
    """Adds `prerequisite` as a prerequisite of `skill`, if not already linked."""
    if prerequisite not in skill.prerequisites:
        skill.prerequisites.append(prerequisite)
        print(f"    - prereq: {prerequisite.name} -> {skill.name}")


def get_or_create_track(name, description):
    track = Track.query.filter_by(name=name).first()
    if track is None:
        track = Track(name=name, description=description)
        db.session.add(track)
        db.session.flush()
        print(f"+ created track: {name}")
    return track


def link_track_skill(track: Track, skill: Skill):
    exists = TrackSkill.query.filter_by(track_id=track.id, skill_id=skill.id).first()
    if exists is None:
        db.session.add(TrackSkill(track_id=track.id, skill_id=skill.id))


def get_or_create_resource(title, skill: Skill, platform, difficulty, duration_hours, learning_style):
    resource = Resource.query.filter_by(title=title).first()
    if resource is None:
        resource = Resource(
            title=title,
            # Placeholder URL — swap in a real course/article/video link.
            url=f"https://example.com/resources/{title.lower().replace(' ', '-').replace('/', '-')}",
            platform=platform,
            domain=skill.domain,
            difficulty=difficulty,
            duration_hours=duration_hours,
            learning_style=learning_style,
            description=f"Placeholder resource covering: {skill.name}. Replace with a real, curated resource.",
        )
        db.session.add(resource)
        db.session.flush()

    link = ResourceSkill.query.filter_by(resource_id=resource.id, skill_id=skill.id).first()
    if link is None:
        db.session.add(ResourceSkill(resource_id=resource.id, skill_id=skill.id))

    return resource


# ---------------------------------------------------------------------------
# 3. SEED LOGIC
# ---------------------------------------------------------------------------

def seed_track(track_def):
    print(f"\nSeeding track: {track_def['name']}")
    track = get_or_create_track(track_def["name"], track_def["description"])

    prev_skill = None
    for name, domain, difficulty, duration_hours, learning_style in track_def["skills"]:
        skill = get_or_create_skill(name, domain)
        link_track_skill(track, skill)

        if prev_skill is not None:
            link_prerequisite(skill, prev_skill)

        get_or_create_resource(
            title=f"Intro to {name}",
            skill=skill,
            platform="placeholder-platform",
            difficulty=difficulty,
            duration_hours=duration_hours,
            learning_style=learning_style,
        )

        prev_skill = skill


def run_seed():
    for track_def in ALL_TRACKS:
        seed_track(track_def)
    db.session.commit()
    print("\nSeeding complete.")


# ---------------------------------------------------------------------------
# 4. STANDALONE EXECUTION
# ---------------------------------------------------------------------------

def _load_app():
    """Try to reuse the project's own Flask app; fall back to a minimal one."""
    try:
        # Adjust this import if your Flask app object lives somewhere else,
        # e.g. `from wsgi import app` or `from run import create_app`.
        from app import app  # type: ignore
        return app
    except Exception:
        from flask import Flask

        db_uri = os.environ.get("SQLALCHEMY_DATABASE_URI") or os.environ.get("DATABASE_URL")
        if not db_uri:
            print(
                "Could not import an existing Flask `app`, and no "
                "SQLALCHEMY_DATABASE_URI / DATABASE_URL env var was set.\n"
                "Either run this from within your app's context, or set the "
                "env var and re-run.",
                file=sys.stderr,
            )
            sys.exit(1)

        app = Flask(__name__)
        app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
        db.init_app(app)
        return app


