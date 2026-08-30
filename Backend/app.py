from flask import Flask
from seed import run_seed
from models import db
import re
from typing import Dict, List, Optional, Tuple
from routes.auth  import auth_bp
from routes.userapp import user_bp
from flask_cors import CORS
import os 
from flask_jwt_extended import JWTManager


app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URI")
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
jwt = JWTManager(app)

db.init_app(app)
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp,url_prefix="/user")



DEMO_EMAIL = "aditi.demo@example.com"
if __name__ == "__main__":
    with app.app_context():
        db.create_all()  
        run_seed()
    app.run(debug=False, use_reloader=False)