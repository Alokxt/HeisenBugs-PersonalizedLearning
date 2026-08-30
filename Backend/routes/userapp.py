from flask import Blueprint, jsonify, request , current_app
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import db, User
from recommender.recommend import generate_roadmap, get_active_roadmap, set_user_track, complete_skill , get_skill_graph_view , build_chat_context , set_skill_excluded , reorder_active_path ,get_progress_view
from recommender.track_resolver import resolve_track
import os 
import re 
import json 
from embeddings.embedds import get_embeddings
user_bp = Blueprint("user", __name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
Knowledge_PATH = os.path.join(BASE_DIR, "rag_index")
def get_vectorstores():
    from langchain_community.vectorstores import FAISS
    return FAISS


def get_prompttemp():
    from langchain_core.prompts import PromptTemplate
    return PromptTemplate
def get_strparser():
    from langchain_core.output_parsers import StrOutputParser
    parser = StrOutputParser()
    return parser
def get_vectorr():
   FAISS = get_vectorstores()
   vectorR = FAISS.load_local( str(Knowledge_PATH), get_embeddings(), allow_dangerous_deserialization=True )
   return vectorR

def get_groqmodel():
    from langchain_groq import ChatGroq
    model = ChatGroq(
        model_name="openai/gpt-oss-20b",
        api_key=os.environ["GROQ_API_KEY"],
        temperature=0.7
    )
    return model
def get_groqmodel2():
    from langchain_groq import ChatGroq

    return ChatGroq(
        model="openai/gpt-oss-20b",
        api_key=os.environ["GROQ_API_KEY"],
        temperature=0.3,
        include_reasoning=False,
        max_tokens=8000,
    )

def get_groqmodel3():
    from langchain_groq import ChatGroq
    model = ChatGroq(
        model_name="openai/gpt-oss-20b",
        api_key=os.environ["GROQ_API_KEY"],
        temperature=0.7,
        model_kwargs={"response_format": {"type": "json_object"}},
    )
    return model

def generate_response(query):
    PromptTemplate = get_prompttemp()
    prompt = PromptTemplate(
        template="""
    You are an academic assistant for undergraduate core engineering subjects.

Explain topics accurately using standard engineering knowledge.
The provided context is only for syllabus scope alignment.

Rules:
- Stay strictly within core engineering subjects.
- Do not introduce unrelated domains.
- If the question is outside the subject, say so clearly.
- Use a formal, textbook-style explanation.



User query:
{query}


Explaination should be Detailed and correct. Do not hallucinate.


\n

        """,
        input_variables=['query'],
       
    )
    #model = get_chatmodel()
    model = get_groqmodel()
    parser = get_strparser()
    chain = prompt | model | parser
   
    

    raw = chain.invoke({'query':query})

    return raw

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
        
    except Exception as e:
       
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

    return jsonify({"success":True,"skill": skill_name, "proficiency": proficiency}), 200


@user_bp.route("/skill-graph", methods=["GET"])
@jwt_required()
def skill_graph_view():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if user is None:
        return jsonify({"error": "User not found."}), 404
    if user.track is None:
        return jsonify({"error": "No track assigned yet."}), 422

    try:
        graph = get_skill_graph_view(user)
    except Exception:
    
        return jsonify({"error": "Could not load skill graph."}), 500

    return jsonify({"track": user.track.name, "skills": graph}), 200
 
 
 
 



CHAT_PROMPT = """
You are a learning-path assistant for a study roadmap platform.

You are given:
- CONTEXT: the user's track, their full skill graph (every skill, whether
  it's mastered, excluded, and its prerequisites), and their current
  roadmap (the skills still outstanding, in order, each with a
  recommended resource).
- MESSAGE: the user's question or request.

Rules you must follow strictly:
- Only ever reference a skill_id that appears in CONTEXT. Never invent one.
- If the user asks a question ("why is X next", "what should I do first"),
  answer conversationally using only facts from CONTEXT. Do not propose
  actions for a question that isn't requesting a change.
- If the user explicitly asks to remove/skip a skill (e.g. "I already
  know Statistics", "remove Probability"), emit an "exclude" action for
  that skill_id.
- If the user asks to bring a skill back (e.g. "add Statistics back"),
  emit an "include" action.
- If the user asks to change the order (e.g. "do React before Node"),
  emit ONE "reorder" action containing the FULL desired order of
  skill_ids for everything currently in their roadmap -- not just the
  ones they mentioned. Keep every roadmap skill_id you weren't told to
  move in its existing relative order.
- Never emit an action for a skill_id that is not in CONTEXT.
- If nothing needs to change, return an empty actions list.

Return ONLY valid JSON, no markdown fences, no text outside the JSON:
{{
  "reply": "A short, natural-language response to the user.",
  "actions": [
    {{"type": "exclude", "skill_id": 3}},
    {{"type": "include", "skill_id": 3}},
    {{"type": "reorder", "order": [5, 7, 4]}}
  ]
}}

CONTEXT:
{context}

MESSAGE:
{message}
"""


@user_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if user is None:
        return jsonify({"error": "User not found."}), 404
    if user.track is None:
        return jsonify({"error": "No track assigned yet."}), 422

    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"errors": {"message": "message is required."}}), 400

    try:
        context = build_chat_context(user)
        valid_skill_ids = {s["skill_id"] for s in context["skill_graph"]}

        PromptTemplate = get_prompttemp()
        prompt = PromptTemplate(
            template=CHAT_PROMPT,
            input_variables=["context", "message"],
        )
        model = get_groqmodel()
        parser = get_strparser()
        chain = prompt | model | parser

        raw = chain.invoke({"context": json.dumps(context), "message": message})
        parsed = clean_llm_json(raw)

        reply = parsed.get("reply", "")
        actions = parsed.get("actions", [])

       
        changed = False
        for action in actions:
            a_type = action.get("type")

            if a_type in ("exclude", "include"):
                skill_id = action.get("skill_id")
                if skill_id in valid_skill_ids:
                    set_skill_excluded(user, skill_id, a_type == "exclude")
                    changed = True

            elif a_type == "reorder":
                order = [sid for sid in action.get("order", []) if sid in valid_skill_ids]
                if order:
                    reorder_active_path(user, order)
                    changed = True

       
        if any(a.get("type") in ("exclude", "include") for a in actions):
            roadmap = generate_roadmap(user)
        else:
            roadmap = get_active_roadmap(user)

    except Exception:
        current_app.logger.exception("chat failed for user_id=%s", user_id)
        return jsonify({"error": "Could not process that message."}), 500

    return jsonify({"reply": reply, "roadmap": roadmap}), 200

