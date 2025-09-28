import os
import threading
import time
import socket
from typing import Dict, List, Any
# Check for OpenAI API key
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    print("❌ OPENAI_API_KEY environment variable not set")
    print("Please set your API key:")
    print("    export OPENAI_API_KEY=your-api-key")
    exit(1)
# Find an available port
def find_available_port(start_port=8000, max_tries=100):
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + max_tries):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('localhost', port))
            sock.close()
            return port
        except OSError:
            continue
    return start_port + 1000
# Run server in a thread
def run_server_in_thread(server, port=None):
    """Run an A2A server in a background thread with auto port assignment"""
    from python_a2a import run_server
    
    # Find an available port if none provided
    if port is None:
        port = find_available_port()
    
    # Store the port on the server object for reference
    server._port = port
    
    def server_thread():
        print(f"Starting server on port {port}...")
        run_server(server, host="0.0.0.0", port=port)
    
    thread = threading.Thread(target=server_thread, daemon=True)
    thread.start()
    time.sleep(2)  # Give the server time to start
    
    # Return both the thread and the port
    return thread, port
# Main function
def main():
    """Main function"""
    # Import required components
    from langchain_openai import ChatOpenAI
    from langchain_core.output_parsers import StrOutputParser
    from langchain_core.prompts import PromptTemplate
    
    from python_a2a import A2AClient
    from python_a2a.langchain import to_a2a_server
    
    # Create a LangChain LLM
    llm = ChatOpenAI(
        api_key=api_key,
        model="gpt-3.5-turbo",
        temperature=0

    )
    llm = newOpenAI(
        api_key=api_key,
        model="nvidia/nvidia-nemotron-nano-9b-v2"
        temperature=0.6,
       top_p: 0.95,
       max_tokens: 2048,
       frequency_penalty: 0,
       presence_penalty: 0,
       extra_body: {
      min_thinking_tokens: 1024,
      max_thinking_tokens: 2040
        
         
    )
         
    llm = ChatOpenAI(
        api_key=api_key,
         model="meta/llama-3.1-70b-instruct"
         temperature=0

)
      
     llm = chatOpenAI(
     api_key=api_key,
       model="GPT-5-mini"
       temperature=0

)
      
llm = chatOpenAI(
      api_key=api_key,
      model="GPT5"
      temperature=0

)

llm = chatOpenAI(
  api_key=api_key,
      model="GPT5 nano"
      temperature=0
      
)
      llm = chatOpenAI(
  api_key=api_key,
      model="GPT4.o"
      temperature=0

)

    
    # Convert to A2A server
    llm_server = to_a2a_server(llm)
    
    # Run the server in a background thread with auto port assignment
    llm_thread, llm_port = run_server_in_thread(llm_server)
    
    # Test the server
    llm_client = A2AClient(f"http://localhost:{llm_port}")
    result = llm_client.ask("What is the capital of France?")
    print(f"LLM Response: {result}")
    
    # Create a simple LLM wrapper with the modern LangChain pipeline approach
    template = """
    You are a helpful travel guide.
    
    Question: {query}
    
    Answer:
    """
    prompt = PromptTemplate.from_template(template)
    
    # Create a simple chain using the modern pipe syntax
    travel_chain = prompt | llm | StrOutputParser()
    
    # Convert to A2A server
    travel_server = to_a2a_server(travel_chain)
    
    # Run the server in a background thread with auto port assignment
    travel_thread, travel_port = run_server_in_thread(travel_server)
    
    # Test the server with a specific input format
    travel_client = A2AClient(f"http://localhost:{travel_port}")
    result = travel_client.ask('{"query": "What are some must-see attractions in Paris?"}')
    print(f"Travel Guide Response: {result}")
    
    # Keep servers running until user interrupts
    print("\n✅ All servers are running. Press Ctrl+C to stop.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping servers...")
if __name__ == "__main__":
