# 🧱 Project Architecture

This document provides an overview of the system design for **Project Pilot AI**.

---

## 📐 Core Layers

1. **Frontend**  
   Built with Vite + React + Tailwind. Provides a slash-command driven UI interface.

2. **Backend**  
   Built on FastAPI, the API layer handles:
   - Slash command routing
   - AI model calls
   - Task parsing and code analysis

3. **AI Layer**  
   Pluggable LLM pipelines:
   - OpenAI (GPT-4 / GPT-3.5)
   - Claude (Anthropic)
   - Gemini (Google)
   - WebLLM (local inference)

4. **Vector Store** *(Optional)*  
   - Uses embeddings (e.g. `text-embedding-3-small`) to power project-wide semantic search.
   - DB: `PostgreSQL` or `Qdrant`

5. **DevOps**  
   - Docker
   - GitHub Actions (CI/CD)
   - Nginx + Gunicorn (prod)
