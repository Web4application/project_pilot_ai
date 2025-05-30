import os
import subprocess
import openai  # or any other LLM API like Ollama, Claude, or Gemini
import requests
from bs4 import BeautifulSoup

PROJECT_PATH = "/path/to/your/project"
OPENAI_API_KEY = "your-openai-api-key"
openai.api_key = OPENAI_API_KEY

def scan_project(directory):
    summary = ""
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.py', '.js', '.ts', '.json', '.md')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    summary += f"\n## File: {filepath}\n"
                    summary += summarize_file_content(content)
    return summary

def summarize_file_content(content):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You're an expert software analyst."},
            {"role": "user", "content": f"Summarize the purpose and functionality of this code:\n\n{content}"}
        ]
    )
    return response.choices[0].message['content']

def generate_readme(summary, output_path):
    with open(os.path.join(output_path, 'README.md'), 'w') as f:
        f.write("# Project Summary\n\n")
        f.write(summary)

def generate_requirements(project_path):
    result = subprocess.run(['pipreqs', project_path, '--force'], capture_output=True, text=True)
    print("Requirements generated:", result.stdout)

def install_requirements(project_path):
    req_path = os.path.join(project_path, 'requirements.txt')
    if os.path.exists(req_path):
        subprocess.run(['pip', 'install', '-r', req_path])
    else:
        print("requirements.txt not found.")

def fetch_missing_dependencies(query):
    # Simple Bing search + scrape download logic
    headers = {'User-Agent': 'Mozilla/5.0'}
    search_url = f"https://www.bing.com/search?q={query}+site:github.com"
    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    links = [a['href'] for a in soup.select('a[href^="https://github.com"]')]
    return links[:3]

def auto_optimize_code(file_path):
    with open(file_path, 'r') as f:
        code = f.read()

    # Send to LLM for refactor
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You're a senior software engineer. Refactor this code for performance, readability, and modern best practices."},
            {"role": "user", "content": code}
        ]
    )
    optimized_code = response.choices[0].message['content']
    with open(file_path, 'w') as f:
        f.write(optimized_code)

def optimize_entire_project(project_path):
    for root, _, files in os.walk(project_path):
        for file in files:
            if file.endswith('.py'):
                auto_optimize_code(os.path.join(root, file))

if __name__ == "__main__":
    summary = scan_project(PROJECT_PATH)
    generate_readme(summary, PROJECT_PATH)
    generate_requirements(PROJECT_PATH)
    install_requirements(PROJECT_PATH)
    optimize_entire_project(PROJECT_PATH)
