from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=True)
    username = db.Column(db.String(80), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)

    goal_text = db.Column(db.String(300), nullable=True)

    
    track_id = db.Column(db.Integer, db.ForeignKey("track.id"), nullable=True)

    
    preferred_style = db.Column(db.String(50), nullable=True)   
    hours_per_week = db.Column(db.Integer, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    track = db.relationship("Track", back_populates="users")
    skills = db.relationship("UserSkill", back_populates="user")
    skill_progress = db.relationship("SkillProgress", back_populates="user")
    feedback = db.relationship("Feedback", back_populates="user")
    learning_paths = db.relationship("LearningPath", back_populates="user")

    def set_password(self, raw_password: str) -> None:
        self.password_hash = generate_password_hash(raw_password)
 
    def check_password(self, raw_password: str) -> bool:
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, raw_password)




class Track(db.Model):
    __tablename__ = "track"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  
    description = db.Column(db.String(500), nullable=True)

    users = db.relationship("User", back_populates="track")
    required_skills = db.relationship("TrackSkill", back_populates="track")


class TrackSkill(db.Model):
   
    __tablename__ = "track_skill"

    id = db.Column(db.Integer, primary_key=True)
    track_id = db.Column(db.Integer, db.ForeignKey("track.id"), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey("skill.id"), nullable=False)

    track = db.relationship("Track", back_populates="required_skills")
    skill = db.relationship("Skill")




class Skill(db.Model):
    __tablename__ = "skill"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    domain = db.Column(db.String(100), nullable=True)  

    prerequisites = db.relationship(
        "Skill",
        secondary="skill_prerequisites",
        primaryjoin="Skill.id==skill_prerequisites.c.skill_id",
        secondaryjoin="Skill.id==skill_prerequisites.c.prerequisite_id",
        back_populates="required_for",
    )
    required_for = db.relationship(
        "Skill",
        secondary="skill_prerequisites",
        primaryjoin="Skill.id==skill_prerequisites.c.prerequisite_id",
        secondaryjoin="Skill.id==skill_prerequisites.c.skill_id",
        back_populates="prerequisites",
    )


skill_prerequisites = db.Table(
    "skill_prerequisites",
    db.Column("skill_id", db.Integer, db.ForeignKey("skill.id"), primary_key=True),
    db.Column("prerequisite_id", db.Integer, db.ForeignKey("skill.id"), primary_key=True),
)


class UserSkill(db.Model):
  
    __tablename__ = "user_skill"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey("skill.id"), nullable=False)
    proficiency = db.Column(db.Integer, default=0)  # 0-100
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", back_populates="skills")
    skill = db.relationship("Skill")

    __table_args__ = (db.UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),)




class Resource(db.Model):
    __tablename__ = "resource"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    url = db.Column(db.String(500), nullable=False)         
    platform = db.Column(db.String(100), nullable=True)      
    domain = db.Column(db.String(100), nullable=True)
    difficulty = db.Column(db.Integer, default=1)             
    duration_hours = db.Column(db.Integer, nullable=True)
    learning_style = db.Column(db.String(50), nullable=True) 
    description = db.Column(db.Text, nullable=True)

    
    embedding = db.Column(db.Text, nullable=True)

    skills = db.relationship("ResourceSkill", back_populates="resource")


class ResourceSkill(db.Model):
   
    __tablename__ = "resource_skill"

    id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column(db.Integer, db.ForeignKey("resource.id"), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey("skill.id"), nullable=False)

    resource = db.relationship("Resource", back_populates="skills")
    skill = db.relationship("Skill")




class LearningPath(db.Model):
    __tablename__ = "learning_path"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)  

    user = db.relationship("User", back_populates="learning_paths")
    items = db.relationship("LearningPathItem", back_populates="path", order_by="LearningPathItem.order_index")


class LearningPathItem(db.Model):
    __tablename__ = "learning_path_item"

    id = db.Column(db.Integer, primary_key=True)
    path_id = db.Column(db.Integer, db.ForeignKey("learning_path.id"), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey("skill.id"), nullable=False)
    resource_id = db.Column(db.Integer, db.ForeignKey("resource.id"), nullable=False)
    order_index = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Float, nullable=True)  

    
    completed_at = db.Column(db.DateTime, nullable=True)

    path = db.relationship("LearningPath", back_populates="items")
    skill = db.relationship("Skill")
    resource = db.relationship("Resource")




class SkillProgress(db.Model):
   
    __tablename__ = "skill_progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey("skill.id"), nullable=False)
    resource_id = db.Column(db.Integer, db.ForeignKey("resource.id"), nullable=True)
    score = db.Column(db.Integer, default=0)  # 0-100
    taken_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="skill_progress")
    skill = db.relationship("Skill")
    resource = db.relationship("Resource")


class Feedback(db.Model):
   
    __tablename__ = "feedback"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    resource_id = db.Column(db.Integer, db.ForeignKey("resource.id"), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # "like" / "dislike" / "skip"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="feedback")
    resource = db.relationship("Resource")





