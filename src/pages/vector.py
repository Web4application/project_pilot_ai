from langchain_openai import OpenAIEmbeddings

embed = OpenAIEmbeddings(model="text-embedding-3-large")

def store_vector(project_id, text):
    v = embed.embed_query(text)
    db.execute(
        "INSERT INTO vectors (project_id, content, embedding) VALUES (%s, %s, %s)",
        (project_id, text, v)
    )
