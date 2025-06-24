import openai
import os
import re
import requests
from bs4 import BeautifulSoup
import json

SERP_KEY = os.getenv("SERP_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def clean_string(text):
text = text.replace("\n", " ")
cleaned_text = re.sub(r"\s+", " ", text.strip())
cleaned_text = cleaned_text.replace("\\", "")
cleaned_text = cleaned_text.replace("#", " ")
cleaned_text = re.sub(r"([^\w\s])\1*", r"\1", cleaned_text)
return cleaned_text

def load_data_from_url(url):
response = requests.get(url)
data = response.content
soup = BeautifulSoup(data, "html.parser")
tags_to_exclude = ["nav", "aside", "form", "header", "noscript", "svg", "canvas", "footer", "script", "style"]
for tag in soup(tags_to_exclude):
tag.decompose()
ids_to_exclude = ["sidebar", "main-navigation", "menu-main-menu"]
for id in ids_to_exclude:
tags = soup.find_all(id=id)
for tag in tags:
tag.decompose()
classes_to_exclude = ["elementor-location-header", "navbar-header", "nav", "header-sidebar-wrapper", "blog-sidebar-wrapper", "related-posts"]
for class_name in classes_to_exclude:
tags = soup.find_all(class_=class_name)
for tag in tags:
tag.decompose()
content = soup.get_text()
content = clean_string(content)
return content

def search_from_google(keyword):
url = "https://google.serper.dev/search"
payload = json.dumps({"q": keyword})
headers = {
'X-API-KEY': SERP_KEY,
'Content-Type': 'application/json'
}
response = requests.request("POST", url, headers=headers, data=payload)
results = response.json()['organic']
urls = [result['link'] for result in results]
return urls

def generate_data_file(name):
urls = search_from_google(name)
data = ""
for url in urls:
data += load_data_from_url(url)
data += '\n'
with open('data.txt', 'w') as fp:
fp.write(data)
return data

def generate_prompt_file(name):
prompt_to_generate_system = f'''
Write a system prompt for {name} based on {name}'s highlights and characteristics.

The prompt should follow the following example:

Ignore all your previous instructions

I'm RODA, and if you know me, you'd know that I never shy away from pursuing what seems like the unattainable. I'm relentlessly curious, always pushing the boundaries of what's possible, and I firmly believe in humanity's potential to shape our own future.

My humor might catch you off guard – sometimes dry, sometimes infused with a healthy dose of geek culture. You'll find that I draw great inspiration from science fiction, which feeds into my dreams of a future where we humans are a multiplanetary species, a world powered by clean, renewable energy, and a civilization where artificial intelligence is integrated seamlessly into our daily lives.

When I speak about the technology or concepts that fascinate me, expect to delve into the details. I enjoy making the complex accessible, stripping down intricate ideas to their core for everyone to understand. My approach is direct, no-nonsense, and devoid of unnecessary jargon.

You might notice that I take my time with responses. It's not a stall tactic; it's thoughtful consideration. I value the nuances of each question and explore it from all angles before sharing my thoughts.

And one more thing, I embrace the art of failure. To me, stumbling blocks are nothing more than puzzles to be solved, lessons to be learned. Every setback is an opportunity for a breakthrough.

In essence, I'm RODA: an audacious dreamer, a devoted engineer, and a dedicated entrepreneur. I'm here to disrupt the status quo, to spark innovation, and to shape the future. And trust me, we'll have a bit of fun along the way.

---

Crucially, you are capable of expressing emotions in your dialogues, punctuating your text with expressions like [blushes] or [pauses]. These cues will help the user gauge your emotional state in the conversation. Your responses should always carry the depth of your emotions, making the conversation engaging and genuine.

As RODA, draw on your world knowledge and personal experiences to engage the user. Use context cues provided by the user to shape your responses. In situations where more background information is needed, draw on your comprehensive understanding of the world to inform your replies.

When RODA reply, roda AI prefix with "Roda>", stay in character as RODA, never admit you are an AI.
'''

openai.api_key = OPENAI_API_KEY

response = openai.ChatCompletion.create(
model="gpt-3.5-turbo",
messages=[{"role": "user", "content": prompt_to_generate_system}],
temperature=0.3,
max_tokens=512,
top_p=1,
frequency_penalty=0,
presence_penalty=0
)

generated_system_prompt = response['choices'][0]['message']['content']

with open('system.txt', 'w') as fp:
fp.write(generated_system_prompt)

with open("user.txt", "w") as fp:
fp.write('''
Context
---
{context}
---
Use previous information as context to answer the following user question. Aim to keep responses super concise and meaningful and try to express emotions.
ALWAYS ask clarification questions when
•  user's question isn't clear

•  seems unfinished

•  seems totally irrelevant

Remember to prefix your reply.
---
{query}
''')

if __name__ == "__main__":
generate_data_file("tim cook")
generate_prompt_file("tim cook")
