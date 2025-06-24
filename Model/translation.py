import requests

API_BASE_URL = "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/"
headers = {"Authorization": "Bearer {API_TOKEN}"}

def run(model, input):
    response = requests.post(f"{API_BASE_URL}{model}", headers=headers, json=input)
    return response.json()

output = run('@cf/meta/m2m100-1.2b', {
  "text": "I'll have an order of the moule frites",
  "source_lang": "english",
  "target_lang": "french"
})

print(output)