def extract_text(raw):
    if isinstance(raw, str):
        return raw

    content = getattr(raw, "content", raw)
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = [
            b.get("text", "") if isinstance(b, dict) and b.get("type") == "text"
            else b if isinstance(b, str) else ""
            for b in content
        ]
        joined = "".join(parts).strip()
        if joined:
            return joined

    return str(raw)

import json_repair

def clean_llm_json(text):
    if isinstance(text, dict):
        return text
    if not isinstance(text, str):
        raise ValueError(f"Expected string/dict, got {type(text)}")

    cleaned = re.sub(r"```(?:json)?", "", text, flags=re.IGNORECASE).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("Quiz generation returned no parseable JSON.")

    json_str = cleaned[start:end + 1]

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
       
        repaired = json_repair.loads(json_str)
        if not repaired:
            raise ValueError("Quiz generation returned malformed, unrepairable JSON.")
        return repaired

def clean_llm_json2(text):
    text = re.sub(r"```json|```", "", text).strip()
    return json.loads(text)

@user_bp.route("/quiz/<skil>", methods=["GET"])
@jwt_required()
def quiz_generator(skil):
    try:
        if len(skil) == 0:
            return jsonify({"success":False,"Message":"Give some topics"})
        
        num_ques = 5
       

        

        ans  = generate_response(skil)
        PromptTemplate = get_prompttemp()
        temp = PromptTemplate(
            template="""
You are an AI exam paper generator for an Engineering-level technical assessment.

You will be given STUDY CONTENT below.
This content is the ONLY authoritative source you may use to create questions.

Rules you must follow strictly:

• All questions must be based on the provided content
• You may ask on closely related concepts implied by the content, but nothing outside its scope
• Difficulty level must be MEDIUM to HARD (conceptual + application based, not trivial recall)
• Do NOT introduce topics not present in the content
• Avoid vague or opinion-based questions
• Ensure each question has one clear correct answer

Test requirements:

• Total questions: {num_ques}
• Mix of:
– Conceptual understanding
– Algorithm/process reasoning
– Edge cases or practical implications

For each question provide:

The question

The correct answer

A short explanation justifying the answer



STUDY CONTENT:
{content}

If any part of the content is insufficient to generate the meaningful medium-hard questions, focus on depth rather than inventing new topics.
You should Strictly return the Reponse in this Format only .
Return ONLY valid JSON. Do not include markdown, code fences, or any text outside the JSON object.
{{
                "questions": [
                    {{
                    "question": "Question text here",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "answer": "Correct Option (e.g., B)",
                    "explanation": "Why the correct option is correct."
                    }},
                    {{
                    "question": "...",
                    "options": ["...", "...", "...", "..."],
                    "answer": "...",
                    "explanation": "Why the correct option is correct."
                    }}
                ]
                }}
""",
input_variables=['num_ques','content'],
        )
        #model = get_chatmodel()
        model = get_groqmodel3()
        parser = get_strparser()
        chain = temp | model | parser

   
    

        raw = chain.invoke({'content':ans,'num_ques':num_ques})
        extra = extract_text(raw)
        ("TYPE:", type(raw))
        ("RAW:", repr(raw))
        parsed = clean_llm_json(raw)
        

        return jsonify({"success":True,"content":parsed})
    except Exception as e:
        (e)
        return jsonify({"success": False, "error": str(e)}), 500



@user_bp.route("/progress", methods=["GET"])
@jwt_required()
def progress_view():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if user is None:
        return jsonify({"error": "User not found."}), 404
    if user.track is None:
        return jsonify({"error": "No track assigned yet."}), 422
 
    try:
        progress = get_progress_view(user)
    except Exception:
        current_app.logger.exception("progress_view failed for user_id=%s", user_id)
        return jsonify({"error": "Could not load progress."}), 500
 
    return jsonify({"track": user.track.name, "progress": progress}), 200
 