import { parseSCTM, buildGraph, executeSCTM } from "./pilotai-engine.js";
import { renderGraph } from "./graph.js";
import { plotFormula } from "./plot.js";

const inputEl = document.getElementById("sctm-input");
const outputEl = document.getElementById("execution-output");

inputEl.addEventListener("input", () => {
    const code = inputEl.value.trim();

    if (!code) {
        outputEl.textContent = "{}";
        return;
    }

    try {
        // 1. Parse SCTM
        const parsed = parseSCTM(code);

        // 2. Build graph
        const graphData = buildGraph(parsed);
        renderGraph(graphData);

        // 3. Execute
        const result = executeSCTM(parsed);

        // 4. Plot if math formula
        if (result.plot) {
            plotFormula(result.plot);
        }

        // 5. Show output
        outputEl.textContent = JSON.stringify(result, null, 2);

    } catch (err) {
        outputEl.textContent = `Error: ${err.message}`;
    }
});
