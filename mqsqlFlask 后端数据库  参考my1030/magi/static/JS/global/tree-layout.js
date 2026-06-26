(() => {
    if (typeof d3 === "undefined") return;

    const svg = d3.select("#graph");
    if (svg.empty()) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    defs.append("marker")
        .attr("id", "tree-arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#86a9ff")
        .attr("opacity", 0.9);

    const viewport = svg.append("g").attr("id", "tree-viewport");
    const linkLayer = viewport.append("g").attr("class", "tree-links");
    const nodeLayer = viewport.append("g").attr("class", "tree-nodes");

    let zoomScale = 1;
    const zoomBehavior = d3.zoom()
        .scaleExtent([0.2, 4])
        .on("zoom", (event) => {
            zoomScale = event.transform.k;
            viewport.attr("transform", event.transform);
            refreshLabelDensity();
        });
    svg.call(zoomBehavior);

    function fetchGraphData() {
        return new Promise((resolve, reject) => {
            if (typeof $ === "undefined") {
                d3.json("/api/graph").then(resolve).catch(reject);
                return;
            }

            $.ajax({
                url: "/api/graph",
                dataType: "json",
                success: resolve,
                error: reject
            });
        });
    }

    function normalizeResponse(resp) {
        if (resp && resp.data && Array.isArray(resp.data.nodes) && Array.isArray(resp.data.links)) {
            return { nodes: resp.data.nodes, links: resp.data.links };
        }
        if (resp && resp.data1 && resp.data2) {
            return { nodes: JSON.parse(resp.data1), links: JSON.parse(resp.data2) };
        }
        return { nodes: [], links: [] };
    }

    function normalizeLinkEndId(end) {
        return end && typeof end === "object" ? end.id : end;
    }

    function buildDirectedTree(nodes, links) {
        const nodeById = new Map(nodes.map(n => [String(n.id), n]));
        const childrenMap = new Map();
        const indegree = new Map(nodes.map(n => [String(n.id), 0]));

        links.forEach(link => {
            const s = String(normalizeLinkEndId(link.source));
            const t = String(normalizeLinkEndId(link.target));
            if (!nodeById.has(s) || !nodeById.has(t) || s === t) return;
            if (!childrenMap.has(s)) childrenMap.set(s, []);
            if (!childrenMap.get(s).includes(t)) {
                childrenMap.get(s).push(t);
                indegree.set(t, (indegree.get(t) || 0) + 1);
            }
        });

        const roots = nodes.filter(n => (indegree.get(String(n.id)) || 0) === 0).map(n => String(n.id));
        const rootId = roots.length ? roots[0] : (nodes.length ? String(nodes[0].id) : null);
        if (!rootId) return null;

        const parent = new Map([[rootId, null]]);
        const depth = new Map([[rootId, 0]]);
        const queue = [rootId];

        while (queue.length) {
            const cur = queue.shift();
            const nextDepth = (depth.get(cur) || 0) + 1;
            (childrenMap.get(cur) || []).forEach(child => {
                if (!parent.has(child)) {
                    parent.set(child, cur);
                    depth.set(child, nextDepth);
                    queue.push(child);
                }
            });
        }

        // Attach disconnected nodes under root as virtual children to avoid losing data.
        nodes.forEach(n => {
            const id = String(n.id);
            if (!parent.has(id) && id !== rootId) {
                parent.set(id, rootId);
                depth.set(id, 1);
                if (!childrenMap.has(rootId)) childrenMap.set(rootId, []);
                if (!childrenMap.get(rootId).includes(id)) childrenMap.get(rootId).push(id);
            }
        });

        const treeChildren = new Map();
        parent.forEach((p, id) => {
            if (p == null) return;
            if (!treeChildren.has(p)) treeChildren.set(p, []);
            treeChildren.get(p).push(id);
        });

        function toTree(id) {
            const data = nodeById.get(id) || { id, name: id, details: "", image: "", isShown: 1 };
            const kids = (treeChildren.get(id) || []).map(toTree);
            return {
                id,
                raw: data,
                children: kids.length ? kids : null
            };
        }

        return { rootId, tree: toTree(rootId) };
    }

    function collapseByDepth(node, depthLimit) {
        if (!node.children) return;
        if (node.depth >= depthLimit) {
            node._children = node.children;
            node.children = null;
            return;
        }
        node.children.forEach(child => collapseByDepth(child, depthLimit));
    }

    let root;
    let treeLayout;

    function computeLayout() {
        width = window.innerWidth;
        height = window.innerHeight;
        svg.attr("viewBox", `0 0 ${width} ${height}`);

        const levelGap = Math.max(140, Math.min(260, width / 6));
        const rowGap = Math.max(34, Math.min(54, height / 20));

        treeLayout = d3.tree()
            .nodeSize([rowGap, levelGap])
            .separation((a, b) => (a.parent === b.parent ? 1 : 1.35));

        treeLayout(root);

        // Center the tree vertically.
        const nodes = root.descendants();
        const minX = d3.min(nodes, d => d.x) || 0;
        const maxX = d3.max(nodes, d => d.x) || 0;
        const treeHeight = maxX - minX;
        const yOffset = (height - treeHeight) / 2 - minX;
        nodes.forEach(n => {
            n.renderX = n.x + yOffset;
            n.renderY = n.y + 80;
        });
    }

    function linkPath(d) {
        return `M${d.source.renderY},${d.source.renderX}C${(d.source.renderY + d.target.renderY) / 2},${d.source.renderX} ${(d.source.renderY + d.target.renderY) / 2},${d.target.renderX} ${d.target.renderY},${d.target.renderX}`;
    }

    function nodeRadius(d) {
        return d._children ? 10 : 8;
    }

    function refreshLabelDensity() {
        nodeLayer.selectAll("text.node-label")
            .style("display", d => {
                if (zoomScale < 0.7) return "none";
                if (zoomScale < 1.05 && d.depth > 1) return "none";
                if (zoomScale < 1.4 && d.depth > 2) return "none";
                return null;
            })
            .style("font-size", zoomScale < 0.9 ? "10px" : "12px");
    }

    function update(source) {
        computeLayout();

        const nodes = root.descendants();
        const links = root.links();

        const linkSel = linkLayer.selectAll("path.tree-link")
            .data(links, d => `${d.source.data.id}->${d.target.data.id}`);

        linkSel.enter()
            .append("path")
            .attr("class", "tree-link")
            .attr("fill", "none")
            .attr("stroke", "#84a8ff")
            .attr("stroke-opacity", 0.75)
            .attr("stroke-width", 1.6)
            .attr("marker-end", "url(#tree-arrow)")
            .attr("d", d => {
                const o = { renderX: source.renderX || source.x || 0, renderY: source.renderY || source.y || 0 };
                return `M${o.renderY},${o.renderX}C${o.renderY},${o.renderX} ${o.renderY},${o.renderX} ${o.renderY},${o.renderX}`;
            })
            .merge(linkSel)
            .transition()
            .duration(280)
            .attr("d", linkPath);

        linkSel.exit()
            .transition()
            .duration(220)
            .attr("d", d => {
                const o = { renderX: source.renderX || source.x || 0, renderY: source.renderY || source.y || 0 };
                return `M${o.renderY},${o.renderX}C${o.renderY},${o.renderX} ${o.renderY},${o.renderX} ${o.renderY},${o.renderX}`;
            })
            .remove();

        const nodeSel = nodeLayer.selectAll("g.tree-node")
            .data(nodes, d => d.data.id);

        const nodeEnter = nodeSel.enter()
            .append("g")
            .attr("class", "tree-node")
            .attr("transform", () => `translate(${source.renderY || source.y || 0},${source.renderX || source.x || 0})`)
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else if (d._children) {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
                event.stopPropagation();
            });

        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .attr("fill", d => (d._children ? "#3f6ad8" : "#2d3f57"))
            .attr("stroke", "#9db6ff")
            .attr("stroke-width", 1.4);

        nodeEnter.append("text")
            .attr("class", "node-label")
            .attr("dy", "0.32em")
            .attr("x", d => (d.children || d._children ? -12 : 12))
            .attr("text-anchor", d => (d.children || d._children ? "end" : "start"))
            .text(d => d.data.raw.name || d.data.id)
            .attr("fill", "#d8e4ff")
            .style("font-family", "'Microsoft YaHei', sans-serif")
            .style("font-size", "12px");

        const nodeMerge = nodeEnter.merge(nodeSel);

        nodeMerge.transition()
            .duration(280)
            .attr("transform", d => `translate(${d.renderY},${d.renderX})`);

        nodeMerge.select("circle")
            .transition()
            .duration(280)
            .attr("r", d => nodeRadius(d))
            .attr("fill", d => (d._children ? "#4f7dff" : "#32485f"));

        nodeSel.exit()
            .transition()
            .duration(220)
            .attr("transform", () => `translate(${source.renderY || source.y || 0},${source.renderX || source.x || 0})`)
            .remove();

        refreshLabelDensity();

        // store previous positions for transitions
        root.each(d => {
            d.x0 = d.renderX;
            d.y0 = d.renderY;
        });
    }

    function bootstrap(data) {
        const graph = normalizeResponse(data);
        const built = buildDirectedTree(graph.nodes || [], graph.links || []);
        if (!built) return;

        root = d3.hierarchy(built.tree, d => d.children);
        root.x0 = height / 2;
        root.y0 = 0;

        // For large graphs, collapse deeper levels initially to avoid overlap.
        const initialDepthLimit = (graph.nodes.length > 180) ? 1 : (graph.nodes.length > 90 ? 2 : 3);
        root.children && root.children.forEach(child => collapseByDepth(child, initialDepthLimit));

        update(root);

        window.addEventListener("resize", () => {
            update(root);
        });

        svg.on("click", () => {
            // click blank to reset focus by fitting root near left
            svg.transition().duration(260).call(zoomBehavior.transform, d3.zoomIdentity.translate(30, 0).scale(Math.max(0.5, Math.min(1.2, width / 1400))));
        });
    }

    fetchGraphData()
        .then(bootstrap)
        .catch((err) => {
            console.error("tree layout load error", err);
        });
})();
