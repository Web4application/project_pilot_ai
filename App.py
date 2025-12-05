from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Load environment variables
load_dotenv()

# Get API key
openai_api_key = os.getenv("OPENAI_API_KEY")

if not openai_api_key:
    raise ValueError("❌ OPENAI_API_KEY not found in environment variables!")

app = Flask(__name__)

@app.route('/generate_react', methods=['POST'])
def generate_react():
    try:
        data = request.json.get("data", "")

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Initialize GPT-5
        llm = ChatOpenAI(
            api_key=openai_api_key,
            model="gpt-5",          # modern param name
            temperature=0.2
        )

        # Prompt template
        prompt = PromptTemplate(
            input_variables=["file_data"],
            template="""
You are an elite frontend engineering assistant.

Given the dataset:

{file_data}

Generate a **React component** that:

- Displays the data in a clean table UI
- Has sorting on each column
- Provides a search-based filter
- Uses modern React with hooks and functional components
- Avoids unnecessary re-renders (optimize performance)
- NO explanations, ONLY the code.

Output ONLY valid React code.
"""
        )

        chain = LLMChain(prompt=prompt, llm=llm)

        response = chain.invoke({"file_data": data})

        return jsonify({"generated_code": response["text"]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
