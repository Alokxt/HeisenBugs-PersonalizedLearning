from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from routes.auth import auth_bp
from routes.userapp import user_bp
from seed import run_seed
import os

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
# Use env var if available, otherwise fallback to local sqlite for development
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URI", 'sqlite:///' + os.path.join(basedir, 'instance', 'app.db'))
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "super-secret-heisenbugs-key-change-in-prod")

jwt = JWTManager(app)

db.init_app(app)
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp, url_prefix="/user")

# Import all models here so SQLAlchemy knows about them before create_all
try:
    from models import User, Track, TrackSkill, Skill, skill_prerequisites, UserSkill, Resource, ResourceSkill, LearningPath, LearningPathItem, SkillProgress, Feedback
except Exception as e:
    pass

if __name__ == "__main__":
    with app.app_context():
        os.makedirs(os.path.join(basedir, 'instance'), exist_ok=True)
        db.create_all()
        try:
            run_seed()
        except Exception as e:
            print("Seed failed or already seeded:", e)
            
    app.run(debug=False, use_reloader=False, port=5000)
