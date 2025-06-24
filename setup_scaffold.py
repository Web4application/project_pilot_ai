import os

scaffold = {
    "ai_core": ["code_summary.py", "finetune_lora.py", "generator.py", "security_scan.py"],
    "cli": ["watchdog_runner.py"],
    "voice": ["whisper_handler.py", "tts_playback.py"],
    "gui": ["deployer.py"],
    "integrations": ["figma_to_code.py"],
    "pilot_sdk": ["__init__.py"],
    ".github/workflows": ["pr-review.yml"],
    "vscode-plugin": []
}

for folder, files in scaffold.items():
    os.makedirs(folder, exist_ok=True)
    for f in files:
        with open(os.path.join(folder, f), "w") as file:
            file.write(f"# {f} - scaffolded\n")
