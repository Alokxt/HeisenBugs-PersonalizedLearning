## AI-Powered Personalized Learning Path Recommender

An intelligent learning assistant that turns a learner's goal, typed in plain English, into a structured, prerequisite-aware roadmap of skills and resources — then explains every recommendation and adapts the path as the learner progresses.

Built for the **AI-Powered Personalized Learning Path Recommender** problem statement.

---

## Table of Contents

- [Problem We're Solving](#problem-were-solving)
- [Our Approach](#our-approach)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Data Model](#data-model)
- [AI/ML Techniques Used](#aiml-techniques-used)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [API Reference](#api-reference)
- [Team](#team)
- [Challenges Faced](#challenges-faced)
- [Future Scope](#future-scope)

---

## Problem We're Solving

Online learning platforms have thousands of courses, but a course list isn't a plan. Two learners with the same goal ("become a Data Analyst") can have completely different starting points — different skill levels, different available hours per week, different learning styles. A one-size-fits-all course list doesn't tell either of them **what to learn first, why, or when they're ready for the next step.**

Learnflow solves the *sequencing* problem, not just the *recommendation* problem: it builds a personalized, prerequisite-ordered roadmap for each learner and keeps it up to date as they learn.

## Our Approach

1. **Understand** — a learner describes their goal in natural language; the system resolves it to a career track and captures their profile.
2. **Diagnose** — the system compares what the learner already knows against what their goal track requires, producing a skill gap.
3. **Sequence** — the skill gap is topologically sorted against a prerequisite graph, so foundational skills always come before advanced ones.
4. **Recommend** — for every skill in the path, the best-fit resource is scored and selected using a multi-factor recommendation function.
5. **Explain** — an LLM-backed assistant explains why each item is on the path and can answer follow-up questions.
6. **Adapt** — quiz scores, completions, and chat-driven feedback (skip/reorder/exclude a skill) regenerate the roadmap in real time.

## Features

- **Conversational goal capture** — learner types their goal in free text; it's matched to a career track (ML Engineer, MERN Stack Developer, Java/Spring Boot Developer) via keyword-based resolution.
- **Learner profiling** — tracks per-user skill proficiency, preferred learning style, weekly time budget, and goal text.
- **Skill-gap based recommendation engine** — scores candidate resources per skill using goal relevance, skill-gap coverage, prerequisite match, difficulty fit, learning-style match, and historical preference.
- **Prerequisite-aware roadmap generator** — builds a directed skill graph per track and topologically sorts it so the path always respects prerequisites.
- **AI assistant (chat)** — LLM-powered chat that explains recommendations, answers learner queries, and can trigger path actions (exclude/include a skill, reorder the path) directly from natural language.
- **Auto-generated quizzes** — on-demand quiz generation per skill to assess mastery and feed progress back into the system.
- **Adaptive re-planning** — completing a skill, scoring on a quiz, or chatting with the assistant can regenerate the active roadmap.
- **Dashboard** — visual roadmap timeline, skill graph view, and progress view showing what's done, current, and upcoming.
- **Authentication** — JWT-based register/login flow.

## System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                  FRONTEND  (HTML / CSS / JS)                  │
│   Login & Register . Roadmap Dashboard . Progress . AI Chat   │
└───────────────────────────────────────────────────────────────┘
               │ REST  (fetch + JWT bearer token)
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                    FLASK BACKEND  (app.py)                    │
├───────────────────────────────────────────────────────────────┤
│  auth.py            userapp.py          track_resolver.py     │
│  register / login   roadmap, chat,      goal text -> track    │
│  (JWT)              quiz, progress      matching              │
└───────────────────────────────────────────────────────────────┘
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                        RECOMMENDER.PY                         │
│   skill graph + topological sort + resource scoring engine    │
└───────────────────────────────────────────────────────────────┘
                                ▼
┌───────────────────────────────────────────────────────────────┐
│ MODELS.PY (SQLAlchemy)        | EMBEDDS.PY + RAG              │
│ User / Track / Skill /        | FAISS index +                 │
│ Resource / LearningPath /     | Groq LLM (chat,               │
│ Feedback / etc.               | quiz generation)              │
└───────────────────────────────────────────────────────────────┘
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                       SQLite  (app.db)                        │
└───────────────────────────────────────────────────────────────┘
```

**Flow:** browser hits Flask via REST → `auth.py` handles login/register, `userapp.py` handles roadmap/chat/quiz/progress, `track_resolver.py` maps free-text goals to a track → all three call into `recommender.py`, which builds the skill graph, topologically sorts it, and scores resources → results are persisted via `models.py` (SQLite) and explanations/chat/quizzes are generated through `embedds.py`'s RAG + Groq LLM pipeline.

**Flow example:** learner registers with a goal → `track_resolver` matches the goal text to a track → `recommender.generate_roadmap()` builds the skill graph for that track, computes the skill gap against the learner's current proficiency, topologically sorts it, and scores the best resource for each skill → the ordered roadmap is persisted and served to the dashboard. Chatting with the assistant re-invokes the same recommender functions based on actions the LLM extracts from the conversation.

## Tech Stack

**Backend**
- Python 3, Flask (`app.py`, blueprints for `auth` and `user`)
- Flask-SQLAlchemy (ORM) + SQLite (`app.db`)
- Flask-JWT-Extended (authentication)
- Flask-CORS

**AI / ML**
- LangChain + Groq (`langchain-groq`, model: `openai/gpt-oss-20b`) for the conversational assistant, roadmap explanations, and quiz generation
- FAISS (`langchain_community.vectorstores`) for retrieval-augmented context (`rag_index`)
- Custom embeddings via Bytez (`nomic-ai/nomic-embed-text-v1.5`)
- Rule-based + heuristic scoring engine (skill-gap coverage, prerequisite match, difficulty fit, learning-style match, historical preference) combined with graph algorithms (topological sort over the skill/prerequisite DAG)

**Frontend**
- HTML5, CSS3, vanilla JavaScript (no framework) — `login.html`, `register.html`, `roadmap.html` (dashboard), `progress.html`, `quiz.html`, `chat_test_console.html`
- `fetch` API for all backend communication, JWT stored in `localStorage`

## Data Model

Core entities (see `Backend/models.py`):

| Model | Purpose |
|---|---|
| `User` | learner profile — goal text, track, preferred style, hours/week |
| `Track` | a career goal/domain (e.g. ML Engineer) |
| `Skill` / `skill_prerequisites` | individual skills and their prerequisite relationships (a DAG) |
| `TrackSkill` | which skills a track requires |
| `UserSkill` | a learner's current proficiency (0–100) per skill |
| `Resource` | a learning resource — title, URL, platform, difficulty, duration, learning style |
| `ResourceSkill` | which skills a resource teaches |
| `LearningPath` / `LearningPathItem` | the generated roadmap and its ordered items |
| `SkillProgress` | quiz/assessment attempts and scores per skill |
| `Feedback` | learner feedback (like/dislike/skip) on a resource |

## AI/ML Techniques Used

1. **Goal-to-track resolution** — tokenized keyword-overlap matching between free-text goals and predefined track vocabularies.
2. **Skill graph + topological sort** — prerequisites modeled as a directed graph; `topo_order()` guarantees foundational skills precede advanced ones in the roadmap.
3. **Multi-factor resource scoring** — `score_resource()` combines goal relevance, skill-gap coverage, prerequisite match, difficulty fit, learning-style match, and historical preference into a single ranking score per candidate resource.
4. **Retrieval-Augmented Generation (RAG)** — a FAISS vector index over learning content, queried before generating explanations/answers, to ground LLM responses.
5. **LLM-driven conversational actions** — the chat endpoint sends the learner's live skill-graph context to an LLM (Groq), which returns both a natural-language reply and structured actions (`exclude`, `include`, `reorder`) that are applied directly to the learner's roadmap.
6. **LLM-based quiz generation** — skill content is passed to an LLM with a constrained prompt to generate medium-to-hard, content-grounded assessment questions.

## Project Structure

```
PersonalizedRoadmap/
├── Backend/
│   ├── app.py                # Flask app entrypoint, DB init, seeding
│   ├── auth.py                # /api/register, /api/login (JWT)
│   ├── userapp.py             # /user/roadmap, /chat, /quiz, /progress, /skill-graph
│   ├── recommender.py         # skill graph, topo sort, scoring, roadmap generation
│   ├── track_resolver.py      # goal text → track matching
│   ├── models.py              # SQLAlchemy models
│   ├── seed.py                # seeds tracks/skills/resources
│   ├── embedds.py             # Bytez embeddings wrapper for RAG
│   ├── demo_road.py           # demo/sample roadmap script
│   └── requirements.txt
└── frontend/
    ├── login.html
    ├── register.html
    ├── roadmap.html           # main dashboard (skill roadmap timeline)
    ├── progress.html
    ├── quiz.html
    └── chat_test_console.html # AI assistant chat interface
```

## Setup & Installation

### Prerequisites
- Python 3.10+
- A [Groq API key](https://console.groq.com/) (free tier)
- A [Bytez API key](https://bytez.com/) (for embeddings, used by the RAG assistant)

### Backend

```bash
cd Backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install flask flask-sqlalchemy flask-cors flask-jwt-extended langchain langchain-groq langchain-community bytez
```

Create a `.env` file inside `Backend/`:

```env
GROQ_API_KEY=your_groq_api_key
BYTEZ_API_KEY=your_bytez_api_key
JWT_SECRET_KEY=some-secret-key
```

Run the server (this also creates and seeds the SQLite database on first run):

```bash
python app.py
```

The API will be available at `http://localhost:5000`.

### Frontend

No build step required — it's static HTML/CSS/JS.

```bash
cd frontend
python -m http.server 5500
```

Open `http://localhost:5500/register.html` in your browser to create an account and get started.

> Note: the frontend currently points at `http://localhost:5000` for API calls — make sure the backend is running first.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register a new learner (name, email, goal, password) |
| POST | `/api/login` | Log in, returns JWT access token |
| GET | `/user/roadmap` | Get the learner's active roadmap |
| POST | `/user/roadmap/regenerate` | Regenerate the roadmap from the current profile |
| GET | `/user/skill-graph` | View the full skill graph for the learner's track |
| POST | `/user/skills/complete` | Mark a skill complete with a quiz score |
| GET | `/user/quiz/<skill>` | Generate an AI quiz for a given skill |
| GET | `/user/progress` | Get progress-over-time view |
| POST | `/user/chat` | Chat with the AI assistant; can trigger roadmap actions |

All `/user/*` routes require a `Authorization: Bearer <token>` header.

## Team

| Name | Role |
|---|---|
| _Team Lead_ | Recommendation engine & AI workflow (Groq/LangChain, scoring logic, roadmap generation) |
| Shubham | Database schema & backend (Flask, models, auth) |
| Akanksha | Frontend & UI |

## Challenges Faced

- Balancing multiple ranking signals (goal relevance, prerequisites, difficulty, learning style, history) into a single fair resource score.
- Keeping the roadmap consistent when the AI assistant modifies it mid-conversation (exclude/reorder actions) without breaking prerequisite ordering.
- Grounding LLM explanations and quiz content in retrieved context (RAG) to reduce hallucination, on a free-tier LLM.
- Coordinating schema, recommendation logic, and UI in parallel across three team members within a 15-day timeline.

## Future Scope

- Move from a hand-curated track/skill catalog to a broader, embeddings-based course catalog.
- Replace keyword-based goal-to-track resolution with LLM-based intent extraction for open-ended goals.
- Add a proper task queue (Celery + Redis) for async LLM calls at scale.
- Richer analytics dashboard (skill radar chart, projected completion date).
- Support multiple concurrent learning paths and path history.
