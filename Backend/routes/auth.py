from flask import Blueprint, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User
from recommender.recommend import generate_roadmap, get_active_roadmap, set_user_track, complete_skill
from recommender.track_resolver import resolve_track

auth_bp = Blueprint("auth", __name__)

MIN_PASSWORD_LENGTH = 8
LOW_CONFIDENCE_THRESHOLD = 0.15  


@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    goal = (data.get("goal") or "").strip()
    password = data.get("password1") or data.get("password") or ""
    pass2 = data.get("password2", password)  

    
    errors = {}
    if not username:
        errors["username"] = "Username is required."
    if not email or "@" not in email:
        errors["email"] = "A valid email is required."
    if not goal:
        errors["goal"] = "Please describe your learning goal."
    if len(password) < MIN_PASSWORD_LENGTH:
        errors["password"] = f"Password must be at least {MIN_PASSWORD_LENGTH} characters."
    elif pass2 != password:
        errors["password2"] = "Passwords do not match."

    if errors:
        return jsonify({"errors": errors}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"errors": {"username": "That username is already taken."}}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"errors": {"email": "An account with that email already exists."}}), 409

    try:
        user = User(username=username, name=username, email=email, goal_text=goal)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()  

        track, confidence = resolve_track(goal)
        if track is None:
            db.session.rollback()
            return jsonify({
                "errors": {"goal": (
                    "Could not determine a learning track from your goal. "
                    "Try mentioning a field like 'machine learning', "
                    "'web development', or 'Java backend'."
                )}
            }), 422
       
        set_user_track(user, track)
       
        db.session.commit()

        roadmap = generate_roadmap(user)

    except Exception:
        db.session.rollback()
        
        return jsonify({"error": "Something went wrong while creating your account. Please try again."}), 500

    token = create_access_token(identity=str(user.id))
    response = {
        "access_token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "goal": user.goal_text,
        },
        "track": {
            "id": track.id,
            "name": track.name,
            "match_confidence": confidence,
        },
        "roadmap": roadmap,
    }
    if confidence < LOW_CONFIDENCE_THRESHOLD:
        response["note"] = (
            "Track match confidence was low — consider confirming the track "
            "with the user or letting them pick manually."
        )

    return jsonify(response), 201


@auth_bp.route("/api/login", methods=["POST"])
def login():
    
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    user = User.query.filter_by(username=username).first()
    if user is None or not user.check_password(password):
        return jsonify({"errors": {"login": "Invalid username or password."}}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "goal": user.goal_text,
        },
    }), 200

