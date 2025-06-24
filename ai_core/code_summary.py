from langchain.document_loaders import DirectoryLoader
from langchain.chains.summarize import load_summarize_chain
from langchain.llms import OpenAI

def summarize_codebase(path="./", llm=None):
    loader = DirectoryLoader(path, glob="**/*.py", recursive=True)
    docs = loader.load()
    llm = llm or OpenAI(temperature=0)
    chain = load_summarize_chain(llm, chain_type="map_reduce")
    return chain.run(docs)
