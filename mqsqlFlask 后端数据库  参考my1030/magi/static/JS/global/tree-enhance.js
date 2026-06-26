(() => {
    if (typeof d3 === "undefined") return;
    if (typeof nodes === "undefined" || typeof links === "undefined") return;
    if (typeof simulation === "undefined" || typeof node === "undefined" || typeof linkPath === "undefined") return;

    const graphSvg = d3.select("#graph");
    let graphViewport = graphSvg.select("#graph-viewport");
    if (graphViewport.empty()) {
        graphViewport = graphSvg.append("g").attr("id", "graph-viewport");
    }

    // Move the already rendered primitives into a single viewport for zoom/pan.
    graphSvg.selectAll(".link").each(function () { graphViewport.node().appendChild(this); });
    graphSvg.selectAll(".link-group").each(function () { graphViewport.node().appendChild(this); });
    graphSvg.selectAll(".node").each(function () { graphViewport.node().appendChild(this); });

    const nodeLabelSelection = node.select("text.node-label");
    let currentZoomScale = 1;

    function normalizeLinkEndId(end) {
        return (end && typeof end === "object") ? end.id : end;
    }

    function edgeKey(sourceId, targetId) {
        return `${String(sourceId)}=>${String(targetId)}`;
    }

    function buildTreeMeta(nodesList, linksList) {
        const nodeIds = new Set(nodesList.map(n => String(n.id)));
        const indegree = new Map(nodesList.map(n => [String(n.id), 0]));
        const outgoing = new Map();
        const incoming = new Map();

        function ensure(map, key) {
            if (!map.has(key)) map.set(key, []);
            return map.get(key);
        }

        linksList.forEach(link => {
            const source = String(normalizeLinkEndId(link.source));
            const target = String(normalizeLinkEndId(link.target));
            if (!nodeIds.has(source) || !nodeIds.has(target) || source === target) return;
            if (!ensure(outgoing, source).includes(target)) ensure(outgoing, source).push(target);
            if (!ensure(incoming, target).includes(source)) ensure(incoming, target).push(source);
            indegree.set(target, (indegree.get(target) || 0) + 1);
        });

        const roots = nodesList
            .filter(n => (indegree.get(String(n.id)) || 0) === 0)
            .map(n => String(n.id));
        const rootId = roots.length ? roots[0] : (nodesList.length ? String(nodesList[0].id) : null);

        const depthById = new Map();
        const parentById = new Map();
        const queue = rootId ? [rootId] : [];
        if (rootId) {
            depthById.set(rootId, 0);
            parentById.set(rootId, null);
        }

        while (queue.length) {
            const current = queue.shift();
            const nextDepth = (depthById.get(current) || 0) + 1;
            (outgoing.get(current) || []).forEach(child => {
                if (!depthById.has(child)) {
                    depthById.set(child, nextDepth);
                    parentById.set(child, current);
                    queue.push(child);
                }
            });
        }

        let fallbackDepth = Math.max(0, ...Array.from(depthById.values()));
        nodesList.forEach(n => {
            const id = String(n.id);
            if (!depthById.has(id)) {
                fallbackDepth += 1;
                depthById.set(id, fallbackDepth);
                parentById.set(id, null);
            }
        });

        const treeChildren = new Map();
        parentById.forEach((parent, id) => {
            if (!parent) return;
            if (!treeChildren.has(parent)) treeChildren.set(parent, []);
            treeChildren.get(parent).push(id);
        });

        // Subtree size for trunk extraction and ordering stability.
        const subtreeMemo = new Map();
        function subtreeSize(id, active) {
            if (subtreeMemo.has(id)) return subtreeMemo.get(id);
            if (active.has(id)) return 1;
            active.add(id);
            let total = 1;
            (treeChildren.get(id) || []).forEach(child => {
                total += subtreeSize(child, active);
            });
            active.delete(id);
            subtreeMemo.set(id, total);
            return total;
        }

        // Main trunk from root to largest descendant branch.
        const trunkNodeIds = new Set();
        if (rootId) {
            let cursor = rootId;
            const guard = new Set();
            while (cursor && !guard.has(cursor)) {
                guard.add(cursor);
                trunkNodeIds.add(cursor);
                const options = (treeChildren.get(cursor) || []).slice();
                if (!options.length) break;
                options.sort((a, b) => subtreeSize(b, new Set()) - subtreeSize(a, new Set()));
                cursor = options[0];
            }
        }

        // Layering.
        const maxDepth = Math.max(0, ...Array.from(depthById.values()));
        const levelMap = new Map();
        nodesList.forEach(n => {
            const d = depthById.get(String(n.id)) || 0;
            if (!levelMap.has(d)) levelMap.set(d, []);
            levelMap.get(d).push(String(n.id));
        });

        // Initial order by parent index then subtree size desc.
        const orderById = new Map();
        for (let depth = 0; depth <= maxDepth; depth++) {
            const ids = (levelMap.get(depth) || []).slice();
            if (depth === 0) {
                ids.sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN"));
            } else {
                ids.sort((a, b) => {
                    const pa = parentById.get(a);
                    const pb = parentById.get(b);
                    const ia = pa == null ? Number.MAX_SAFE_INTEGER : (orderById.get(pa) || 0);
                    const ib = pb == null ? Number.MAX_SAFE_INTEGER : (orderById.get(pb) || 0);
                    if (ia !== ib) return ia - ib;
                    const sa = subtreeSize(a, new Set());
                    const sb = subtreeSize(b, new Set());
                    if (sa !== sb) return sb - sa;
                    return String(a).localeCompare(String(b), "zh-Hans-CN");
                });
            }
            ids.forEach((id, idx) => orderById.set(id, idx));
            levelMap.set(depth, ids);
        }

        // Barycentric refinement (forward + backward sweeps) to reduce crossings.
        function barycenter(ids, neighborMap) {
            return ids.map(id => {
                const neighbors = neighborMap.get(id) || [];
                if (!neighbors.length) {
                    return { id, score: Number.POSITIVE_INFINITY };
                }
                let sum = 0;
                let cnt = 0;
                neighbors.forEach(n => {
                    if (orderById.has(n)) {
                        sum += orderById.get(n);
                        cnt += 1;
                    }
                });
                return { id, score: cnt ? sum / cnt : Number.POSITIVE_INFINITY };
            });
        }

        for (let pass = 0; pass < 2; pass++) {
            for (let depth = 1; depth <= maxDepth; depth++) {
                const ids = levelMap.get(depth) || [];
                const scored = barycenter(ids, incoming);
                scored.sort((a, b) => (a.score - b.score) || String(a.id).localeCompare(String(b.id), "zh-Hans-CN"));
                const reordered = scored.map(x => x.id);
                reordered.forEach((id, idx) => orderById.set(id, idx));
                levelMap.set(depth, reordered);
            }
            for (let depth = maxDepth - 1; depth >= 0; depth--) {
                const ids = levelMap.get(depth) || [];
                const scored = barycenter(ids, outgoing);
                scored.sort((a, b) => (a.score - b.score) || String(a.id).localeCompare(String(b.id), "zh-Hans-CN"));
                const reordered = scored.map(x => x.id);
                reordered.forEach((id, idx) => orderById.set(id, idx));
                levelMap.set(depth, reordered);
            }
        }

        // Coordinate slot assignment.
        const nodeById = new Map(nodesList.map(n => [String(n.id), n]));
        const usableWidth = Math.max(320, window.innerWidth - 160);
        const minGap = 92;
        const maxGap = 210;
        const maxPerRow = Math.max(1, Math.floor(usableWidth / minGap));

        for (let depth = 0; depth <= maxDepth; depth++) {
            const ids = levelMap.get(depth) || [];
            ids.forEach((id, index) => {
                const n = nodeById.get(id);
                if (!n) return;
                n.treeDepth = depth;
                n.treeRow = Math.floor(index / maxPerRow);
                n.treeCol = index % maxPerRow;
                n.treeRowSize = Math.min(maxPerRow, ids.length - n.treeRow * maxPerRow);
            });
        }

        // Descendants (for click-to-expand subtree).
        const descendantsById = new Map();
        function collectDescendants(id, active) {
            if (descendantsById.has(id)) return descendantsById.get(id);
            if (active.has(id)) return new Set();
            active.add(id);
            const set = new Set();
            (treeChildren.get(id) || []).forEach(child => {
                set.add(child);
                collectDescendants(child, active).forEach(x => set.add(x));
            });
            active.delete(id);
            descendantsById.set(id, set);
            return set;
        }
        nodeIds.forEach(id => collectDescendants(id, new Set()));

        // Mark tree edges.
        const treeEdgeKeys = new Set();
        parentById.forEach((parent, id) => {
            if (parent) treeEdgeKeys.add(edgeKey(parent, id));
        });

        return {
            rootId,
            maxDepth,
            depthById,
            descendantsById,
            trunkNodeIds,
            treeEdgeKeys
        };
    }

    let treeMeta = buildTreeMeta(nodes, links);
    const expandedRoots = new Set();
    let visibleNodeIds = new Set(treeMeta.trunkNodeIds);

    function rebuildVisibleNodeIds() {
        const visible = new Set(treeMeta.trunkNodeIds);
        expandedRoots.forEach(rootId => {
            visible.add(rootId);
            const descendants = treeMeta.descendantsById.get(rootId) || new Set();
            descendants.forEach(id => visible.add(id));
        });
        visibleNodeIds = visible;
    }

    function isNodeVisible(d) {
        if (d.isShown === 0) return false;
        return visibleNodeIds.has(String(d.id));
    }

    function isTreeEdge(d) {
        const source = normalizeLinkEndId(d.source);
        const target = normalizeLinkEndId(d.target);
        return treeMeta.treeEdgeKeys.has(edgeKey(source, target));
    }

    function isLinkVisible(d) {
        if (d.isShown === 0) return false;
        const source = normalizeLinkEndId(d.source);
        const target = normalizeLinkEndId(d.target);
        if (!visibleNodeIds.has(String(source)) || !visibleNodeIds.has(String(target))) return false;
        if (currentZoomScale < 1.45 && !isTreeEdge(d)) return false;
        return true;
    }

    function treeTargetX(d) {
        const rowSize = Math.max(1, d.treeRowSize || 1);
        if (rowSize === 1) return window.innerWidth / 2;
        const availableWidth = Math.max(320, window.innerWidth - 160);
        const gap = Math.max(92, Math.min(210, availableWidth / (rowSize - 1)));
        const span = (rowSize - 1) * gap;
        const start = window.innerWidth / 2 - span / 2;
        return start + (d.treeCol || 0) * gap;
    }

    function treeTargetY(d) {
        return 80 + (d.treeDepth || 0) * 130 + (d.treeRow || 0) * 70;
    }

    function applyVisibility() {
        node.style("display", d => (isNodeVisible(d) ? null : "none"));
        linkPath.style("display", d => (isLinkVisible(d) ? null : "none"));
        if (typeof linkGroup !== "undefined") {
            linkGroup.style("display", d => (isLinkVisible(d) ? null : "none"));
        }
    }

    function applyZoomDrivenDisplay() {
        linkPath
            .style("stroke-width", d => {
                const base = isTreeEdge(d) ? 1.9 : 1.1;
                if (currentZoomScale < 0.8) return base * 0.8;
                if (currentZoomScale < 1.4) return base;
                return base * 1.2;
            })
            .style("opacity", d => {
                if (currentZoomScale < 1.45 && !isTreeEdge(d)) return 0;
                return isTreeEdge(d) ? 0.9 : 0.35;
            });

        if (typeof linkText !== "undefined") {
            linkText.style("display", d => (currentZoomScale >= 1.2 && isTreeEdge(d) ? null : "none"));
        }

        nodeLabelSelection.style("display", d => {
            if (!isNodeVisible(d)) return "none";
            if (currentZoomScale < 1.02) return "none";
            if (nodes.length > 220 && (d.treeDepth || 0) > 1 && currentZoomScale < 1.55) return "none";
            if (nodes.length > 120 && (d.treeDepth || 0) > 2 && currentZoomScale < 1.32) return "none";
            return null;
        });

        if (typeof linkGroup !== "undefined") {
            linkGroup.style("opacity", currentZoomScale < 1.2 ? 0 : 1);
        }

        applyVisibility();
    }

    function refreshTreeForces() {
        simulation
            .force("link", simulation.force("link").distance(d => {
                const sDepth = (d.source && d.source.treeDepth) ? d.source.treeDepth : (treeMeta.depthById.get(String(normalizeLinkEndId(d.source))) || 0);
                const tDepth = (d.target && d.target.treeDepth) ? d.target.treeDepth : (treeMeta.depthById.get(String(normalizeLinkEndId(d.target))) || 0);
                const depthDelta = Math.abs(sDepth - tDepth);
                return 85 + Math.min(4, depthDelta) * 20 + (isTreeEdge(d) ? 0 : 18);
            }).strength(d => (isTreeEdge(d) ? 0.9 : 0.25)))
            .force("collide", d3.forceCollide().radius(d => ((d.treeDepth || 0) <= 1 ? 34 : 28)).strength(0.95))
            .force("charge", d3.forceManyBody().strength(nodes.length > 160 ? -180 : -240))
            .force("treeX", d3.forceX(d => treeTargetX(d)).strength(0.85))
            .force("treeY", d3.forceY(d => treeTargetY(d)).strength(0.92));
    }

    function toggleNodeSubtree(nodeId) {
        const id = String(nodeId);
        if (expandedRoots.has(id)) {
            expandedRoots.delete(id);
            const descendants = treeMeta.descendantsById.get(id) || new Set();
            const toDelete = [];
            expandedRoots.forEach(expandedId => {
                if (descendants.has(expandedId)) toDelete.push(expandedId);
            });
            toDelete.forEach(x => expandedRoots.delete(x));
        } else {
            expandedRoots.add(id);
        }
        rebuildVisibleNodeIds();
        applyZoomDrivenDisplay();
        simulation.alpha(0.4).restart();
    }

    const zoomBehavior = d3.zoom()
        .scaleExtent([0.35, 3.2])
        .on("zoom", function (event) {
            currentZoomScale = event.transform.k;
            graphViewport.attr("transform", event.transform);
            applyZoomDrivenDisplay();
        });

    graphSvg.call(zoomBehavior);
    graphSvg.on("dblclick.zoom", null);

    node.on("click.subtreeExpand", function (event, d) {
        toggleNodeSubtree(d.id);
    });

    window.addEventListener("resize", function () {
        treeMeta = buildTreeMeta(nodes, links);
        rebuildVisibleNodeIds();
        refreshTreeForces();
        applyZoomDrivenDisplay();
        simulation.alpha(0.35).restart();
    });

    rebuildVisibleNodeIds();
    refreshTreeForces();
    applyZoomDrivenDisplay();
    simulation.alpha(0.5).restart();
})();
