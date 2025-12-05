pilotai/
 ├── backend/
 │    ├── main.py                # FastAPI + GPT-5
 │    ├── worker.py              # RQ background worker
 │    ├── auth.py                # JWT / API keys
 │    ├── vector.py              # Embeddings & vector memory
 │    ├── db.py                  # Postgres integration
 │    ├── utils.py               # API helpers
 │    ├── requirements.txt
 │    ├── Dockerfile
 │    └── .env.example
 ├── frontend/
 │    ├── package.json
 │    ├── public/
 │    │    └── index.html
 │    └── src/
 │         ├── App.jsx
 │         ├── pages/
 │         │     ├── dashboard.jsx
 │         │     ├── studio.jsx
 │         │     ├── lmlm.jsx
 │         │     ├── preview.jsx
 │         │     ├── api_keys.jsx
 │         │     └── admin.jsx
 │         ├── components/
 │         │     ├── Sidebar.jsx
 │         │     ├── Navbar.jsx
 │         │     ├── CodeEditor.jsx
 │         │     ├── Terminal.jsx
 │         │     ├── LivePreview.jsx
 │         │     └── DatasetView.jsx
 │         └── utils/
 │               ├── api.js
 │               └── auth.js
 ├── k8s/
 │    ├── deployment.yaml
 │    ├── service.yaml
 │    └── secrets.yaml
 ├── nginx/
 │    └── nginx.conf
 ├── docker-compose.yml
 ├── .github/
 │    └── workflows/
 │         └── deploy.yaml
 ├── docs/
 │    ├── README.md
 │    └── LMLM_spec_v1.md
 └── mobile/
      ├── package.json
      └── App.jsx               # React Native PilotAI mobile starter
