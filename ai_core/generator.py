from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

template = PromptTemplate(
    input_variables=["task"],
    template="Generate a full project with test files and structure to: {task}"
)

def generate_project(task, llm):
    chain = LLMChain(prompt=template, llm=llm)
    return chain.run(task)
