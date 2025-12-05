export function renderGraph(graph) {
    const container = document.getElementById("knowledge-graph");
    container.innerHTML = "";

    const width = container.offsetWidth;
    const height = 300;

    const svg = d3.select("#knowledge-graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.id).distance(60))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("stroke", "#555")
        .attr("stroke-width", 2);

    const node = svg.append("g")
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")
        .attr("r", 8)
        .attr("fill", "#09f")
        .call(drag(simulation));

    const text = svg.append("g")
        .selectAll("text")
        .data(graph.nodes)
        .enter()
        .append("text")
        .text(d => d.label)
        .attr("x", 12)
        .attr("y", 4)
        .style("fill", "#fff");

    simulation.on("tick", () => {
        node.attr("cx", d => d.x).attr("cy", d => d.y);
        text.attr("x", d => d.x + 12).attr("y", d => d.y + 4);
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
    });

    function drag(sim) {
        return d3.drag()
            .on("start", e => {
                if (!e.active) sim.alphaTarget(0.3).restart();
                e.subject.fx = e.subject.x;
                e.subject.fy = e.subject.y;
            })
            .on("drag", e => {
                e.subject.fx = e.x;
                e.subject.fy = e.y;
            })
            .on("end", e => {
                if (!e.active) sim.alphaTarget(0);
                e.subject.fx = null;
                e.subject.fy = null;
            });
    }
}
