export function plotFormula(expr) {
    const x = [];
    const y = [];

    for (let i = -20; i <= 20; i += 0.2) {
        try {
            const val = eval(expr.replace(/x/g, i));
            x.push(i);
            y.push(val);
        } catch {
            return;
        }
    }

    Plotly.newPlot("formula-plot", [{
        x,
        y,
        mode: "lines"
    }], {
        margin: { t: 10 }
    });
}
