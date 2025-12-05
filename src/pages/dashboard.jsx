export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>PilotAI Studio</h1>

      <section className="stats">
        <div className="card">
          <h3>Requests Today</h3>
          <p>1,273</p>
        </div>
        <div className="card">
          <h3>Tokens Used</h3>
          <p>837,441</p>
        </div>
        <div className="card">
          <h3>Active Models</h3>
          <p>GPT-5, Llama 3.1, Claude 3.7</p>
        </div>
      </section>

      <section className="quick-actions">
        <button>Create Project</button>
        <button>Open LMLM Editor</button>
        <button>Open React Generator</button>
      </section>
    </div>
  );
}
