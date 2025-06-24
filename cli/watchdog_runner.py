from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from ai_core.suggestions import suggest_changes

class CodeChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith(".py"):
            print(f"📎 Change detected in {event.src_path}")
            suggest_changes(event.src_path)

def start_watch(path="."):
    observer = Observer()
    observer.schedule(CodeChangeHandler(), path=path, recursive=True)
    observer.start()
