import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateCode() {
    setLoading(true);
    setOutput("");

    const res = await fetch("http://localhost:8000/generate_react_stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: input })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      setOutput(prev => prev + decoder.decode(value));
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>PilotAI React Generator</h1>

      <textarea
        style={{ width: "100%", height: 120 }}
        placeholder="Paste JSON or dataset..."
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <br /><br />

      <button onClick={generateCode} disabled={loading}>
        {loading ? "Generating..." : "Generate React Component"}
      </button>

      <pre style={{
        whiteSpace: "pre-wrap",
        marginTop: 20,
        padding: 20,
        background: "#111",
        color: "#0f0",
        minHeight: 200
      }}>
        {output}
      </pre>
    </div>
  );
}

export default App;
