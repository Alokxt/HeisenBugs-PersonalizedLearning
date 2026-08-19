from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import db, User
from recommender.recommend import generate_roadmap, get_active_roadmap, set_user_track, complete_skill
from recommender.track_resolver  import resolve_track
import os 

user_bp = Blueprint("user", __name__)

@user_bp.route("/roadmap", methods=["GET"])
@jwt_required()
def get_roadmap():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
   
    if user is None:
        return jsonify({"error": "User not found."}), 404
  
    if user.track is None:
        return jsonify({"error": "No track assigned yet."}), 422

    try:
        roadmap = get_active_roadmap(user)
    except Exception:
        return jsonify({"error": "Could not load roadmap."}), 500

    return jsonify({"roadmap": roadmap}), 200


@user_bp.route("/roadmap/regenerate", methods=["POST"])
@jwt_required()
def regenerate_roadmap():
    
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if user is None:
        return jsonify({"error": "User not found."}), 404
    if user.track is None:
        return jsonify({"error": "No track assigned yet."}), 422

    try:
        roadmap = generate_roadmap(user)
    except Exception:
        return jsonify({"error": "Could not regenerate roadmap."}), 500

    return jsonify({"roadmap": roadmap}), 200


@user_bp.route("/skills/complete", methods=["POST"])
@jwt_required()
def complete_skill_route():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if user is None:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}
    skill_name = (data.get("skill") or "").strip()
    quiz_score = data.get("quiz_score")

    if not skill_name:
        return jsonify({"errors": {"skill": "skill is required."}}), 400
    if not isinstance(quiz_score, int) or not (0 <= quiz_score <= 100):
        return jsonify({"errors": {"quiz_score": "quiz_score must be an integer 0-100."}}), 400

    try:
        proficiency = complete_skill(user, skill_name, quiz_score)
    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except Exception:
        return jsonify({"error": "Could not record skill completion."}), 500

    return jsonify({"skill": skill_name, "proficiency": proficiency}), 200
