// app.js
const inputArea = document.getElementById("sctm-input");
const outputPre = document.getElementById("execution-output");

inputArea.addEventListener("input", async () => {
    const inputText = inputArea.value;

    const res = await fetch("http://localhost:8000/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: inputText })
    });

    const data = await res.json();
    outputPre.textContent = JSON.stringify(data, null, 2);

    // Update visualization
    updateGraph(data);
    updateFormulaPlot(data);
});

// Knowledge Graph Example (D3.js)
function updateGraph(data) {
    const nodes = data.entities.map(e => ({ id: e.id, group: 1 }));
    const links = []; // optional: add edges if needed

    d3.select("#knowledge-graph").selectAll("*").remove();

    const svg = d3.select("#knowledge-graph")
        .append("svg").attr("width",300).attr("height",300);

    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(150,150));

    const node = svg.selectAll("circle")
        .data(nodes).enter().append("circle")
        .attr("r", 20)
        .attr("fill", "orange");

    const label = svg.selectAll("text")
        .data(nodes).enter().append("text")
        .text(d => d.id)
        .attr("x", d => 150)
        .attr("y", d => 150);
}

// Plot formulas (Plotly.js)
function updateFormulaPlot(data) {
    const traces = data.formulas.map(f => {
        const x = Array.from({length: 11}, (_, i) => i);
        const y = x.map(val => Math.pow(val,2)); // placeholder: ∫x^2
        return { x, y, type: 'scatter', name: f.id };
    });

    Plotly.newPlot('formula-plot', traces);
}
