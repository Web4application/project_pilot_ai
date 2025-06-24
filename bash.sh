docker build -t projectpilot-cert-dashboard .
docker run -p 8501:8501 projectpilot-cert-dashboard

git add .gitignore .gitattributes pyproject.toml requirements.txt requirements-dev.txt .github/workflows/lint-cert.yml
git commit -m "🚀 Harden build: git hygiene, pyproject packaging, cert CI, modern dependency setup"
git push origin main

pip install -r requirements.txt

chmod +x .git/hooks/pre-commit

cd extensions/cert_dashboard
streamlit run app.py

git clone https://github.com/Web4application/Web4AI_Project_Assistant.git
cd Web4AI_Project_Assistant


POST http://localhost:8000/api/analyze

npm install -g yo

cd <https://github.com/Web4application/project_pilot_ai/tree/main>

docker build -t vscode-generator-code 

docker run -it -v $(pwd):/usr/src/app vscode-generator-code

npm install --global yo generator-code

yo code

npx --package yo --package generator-code -- yo code
