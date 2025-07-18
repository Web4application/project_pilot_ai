import os
from github import Github
from project_pilot_ai.github_models import ModelClient
from project_pilot_ai.config import get_model_config

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_NAME = os.getenv("GITHUB_REPOSITORY")
PR_NUMBER = int(os.getenv("PR_NUMBER"))

gh = Github(GITHUB_TOKEN)
repo = gh.get_repo(REPO_NAME)
pr = repo.get_pull(PR_NUMBER)

base_url, model_name = get_model_config("github")
client = ModelClient(base_url=base_url, model=model_name, token=GITHUB_TOKEN)

def get_diff_files(pr):
    files = pr.get_files()
    diffs = {}
    for f in files:
        if f.status in ("modified", "added") and f.filename.endswith((".py", ".js", ".ts", ".java")):
            diffs[f.filename] = f.patch
    return diffs

def create_ai_prompt(filename, diff_text):
    return (
        f"You are an expert code reviewer. Analyze this diff for bugs, security risks, and style issues. "
        f"Provide suggestions clearly. File: {filename}\n\n{diff_text}"
    )

def analyze_and_comment(pr):
    diffs = get_diff_files(pr)
    comments = []

    for fname, diff in diffs.items():
        prompt = create_ai_prompt(fname, diff)
        response = client.ask([
            {"role": "system", "content": "You are an expert code reviewer."},
            {"role": "user", "content": prompt}
        ])
        comments.append(f"**AI Review for `{fname}`:**\n{response.strip()}")

    if comments:
        pr.create_issue_comment("\n\n---\n\n".join(comments))
    else:
        pr.create_issue_comment("AI Review found no issues. Good job!")

if __name__ == "__main__":
    analyze_and_comment(pr)
