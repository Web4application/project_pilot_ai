export function parseSCTM(code) {
    const tokens = code.split(/\s+/).filter(Boolean);

    return tokens.map((t, idx) => ({
        id: idx,
        value: t,
        type: detectTokenType(t)
    }));
}

function detectTokenType(token) {
    if (/^\d+$/.test(token)) return "number";
    if (/^[A-Za-z]+$/.test(token)) return "symbol";
    if (/^[+\-*\/^]$/.test(token)) return "operator";
    return "unknown";
}

export function buildGraph(tokens) {
    const nodes = tokens.map(t => ({ id: t.id, label: t.value }));
    const links = [];

    for (let i = 0; i < tokens.length - 1; i++) {
        links.push({
            source: tokens[i].id,
            target: tokens[i + 1].id
        });
    }

    return { nodes, links };
}

export function executeSCTM(tokens) {
    const command = tokens.map(t => t.value).join("");

    // Quick Math Expression
    if (/[\d+\-*\/^()]+/.test(command)) {
        try {
            const result = eval(command);
            return {
                type: "math-eval",
                input: command,
                output: result,
                plot: command
            };
        } catch {
            return { error: "Invalid math expression." };
        }
    }

    // Symbolic interpretation
    return {
        type: "symbolic",
        message: "SCTM symbolic expression processed.",
        tokens
    };
}
