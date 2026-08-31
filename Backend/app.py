from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from routes.auth import auth_bp
import os

def create_app():
    app = Flask(__name__)
    
    # Configure SQLite Database
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configure JWT
    app.config['JWT_SECRET_KEY'] = 'super-secret-heisenbugs-key-change-in-prod'
    
    # Enable CORS for frontend requests
    CORS(app)
    
    # Initialize extensions
    db.init_app(app)
    JWTManager(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    
    # Import all models here so SQLAlchemy knows about them before create_all
    try:
        from models import User, Track, TrackSkill, Skill, skill_prerequisites, UserSkill, Resource, ResourceSkill, LearningPath, LearningPathItem, SkillProgress, Feedback
    except Exception as e:
        pass
    
    # Create database tables if they don't exist
    with app.app_context():
        os.makedirs(os.path.join(basedir, 'instance'), exist_ok=True)
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=False, port=5000)
