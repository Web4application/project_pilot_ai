from openai import OpenAI

class ModelClient:
    def __init__(self, base_url: str, model: str, token: str):
        self.client = OpenAI(base_url=base_url, api_key=token)
        self.model = model

    def ask(self, messages, retries=3, delay=2):
        import time
        for attempt in range(retries):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=1.0,
                    top_p=1.0
                )
                return response.choices[0].message.content
            except Exception as e:
                if attempt < retries - 1:
                    time.sleep(delay)
                else:
                    raise RuntimeError(f"Failed after {retries} attempts: {e}")
