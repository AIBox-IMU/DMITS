(function () {
    const relationControlMenu = document.querySelector(".relation-control-menu");
    const menuElem = document.querySelector(".menu.control-menu-list");
    const relationPanel = document.querySelector(".relation-control-panel-list.panel-item");
    const relationListUl = document.querySelector(".relation-list");
    const searchInput = document.querySelector(".search-box input");
    const searchIcon = document.querySelector(".icon-search");
    const suggestionList = document.getElementById("relation-search-box-suggestions");
    const playAutoButton = document.querySelector(".play-auto");
    const videoAutoPlay = document.querySelector(".video-auto-play");
    const graphContainer = document.getElementById("graph");
    const nodeEffect = document.getElementById("graph-node-effect");
    const nodeDetailContainer = document.getElementById("node-detail-container");
    const nodeContainer = document.getElementById("node-detail-circle");
    const rightControlContainer = document.getElementById("right-control-container");
    const videoPlayerModal = document.getElementById("video-player-modal");
    const detailTitle = document.querySelector(".circle-detail a.title");
    const detailContent = document.querySelector(".content");
    const detailSearchButton = document.querySelector(".circle-detail-container .search-btn");
    const detailEditButton = document.querySelector(".circle-detail-container .edit-btn");
    const circleNameContainer = document.querySelector(".circle-3");
    const circleActionContainer = document.querySelector(".circle-2");

    if (!graphContainer || !window.G6) {
        return;
    }

    const relationCategoryLabels = {
        experience: "包含",
        influence: "影响",
        attribution: "归属",
        other: "其他",
        enemy: "对立",
        career: "扩展",
        love: "关联",
        family: "附属",
    };

    const detailTabLabels = {
        overview: "概览",
        text: "文本资源",
        video: "视频资源",
        relations: "关系",
    };

    const textResourceTypeLabels = {
        definition: "定义",
        theorem: "定理",
        law: "定律",
        exercise: "习题",
        example: "例题",
        note: "笔记",
        other: "其他",
    };

    const nodesContain = [
        { id: 1, name: "Node1", relations: ["experience", "influence", "attribution", "other", "enemy", "career", "love", "family"], title: ["包含", "影响", "归属", "其他", "对立", "扩展", "关联", "附属"] },
        { id: 2, name: "Node2", relations: ["experience", "influence", "attribution", "other", "enemy", "career", "love"], title: ["包含", "影响", "归属", "其他", "对立", "扩展", "关联"] },
        { id: 3, name: "Node3", relations: ["experience", "influence", "attribution", "other", "enemy", "career"], title: ["包含", "影响", "归属", "其他", "对立", "扩展"] },
        { id: 4, name: "Node4", relations: ["experience", "influence", "attribution", "other", "enemy"], title: ["包含", "影响", "归属", "其他", "对立"] },
        { id: 5, name: "Node5", relations: ["experience", "influence", "attribution", "other"], title: ["包含", "影响", "归属", "其他"] },
        { id: 6, name: "Node6", relations: ["experience", "influence"], title: ["包含", "影响"] },
        { id: 7, name: "Node7", relations: ["experience"], title: ["包含"] },
        { id: 8, name: "Node8", relations: ["influence", "attribution"], title: ["影响", "归属"] },
        { id: 9, name: "Node9", relations: ["other", "enemy", "career"], title: ["其他", "对立", "扩展"] },
        { id: 10, name: "Node10", relations: ["attribution", "other", "enemy", "career"], title: ["归属", "其他", "对立", "扩展"] },
        { id: 11, name: "Node11", relations: ["experience", "influence", "attribution", "other", "enemy", "career"], title: ["包含", "影响", "归属", "其他", "对立", "扩展"] },
        { id: 12, name: "Node12", relations: ["experience", "influence", "attribution", "enemy", "career"], title: ["包含", "影响", "归属", "对立", "扩展"] },
        { id: 13, name: "Node13", relations: ["experience", "influence", "attribution", "other", "enemy", "career"], title: ["包含", "影响", "归属", "其他", "对立", "扩展"] },
        { id: 14, name: "Node14", relations: ["experience", "enemy", "career"], title: ["包含", "对立", "扩展"] },
        { id: 15, name: "Node15", relations: ["experience", "influence", "career"], title: ["包含", "影响", "扩展"] },
        { id: 16, name: "Node16", relations: ["experience", "influence", "attribution", "other", "enemy"], title: ["包含", "影响", "归属", "其他", "对立"] },
        { id: 17, name: "Node17", relations: ["experience", "influence", "attribution", "other", "enemy", "career"], title: ["包含", "影响", "归属", "其他", "对立", "扩展"] },
        { id: 18, name: "Node18", relations: ["experience", "influence"], title: ["包含", "影响"] },
        { id: 19, name: "Node19", relations: ["experience", "influence", "attribution", "other"], title: ["包含", "影响", "归属", "其他"] },
        { id: 20, name: "Node20", relations: ["career"], title: ["扩展"] },
        { id: 21, name: "Node21", relations: ["experience"], title: ["包含"] },
    ];

    const nodesRelation = [
        { id: 1, name: "Node1", experience: ["edge33", "edge34", "edge35"], influence: ["edge36"], attribution: ["edge37"], other: ["edge38"], enemy: ["edge39"], career: ["edge40"], love: ["edge41"], family: ["edge42"] },
        { id: 2, name: "Node2", experience: ["edge43"], influence: ["edge44"], attribution: ["edge45"], other: ["edge46", "edge47"], enemy: ["edge48"], career: ["edge49", "edge50"], love: ["edge51"] },
    ];

    const fallbackGraph = {
        nodes: [
            { id: 1, name: "root", details: "这是根节点。", image: "/images/snow.png", isShown: 1 },
            { id: 2, name: "命题逻辑", details: "这是一个示例节点。", image: "/images/snow.png", isShown: 1 },
            { id: 3, name: "等值演算", details: "这是一个示例节点。", image: "/images/snow.png", isShown: 1 },
        ],
        links: [
            { id: "edge1", source: 1, target: 2, description: "包含", details: "", isShown: 1 },
            { id: "edge2", source: 2, target: 3, description: "包含", details: "", isShown: 1 },
        ],
    };

    const palette = ["#2F6BFF", "#1FA2FF", "#34D399", "#F7B955", "#FB7185", "#A78BFA"];
    const resourceNodeVisualConfig = {
        text: {
            fill: "#F5B971",
            stroke: "#FFE1A7",
            size: 34,
            image: "/static/imgs/video/Text_Edit_26232.png",
            iconWidth: 34,
            iconHeight: 34,
        },
        video: {
            fill: "#9D7CFF",
            stroke: "#D8CCFF",
            size: 38,
            image: "proposition-cover-2.jpg",
            iconWidth: 38,
            iconHeight: 38,
        },
    };
    const nodeMetaById = new Map(nodesContain.map((item) => [String(item.id), item]));
    const nodeRelationById = new Map(nodesRelation.map((item) => [String(item.id), item]));

    const state = {
        graph: null,
        nodes: [],
        edges: [],
        resourceNodes: [],
        resourceEdges: [],
        nodeById: new Map(),
        edgeById: new Map(),
        resourceNodeById: new Map(),
        resourceEdgeById: new Map(),
        adjacency: new Map(),
        reverseAdjacency: new Map(),
        edgeIdsByPair: new Map(),
        resourceNodeIdsByParent: new Map(),
        resourceEdgeIdsByParent: new Map(),
        treeRootId: null,
        treeParentById: new Map(),
        treeChildrenById: new Map(),
        treeDepthById: new Map(),
        treeDescendantsById: new Map(),
        nameEntries: [],
        baseHiddenNodeIds: [],
        baseHiddenEdgeIds: [],
        collapsedNodeIds: new Set(),
        collapseHiddenNodeIds: [],
        collapseHiddenEdgeIds: [],
        visibleRelationEdgeIds: [],
        hiddenNodeIds: [],
        hiddenEdgeIds: [],
        activeNodeId: null,
        activeRelationId: null,
        expandedResourceParentIds: new Set(),
        detailNodeId: null,
        detailRelationTypes: new Set(),
        detailViewMode: "overview",
        detailTextFilter: "all",
        detailCache: new Map(),
        detailLoading: false,
        detailRequestToken: 0,
        detailSidePanelOpen: false,
        videoModalNodeId: null,
        videoModalVideoId: null,
        videoModalOpen: false,
        videoModalRequestToken: 0,
        suppressCanvasClearUntil: 0,
        autoplayTimer: null,
        autoplayIndex: 0,
        effectNodeId: null,
        effectFrameId: null,
        layoutSyncPromise: null,
    };

    const nodeClickEvent = window.G6.NodeEvent ? window.G6.NodeEvent.CLICK : "node:click";
    const nodeContextMenuEvent = window.G6.NodeEvent && window.G6.NodeEvent.CONTEXT_MENU
        ? window.G6.NodeEvent.CONTEXT_MENU
        : "node:contextmenu";
    const edgeClickEvent = window.G6.EdgeEvent ? window.G6.EdgeEvent.CLICK : "edge:click";
    const canvasClickEvent = window.G6.CanvasEvent ? window.G6.CanvasEvent.CLICK : "canvas:click";

    function setRelationMenuOpen(open) {
        if (menuElem) {
            menuElem.classList.toggle("active", !!open);
        }
        if (relationPanel) {
            relationPanel.style.display = open ? "block" : "none";
        }
    }

    function safeText(value, fallback) {
        if (value === undefined || value === null) return fallback || "";
        return String(value);
    }

    function normalizeLinkEndId(end) {
        if (end && typeof end === "object") {
            return end.id;
        }
        return end;
    }

    function normalizeImageUrl(value) {
        const text = safeText(value, "").trim();
        if (!text) return "/images/snow.png";
        if (/^(https?:)?\/\//.test(text) || text.startsWith("/")) return text;
        if (text.startsWith("images/")) return "/" + text;
        return text;
    }

    if (relationControlMenu && menuElem) {
        relationControlMenu.addEventListener("click", function (event) {
            const target = event && event.target;
            if (target && target.closest && target.closest(".panel-item")) {
                return;
            }
            setRelationMenuOpen(!menuElem.classList.contains("active"));
        });
    }

    function buildLevelMap(nodes, edges) {
        const indegree = new Map(nodes.map((node) => [node.id, 0]));
        const outgoing = new Map();

        function ensure(map, key) {
            if (!map.has(key)) map.set(key, []);
            return map.get(key);
        }

        edges.forEach((edge) => {
            if (edge.source === edge.target) return;
            ensure(outgoing, edge.source).push(edge.target);
            indegree.set(edge.target, (indegree.get(edge.target) || 0) + 1);
        });

        const roots = nodes
            .filter((node) => (indegree.get(node.id) || 0) === 0)
            .map((node) => node.id);
        const queue = roots.length ? roots.slice() : nodes.slice(0, 1).map((node) => node.id);
        const levelMap = new Map();

        queue.forEach((id) => levelMap.set(id, 0));

        while (queue.length) {
            const current = queue.shift();
            const nextLevel = (levelMap.get(current) || 0) + 1;
            (outgoing.get(current) || []).forEach((target) => {
                if (!levelMap.has(target)) {
                    levelMap.set(target, nextLevel);
                    queue.push(target);
                }
            });
        }

        let fallbackLevel = Math.max(0, ...Array.from(levelMap.values()));
        nodes.forEach((node) => {
            if (!levelMap.has(node.id)) {
                fallbackLevel += 1;
                levelMap.set(node.id, fallbackLevel);
            }
        });

        return levelMap;
    }

    function buildTreeStructure(nodes, edges) {
        const indegree = new Map(nodes.map(function (node) { return [node.id, 0]; }));
        const childrenMap = new Map();
        const nodeIds = new Set(nodes.map(function (node) { return node.id; }));

        function ensure(map, key) {
            if (!map.has(key)) map.set(key, []);
            return map.get(key);
        }

        edges.forEach(function (edge) {
            if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target) || edge.source === edge.target) return;
            const childList = ensure(childrenMap, edge.source);
            if (!childList.includes(edge.target)) {
                childList.push(edge.target);
                indegree.set(edge.target, (indegree.get(edge.target) || 0) + 1);
            }
        });

        const roots = nodes
            .filter(function (node) { return (indegree.get(node.id) || 0) === 0; })
            .map(function (node) { return node.id; });
        const rootId = roots.length ? roots[0] : (nodes[0] ? nodes[0].id : null);
        if (!rootId) {
            return {
                rootId: null,
                parentMap: new Map(),
                depthMap: new Map(),
                treeChildren: new Map(),
            };
        }

        const parentMap = new Map([[rootId, null]]);
        const depthMap = new Map([[rootId, 0]]);
        const queue = [rootId];

        while (queue.length) {
            const current = queue.shift();
            const nextDepth = (depthMap.get(current) || 0) + 1;
            (childrenMap.get(current) || []).forEach(function (childId) {
                if (!parentMap.has(childId)) {
                    parentMap.set(childId, current);
                    depthMap.set(childId, nextDepth);
                    queue.push(childId);
                }
            });
        }

        nodes.forEach(function (node) {
            if (!parentMap.has(node.id) && node.id !== rootId) {
                parentMap.set(node.id, rootId);
                depthMap.set(node.id, 1);
                const rootChildren = ensure(childrenMap, rootId);
                if (!rootChildren.includes(node.id)) {
                    rootChildren.push(node.id);
                }
            }
        });

        const treeChildren = new Map();
        parentMap.forEach(function (parentId, nodeId) {
            if (parentId === null) return;
            ensure(treeChildren, parentId).push(nodeId);
        });

        const orderChildren = function (nodeId) {
            const currentChildren = (treeChildren.get(nodeId) || []).slice();
            currentChildren.sort(function (a, b) {
                const depthA = depthMap.get(a) || 0;
                const depthB = depthMap.get(b) || 0;
                if (depthA !== depthB) return depthA - depthB;
                return String(a).localeCompare(String(b), "zh-Hans-CN");
            });
            treeChildren.set(nodeId, currentChildren);
            currentChildren.forEach(orderChildren);
        };

        orderChildren(rootId);

        return {
            rootId: rootId,
            parentMap: parentMap,
            depthMap: depthMap,
            treeChildren: treeChildren,
        };
    }

    function getTreeChildren(nodeId, visibleNodeIds, treeChildrenMap) {
        const sourceMap = treeChildrenMap || state.treeChildrenById;
        const children = sourceMap.get(String(nodeId)) || [];
        if (!visibleNodeIds) return children.slice();
        return children.filter(function (childId) { return visibleNodeIds.has(childId); });
    }

    function nodeHasTreeChildren(nodeId) {
        return getTreeChildren(nodeId).length > 0;
    }

    function isNodeCollapsed(nodeId) {
        return state.collapsedNodeIds.has(String(nodeId));
    }

    function buildTreePositionMap(nodes, edges, treeState, visibleNodeIds) {
        const structure = treeState || buildTreeStructure(nodes, edges);
        const rootId = structure.rootId;
        const depthMap = structure.depthMap || new Map();
        if (!rootId) return new Map();

        const visibleSet = visibleNodeIds || new Set(nodes.map(function (node) { return node.id; }));
        const leafOrder = { value: 0 };
        const slotMap = new Map();

        function assignSlot(nodeId) {
            if (!visibleSet.has(nodeId)) return null;

            const currentChildren = getTreeChildren(nodeId, visibleSet, structure.treeChildren);
            if (!currentChildren.length) {
                const slot = leafOrder.value;
                leafOrder.value += 1;
                slotMap.set(nodeId, slot);
                return slot;
            }

            const childSlots = currentChildren
                .map(assignSlot)
                .filter(function (slot) { return slot !== null; });

            if (!childSlots.length) {
                const fallbackSlot = leafOrder.value;
                leafOrder.value += 1;
                slotMap.set(nodeId, fallbackSlot);
                return fallbackSlot;
            }

            const slot = childSlots.reduce(function (sum, value) { return sum + value; }, 0) / childSlots.length;
            slotMap.set(nodeId, slot);
            return slot;
        }

        assignSlot(rootId);

        const width = Math.max(window.innerWidth || 1280, 960);
        const height = Math.max(window.innerHeight || 720, 640);
        const visibleSlots = Array.from(slotMap.values());
        const visibleDepths = Array.from(visibleSet)
            .map(function (id) { return depthMap.get(id) || 0; });
        const minSlot = visibleSlots.length ? Math.min.apply(null, visibleSlots) : 0;
        const maxSlot = visibleSlots.length ? Math.max.apply(null, visibleSlots) : 0;
        const minDepth = visibleDepths.length ? Math.min.apply(null, visibleDepths) : 0;
        const maxDepth = visibleDepths.length ? Math.max.apply(null, visibleDepths) : 0;
        const leafCount = Math.max(1, Math.round(maxSlot - minSlot) + 1);
        const depthCount = Math.max(1, Math.round(maxDepth - minDepth) + 1);
        const slotMid = (minSlot + maxSlot) / 2;
        const horizontalGap = leafCount > 40
            ? Math.max(68, Math.min(120, 160 - leafCount * 1.2))
            : Math.max(96, Math.min(170, 198 - leafCount * 2));
        const verticalGap = Math.max(112, Math.min(168, 190 - depthCount * 6));
        const topY = Math.max(100, Math.min(150, height * 0.15));
        const centerX = width / 2;

        const positionMap = new Map();
        visibleSet.forEach(function (nodeId) {
            const depth = depthMap.get(nodeId) || 0;
            const slot = slotMap.has(nodeId) ? slotMap.get(nodeId) : minSlot;
            positionMap.set(nodeId, {
                x: centerX + (slot - slotMid) * horizontalGap,
                y: topY + (depth - minDepth) * verticalGap,
                depth: depth,
            });
        });

        return positionMap;
    }

    function getLayoutOrderedResourceNodes(parentId) {
        const resourceTypeOrder = {
            definition: 1,
            theorem: 2,
            law: 3,
            example: 4,
            exercise: 5,
            note: 6,
            other: 7,
            video: 8,
        };

        return (state.resourceNodeIdsByParent.get(parentId) || [])
            .map(function (resourceNodeId) { return state.resourceNodeById.get(resourceNodeId); })
            .filter(Boolean)
            .sort(function (leftNode, rightNode) {
                const leftType = safeText(leftNode.data && leftNode.data.resourceType, "other");
                const rightType = safeText(rightNode.data && rightNode.data.resourceType, "other");
                const leftRank = resourceTypeOrder[leftType] || 99;
                const rightRank = resourceTypeOrder[rightType] || 99;
                if (leftRank !== rightRank) return leftRank - rightRank;
                return safeText(leftNode.data && leftNode.data.fullName, leftNode.id)
                    .localeCompare(safeText(rightNode.data && rightNode.data.fullName, rightNode.id), "zh-Hans-CN");
            });
    }

    function buildUnifiedVisibleLayoutState(visibleConceptNodeIds) {
        const visibleConceptIdSet = visibleConceptNodeIds instanceof Set
            ? new Set(Array.from(visibleConceptNodeIds))
            : new Set(visibleConceptNodeIds || []);
        const layoutNodeIds = new Set(Array.from(visibleConceptIdSet));
        const layoutDepthMap = new Map();
        const layoutChildren = new Map();
        const layoutResourceNodes = [];

        state.treeChildrenById.forEach(function (children, parentId) {
            const visibleChildren = (children || []).filter(function (childId) {
                return visibleConceptIdSet.has(childId);
            });
            layoutChildren.set(parentId, visibleChildren.slice());
        });

        visibleConceptIdSet.forEach(function (nodeId) {
            layoutDepthMap.set(nodeId, state.treeDepthById.get(nodeId) || 0);
        });

        Array.from(state.expandedResourceParentIds).forEach(function (parentId) {
            if (!visibleConceptIdSet.has(parentId)) return;
            const orderedResourceNodes = getLayoutOrderedResourceNodes(parentId);
            if (!orderedResourceNodes.length) return;

            const currentChildren = (layoutChildren.get(parentId) || []).slice();
            orderedResourceNodes.forEach(function (resourceNode) {
                const resourceId = resourceNode.id;
                layoutNodeIds.add(resourceId);
                layoutResourceNodes.push(resourceNode);
                layoutDepthMap.set(resourceId, (state.treeDepthById.get(parentId) || 0) + 1);
                layoutChildren.set(resourceId, []);
                currentChildren.push(resourceId);
            });
            layoutChildren.set(parentId, currentChildren);
        });

        return {
            rootId: state.treeRootId,
            visibleNodeIds: layoutNodeIds,
            depthMap: layoutDepthMap,
            treeChildren: layoutChildren,
            resourceNodes: layoutResourceNodes,
        };
    }

    function buildGraphData(rawNodes, rawLinks) {
        const nodes = rawNodes.map((node) => ({
            id: String(node.id),
            data: {
                rawId: Number(node.id),
                entityType: "concept",
                name: safeText(node.name, "未命名节点"),
                details: safeText(node.details, ""),
                image: normalizeImageUrl(node.image),
                isShown: Number(node.isShown === undefined ? 1 : node.isShown),
            },
        }));

        const edges = rawLinks.map((edge, index) => {
            const source = String(normalizeLinkEndId(edge.source));
            const target = String(normalizeLinkEndId(edge.target));
            return {
                id: safeText(edge.id, "edge-" + (index + 1)),
                source,
                target,
                data: {
                    description: safeText(edge.description, "关系"),
                    details: safeText(edge.details, ""),
                    isShown: Number(edge.isShown === undefined ? 1 : edge.isShown),
                    sourceId: source,
                    targetId: target,
                    edgeType: "concept",
                },
            };
        });

        const tree = buildTreeStructure(nodes, edges);
        const positionMap = buildTreePositionMap(nodes, edges, tree);
        const levelMap = buildLevelMap(nodes, edges);
        nodes.forEach((node) => {
            const level = levelMap.get(node.id) || 0;
            const position = positionMap.get(node.id) || { x: 0, y: 0 };
            node.data.level = level;
            node.data.fill = level === 0 ? "#2B7FFF" : palette[(level - 1 + palette.length) % palette.length];
            node.data.stroke = level === 0 ? "#A7DBFF" : "#D8ECFF";
            node.data.size = level === 0 ? 54 : 44;
            node.x = position.x;
            node.y = position.y;
            node.style = {
                x: position.x,
                y: position.y,
            };
        });

        return { nodes, edges, tree };
    }

    function refreshNodePositions() {
        const visibleConceptNodeIds = new Set(
            state.nodes
                .map(function (node) { return node.id; })
                .filter(function (id) {
                    return !state.collapseHiddenNodeIds.includes(id) && !state.baseHiddenNodeIds.includes(id);
                })
        );
        const layoutState = buildUnifiedVisibleLayoutState(visibleConceptNodeIds);
        const positionMap = buildTreePositionMap(
            state.nodes.concat(layoutState.resourceNodes),
            state.edges,
            {
                rootId: layoutState.rootId,
                depthMap: layoutState.depthMap,
                treeChildren: layoutState.treeChildren,
            },
            layoutState.visibleNodeIds
        );
        state.nodes.forEach(function (node) {
            const position = positionMap.get(node.id) || { x: node.x || 0, y: node.y || 0 };
            node.x = position.x;
            node.y = position.y;
            node.style = Object.assign({}, node.style || {}, {
                x: position.x,
                y: position.y,
            });
        });
        state.resourceNodes.forEach(function (node) {
            const position = positionMap.get(node.id);
            if (!position) return;
            node.x = position.x;
            node.y = position.y;
            node.style = Object.assign({}, node.style || {}, {
                x: position.x,
                y: position.y,
            });
        });
    }

    async function loadGraphPayload() {
        try {
            const response = await fetch("/api/graph", { credentials: "same-origin" });
            if (!response.ok) throw new Error("request failed");
            const payload = await response.json();
            if (payload && payload.data && Array.isArray(payload.data.nodes) && Array.isArray(payload.data.links)) {
                return payload.data;
            }
            if (payload && payload.data1 && payload.data2) {
                return {
                    nodes: JSON.parse(payload.data1),
                    links: JSON.parse(payload.data2),
                };
            }
            throw new Error("invalid payload");
        } catch (error) {
            return fallbackGraph;
        }
    }

    function rebuildLookups() {
        state.nodeById = new Map(state.nodes.map((node) => [node.id, node]));
        state.edgeById = new Map(state.edges.map((edge) => [edge.id, edge]));
        state.adjacency = new Map();
        state.reverseAdjacency = new Map();
        state.edgeIdsByPair = new Map();

        function ensure(map, key) {
            if (!map.has(key)) map.set(key, []);
            return map.get(key);
        }

        state.edges.forEach((edge) => {
            ensure(state.adjacency, edge.source).push(edge.target);
            ensure(state.reverseAdjacency, edge.target).push(edge.source);
            const pairKey = edge.source + "->" + edge.target;
            ensure(state.edgeIdsByPair, pairKey).push(edge.id);
        });

        state.baseHiddenNodeIds = state.nodes.filter((node) => node.data.isShown === 0).map((node) => node.id);
        state.baseHiddenEdgeIds = state.edges.filter((edge) => edge.data.isShown === 0).map((edge) => edge.id);
        state.nameEntries = state.nodes.map((node) => ({
            id: node.id,
            rawId: node.data.rawId,
            name: node.data.name,
            lowered: node.data.name.toLowerCase(),
        }));
    }

    function getDescendantNodeIds(nodeId) {
        const cached = state.treeDescendantsById.get(String(nodeId));
        if (cached) {
            return cached.slice();
        }

        const descendants = [];
        const seen = new Set();
        const stack = getTreeChildren(nodeId);

        while (stack.length) {
            const currentId = stack.pop();
            if (seen.has(currentId)) continue;
            seen.add(currentId);
            descendants.push(currentId);
            getTreeChildren(currentId).forEach(function (childId) {
                stack.push(childId);
            });
        }

        return descendants;
    }

    function buildTreeDescendantCache() {
        state.treeDescendantsById = new Map();

        function collect(nodeId) {
            const textNodeId = String(nodeId);
            if (state.treeDescendantsById.has(textNodeId)) {
                return state.treeDescendantsById.get(textNodeId);
            }

            const descendants = [];
            getTreeChildren(textNodeId).forEach(function (childId) {
                descendants.push(childId);
                collect(childId).forEach(function (descendantId) {
                    descendants.push(descendantId);
                });
            });

            state.treeDescendantsById.set(textNodeId, descendants);
            return descendants;
        }

        state.nodes.forEach(function (node) {
            collect(node.id);
        });
    }

    function initializeCollapsedState() {
        state.collapsedNodeIds = new Set();

        const nodeCount = state.nodes.length;
        const defaultCollapseDepth = nodeCount > 320 ? 1 : nodeCount > 180 ? 2 : Infinity;
        if (defaultCollapseDepth === Infinity) return;

        state.nodes.forEach(function (node) {
            const depth = state.treeDepthById.get(node.id) || 0;
            if (node.id === state.treeRootId) return;
            if (depth >= defaultCollapseDepth && nodeHasTreeChildren(node.id)) {
                state.collapsedNodeIds.add(node.id);
            }
        });
    }

    function refreshCollapsedElements() {
        const collapseHiddenNodeSet = new Set();

        state.collapsedNodeIds.forEach(function (nodeId) {
            getDescendantNodeIds(nodeId).forEach(function (descendantId) {
                collapseHiddenNodeSet.add(descendantId);
            });
        });

        const collapseHiddenEdgeIds = state.edges
            .filter(function (edge) {
                return collapseHiddenNodeSet.has(edge.source) || collapseHiddenNodeSet.has(edge.target);
            })
            .map(function (edge) { return edge.id; });

        state.collapseHiddenNodeIds = Array.from(collapseHiddenNodeSet);
        state.collapseHiddenEdgeIds = collapseHiddenEdgeIds;
        state.hiddenNodeIds = Array.from(new Set(state.baseHiddenNodeIds.concat(state.collapseHiddenNodeIds)));
        state.hiddenEdgeIds = Array.from(new Set(state.baseHiddenEdgeIds.concat(state.collapseHiddenEdgeIds)));
        state.visibleRelationEdgeIds = state.edges
            .filter(function (edge) {
                return !state.hiddenEdgeIds.includes(edge.id)
                    && !state.hiddenNodeIds.includes(edge.source)
                    && !state.hiddenNodeIds.includes(edge.target);
            })
            .map(function (edge) { return edge.id; });
    }

    function getVisibleRelationEdges() {
        return state.visibleRelationEdgeIds
            .map(function (edgeId) { return state.edgeById.get(edgeId); })
            .filter(Boolean);
    }

    function getRenderableNodes() {
        const conceptNodes = state.nodes.filter(function (node) {
            return !state.collapseHiddenNodeIds.includes(node.id);
        });
        return conceptNodes.concat(getVisibleResourceNodes());
    }

    function getRenderableEdges() {
        const conceptEdges = state.edges.filter(function (edge) {
            return !state.collapseHiddenEdgeIds.includes(edge.id)
                && !state.collapseHiddenNodeIds.includes(edge.source)
                && !state.collapseHiddenNodeIds.includes(edge.target);
        });
        return conceptEdges.concat(getVisibleResourceEdges());
    }

    function getGraphNodeDatum(nodeId) {
        const textNodeId = safeText(nodeId, "").trim();
        return state.nodeById.get(textNodeId) || state.resourceNodeById.get(textNodeId) || null;
    }

    function buildBezierPath(startPoint, controlPointA, controlPointB, endPoint) {
        return [
            ["M", Number(startPoint.x || 0), Number(startPoint.y || 0)],
            [
                "C",
                Number(controlPointA.x || 0),
                Number(controlPointA.y || 0),
                Number(controlPointB.x || 0),
                Number(controlPointB.y || 0),
                Number(endPoint.x || 0),
                Number(endPoint.y || 0),
            ],
        ];
    }

    function buildPrimaryResourceEdgePath(edge) {
        const sourceNode = getGraphNodeDatum(edge && edge.source);
        const targetNode = getGraphNodeDatum(edge && edge.target);
        if (!sourceNode || !targetNode) return null;

        const startPoint = {
            x: Number(sourceNode.x || 0),
            y: Number(sourceNode.y || 0),
        };
        const endPoint = {
            x: Number(targetNode.x || 0),
            y: Number(targetNode.y || 0),
        };
        const deltaX = endPoint.x - startPoint.x;
        const deltaY = Math.max(endPoint.y - startPoint.y, 72);
        const direction = deltaX >= 0 ? 1 : -1;
        const sidePull = direction * clampNumber(Math.abs(deltaX) * 0.3, 18, 84);
        const sourceLiftY = startPoint.y + clampNumber(deltaY * 0.34, 28, 68);
        const targetSettleY = endPoint.y - clampNumber(deltaY * 0.2, 18, 40);

        return buildBezierPath(
            startPoint,
            {
                x: startPoint.x + sidePull * 0.32,
                y: sourceLiftY,
            },
            {
                x: endPoint.x - sidePull * 0.52,
                y: targetSettleY,
            },
            endPoint
        );
    }

    function buildAssociationResourceEdgePath(edge) {
        const sourceNode = getGraphNodeDatum(edge && edge.source);
        const targetNode = getGraphNodeDatum(edge && edge.target);
        if (!sourceNode || !targetNode) return null;

        const startPoint = {
            x: Number(sourceNode.x || 0),
            y: Number(sourceNode.y || 0),
        };
        const endPoint = {
            x: Number(targetNode.x || 0),
            y: Number(targetNode.y || 0),
        };
        const deltaX = endPoint.x - startPoint.x;
        const direction = deltaX >= 0 ? 1 : -1;
        const distanceX = Math.abs(deltaX);
        const corridorY = Math.max(startPoint.y, endPoint.y) + clampNumber(108 + distanceX * 0.12, 112, 224);
        const midX = (startPoint.x + endPoint.x) / 2;
        const sourceEscapeX = startPoint.x + direction * clampNumber(distanceX * 0.18, 36, 118);
        const targetApproachX = endPoint.x - direction * clampNumber(distanceX * 0.15, 32, 102);
        const sourceLiftY = startPoint.y + clampNumber((corridorY - startPoint.y) * 0.28, 42, 78);
        const targetLiftY = endPoint.y + clampNumber((corridorY - endPoint.y) * 0.5, 54, 124);
        const middlePull = direction * clampNumber(distanceX * 0.06, 12, 44);

        return [
            ["M", startPoint.x, startPoint.y],
            [
                "C",
                sourceEscapeX,
                sourceLiftY,
                midX - middlePull,
                corridorY,
                midX,
                corridorY,
            ],
            [
                "C",
                midX + middlePull,
                corridorY,
                targetApproachX,
                targetLiftY,
                endPoint.x,
                endPoint.y,
            ],
        ];
    }

    function buildCurvedResourceEdgePath(edge) {
        if (!edge || !edge.data || edge.data.edgeType !== "resource") {
            return null;
        }
        if (edge.data.resourceKind === "exercise-link") {
            return buildAssociationResourceEdgePath(edge);
        }
        return buildPrimaryResourceEdgePath(edge);
    }

    function refreshResourceEdgeGeometry() {
        state.resourceEdges.forEach(function (edge) {
            const curvedPath = buildCurvedResourceEdgePath(edge);
            const nextStyle = Object.assign({}, edge.style || {});

            if (curvedPath) {
                nextStyle.d = curvedPath;
                nextStyle.lineJoin = "round";
                nextStyle.lineCap = "round";
            } else if (Object.prototype.hasOwnProperty.call(nextStyle, "d")) {
                delete nextStyle.d;
            }

            edge.style = nextStyle;
        });
    }

    async function syncGraphVisibilityLayout() {
        if (state.layoutSyncPromise) {
            return state.layoutSyncPromise;
        }

        state.layoutSyncPromise = (async function () {
        refreshCollapsedElements();
        refreshNodePositions();
        refreshResourceEdgeGeometry();
        if (state.activeRelationId && state.hiddenEdgeIds.includes(state.activeRelationId)) {
            state.activeRelationId = null;
            ensureRelationPopupRemoved();
        }
        if (state.detailNodeId) {
            const detailNode = state.nodes.find(function (node) {
                return String(node.data.rawId) === String(state.detailNodeId);
            });
            if (detailNode && state.hiddenNodeIds.includes(detailNode.id)) {
                closeNodeDetail(false);
            }
        }
        if (!state.graph) return;
        if (typeof state.graph.setData === "function") {
            state.graph.setData({
                nodes: getRenderableNodes(),
                edges: getRenderableEdges(),
            });
        }
        await renderGraph();
        renderRelationList();
        setRelationListActive(state.activeRelationId);
        if (playAutoButton) {
            playAutoButton.classList.toggle("disable", !getVisibleRelationEdges().length);
        }
        })();

        try {
            await state.layoutSyncPromise;
        } finally {
            state.layoutSyncPromise = null;
        }
    }

    async function ensureNodesExpanded(nodeIds) {
        let changed = false;
        (nodeIds || []).map(String).forEach(function (nodeId) {
            let parentId = state.treeParentById.get(nodeId);
            while (parentId) {
                if (state.collapsedNodeIds.delete(parentId)) {
                    changed = true;
                }
                parentId = state.treeParentById.get(parentId);
            }
        });

        if (changed) {
            await syncGraphVisibilityLayout();
        }
    }

    async function toggleNodeChildren(nodeId) {
        const textNodeId = String(nodeId);
        if (!nodeHasTreeChildren(textNodeId)) return false;

        if (state.collapsedNodeIds.has(textNodeId)) {
            state.collapsedNodeIds.delete(textNodeId);
        } else {
            state.collapsedNodeIds.add(textNodeId);
        }

        await syncGraphVisibilityLayout();
        return true;
    }

    function getGraphViewportSize() {
        return {
            width: Math.max(graphContainer.clientWidth || 0, window.innerWidth || 0, 960),
            height: Math.max(graphContainer.clientHeight || 0, window.innerHeight || 0, 640),
        };
    }

    function getGraphZoom() {
        if (!state.graph || typeof state.graph.getZoom !== "function") {
            return 1;
        }
        const zoom = Number(state.graph.getZoom());
        return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
    }

    function waitForNextFrame() {
        return new Promise(function (resolve) {
            window.requestAnimationFrame(function () {
                resolve();
            });
        });
    }

    function suppressCanvasClear(durationMs) {
        state.suppressCanvasClearUntil = Date.now() + (durationMs || 220);
    }

    function shouldIgnoreCanvasClear() {
        return Date.now() < state.suppressCanvasClearUntil;
    }

    function shieldPanelEvent(event) {
        suppressCanvasClear(260);
        if (event && typeof event.stopPropagation === "function") {
            event.stopPropagation();
        }
    }

    function normalizeRenderBounds(bounds) {
        if (!bounds) return null;

        if (
            typeof bounds.x === "number" &&
            typeof bounds.y === "number" &&
            typeof bounds.width === "number" &&
            typeof bounds.height === "number"
        ) {
            return {
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
            };
        }

        if (
            bounds.min &&
            bounds.max &&
            Array.isArray(bounds.min) &&
            Array.isArray(bounds.max) &&
            bounds.min.length >= 2 &&
            bounds.max.length >= 2
        ) {
            return {
                x: bounds.min[0],
                y: bounds.min[1],
                width: bounds.max[0] - bounds.min[0],
                height: bounds.max[1] - bounds.min[1],
            };
        }

        if (
            Array.isArray(bounds.center) &&
            Array.isArray(bounds.halfExtents) &&
            bounds.center.length >= 2 &&
            bounds.halfExtents.length >= 2
        ) {
            return {
                x: bounds.center[0] - bounds.halfExtents[0],
                y: bounds.center[1] - bounds.halfExtents[1],
                width: bounds.halfExtents[0] * 2,
                height: bounds.halfExtents[1] * 2,
            };
        }

        return null;
    }

    function normalizePoint(point) {
        if (!point) return null;

        if (
            typeof point.x === "number" &&
            typeof point.y === "number" &&
            Number.isFinite(point.x) &&
            Number.isFinite(point.y)
        ) {
            return {
                x: point.x,
                y: point.y,
            };
        }

        if (
            Array.isArray(point) &&
            point.length >= 2 &&
            Number.isFinite(point[0]) &&
            Number.isFinite(point[1])
        ) {
            return {
                x: Number(point[0]),
                y: Number(point[1]),
            };
        }

        return null;
    }

    function convertCanvasPointToClient(point) {
        if (!state.graph) return null;

        const normalizedPoint = normalizePoint(point);
        if (!normalizedPoint) return null;

        const pointVariants = [
            { x: normalizedPoint.x, y: normalizedPoint.y },
            [normalizedPoint.x, normalizedPoint.y],
        ];

        if (typeof state.graph.getClientByCanvas === "function") {
            for (let index = 0; index < pointVariants.length; index += 1) {
                try {
                    const convertedPoint = normalizePoint(state.graph.getClientByCanvas(pointVariants[index]));
                    if (convertedPoint) {
                        return convertedPoint;
                    }
                } catch (error) {
                    continue;
                }
            }
        }

        if (typeof state.graph.getViewportByCanvas === "function") {
            for (let index = 0; index < pointVariants.length; index += 1) {
                try {
                    const convertedPoint = normalizePoint(state.graph.getViewportByCanvas(pointVariants[index]));
                    if (convertedPoint) {
                        return convertedPoint;
                    }
                } catch (error) {
                    continue;
                }
            }
        }

        const containerRect = graphContainer.getBoundingClientRect();
        return {
            x: containerRect.left + normalizedPoint.x,
            y: containerRect.top + normalizedPoint.y,
        };
    }

    function getElementViewportCenter(elementId) {
        if (!state.graph || !elementId) {
            return null;
        }

        const textElementId = String(elementId);
        const nodeDatum = state.nodeById.get(textElementId);
        if (
            nodeDatum &&
            typeof nodeDatum.x === "number" &&
            typeof nodeDatum.y === "number"
        ) {
            const clientPoint = convertCanvasPointToClient({ x: nodeDatum.x, y: nodeDatum.y });
            if (clientPoint) {
                const nodeSize = nodeDatum.data && nodeDatum.data.size ? nodeDatum.data.size : 44;
                return {
                    x: clientPoint.x,
                    y: clientPoint.y,
                    width: nodeSize,
                    height: nodeSize,
                };
            }
        }

        if (typeof state.graph.getElementRenderBounds !== "function") {
            return null;
        }

        const bounds = normalizeRenderBounds(state.graph.getElementRenderBounds(textElementId));
        if (!bounds) {
            return null;
        }

        const clientPoint = convertCanvasPointToClient({
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
        });
        if (!clientPoint) {
            return null;
        }

        return {
            x: clientPoint.x,
            y: clientPoint.y,
            width: bounds.width,
            height: bounds.height,
        };
    }

    function cancelNodeEffectFrame() {
        if (!state.effectFrameId) return;
        window.cancelAnimationFrame(state.effectFrameId);
        state.effectFrameId = null;
    }

    function hideNodeEffect() {
        state.effectNodeId = null;
        cancelNodeEffectFrame();
        if (!nodeEffect) return;
        nodeEffect.classList.remove("active");
        nodeEffect.classList.add("hidden");
    }

    function syncNodeEffectPosition() {
        if (!nodeEffect || !state.graph || !state.effectNodeId) {
            return;
        }

        const nodeDatum = state.nodeById.get(String(state.effectNodeId));
        if (!nodeDatum || typeof state.graph.getElementRenderBounds !== "function") {
            hideNodeEffect();
            return;
        }

        const center = getElementViewportCenter(state.effectNodeId);
        if (!center) {
            hideNodeEffect();
            return;
        }
        const zoom = getGraphZoom();
        const size = Math.max(76, Math.min(168, (nodeDatum.data.size || 44) * zoom + 34));

        nodeEffect.style.left = center.x + "px";
        nodeEffect.style.top = center.y + "px";
        nodeEffect.style.width = size + "px";
        nodeEffect.style.height = size + "px";
        nodeEffect.classList.remove("hidden");
        nodeEffect.classList.add("active");
    }

    function showNodeEffect(nodeId) {
        if (!nodeEffect) return;
        state.effectNodeId = String(nodeId);
        nodeEffect.classList.remove("active");
        nodeEffect.classList.add("hidden");
        void nodeEffect.offsetWidth;
        syncNodeEffectPosition();
    }

    function createGraph() {
        const viewport = getGraphViewportSize();

        state.graph = new window.G6.Graph({
            container: "graph",
            width: viewport.width,
            height: viewport.height,
            autoResize: true,
            padding: [110, 80, 80, 80],
            data: {
                nodes: getRenderableNodes(),
                edges: getRenderableEdges(),
            },
            behaviors: ["drag-canvas", "zoom-canvas"],
            node: {
                type: "circle",
                style: {
                    size: function (datum) { return datum.data.size || 44; },
                    fill: function (datum) { return datum.data.fill; },
                    fillOpacity: function (datum) {
                        return datum.data.entityType === "concept" ? 0.9 : 0.96;
                    },
                    stroke: function (datum) { return datum.data.stroke; },
                    lineWidth: function (datum) {
                        return datum.data.entityType === "concept" ? 2 : 1.8;
                    },
                    shadowColor: function (datum) {
                        if (datum.data.entityType === "resource-video") return "rgba(157, 124, 255, 0.28)";
                        if (datum.data.entityType === "resource-text") return "rgba(245, 185, 113, 0.24)";
                        return "rgba(78, 163, 255, 0.25)";
                    },
                    shadowBlur: function (datum) {
                        return datum.data.entityType === "concept" ? 14 : 10;
                    },
                    shadowOffsetY: function (datum) {
                        return datum.data.entityType === "concept" ? 4 : 2;
                    },
                    label: true,
                    labelText: function (datum) {
                        return datum.data.name;
                    },
                    labelPlacement: "bottom",
                    labelFill: function (datum) {
                        return datum.data.entityType === "concept" ? "#D8E7FF" : "#F7FBFF";
                    },
                    labelFontSize: function (datum) {
                        return datum.data.entityType === "concept" ? 12 : 11;
                    },
                    labelFontFamily: "KaiTi, STKaiti, serif",
                    labelBackground: true,
                    labelBackgroundFill: function (datum) {
                        if (datum.data.entityType === "resource-video") return "rgba(48, 26, 78, 0.88)";
                        if (datum.data.entityType === "resource-text") return "rgba(71, 44, 10, 0.88)";
                        return "rgba(10, 19, 35, 0.8)";
                    },
                    labelBackgroundStroke: function (datum) {
                        if (datum.data.entityType === "resource-video") return "rgba(206, 191, 255, 0.4)";
                        if (datum.data.entityType === "resource-text") return "rgba(255, 226, 165, 0.4)";
                        return "rgba(119, 181, 255, 0.35)";
                    },
                    labelBackgroundLineWidth: 1,
                    labelBackgroundRadius: 10,
                    labelPadding: [3, 8],
                    iconSrc: function (datum) { return datum.data.image || ""; },
                    iconWidth: function (datum) {
                        return Number(datum.data.iconWidth || (datum.data.entityType === "concept" ? 52 : 0));
                    },
                    iconHeight: function (datum) {
                        return Number(datum.data.iconHeight || (datum.data.entityType === "concept" ? 52 : 0));
                    },
                    iconOpacity: 0.95,
                    cursor: "pointer",
                },
                state: {
                    focus: {
                        stroke: "#8AE8FF",
                        lineWidth: 3,
                        halo: true,
                        haloStroke: "#8AE8FF",
                        haloLineWidth: 18,
                        haloStrokeOpacity: 0.28,
                        shadowBlur: 26,
                        shadowColor: "rgba(138, 232, 255, 0.55)",
                    },
                    highlight: {
                        stroke: "#FFD46D",
                        lineWidth: 3,
                        halo: true,
                        haloStroke: "#FFD46D",
                        haloLineWidth: 18,
                        haloStrokeOpacity: 0.24,
                    },
                    path: {
                        stroke: "#FF9966",
                        lineWidth: 3,
                        halo: true,
                        haloStroke: "#FF9966",
                        haloLineWidth: 18,
                        haloStrokeOpacity: 0.22,
                    },
                    dim: {
                        opacity: 0.15,
                    },
                },
            },
            edge: {
                type: "line",
                style: {
                    stroke: function (datum) {
                        return datum.data.stroke || "#8BB5FF";
                    },
                    strokeOpacity: function (datum) {
                        if (datum.data.resourceKind === "exercise-link") return 0.66;
                        return datum.data.edgeType === "resource" ? 0.76 : 0.86;
                    },
                    lineWidth: function (datum) {
                        return Number(datum.data.lineWidth || 1.8);
                    },
                    lineDash: function (datum) {
                        return datum.data.lineDash || null;
                    },
                    endArrow: true,
                    label: true,
                    labelText: function (datum) { return datum.data.description; },
                    labelPlacement: "center",
                    labelFill: function (datum) {
                        if (datum.data.resourceKind === "exercise-link") return "#FFE7DC";
                        return datum.data.edgeType === "resource" ? "#F7FBFF" : "#E4EFFF";
                    },
                    labelFontSize: 10,
                    labelAutoRotate: false,
                    labelBackground: true,
                    labelBackgroundFill: function (datum) {
                        if (datum.data.resourceKind === "exercise-link") return "rgba(89, 32, 14, 0.78)";
                        if (datum.data.resourceKind === "video") return "rgba(48, 26, 78, 0.8)";
                        if (datum.data.resourceKind === "text") return "rgba(71, 44, 10, 0.8)";
                        return "rgba(8, 14, 26, 0.82)";
                    },
                    labelBackgroundStroke: function (datum) {
                        if (datum.data.resourceKind === "exercise-link") return "rgba(255, 167, 132, 0.34)";
                        if (datum.data.resourceKind === "video") return "rgba(206, 191, 255, 0.3)";
                        if (datum.data.resourceKind === "text") return "rgba(255, 226, 165, 0.3)";
                        return "rgba(129, 180, 255, 0.25)";
                    },
                    labelBackgroundLineWidth: 1,
                    labelBackgroundRadius: 8,
                    labelPadding: [2, 8],
                    cursor: "pointer",
                },
                state: {
                    focus: {
                        stroke: "#FF9D6C",
                        lineWidth: 2.8,
                        endArrowFill: "#FF9D6C",
                        endArrowStroke: "#FF9D6C",
                        halo: true,
                        haloStroke: "#FF9D6C",
                        haloLineWidth: 8,
                        haloStrokeOpacity: 0.2,
                        labelFill: "#FFF4ED",
                        labelBackgroundFill: "rgba(255, 121, 77, 0.18)",
                        labelBackgroundStroke: "rgba(255, 171, 135, 0.35)",
                    },
                    path: {
                        stroke: "#FFB066",
                        lineWidth: 2.6,
                        endArrowFill: "#FFB066",
                        endArrowStroke: "#FFB066",
                        halo: true,
                        haloStroke: "#FFB066",
                        haloLineWidth: 8,
                        haloStrokeOpacity: 0.18,
                    },
                    dim: {
                        opacity: 0.12,
                    },
                },
            },
        });

        state.graph.on(nodeClickEvent, function (event) {
            const id = event && event.target ? event.target.id : "";
            if (!id) return;
            if (state.resourceNodeById.has(id)) {
                handleResourceNodeSelect(id);
                return;
            }
            if (!state.nodeById.has(id)) return;
            handleNodeSelect(id, true);
        });

        state.graph.on(nodeContextMenuEvent, function (event) {
            const id = event && event.target ? event.target.id : "";
            if (event && typeof event.preventDefault === "function") {
                event.preventDefault();
            }
            if (event && event.originalEvent && typeof event.originalEvent.preventDefault === "function") {
                event.originalEvent.preventDefault();
            }
            if (event && typeof event.stopPropagation === "function") {
                event.stopPropagation();
            }
            if (!id || !state.nodeById.has(id)) return;
            toggleNodeResources(id).catch(function () {});
        });

        state.graph.on(edgeClickEvent, function (event) {
            const id = event && event.target ? event.target.id : "";
            if (!id || !state.edgeById.has(id)) return;
            activateRelation(id, { fromEvent: event, keepInput: true });
        });

        state.graph.on(canvasClickEvent, function () {
            if (shouldIgnoreCanvasClear()) {
                return;
            }
            clearTransientUi({ clearInput: false });
        });
    }

    async function renderGraph() {
        if (!state.graph) return;
        await Promise.resolve(state.graph.render());
        await applyBaseVisibility();
        if (state.effectNodeId) {
            syncNodeEffectPosition();
        }
    }

    async function applyBaseVisibility() {
        if (!state.graph) return;
        if (state.baseHiddenNodeIds.length && typeof state.graph.hideElement === "function") {
            await state.graph.hideElement(state.baseHiddenNodeIds, false);
        }
        if (state.baseHiddenEdgeIds.length && typeof state.graph.hideElement === "function") {
            await state.graph.hideElement(state.baseHiddenEdgeIds, false);
        }
    }

    async function refreshSupplementVisibility() {
        if (!state.graph) return;
        const relationData = nodeRelationById.get(String(state.detailNodeId));
        const edgeIdsToShow = new Set();
        const nodeIdsToShow = new Set();

        if (relationData) {
            state.detailRelationTypes.forEach(function (relationType) {
                const edgeIds = relationData[relationType] || [];
                edgeIds.forEach(function (edgeId) {
                    const textEdgeId = String(edgeId);
                    edgeIdsToShow.add(textEdgeId);
                    const edge = state.edgeById.get(textEdgeId);
                    if (edge) {
                        nodeIdsToShow.add(edge.source);
                        nodeIdsToShow.add(edge.target);
                    }
                });
            });
        }

        const visibleExtraEdgeIds = state.baseHiddenEdgeIds.filter(function (id) { return edgeIdsToShow.has(id); });
        const hiddenExtraEdgeIds = state.baseHiddenEdgeIds.filter(function (id) { return !edgeIdsToShow.has(id); });
        const visibleExtraNodeIds = state.baseHiddenNodeIds.filter(function (id) { return nodeIdsToShow.has(id); });
        const hiddenExtraNodeIds = state.baseHiddenNodeIds.filter(function (id) { return !nodeIdsToShow.has(id); });

        if (typeof state.graph.hideElement === "function") {
            if (hiddenExtraNodeIds.length) await state.graph.hideElement(hiddenExtraNodeIds, false);
            if (hiddenExtraEdgeIds.length) await state.graph.hideElement(hiddenExtraEdgeIds, false);
        }
        if (typeof state.graph.showElement === "function") {
            if (visibleExtraNodeIds.length) await state.graph.showElement(visibleExtraNodeIds, false);
            if (visibleExtraEdgeIds.length) await state.graph.showElement(visibleExtraEdgeIds, false);
        }
    }

    function findNodeByName(query) {
        const normalized = safeText(query, "").trim().toLowerCase();
        if (!normalized) return null;
        const exact = state.nameEntries.find(function (entry) { return entry.lowered === normalized; });
        if (exact) return exact;
        return state.nameEntries.find(function (entry) { return entry.lowered.includes(normalized); }) || null;
    }

    function findPaths(startId, endId, limit) {
        const results = [];
        const maxPaths = limit || 12;

        function dfs(currentId, visited, path) {
            if (results.length >= maxPaths) return;
            if (currentId === endId) {
                results.push(path.slice());
                return;
            }
            const nextList = state.adjacency.get(currentId) || [];
            for (let i = 0; i < nextList.length; i += 1) {
                const nextId = nextList[i];
                if (visited.has(nextId)) continue;
                visited.add(nextId);
                path.push(nextId);
                dfs(nextId, visited, path);
                path.pop();
                visited.delete(nextId);
            }
        }

        const visited = new Set([startId]);
        dfs(startId, visited, [startId]);
        return results;
    }

    function collectEdgeIdsForPath(path) {
        const edgeIds = [];
        for (let index = 0; index < path.length - 1; index += 1) {
            const pairKey = path[index] + "->" + path[index + 1];
            const pairEdges = state.edgeIdsByPair.get(pairKey) || [];
            if (pairEdges.length) {
                edgeIds.push(pairEdges[0]);
            }
        }
        return edgeIds;
    }

    function buildStateMap(nodeIds, edgeIds, mode, dimOthers) {
        const targetNodes = new Set((nodeIds || []).map(String));
        const targetEdges = new Set((edgeIds || []).map(String));
        const stateMap = {};

        getRenderableNodes().forEach(function (node) {
            const states = [];
            if (targetNodes.has(node.id)) states.push(mode || "focus");
            else if (dimOthers) states.push("dim");
            stateMap[node.id] = states;
        });

        getRenderableEdges().forEach(function (edge) {
            const states = [];
            if (targetEdges.has(edge.id)) states.push(mode || "focus");
            else if (dimOthers) states.push("dim");
            stateMap[edge.id] = states;
        });

        return stateMap;
    }

    async function focusElements(targets, duration) {
        if (!state.graph || !targets) return;
        const list = Array.isArray(targets) ? targets.filter(Boolean).map(String) : [String(targets)];
        if (!list.length || typeof state.graph.focusElement !== "function") return;

        try {
            await state.graph.focusElement(list.length === 1 ? list[0] : list, { duration: duration || 450 });
        } catch (error) {
            await state.graph.focusElement(list[0], { duration: duration || 450 });
        }
    }

    function collectExpandedResourceRelatedConceptIds(parentId) {
        const edgeIds = state.resourceEdgeIdsByParent.get(String(parentId)) || [];
        const relatedNodeIds = [];

        edgeIds.forEach(function (edgeId) {
            const edge = state.resourceEdgeById.get(edgeId);
            if (!edge || !edge.data || edge.data.resourceKind !== "exercise-link") {
                return;
            }
            const targetId = safeText(edge.target, "").trim();
            if (!targetId || !state.nodeById.has(targetId)) {
                return;
            }
            relatedNodeIds.push(targetId);
        });

        return Array.from(new Set(relatedNodeIds));
    }

    function revealAncestorChains(nodeIds) {
        let changed = false;

        (nodeIds || []).map(String).forEach(function (nodeId) {
            let parentId = state.treeParentById.get(nodeId);
            while (parentId) {
                if (state.collapsedNodeIds.delete(parentId)) {
                    changed = true;
                }
                parentId = state.treeParentById.get(parentId);
            }
        });

        return changed;
    }

    function getVisibleResourceContextNodeIds(parentId) {
        const renderableNodeIds = new Set(getRenderableNodes().map(function (node) {
            return node.id;
        }));
        const result = [];

        if (renderableNodeIds.has(parentId)) {
            result.push(parentId);
        }

        (state.resourceNodeIdsByParent.get(String(parentId)) || []).forEach(function (resourceNodeId) {
            if (renderableNodeIds.has(resourceNodeId)) {
                result.push(resourceNodeId);
            }
        });

        (state.resourceEdgeIdsByParent.get(String(parentId)) || []).forEach(function (edgeId) {
            const edge = state.resourceEdgeById.get(edgeId);
            if (!edge || !edge.data || edge.data.resourceKind !== "exercise-link") {
                return;
            }
            if (renderableNodeIds.has(edge.target)) {
                result.push(edge.target);
            }
        });

        return Array.from(new Set(result));
    }

    async function keepReadableViewportZoom(minZoom) {
        if (!state.graph) return;
        const currentZoom = getGraphZoom();
        if (currentZoom >= minZoom - 0.02) {
            return;
        }

        if (typeof state.graph.zoomTo === "function") {
            try {
                await Promise.resolve(state.graph.zoomTo(minZoom, { duration: 260 }));
                return;
            } catch (error) {}
        }

        if (typeof state.graph.setZoom === "function") {
            try {
                state.graph.setZoom(minZoom);
            } catch (error) {}
        }
    }

    async function focusExpandedResourceContext(parentId) {
        const targetIds = getVisibleResourceContextNodeIds(parentId);
        if (!targetIds.length) {
            return;
        }

        await waitForNextFrame();
        await focusElements(targetIds, 360);
        await waitForNextFrame();
        await keepReadableViewportZoom(0.92);
    }

    async function revealInteractionElements(nodeIds, edgeIds) {
        if (!state.graph) return;
        const showNodeIds = (nodeIds || []).map(String).filter(function (id) {
            return state.baseHiddenNodeIds.includes(id);
        });
        const showEdgeIds = (edgeIds || []).map(String).filter(function (id) {
            return state.baseHiddenEdgeIds.includes(id);
        });

        if (showNodeIds.length && typeof state.graph.showElement === "function") {
            await state.graph.showElement(showNodeIds, false);
        }
        if (showEdgeIds.length && typeof state.graph.showElement === "function") {
            await state.graph.showElement(showEdgeIds, false);
        }
    }

    async function applySpotlight(nodeIds, edgeIds, mode, dimOthers) {
        if (!state.graph) return;
        if (typeof state.graph.setElementState !== "function") return;
        const stateMap = buildStateMap(nodeIds, edgeIds, mode, dimOthers);
        await state.graph.setElementState(stateMap, false);
        const frontIds = []
            .concat((nodeIds || []).map(String))
            .concat((edgeIds || []).map(String));
        if (frontIds.length && typeof state.graph.frontElement === "function") {
            state.graph.frontElement(frontIds);
        }
    }

    async function clearSpotlight() {
        if (!state.graph) return;
        if (typeof state.graph.setElementState !== "function") return;
        const stateMap = {};
        getRenderableNodes().forEach(function (node) {
            stateMap[node.id] = [];
        });
        getRenderableEdges().forEach(function (edge) {
            stateMap[edge.id] = [];
        });
        await state.graph.setElementState(stateMap, false);
    }

    function ensureRelationPopupRemoved() {
        const section = document.querySelector(".netLinkInfo-box");
        if (section && section.parentNode) {
            section.parentNode.removeChild(section);
        }
    }

    function resolvePopupAnchor(event, edge) {
        if (event) {
            if (event.client && typeof event.client.x === "number" && typeof event.client.y === "number") {
                return { x: event.client.x, y: event.client.y };
            }
            if (event.canvas && typeof event.canvas.x === "number" && typeof event.canvas.y === "number") {
                const rect = graphContainer.getBoundingClientRect();
                return { x: rect.left + event.canvas.x, y: rect.top + event.canvas.y };
            }
        }

        if (edge) {
            const sourceCenter = getElementViewportCenter(edge.source);
            const targetCenter = getElementViewportCenter(edge.target);

            if (sourceCenter && targetCenter) {
                return {
                    x: (sourceCenter.x + targetCenter.x) / 2,
                    y: (sourceCenter.y + targetCenter.y) / 2,
                };
            }

            if (edge.id) {
                const edgeCenter = getElementViewportCenter(edge.id);
                if (edgeCenter) {
                    return {
                        x: edgeCenter.x,
                        y: edgeCenter.y,
                    };
                }
            }
        }

        return {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        };
    }

    function buildRelationPopup(edge, anchor) {
        ensureRelationPopupRemoved();

        const sourceNode = state.nodeById.get(edge.source);
        const targetNode = state.nodeById.get(edge.target);
        const sourceName = sourceNode ? sourceNode.data.name : edge.source;
        const targetName = targetNode ? targetNode.data.name : edge.target;

        const section = document.createElement("section");
        section.setAttribute("class", "netLinkInfo-box panel-relation");

        const left = Math.max(20, Math.min(window.innerWidth - 340, anchor.x - 160));
        const top = Math.max(90, Math.min(window.innerHeight - 220, anchor.y + 18));
        section.setAttribute("style", "left: " + left + "px; top: " + top + "px;");

        const wrap = document.createElement("div");
        wrap.setAttribute("class", "atobNetLinkInfo-li");

        const titleDiv = document.createElement("div");
        titleDiv.setAttribute("class", "atobNetLinkInfo-title");

        const fromSpan = document.createElement("span");
        fromSpan.setAttribute("title", sourceName);
        fromSpan.textContent = sourceName;
        titleDiv.appendChild(fromSpan);

        const relationDesc = document.createElement("span");
        relationDesc.setAttribute("class", "relationDesc");

        const arrow = document.createElement("span");
        arrow.setAttribute("class", "right-icon");

        const desc = document.createElement("span");
        desc.setAttribute("class", "desc-text");
        desc.textContent = edge.data.description;

        relationDesc.appendChild(arrow);
        relationDesc.appendChild(desc);
        titleDiv.appendChild(relationDesc);

        const toSpan = document.createElement("span");
        toSpan.setAttribute("title", targetName);
        toSpan.textContent = targetName;
        titleDiv.appendChild(toSpan);

        const contentDiv = document.createElement("div");
        contentDiv.setAttribute("class", "atobNetLinkInfo-content");

        const descriptionDiv = document.createElement("div");
        descriptionDiv.setAttribute("class", "atobNetLinkInfo-description");
        descriptionDiv.textContent = edge.data.details || "暂无关系说明";
        contentDiv.appendChild(descriptionDiv);

        wrap.appendChild(titleDiv);
        wrap.appendChild(contentDiv);
        section.appendChild(wrap);
        document.body.appendChild(section);
    }

    function renderRelationList() {
        if (!relationListUl) return;
        relationListUl.innerHTML = "<li class=\"line\"></li>";

        const visibleEdges = getVisibleRelationEdges();
        if (!visibleEdges.length) {
            const emptyItem = document.createElement("li");
            emptyItem.className = "empty-note";
            emptyItem.textContent = "暂无可展示的关系";
            relationListUl.appendChild(emptyItem);
            return;
        }

        visibleEdges.forEach(function (edge) {
            const sourceNode = state.nodeById.get(edge.source);
            const targetNode = state.nodeById.get(edge.target);

            const li = document.createElement("li");
            li.setAttribute("id", "relation-page-" + edge.id);
            li.setAttribute("data-edge-id", edge.id);
            li.className = "item";
            li.addEventListener("click", function (event) {
                event.stopPropagation();
                if (state.activeRelationId === edge.id) {
                    clearTransientUi({ clearInput: false });
                } else {
                    activateRelation(edge.id, { keepInput: true });
                }
            });

            const relationName = document.createElement("div");
            relationName.className = "relation-name";
            relationName.textContent = edge.data.description;

            const circle = document.createElement("div");
            circle.className = "circle";

            const detail = document.createElement("div");
            detail.className = "detail";

            const relationA = document.createElement("div");
            relationA.className = "relation-a";
            relationA.textContent = sourceNode ? sourceNode.data.name : edge.source;

            const relationArrow = document.createElement("div");
            relationArrow.className = "relation-arrow";

            const relationB = document.createElement("div");
            relationB.className = "relation-b";
            relationB.textContent = targetNode ? targetNode.data.name : edge.target;

            const relationTime = document.createElement("div");
            relationTime.className = "relation-time";

            const relationDesc = document.createElement("div");
            relationDesc.className = "desc";
            relationDesc.textContent = edge.data.details;

            const clear = document.createElement("div");
            clear.className = "c";

            detail.appendChild(relationA);
            detail.appendChild(relationArrow);
            detail.appendChild(relationB);
            detail.appendChild(relationTime);
            detail.appendChild(relationDesc);
            detail.appendChild(clear);

            li.appendChild(relationName);
            li.appendChild(circle);
            li.appendChild(detail);
            relationListUl.appendChild(li);
        });
    }

    function setRelationListActive(edgeId) {
        const items = relationListUl ? relationListUl.querySelectorAll(".item") : [];
        items.forEach(function (item) {
            item.classList.toggle("active", item.getAttribute("data-edge-id") === safeText(edgeId, ""));
        });

        const activeItem = edgeId && relationListUl
            ? relationListUl.querySelector("[data-edge-id=\"" + edgeId + "\"]")
            : null;
        if (activeItem) {
            activeItem.scrollIntoView({ block: "nearest" });
        }
    }

    async function activateRelation(edgeId, options) {
        const settings = options || {};
        const edge = state.edgeById.get(String(edgeId));
        if (!edge) return;
        const visibleEdges = getVisibleRelationEdges();
        const visibleIndex = visibleEdges.findIndex(function (item) { return item.id === edge.id; });

        if (!settings.fromAutoplay) {
            stopAutoplay();
        }

        state.activeRelationId = edge.id;
        state.activeNodeId = null;
        if (!settings.fromAutoplay && visibleIndex >= 0) {
            state.autoplayIndex = (visibleIndex + 1) % Math.max(visibleEdges.length, 1);
        }
        setRelationListActive(edge.id);
        hideNodeEffect();

        await revealInteractionElements([edge.source, edge.target], [edge.id]);
        await applySpotlight([edge.source, edge.target], [edge.id], "focus", false);
        await focusElements([edge.source, edge.target], 450);
        await waitForNextFrame();

        const anchor = resolvePopupAnchor(settings.fromEvent, edge);
        buildRelationPopup(edge, anchor);

        if (nodeContainer && nodeContainer.classList.contains("active")) {
            closeNodeDetail(true);
        }
    }

    async function handleNodeSelect(nodeId, focusViewport) {
        stopAutoplay();
        const textNodeId = String(nodeId);
        const sameNodeActive = state.activeNodeId === textNodeId;
        let toggledChildren = false;

        state.activeNodeId = textNodeId;
        state.activeRelationId = null;
        setRelationListActive(-1);
        showNodeEffect(textNodeId);

        await ensureNodesExpanded([textNodeId]);
        if (nodeHasTreeChildren(textNodeId) && (isNodeCollapsed(textNodeId) || sameNodeActive)) {
            toggledChildren = await toggleNodeChildren(textNodeId);
        }

        await revealInteractionElements([textNodeId], []);
        await applySpotlight([textNodeId], [], "focus", false);
        if (focusViewport && !toggledChildren) {
            await focusElements(textNodeId, 450);
        }
        syncNodeEffectPosition();
        openNodeDetail(textNodeId, true);
    }

    function escapeHtml(value) {
        return safeText(value, "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function normalizeMediaUrl(value, fallback) {
        const text = safeText(value, "").trim();
        if (!text) return fallback || "";
        if (/^(https?:)?\/\//.test(text) || text.startsWith("/") || text.startsWith("data:")) return text;
        if (text.startsWith("images/")) return "/" + text;
        return text;
    }

    function isDirectVideoSource(url) {
        const text = safeText(url, "").trim().toLowerCase();
        if (!text) return false;
        if (text.startsWith("blob:") || text.startsWith("data:video/")) return true;
        return /\.(mp4|webm|ogg|mov|m4v|m3u8)(?:[?#].*)?$/.test(text);
    }

    function getEmbeddableVideoUrl(url) {
        const text = safeText(url, "").trim();
        if (!text) return "";

        if (/youtube\.com\/embed\//i.test(text) || /player\.bilibili\.com/i.test(text)) {
            return text;
        }

        const youtubeMatch = text.match(/[?&]v=([^&#]+)/i);
        if (/youtube\.com\/watch/i.test(text) && youtubeMatch && youtubeMatch[1]) {
            return "https://www.youtube.com/embed/" + youtubeMatch[1];
        }

        const shortYoutubeMatch = text.match(/youtu\.be\/([^?&#/]+)/i);
        if (shortYoutubeMatch && shortYoutubeMatch[1]) {
            return "https://www.youtube.com/embed/" + shortYoutubeMatch[1];
        }

        const bilibiliBvMatch = text.match(/bilibili\.com\/video\/(BV[0-9A-Za-z]+)/i);
        if (bilibiliBvMatch && bilibiliBvMatch[1]) {
            return "https://player.bilibili.com/player.html?bvid=" + bilibiliBvMatch[1];
        }

        const bilibiliAvMatch = text.match(/bilibili\.com\/video\/av(\d+)/i);
        if (bilibiliAvMatch && bilibiliAvMatch[1]) {
            return "https://player.bilibili.com/player.html?aid=" + bilibiliAvMatch[1];
        }

        return text;
    }

    function ensureArray(value) {
        if (Array.isArray(value)) return value;
        if (value === undefined || value === null || value === "") return [];
        return [value];
    }

    function truncateText(value, maxLength) {
        const text = safeText(value, "").trim();
        if (!text || text.length <= maxLength) return text;
        return text.slice(0, Math.max(0, maxLength - 1)) + "…";
    }

    function normalizeTextResourceType(value) {
        const normalized = safeText(value, "").trim().toLowerCase();
        const mapping = {
            definition: "definition",
            "定义": "definition",
            theorem: "theorem",
            "定理": "theorem",
            law: "law",
            "定律": "law",
            exercise: "exercise",
            "习题": "exercise",
            example: "example",
            "例题": "example",
            note: "note",
            "笔记": "note",
        };
        return mapping[normalized] || normalized || "other";
    }

    function normalizeRelatedConceptNodes(value) {
        return ensureArray(value).map(function (item) {
            if (item && typeof item === "object" && !Array.isArray(item)) {
                return {
                    id: safeText(item.id || item.node_id || item.related_node_id || item.knowledge_node_id, ""),
                    name: safeText(item.name || item.node_name, ""),
                    relationType: safeText(item.relation_type || item.relationType || item.type, ""),
                    relationLabel: safeText(item.relation_label || item.relationLabel || item.label, ""),
                    sortOrder: Number(item.sort_order || item.sortOrder) || 0,
                };
            }
            return {
                id: safeText(item, ""),
                name: "",
                relationType: "",
                relationLabel: "",
                sortOrder: 0,
            };
        }).filter(function (item) {
            return !!item.id;
        }).sort(function (left, right) {
            if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
            return left.id.localeCompare(right.id, "zh-Hans-CN");
        });
    }

    function normalizeTextResource(item, index, rawNodeId) {
        const resourceType = normalizeTextResourceType(
            item && (item.resource_type || item.type || item.category)
        );
        return {
            id: safeText(item && item.id, "text-" + (index + 1)),
            nodeId: safeText(item && (item.node_id || item.nodeId), rawNodeId),
            resourceType: resourceType,
            resourceLabel: textResourceTypeLabels[resourceType] || "其他",
            title: safeText(item && item.title, "未命名文本资源"),
            summary: safeText(item && item.summary, ""),
            content: safeText(item && item.content, ""),
            question: safeText(item && (item.question || item.prompt), ""),
            answer: safeText(item && (item.answer || item.reference_answer || item.correct_answer), ""),
            analysis: safeText(item && (item.analysis || item.explanation), ""),
            rubric: safeText(item && item.rubric, ""),
            inputType: safeText(item && (item.input_type || item.answer_type), "text"),
            options: ensureArray(item && item.options),
            estimatedTime: safeText(item && (item.estimated_time || item.estimatedTime), ""),
            source: safeText(item && item.source, ""),
            difficulty: safeText(item && item.difficulty, ""),
            tags: ensureArray(item && item.tags).map(function (tag) {
                return safeText(tag, "").trim();
            }).filter(Boolean),
            relatedNodes: normalizeRelatedConceptNodes(
                item && (
                    item.related_nodes
                    || item.relatedNodes
                    || item.knowledge_nodes
                    || item.knowledgeNodes
                    || item.linked_nodes
                    || item.linkedNodes
                    || item.related_node_ids
                    || item.relatedNodeIds
                    || item.knowledge_node_ids
                    || item.knowledgeNodeIds
                )
            ),
            sortOrder: Number(item && item.sort_order) || 0,
        };
    }

    function normalizeVideoResource(item, index, rawNodeId) {
        return {
            id: safeText(item && item.id, "video-" + (index + 1)),
            nodeId: safeText(item && (item.node_id || item.nodeId), rawNodeId),
            title: safeText(item && item.title, "未命名视频资源"),
            summary: safeText(item && item.summary, ""),
            coverUrl: normalizeMediaUrl(item && (item.cover_url || item.cover || item.image), ""),
            videoUrl: normalizeMediaUrl(item && (item.video_url || item.url), ""),
            duration: safeText(item && item.duration, ""),
            speaker: safeText(item && (item.speaker || item.teacher), ""),
            source: safeText(item && item.source, ""),
            tags: ensureArray(item && item.tags).map(function (tag) {
                return safeText(tag, "").trim();
            }).filter(Boolean),
            sortOrder: Number(item && item.sort_order) || 0,
        };
    }

    function buildResourceNodeId(parentNodeId, resourceKind, resourceId) {
        return [
            "resource",
            safeText(parentNodeId, "").trim(),
            safeText(resourceKind, "").trim(),
            encodeURIComponent(safeText(resourceId, "").trim() || "item"),
        ].join("::");
    }

    function buildResourceEdgeId(parentNodeId, resourceNodeId) {
        return [
            "resource-edge",
            safeText(parentNodeId, "").trim(),
            encodeURIComponent(safeText(resourceNodeId, "").trim()),
        ].join("::");
    }

    function buildResourceAssociationEdgeId(resourceNodeId, conceptNodeId) {
        return [
            "resource-link-edge",
            encodeURIComponent(safeText(resourceNodeId, "").trim()),
            safeText(conceptNodeId, "").trim(),
        ].join("::");
    }

    function isResourceNodeId(nodeId) {
        return safeText(nodeId, "").indexOf("resource::") === 0;
    }

    function isResourceEdgeId(edgeId) {
        const text = safeText(edgeId, "");
        return text.indexOf("resource-edge::") === 0 || text.indexOf("resource-link-edge::") === 0;
    }

    function getVisibleConceptNodeIds() {
        return state.nodes
            .map(function (node) { return node.id; })
            .filter(function (nodeId) {
                return !state.hiddenNodeIds.includes(nodeId);
            });
    }

    function getVisibleResourceNodes() {
        const visibleConceptIds = new Set(getVisibleConceptNodeIds());
        const result = [];

        state.expandedResourceParentIds.forEach(function (parentId) {
            if (!visibleConceptIds.has(parentId)) return;
            const resourceNodeIds = state.resourceNodeIdsByParent.get(parentId) || [];
            resourceNodeIds.forEach(function (resourceNodeId) {
                const resourceNode = state.resourceNodeById.get(resourceNodeId);
                if (resourceNode) {
                    result.push(resourceNode);
                }
            });
        });

        return result;
    }

    function getVisibleResourceEdges() {
        const visibleConceptIds = new Set(getVisibleConceptNodeIds());
        const visibleResourceNodeIds = new Set(getVisibleResourceNodes().map(function (node) {
            return node.id;
        }));
        const result = [];

        state.expandedResourceParentIds.forEach(function (parentId) {
            if (!visibleConceptIds.has(parentId)) return;
            const resourceEdgeIds = state.resourceEdgeIdsByParent.get(parentId) || [];
            resourceEdgeIds.forEach(function (resourceEdgeId) {
                const resourceEdge = state.resourceEdgeById.get(resourceEdgeId);
                if (!resourceEdge) return;
                const sourceIsConcept = visibleConceptIds.has(resourceEdge.source);
                const targetIsConcept = visibleConceptIds.has(resourceEdge.target);
                const sourceIsResource = visibleResourceNodeIds.has(resourceEdge.source);
                const targetIsResource = visibleResourceNodeIds.has(resourceEdge.target);
                if (!((sourceIsConcept && targetIsResource) || (sourceIsResource && targetIsConcept))) return;
                result.push(resourceEdge);
            });
        });

        return result;
    }

    function buildResourceNodesForDetail(nodeDatum, detailData) {
        const parentNodeId = safeText(nodeDatum && nodeDatum.id, "");
        const parentRawId = safeText(nodeDatum && nodeDatum.data && nodeDatum.data.rawId, parentNodeId);
        const textResources = detailData && Array.isArray(detailData.textResources) ? detailData.textResources : [];
        const videoResources = detailData && Array.isArray(detailData.videoResources) ? detailData.videoResources : [];
        const resourceNodes = [];
        const resourceEdges = [];
        const textVisual = resourceNodeVisualConfig.text;
        const videoVisual = resourceNodeVisualConfig.video;

        textResources.forEach(function (item, index) {
            const resourceNodeId = buildResourceNodeId(parentNodeId, "text", item.id || ("text-" + index));
            const resourceLabel = item.resourceLabel || textResourceTypeLabels[item.resourceType] || "resource";
            const practiceRoute = item.resourceType === "exercise"
                ? "/practice/" + encodeURIComponent(parentRawId) + "/" + encodeURIComponent(item.id)
                : "";
            const summaryText = item.summary || item.question || item.content || item.title || "";
            const relatedConceptNodes = ensureArray(item.relatedNodes);
            const textIcon = normalizeMediaUrl(item.icon || item.image, textVisual.image);

            resourceNodes.push({
                id: resourceNodeId,
                data: {
                    rawId: resourceNodeId,
                    parentId: parentNodeId,
                    parentRawId: parentRawId,
                    entityType: "resource-text",
                    resourceId: safeText(item.id, ""),
                    resourceType: safeText(item.resourceType, "text"),
                    resourceLabel: resourceLabel,
                    name: truncateText(resourceLabel + " | " + safeText(item.title, "text"), 18),
                    fullName: resourceLabel + " | " + safeText(item.title, "text"),
                    details: safeText(summaryText, ""),
                    image: textIcon,
                    isShown: 1,
                    fill: textVisual.fill,
                    stroke: textVisual.stroke,
                    size: textVisual.size,
                    iconWidth: textIcon ? textVisual.iconWidth : 0,
                    iconHeight: textIcon ? textVisual.iconHeight : 0,
                    practiceRoute: practiceRoute,
                },
            });

            resourceEdges.push({
                id: buildResourceEdgeId(parentNodeId, resourceNodeId),
                source: parentNodeId,
                target: resourceNodeId,
                data: {
                    description: resourceLabel,
                    details: safeText(item.summary || item.title, ""),
                    isShown: 1,
                    sourceId: parentNodeId,
                    targetId: resourceNodeId,
                    edgeType: "resource",
                    resourceKind: "text",
                    stroke: "#F4B15D",
                    lineDash: [6, 4],
                    lineWidth: 1.5,
                },
            });

            if (safeText(item.resourceType, "") === "exercise" && relatedConceptNodes.length) {
                relatedConceptNodes.forEach(function (relatedNode) {
                    const relatedNodeId = safeText(relatedNode && relatedNode.id, "").trim();
                    if (!relatedNodeId || relatedNodeId === parentNodeId || !state.nodeById.has(relatedNodeId)) {
                        return;
                    }

                    resourceEdges.push({
                        id: buildResourceAssociationEdgeId(resourceNodeId, relatedNodeId),
                        source: resourceNodeId,
                        target: relatedNodeId,
                        data: {
                            description: "",
                            details: safeText(relatedNode && (relatedNode.relationLabel || relatedNode.name), ""),
                            isShown: 1,
                            sourceId: resourceNodeId,
                            targetId: relatedNodeId,
                            edgeType: "resource",
                            resourceKind: "exercise-link",
                            stroke: "#FF8C69",
                            lineDash: [3, 5],
                            lineWidth: 1.4,
                        },
                    });
                });
            }
        });

        videoResources.forEach(function (item, index) {
            const resourceNodeId = buildResourceNodeId(parentNodeId, "video", item.id || ("video-" + index));
            const videoIcon = normalizeMediaUrl(item.coverUrl, videoVisual.image);
            resourceNodes.push({
                id: resourceNodeId,
                data: {
                    rawId: resourceNodeId,
                    parentId: parentNodeId,
                    parentRawId: parentRawId,
                    entityType: "resource-video",
                    resourceId: safeText(item.id, ""),
                    resourceType: "video",
                    resourceLabel: "\u89c6\u9891",
                    name: truncateText("\u89c6\u9891 | " + safeText(item.title, "video"), 18),
                    fullName: "\u89c6\u9891 | " + safeText(item.title, "video"),
                    details: safeText(item.summary || item.title, ""),
                    image: videoIcon,
                    isShown: 1,
                    fill: videoVisual.fill,
                    stroke: videoVisual.stroke,
                    size: videoVisual.size,
                    iconWidth: videoIcon ? videoVisual.iconWidth : 0,
                    iconHeight: videoIcon ? videoVisual.iconHeight : 0,
                    videoId: safeText(item.id, ""),
                    videoUrl: safeText(item.videoUrl, ""),
                },
            });

            resourceEdges.push({
                id: buildResourceEdgeId(parentNodeId, resourceNodeId),
                source: parentNodeId,
                target: resourceNodeId,
                data: {
                    description: "\u89c6\u9891",
                    details: safeText(item.summary || item.title, ""),
                    isShown: 1,
                    sourceId: parentNodeId,
                    targetId: resourceNodeId,
                    edgeType: "resource",
                    resourceKind: "video",
                    stroke: "#AC8DFF",
                    lineDash: [4, 4],
                    lineWidth: 1.6,
                },
            });
        });

        return {
            nodes: resourceNodes,
            edges: resourceEdges,
        };
    }

    async function ensureResourceDataForNode(nodeId) {
        const parentId = safeText(nodeId, "").trim();
        if (!parentId || state.resourceNodeIdsByParent.has(parentId)) {
            return;
        }

        const nodeDatum = state.nodeById.get(parentId);
        if (!nodeDatum) return;

        const detailData = await ensureNodeDetailDataByRawId(nodeDatum.data.rawId);
        const resourceGraph = buildResourceNodesForDetail(nodeDatum, detailData || {});

        state.resourceNodeIdsByParent.set(parentId, resourceGraph.nodes.map(function (node) { return node.id; }));
        state.resourceEdgeIdsByParent.set(parentId, resourceGraph.edges.map(function (edge) { return edge.id; }));

        resourceGraph.nodes.forEach(function (node) {
            state.resourceNodes.push(node);
            state.resourceNodeById.set(node.id, node);
        });

        resourceGraph.edges.forEach(function (edge) {
            state.resourceEdges.push(edge);
            state.resourceEdgeById.set(edge.id, edge);
        });
    }

    function clampNumber(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function toRadians(degree) {
        return degree * Math.PI / 180;
    }

    function getVisibleConceptNodes() {
        return getVisibleConceptNodeIds()
            .map(function (nodeId) { return state.nodeById.get(nodeId); })
            .filter(Boolean);
    }

    function createLayoutObstacle(x, y, radius, kind, id) {
        return {
            x: Number(x || 0),
            y: Number(y || 0),
            r: Number(radius || 0),
            kind: kind || "resource",
            id: safeText(id, ""),
        };
    }

    function buildConceptObstacles(visibleConceptNodes) {
        return visibleConceptNodes.map(function (node) {
            const size = Number(node && node.data && node.data.size) || 44;
            const extra = node.id === state.treeRootId ? 30 : 24;
            return createLayoutObstacle(node.x, node.y, size / 2 + extra, "concept", node.id);
        });
    }

    function buildVisibleConceptEdgeSegments(visibleConceptIdSet) {
        return state.edges
            .filter(function (edge) {
                return !state.hiddenEdgeIds.includes(edge.id)
                    && visibleConceptIdSet.has(edge.source)
                    && visibleConceptIdSet.has(edge.target);
            })
            .map(function (edge) {
                const sourceNode = state.nodeById.get(edge.source);
                const targetNode = state.nodeById.get(edge.target);
                if (!sourceNode || !targetNode) return null;
                return {
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    x1: Number(sourceNode.x || 0),
                    y1: Number(sourceNode.y || 0),
                    x2: Number(targetNode.x || 0),
                    y2: Number(targetNode.y || 0),
                };
            })
            .filter(Boolean);
    }

    function getPointToSegmentDistance(pointX, pointY, segment) {
        const x1 = Number(segment && segment.x1) || 0;
        const y1 = Number(segment && segment.y1) || 0;
        const x2 = Number(segment && segment.x2) || 0;
        const y2 = Number(segment && segment.y2) || 0;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;

        if (!lengthSquared) {
            const diffX = pointX - x1;
            const diffY = pointY - y1;
            return Math.sqrt(diffX * diffX + diffY * diffY);
        }

        const t = clampNumber(((pointX - x1) * dx + (pointY - y1) * dy) / lengthSquared, 0, 1);
        const projectionX = x1 + t * dx;
        const projectionY = y1 + t * dy;
        const diffX = pointX - projectionX;
        const diffY = pointY - projectionY;
        return Math.sqrt(diffX * diffX + diffY * diffY);
    }

    function findBlockingConceptOnResourceSegment(parentNode, targetX, targetY, conceptObstacles) {
        const segment = {
            x1: Number(parentNode && parentNode.x) || 0,
            y1: Number(parentNode && parentNode.y) || 0,
            x2: Number(targetX || 0),
            y2: Number(targetY || 0),
        };
        let blocking = null;

        conceptObstacles.forEach(function (obstacle) {
            if (!obstacle || obstacle.id === safeText(parentNode && parentNode.id, "")) {
                return;
            }
            const distance = getPointToSegmentDistance(obstacle.x, obstacle.y, segment);
            const safeDistance = Number(obstacle.r || 0) + 12;
            if (distance >= safeDistance) return;

            const overlap = safeDistance - distance;
            if (!blocking || overlap > blocking.overlap) {
                blocking = {
                    obstacle: obstacle,
                    overlap: overlap,
                };
            }
        });

        return blocking;
    }

    function getVisibleChildCount(nodeId, visibleConceptIdSet) {
        return getTreeChildren(nodeId, visibleConceptIdSet, state.treeChildrenById).length;
    }

    function getResourceDirectionCandidates(parentNode, viewport, visibleConceptIdSet) {
        const viewportWidth = Math.max(Number(viewport && viewport.width) || 0, 960);
        const parentParentId = state.treeParentById.get(parentNode.id);
        const ancestorNode = parentParentId ? state.nodeById.get(parentParentId) : null;
        const horizontalDelta = ancestorNode ? Number(parentNode.x || 0) - Number(ancestorNode.x || 0) : 0;
        const roomLeft = Number(parentNode.x || 0);
        const roomRight = viewportWidth - Number(parentNode.x || 0);
        let preferred = "";

        if (Math.abs(horizontalDelta) > 26) {
            preferred = horizontalDelta >= 0 ? "right" : "left";
        } else {
            preferred = roomRight >= roomLeft ? "right" : "left";
        }

        if (preferred === "right" && roomRight < 220 && roomLeft > roomRight + 90) {
            preferred = "left";
        } else if (preferred === "left" && roomLeft < 220 && roomRight > roomLeft + 90) {
            preferred = "right";
        }

        const hasVisibleChildren = getVisibleChildCount(parentNode.id, visibleConceptIdSet) > 0;
        const verticalFallback = "bottom";
        const opposite = preferred === "right" ? "left" : "right";
        return hasVisibleChildren
            ? [preferred, opposite, verticalFallback]
            : [preferred, verticalFallback, opposite];
    }

    function getResourceDirectionConfig(direction) {
        if (direction === "left") {
            return {
                textAngle: 170,
                videoAngle: 194,
                textRadius: 108,
                videoRadius: 146,
                ringGap: 58,
                arcSpread: 40,
                minX: 52,
                maxX: -52,
                minY: 52,
                maxY: -52,
                axis: "horizontal",
                flowX: -1,
                bandMinOffsetY: -26,
                bandMaxOffsetY: 138,
            };
        }
        if (direction === "top") {
            return {
                textAngle: -124,
                videoAngle: -58,
                textRadius: 100,
                videoRadius: 138,
                ringGap: 56,
                arcSpread: 52,
                minX: 42,
                maxX: -42,
                minY: 50,
                maxY: -58,
            };
        }
        if (direction === "bottom") {
            return {
                textAngle: 126,
                videoAngle: 54,
                textRadius: 108,
                videoRadius: 144,
                ringGap: 56,
                arcSpread: 52,
                minX: 42,
                maxX: -42,
                minY: 58,
                maxY: -50,
                axis: "vertical",
                flowY: 1,
            };
        }
        return {
            textAngle: -14,
            videoAngle: 20,
            textRadius: 108,
            videoRadius: 146,
            ringGap: 58,
            arcSpread: 40,
            minX: 52,
            maxX: -52,
            minY: 52,
            maxY: -52,
            axis: "horizontal",
            flowX: 1,
            bandMinOffsetY: -26,
            bandMaxOffsetY: 138,
        };
    }

    function buildDirectionalGroupSeedPositions(parentNode, groupNodes, centerAngle, baseRadius, ringGap, arcSpread) {
        const result = [];
        let cursor = 0;
        let ringIndex = 0;

        while (cursor < groupNodes.length) {
            const ringCapacity = Math.max(2, 3 + ringIndex);
            const count = Math.min(ringCapacity, groupNodes.length - cursor);
            const currentRadius = baseRadius + ringIndex * ringGap;
            const currentSpread = arcSpread + ringIndex * 10;

            for (let index = 0; index < count; index += 1) {
                const ratio = count === 1 ? 0.5 : index / (count - 1);
                const angle = centerAngle + (ratio - 0.5) * currentSpread;
                const radian = toRadians(angle);
                result.push({
                    id: groupNodes[cursor + index].id,
                    x: Number(parentNode.x || 0) + Math.cos(radian) * currentRadius,
                    y: Number(parentNode.y || 0) + Math.sin(radian) * currentRadius,
                    angle: angle,
                    radius: currentRadius,
                    nodeRadius: (Number(groupNodes[cursor + index].data && groupNodes[cursor + index].data.size) || 34) / 2 + 18,
                });
            }

            cursor += count;
            ringIndex += 1;
        }

        return result;
    }

    function pushSeedAwayFromObstacles(seed, parentNode, viewport, occupiedObstacles, conceptObstacles, conceptEdgeSegments, directionConfig, swingSign) {
        let x = Number(seed.x || 0);
        let y = Number(seed.y || 0);
        const parentX = Number(parentNode.x || 0);
        const parentY = Number(parentNode.y || 0);
        let deltaX = x - parentX;
        let deltaY = y - parentY;
        let length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (!length) {
            deltaX = 1;
            deltaY = 0;
            length = 1;
        }

        const axis = directionConfig.axis || "horizontal";
        let unitX = axis === "horizontal" ? Number(directionConfig.flowX || (deltaX >= 0 ? 1 : -1)) : deltaX / length;
        let unitY = axis === "vertical" ? Number(directionConfig.flowY || (deltaY >= 0 ? 1 : -1)) : deltaY / length;
        const sideX = axis === "horizontal" ? 0 : -unitY;
        const sideY = axis === "horizontal" ? 1 : unitX;
        const viewportMinX = 44 + (directionConfig.minX || 0);
        const viewportMaxX = Math.max(viewportMinX + 1, Number(viewport.width || 0) - 44 + (directionConfig.maxX || 0));
        const viewportMinY = 44 + (directionConfig.minY || 0);
        const viewportMaxY = Math.max(viewportMinY + 1, Number(viewport.height || 0) - 44 + (directionConfig.maxY || 0));
        const minX = axis === "horizontal" && unitX > 0
            ? Math.max(viewportMinX, parentX + 44)
            : viewportMinX;
        const maxX = axis === "horizontal" && unitX < 0
            ? Math.min(viewportMaxX, parentX - 44)
            : viewportMaxX;
        const bandMinY = Number.isFinite(directionConfig.bandMinOffsetY)
            ? parentY + Number(directionConfig.bandMinOffsetY)
            : viewportMinY;
        const bandMaxY = Number.isFinite(directionConfig.bandMaxOffsetY)
            ? parentY + Number(directionConfig.bandMaxOffsetY)
            : viewportMaxY;
        const minY = axis === "horizontal" ? Math.max(viewportMinY, bandMinY) : viewportMinY;
        const maxY = axis === "horizontal" ? Math.min(viewportMaxY, bandMaxY) : viewportMaxY;

        for (let attempt = 0; attempt < 12; attempt += 1) {
            let overlapResolved = true;

            for (let obstacleIndex = 0; obstacleIndex < occupiedObstacles.length; obstacleIndex += 1) {
                const obstacle = occupiedObstacles[obstacleIndex];
                if (!obstacle || obstacle.id === seed.id || obstacle.id === parentNode.id) continue;

                const diffX = x - obstacle.x;
                const diffY = y - obstacle.y;
                const distance = Math.sqrt(diffX * diffX + diffY * diffY) || 1;
                const padding = obstacle.kind === "concept" ? 22 : 16;
                const requiredDistance = Number(seed.nodeRadius || 0) + Number(obstacle.r || 0) + padding;

                if (distance < requiredDistance) {
                    const step = requiredDistance - distance + 8;
                    if (axis === "horizontal") {
                        x += unitX * step;
                        if (attempt % 2 === 1) {
                            y += sideY * swingSign * 8;
                        }
                    } else {
                        x += unitX * step;
                        y += unitY * step;
                        if (attempt % 2 === 1) {
                            x += sideX * swingSign * 10;
                            y += sideY * swingSign * 10;
                        }
                    }
                    overlapResolved = false;
                    break;
                }
            }

            if (overlapResolved && Array.isArray(conceptEdgeSegments) && conceptEdgeSegments.length) {
                for (let edgeIndex = 0; edgeIndex < conceptEdgeSegments.length; edgeIndex += 1) {
                    const segment = conceptEdgeSegments[edgeIndex];
                    if (!segment || segment.source === seed.id || segment.target === seed.id) continue;
                    const distanceToEdge = getPointToSegmentDistance(x, y, segment);
                    const edgePadding = Number(seed.nodeRadius || 0) + 18;

                    if (distanceToEdge < edgePadding) {
                        const step = edgePadding - distanceToEdge + 10;
                        if (axis === "horizontal") {
                            x += unitX * step;
                            y += Math.max(4, step * 0.24);
                        } else {
                            y += unitY * step;
                            x += sideX * swingSign * 8;
                        }
                        overlapResolved = false;
                        break;
                    }
                }
            }

            if (overlapResolved && Array.isArray(conceptObstacles) && conceptObstacles.length) {
                const blockingConcept = findBlockingConceptOnResourceSegment(parentNode, x, y, conceptObstacles);
                if (blockingConcept) {
                    const step = blockingConcept.overlap + 14;
                    if (axis === "horizontal") {
                        x += unitX * step;
                        y += Math.max(6, step * 0.22);
                    } else {
                        y += unitY * step;
                        x += sideX * swingSign * 10;
                    }
                    overlapResolved = false;
                }
            }

            x = clampNumber(x, minX, maxX);
            y = clampNumber(y, minY, maxY);

            deltaX = x - parentX;
            deltaY = y - parentY;
            length = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;
            if (axis !== "horizontal") {
                unitX = deltaX / length;
                unitY = deltaY / length;
            }

            if (overlapResolved) {
                break;
            }
        }

        return {
            id: seed.id,
            x: x,
            y: y,
            r: Number(seed.nodeRadius || 0),
            kind: "resource",
        };
    }

    function scoreResourceLayout(parentNode, placedPositions, conceptObstacles, occupiedResourceObstacles, conceptEdgeSegments, viewport) {
        let score = 0;
        const viewportWidth = Number(viewport && viewport.width) || 0;
        const viewportHeight = Number(viewport && viewport.height) || 0;
        const allObstacles = conceptObstacles.concat(occupiedResourceObstacles);

        placedPositions.forEach(function (position) {
            const dx = position.x - Number(parentNode.x || 0);
            const dy = position.y - Number(parentNode.y || 0);
            const distanceFromParent = Math.sqrt(dx * dx + dy * dy);
            const blockingConcept = findBlockingConceptOnResourceSegment(parentNode, position.x, position.y, conceptObstacles);

            if (position.x < 48 || position.x > viewportWidth - 48) score += 8000;
            if (position.y < 48 || position.y > viewportHeight - 48) score += 8000;
            score += distanceFromParent * 0.2;
            if (position.y < Number(parentNode.y || 0) - 28) {
                score += Math.pow((Number(parentNode.y || 0) - 28) - position.y, 2) * 0.9;
            }
            if (blockingConcept) {
                score += Math.pow(blockingConcept.overlap + 8, 2) * 13;
            }

            allObstacles.forEach(function (obstacle) {
                if (!obstacle || obstacle.id === parentNode.id) return;
                const diffX = position.x - obstacle.x;
                const diffY = position.y - obstacle.y;
                const distance = Math.sqrt(diffX * diffX + diffY * diffY) || 1;
                const padding = obstacle.kind === "concept" ? 20 : 14;
                const safeDistance = Number(position.r || 0) + Number(obstacle.r || 0) + padding;
                if (distance < safeDistance) {
                    score += Math.pow(safeDistance - distance, 2) * (obstacle.kind === "concept" ? 7 : 4);
                }
            });

            conceptEdgeSegments.forEach(function (segment) {
                if (!segment) return;
                const distanceToEdge = getPointToSegmentDistance(position.x, position.y, segment);
                const edgeSafeDistance = Number(position.r || 0) + 18;
                if (distanceToEdge < edgeSafeDistance) {
                    const weight = segment.source === parentNode.id ? 10 : 6;
                    score += Math.pow(edgeSafeDistance - distanceToEdge, 2) * weight;
                }
            });
        });

        for (let index = 0; index < placedPositions.length; index += 1) {
            for (let otherIndex = index + 1; otherIndex < placedPositions.length; otherIndex += 1) {
                const first = placedPositions[index];
                const second = placedPositions[otherIndex];
                const diffX = first.x - second.x;
                const diffY = first.y - second.y;
                const distance = Math.sqrt(diffX * diffX + diffY * diffY) || 1;
                const safeDistance = Number(first.r || 0) + Number(second.r || 0) + 18;
                if (distance < safeDistance) {
                    score += Math.pow(safeDistance - distance, 2) * 5;
                }
            }
        }

        return score;
    }

    function buildCandidateResourceLayout(parentNode, resourceNodes, direction, scale, conceptObstacles, occupiedResourceObstacles, conceptEdgeSegments, viewport) {
        const directionConfig = getResourceDirectionConfig(direction);
        const textNodes = resourceNodes
            .filter(function (node) { return node.data && node.data.entityType === "resource-text"; })
            .sort(function (a, b) {
                return safeText(a.data && a.data.fullName, a.id).localeCompare(safeText(b.data && b.data.fullName, b.id), "zh-Hans-CN");
            });
        const videoNodes = resourceNodes
            .filter(function (node) { return node.data && node.data.entityType === "resource-video"; })
            .sort(function (a, b) {
                return safeText(a.data && a.data.fullName, a.id).localeCompare(safeText(b.data && b.data.fullName, b.id), "zh-Hans-CN");
            });

        const textSeeds = buildDirectionalGroupSeedPositions(
            parentNode,
            textNodes,
            directionConfig.textAngle,
            directionConfig.textRadius * scale,
            directionConfig.ringGap * scale,
            directionConfig.arcSpread
        );
        const videoSeeds = buildDirectionalGroupSeedPositions(
            parentNode,
            videoNodes,
            directionConfig.videoAngle,
            directionConfig.videoRadius * scale,
            directionConfig.ringGap * scale,
            directionConfig.arcSpread
        );

        const orderedSeeds = textSeeds.concat(videoSeeds).sort(function (a, b) {
            return Number(a.radius || 0) - Number(b.radius || 0);
        });
        const localObstacles = conceptObstacles.concat(occupiedResourceObstacles);
        const placedPositions = [];

        orderedSeeds.forEach(function (seed, index) {
            const placed = pushSeedAwayFromObstacles(
                seed,
                parentNode,
                viewport,
                localObstacles,
                conceptObstacles,
                conceptEdgeSegments,
                directionConfig,
                index % 2 === 0 ? 1 : -1
            );
            placedPositions.push(placed);
            localObstacles.push(createLayoutObstacle(placed.x, placed.y, placed.r, "resource", placed.id));
        });

        return {
            positions: placedPositions,
            score: scoreResourceLayout(parentNode, placedPositions, conceptObstacles, occupiedResourceObstacles, conceptEdgeSegments, viewport),
        };
    }

    function buildResourcePositionMap() {
        const positionMap = new Map();
        const viewport = getGraphViewportSize();
        const visibleConceptNodes = getVisibleConceptNodes();
        const visibleConceptIdSet = new Set(visibleConceptNodes.map(function (node) { return node.id; }));
        const conceptObstacles = buildConceptObstacles(visibleConceptNodes);
        const conceptEdgeSegments = buildVisibleConceptEdgeSegments(visibleConceptIdSet);
        const occupiedResourceObstacles = [];
        const expandedParents = Array.from(state.expandedResourceParentIds).sort(function (leftId, rightId) {
            const leftDepth = state.treeDepthById.get(leftId) || 0;
            const rightDepth = state.treeDepthById.get(rightId) || 0;
            if (leftDepth !== rightDepth) return leftDepth - rightDepth;
            const leftNode = state.nodeById.get(leftId);
            const rightNode = state.nodeById.get(rightId);
            return Number(leftNode && leftNode.x) - Number(rightNode && rightNode.x);
        });

        expandedParents.forEach(function (parentId) {
            const parentNode = state.nodeById.get(parentId);
            if (!parentNode || !visibleConceptIdSet.has(parentId)) {
                return;
            }

            const resourceNodes = (state.resourceNodeIdsByParent.get(parentId) || [])
                .map(function (resourceNodeId) { return state.resourceNodeById.get(resourceNodeId); })
                .filter(Boolean);
            if (!resourceNodes.length) return;

            const directions = getResourceDirectionCandidates(parentNode, viewport, visibleConceptIdSet);
            let bestLayout = null;

            directions.forEach(function (direction) {
                [1, 1.18, 1.36].forEach(function (scale) {
                    const candidate = buildCandidateResourceLayout(
                        parentNode,
                        resourceNodes,
                        direction,
                        scale,
                        conceptObstacles,
                        occupiedResourceObstacles,
                        conceptEdgeSegments,
                        viewport
                    );
                    if (!bestLayout || candidate.score < bestLayout.score) {
                        bestLayout = candidate;
                    }
                });
            });

            if (!bestLayout) return;

            bestLayout.positions.forEach(function (position) {
                positionMap.set(position.id, {
                    x: position.x,
                    y: position.y,
                });
                occupiedResourceObstacles.push(createLayoutObstacle(position.x, position.y, position.r, "resource", position.id));
            });
        });

        return positionMap;
    }

    function refreshResourceNodePositions() {
        const positionMap = buildResourcePositionMap();

        state.resourceNodes.forEach(function (node) {
            const position = positionMap.get(node.id);
            if (!position) return;
            node.x = position.x;
            node.y = position.y;
            node.style = Object.assign({}, node.style || {}, {
                x: position.x,
                y: position.y,
            });
        });
    }

    async function toggleNodeResources(nodeId) {
        const parentId = safeText(nodeId, "").trim();
        if (!parentId || !state.nodeById.has(parentId)) {
            return false;
        }

        suppressCanvasClear(560);
        stopAutoplay();

        if (state.expandedResourceParentIds.has(parentId)) {
            state.expandedResourceParentIds.delete(parentId);
            await syncGraphVisibilityLayout();
            return true;
        }

        await ensureResourceDataForNode(parentId);
        if (!(state.resourceNodeIdsByParent.get(parentId) || []).length) {
            return false;
        }

        revealAncestorChains(collectExpandedResourceRelatedConceptIds(parentId));
        state.expandedResourceParentIds.add(parentId);
        await syncGraphVisibilityLayout();
        await focusExpandedResourceContext(parentId);
        return true;
    }

    function handleResourceNodeSelect(nodeId) {
        const resourceNode = state.resourceNodeById.get(String(nodeId));
        if (!resourceNode || !resourceNode.data) return;

        const entityType = safeText(resourceNode.data.entityType, "");
        if (entityType === "resource-video" && resourceNode.data.videoId) {
            openVideoPlayer(resourceNode.data.parentRawId, resourceNode.data.videoId);
            return;
        }

        if (resourceNode.data.practiceRoute) {
            window.location.href = resourceNode.data.practiceRoute;
            return;
        }

        const parentId = safeText(resourceNode.data.parentId, "");
        if (!parentId || !state.nodeById.has(parentId)) return;

        openNodeDetail(parentId, true);
        state.detailViewMode = "text";
        state.detailTextFilter = safeText(resourceNode.data.resourceType, "all");
        rerenderActiveNodeDetail();
    }

    function getVideoOpenAttributes(item) {
        if (!item || !safeText(item.videoUrl, "").trim()) {
            return "";
        }
        const videoId = safeText(item.id, "").trim();
        const nodeId = safeText(item.nodeId, "").trim();
        if (!videoId || !nodeId) return "";
        return " data-video-open=\"" + escapeHtml(videoId) + "\" data-video-node=\"" + escapeHtml(nodeId) + "\"";
    }

    async function ensureNodeDetailDataByRawId(rawNodeId) {
        const normalizedId = safeText(rawNodeId, "").trim();
        if (!normalizedId) return null;

        const cached = state.detailCache.get(normalizedId);
        if (cached) return cached;

        const nodeDatum = getNodeDatumByRawId(normalizedId);
        if (!nodeDatum) return null;
        return fetchNodeDetailData(nodeDatum);
    }

    function findVideoResourceById(detailData, videoId) {
        const resources = detailData && Array.isArray(detailData.videoResources) ? detailData.videoResources : [];
        const normalizedVideoId = safeText(videoId, "").trim();
        if (!normalizedVideoId) return resources[0] || null;

        for (let index = 0; index < resources.length; index += 1) {
            if (safeText(resources[index].id, "").trim() === normalizedVideoId) {
                return resources[index];
            }
        }
        return resources[0] || null;
    }

    function getNodeDatumByRawId(rawId) {
        const targetId = String(rawId);
        for (let index = 0; index < state.nodes.length; index += 1) {
            const node = state.nodes[index];
            if (String(node.data.rawId) === targetId) {
                return node;
            }
        }
        return null;
    }

    function normalizeLooseItems(value) {
        return ensureArray(value).map(function (item) {
            if (item && typeof item === "object") {
                const label = safeText(
                    item.label || item.name || item.title || item.text || item.id,
                    ""
                ).trim();
                const rawNodeId = safeText(item.node_id || item.nodeId || item.rawId || item.id, "").trim();
                const nodeDatum = rawNodeId ? getNodeDatumByRawId(rawNodeId) : null;
                return {
                    label: label,
                    nodeId: nodeDatum ? nodeDatum.id : "",
                };
            }
            return {
                label: safeText(item, "").trim(),
                nodeId: "",
            };
        }).filter(function (item) {
            return item.label;
        });
    }

    function buildFallbackNodeDetail(nodeDatum) {
        const summary = safeText(nodeDatum && nodeDatum.data && nodeDatum.data.details, "").trim();
        return {
            node: {
                id: safeText(nodeDatum && nodeDatum.data && nodeDatum.data.rawId, ""),
                name: safeText(nodeDatum && nodeDatum.data && nodeDatum.data.name, ""),
                image: normalizeMediaUrl(nodeDatum && nodeDatum.data && nodeDatum.data.image, "/images/snow.png"),
                summary: summary,
                description: summary,
                modulePath: "",
                difficulty: "",
                stage: "",
                learningGoals: [],
                prerequisites: [],
                successors: [],
                tags: [],
            },
            textResources: [],
            videoResources: [],
        };
    }

    function normalizeNodeDetailPayload(nodeDatum, payload) {
        const fallback = buildFallbackNodeDetail(nodeDatum);
        const source = payload && payload.node ? payload : fallback;
        const nodeInfo = source.node || {};

        return {
            node: {
                id: safeText(nodeInfo.id, fallback.node.id),
                name: safeText(nodeInfo.name, fallback.node.name),
                image: normalizeMediaUrl(nodeInfo.image, fallback.node.image),
                summary: safeText(nodeInfo.summary, fallback.node.summary),
                description: safeText(nodeInfo.description, fallback.node.description),
                modulePath: safeText(nodeInfo.module_path || nodeInfo.modulePath, ""),
                difficulty: safeText(nodeInfo.difficulty, ""),
                stage: safeText(nodeInfo.stage, ""),
                learningGoals: ensureArray(nodeInfo.learning_goals || nodeInfo.learningGoals).map(function (item) {
                    return safeText(item, "").trim();
                }).filter(Boolean),
                prerequisites: normalizeLooseItems(nodeInfo.prerequisites),
                successors: normalizeLooseItems(nodeInfo.successors),
                tags: ensureArray(nodeInfo.tags).map(function (item) {
                    return safeText(item, "").trim();
                }).filter(Boolean),
            },
            textResources: ensureArray(source.text_resources || source.textResources).map(function (item, index) {
                return normalizeTextResource(item, index, fallback.node.id);
            }).sort(function (left, right) {
                return left.sortOrder - right.sortOrder;
            }),
            videoResources: ensureArray(source.video_resources || source.videoResources).map(function (item, index) {
                return normalizeVideoResource(item, index, fallback.node.id);
            }).sort(function (left, right) {
                return left.sortOrder - right.sortOrder;
            }),
        };
    }

    async function fetchNodeDetailData(nodeDatum) {
        const rawNodeId = safeText(nodeDatum && nodeDatum.data && nodeDatum.data.rawId, "");
        if (!rawNodeId) {
            return buildFallbackNodeDetail(nodeDatum);
        }

        if (state.detailCache.has(rawNodeId)) {
            return state.detailCache.get(rawNodeId);
        }

        try {
            const response = await fetch("/api/node/" + encodeURIComponent(rawNodeId) + "/detail", {
                credentials: "same-origin",
            });
            if (!response.ok) {
                throw new Error("request failed");
            }
            const payload = await response.json();
            const normalized = normalizeNodeDetailPayload(nodeDatum, payload && payload.data ? payload.data : payload);
            state.detailCache.set(rawNodeId, normalized);
            return normalized;
        } catch (error) {
            return buildFallbackNodeDetail(nodeDatum);
        }
    }

    function getNodeRelationSummary(nodeDatum) {
        const nodeId = safeText(nodeDatum && nodeDatum.id, "");
        const parentIds = [];
        const seenParentIds = new Set();
        const treeParentId = state.treeParentById.get(nodeId);
        if (treeParentId && !seenParentIds.has(treeParentId)) {
            seenParentIds.add(treeParentId);
            parentIds.push(treeParentId);
        }

        const childIds = [];
        const seenChildIds = new Set();
        getTreeChildren(nodeId).forEach(function (childId) {
            if (!seenChildIds.has(childId)) {
                seenChildIds.add(childId);
                childIds.push(childId);
            }
        });

        const neighborIds = new Set();
        (state.adjacency.get(nodeId) || []).forEach(function (targetId) {
            if (targetId !== nodeId) neighborIds.add(targetId);
        });
        (state.reverseAdjacency.get(nodeId) || []).forEach(function (sourceId) {
            if (sourceId !== nodeId) neighborIds.add(sourceId);
        });

        const relatedIds = Array.from(neighborIds).filter(function (relatedId) {
            return !seenParentIds.has(relatedId) && !seenChildIds.has(relatedId);
        });

        const directEdges = state.edges.filter(function (edge) {
            return edge.source === nodeId || edge.target === nodeId;
        });

        return {
            parents: parentIds.map(function (itemId) { return state.nodeById.get(itemId); }).filter(Boolean),
            children: childIds.map(function (itemId) { return state.nodeById.get(itemId); }).filter(Boolean),
            related: relatedIds.map(function (itemId) { return state.nodeById.get(itemId); }).filter(Boolean),
            edges: directEdges,
        };
    }

    function renderStatItem(label, value) {
        return (
            "<div class=\"detail-stat\">" +
            "<span class=\"detail-stat-value\">" + escapeHtml(value) + "</span>" +
            "<span class=\"detail-stat-label\">" + escapeHtml(label) + "</span>" +
            "</div>"
        );
    }

    function renderInlinePills(items, emptyText, dataKey) {
        if (!items || !items.length) {
            return "<span class=\"detail-empty-inline\">" + escapeHtml(emptyText || "暂无") + "</span>";
        }

        return items.map(function (item) {
            const label = escapeHtml(item.label || item);
            const nodeId = item && item.nodeId ? safeText(item.nodeId, "") : "";
            if (dataKey && nodeId) {
                return "<button type=\"button\" class=\"detail-link-chip\" " + dataKey + "=\"" + escapeHtml(nodeId) + "\">" + label + "</button>";
            }
            return "<span class=\"detail-pill detail-pill-soft\">" + label + "</span>";
        }).join("");
    }

    function renderOverviewResourceList(title, items, emptyText) {
        const content = items.length
            ? "<ul class=\"detail-mini-list\">" + items.map(function (item) {
                const practiceRoute = item.resourceType === "exercise"
                    ? "/practice/" + encodeURIComponent(item.nodeId) + "/" + encodeURIComponent(item.id)
                    : "";
                const videoOpenAttrs = !practiceRoute ? getVideoOpenAttributes(item) : "";
                const itemAttrs = practiceRoute
                    ? " data-practice-route=\"" + practiceRoute + "\""
                    : videoOpenAttrs;
                const itemClass = practiceRoute || videoOpenAttrs
                    ? "detail-mini-item detail-mini-item-link"
                    : "detail-mini-item";
                return (
                    "<li class=\"" + itemClass + "\"" + itemAttrs + ">" +
                    "<span class=\"detail-mini-title\">" + escapeHtml(item.title) + "</span>" +
                    (practiceRoute ? "<span class=\"detail-mini-link\" data-practice-route=\"" + practiceRoute + "\">进入练习</span>" : "") +
                    "<span class=\"detail-mini-sub\">" + escapeHtml(item.summary || item.resourceLabel || item.duration || "") + "</span>" +
                    "</li>"
                );
            }).join("") + "</ul>"
            : "<div class=\"detail-empty\">" + escapeHtml(emptyText) + "</div>";

        return (
            "<section class=\"detail-section\">" +
            "<h4>" + escapeHtml(title) + "</h4>" +
            content +
            "</section>"
        );
    }

    function renderOverviewTab(nodeDatum, detailData, relationSummary) {
        const nodeInfo = detailData.node;
        const summary = nodeInfo.summary || nodeInfo.description || "暂无知识点简介";
        const prerequisiteItems = nodeInfo.prerequisites.length
            ? nodeInfo.prerequisites
            : relationSummary.parents.map(function (item) {
                return { label: item.data.name, nodeId: item.id };
            });
        const successorItems = nodeInfo.successors.length
            ? nodeInfo.successors
            : relationSummary.children.map(function (item) {
                return { label: item.data.name, nodeId: item.id };
            });

        return (
            "<section class=\"detail-section\">" +
            "<h4>知识点概览</h4>" +
            "<p class=\"detail-paragraph\">" + escapeHtml(summary) + "</p>" +
            "</section>" +
            "<section class=\"detail-section\">" +
            "<h4>学习路径</h4>" +
            "<div class=\"detail-grid-pair\">" +
            "<div><div class=\"detail-grid-label\">先修知识</div><div class=\"detail-chip-row\">" + renderInlinePills(prerequisiteItems, "暂无先修信息", "data-node-focus") + "</div></div>" +
            "<div><div class=\"detail-grid-label\">后继知识</div><div class=\"detail-chip-row\">" + renderInlinePills(successorItems, "暂无后继信息", "data-node-focus") + "</div></div>" +
            "</div>" +
            "</section>" +
            (
                nodeInfo.learningGoals.length
                    ? "<section class=\"detail-section\"><h4>学习目标</h4><ul class=\"detail-goal-list\">" + nodeInfo.learningGoals.map(function (item) {
                        return "<li>" + escapeHtml(item) + "</li>";
                    }).join("") + "</ul></section>"
                    : ""
            ) +
            renderOverviewResourceList("推荐文本", detailData.textResources.slice(0, 3), "当前没有文本资源") +
            renderOverviewResourceList("推荐视频", detailData.videoResources.slice(0, 2), "当前没有视频资源")
        );
    }

    function renderTextResourcesTab(detailData) {
        const resources = detailData.textResources;
        const typeKeys = Array.from(new Set(resources.map(function (item) {
            return item.resourceType;
        }).filter(Boolean)));
        const filterKeys = ["all"].concat(typeKeys);
        const activeFilter = state.detailTextFilter;
        const filteredResources = activeFilter === "all"
            ? resources
            : resources.filter(function (item) { return item.resourceType === activeFilter; });

        const filterHtml = filterKeys.map(function (key) {
            const isActive = activeFilter === key;
            const label = key === "all" ? "全部" : (textResourceTypeLabels[key] || "其他");
            const count = key === "all"
                ? resources.length
                : resources.filter(function (item) { return item.resourceType === key; }).length;
            return (
                "<button type=\"button\" class=\"detail-filter" + (isActive ? " active" : "") + "\" data-text-filter=\"" + escapeHtml(key) + "\">" +
                escapeHtml(label) + " " + escapeHtml(count) +
                "</button>"
            );
        }).join("");

        const cardsHtml = filteredResources.length
            ? filteredResources.map(function (item) {
                const summary = item.summary || item.question || truncateText(item.content, 90) || "暂无摘要";
                const metaParts = [item.resourceLabel, item.source, item.difficulty, item.estimatedTime].filter(Boolean);
                const tagsHtml = item.tags.length
                    ? "<div class=\"detail-chip-row\">" + item.tags.map(function (tag) {
                        return "<span class=\"detail-pill detail-pill-soft\">" + escapeHtml(tag) + "</span>";
                    }).join("") + "</div>"
                    : "";
                const bodyText = item.question || item.content;
                const practiceRoute = item.resourceType === "exercise"
                    ? "/practice/" + encodeURIComponent(item.nodeId) + "/" + encodeURIComponent(item.id)
                    : "";
                const practiceActionHtml = item.resourceType === "exercise"
                    ? (
                        "<div class=\"resource-actions\">" +
                        "<a class=\"detail-external-link practice-link\" href=\"" + practiceRoute + "\" data-practice-route=\"" + practiceRoute + "\">进入练习</a>" +
                        "</div>"
                    )
                    : "";

                return (
                    "<details class=\"resource-card" + (item.resourceType === "exercise" ? " resource-card-exercise" : "") + "\"" + (practiceRoute ? " data-practice-route=\"" + practiceRoute + "\"" : "") + ">" +
                    "<summary" + (practiceRoute ? " data-practice-route=\"" + practiceRoute + "\"" : "") + ">" +
                    "<span class=\"resource-summary-row\">" +
                    "<span class=\"resource-title\">" + escapeHtml(item.title) + "</span>" +
                    (practiceRoute ? "<span class=\"resource-inline-action\" data-practice-route=\"" + practiceRoute + "\">进入练习</span>" : "") +
                    "<span class=\"resource-meta\">" + escapeHtml(metaParts.join(" / ")) + "</span>" +
                    "<span class=\"resource-brief\">" + escapeHtml(summary) + "</span>" +
                    "</span>" +
                    "</summary>" +
                    "<div class=\"resource-body\">" +
                    (item.summary ? "<p class=\"detail-paragraph\">" + escapeHtml(item.summary) + "</p>" : "") +
                    (bodyText ? "<div class=\"resource-content\">" + escapeHtml(bodyText) + "</div>" : "<div class=\"detail-empty\">暂无正文内容</div>") +
                    tagsHtml +
                    practiceActionHtml +
                    "</div>" +
                    "</details>"
                );
            }).join("")
            : "<div class=\"detail-empty\">当前筛选条件下没有文本资源</div>";

        return (
            "<section class=\"detail-section\">" +
            "<div class=\"detail-filter-row\">" + filterHtml + "</div>" +
            "</section>" +
            "<div class=\"detail-card-list\">" + cardsHtml + "</div>"
        );
    }

    function renderVideoResourcesTab(detailData) {
        const cardsHtml = detailData.videoResources.length
            ? detailData.videoResources.map(function (item) {
                const metaParts = [item.duration, item.speaker, item.source].filter(Boolean);
                const coverHtml = item.coverUrl
                    ? "<img class=\"video-cover\" src=\"" + escapeHtml(item.coverUrl) + "\" alt=\"" + escapeHtml(item.title) + "\">"
                    : "<div class=\"video-cover placeholder\">视频</div>";
                const playerHtml = item.videoUrl
                    ? (
                        "<div class=\"video-player-wrap\">" +
                        "<video controls preload=\"none\" src=\"" + escapeHtml(item.videoUrl) + "\"></video>" +
                        "<a class=\"detail-external-link\" href=\"" + escapeHtml(item.videoUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">新窗口打开视频</a>" +
                        "</div>"
                    )
                    : "<div class=\"detail-empty\">暂无可播放的视频地址</div>";

                return (
                    "<details class=\"resource-card resource-card-video\">" +
                    "<summary>" +
                    "<span class=\"video-summary-row\">" +
                    coverHtml +
                    "<span class=\"video-summary-text\">" +
                    "<span class=\"resource-title\">" + escapeHtml(item.title) + "</span>" +
                    "<span class=\"resource-meta\">" + escapeHtml(metaParts.join(" / ")) + "</span>" +
                    "<span class=\"resource-brief\">" + escapeHtml(item.summary || "点击展开查看视频详情") + "</span>" +
                    "</span>" +
                    "</span>" +
                    "</summary>" +
                    "<div class=\"resource-body\">" +
                    (item.summary ? "<p class=\"detail-paragraph\">" + escapeHtml(item.summary) + "</p>" : "") +
                    playerHtml +
                    "</div>" +
                    "</details>"
                );
            }).join("")
            : "<div class=\"detail-empty\">当前知识点还没有视频资源</div>";

        return "<div class=\"detail-card-list\">" + cardsHtml + "</div>";
    }

    function renderOverviewResourceList(title, items, emptyText) {
        const content = items.length
            ? "<ul class=\"detail-mini-list\">" + items.map(function (item) {
                const practiceRoute = item.resourceType === "exercise"
                    ? "/practice/" + encodeURIComponent(item.nodeId) + "/" + encodeURIComponent(item.id)
                    : "";
                const videoOpenAttrs = !practiceRoute ? getVideoOpenAttributes(item) : "";
                const itemAttrs = practiceRoute
                    ? " data-practice-route=\"" + practiceRoute + "\""
                    : videoOpenAttrs;
                const itemClass = practiceRoute || videoOpenAttrs
                    ? "detail-mini-item detail-mini-item-link"
                    : "detail-mini-item";
                const actionHtml = practiceRoute
                    ? "<span class=\"detail-mini-link\" data-practice-route=\"" + practiceRoute + "\">杩涘叆缁冧範</span>"
                    : (
                        videoOpenAttrs
                            ? "<span class=\"detail-mini-link\"" + videoOpenAttrs + ">鎾斁瑙嗛</span>"
                            : ""
                    );
                return (
                    "<li class=\"" + itemClass + "\"" + itemAttrs + ">" +
                    "<span class=\"detail-mini-title\">" + escapeHtml(item.title) + "</span>" +
                    actionHtml +
                    "<span class=\"detail-mini-sub\">" + escapeHtml(item.summary || item.resourceLabel || item.duration || "") + "</span>" +
                    "</li>"
                );
            }).join("") + "</ul>"
            : "<div class=\"detail-empty\">" + escapeHtml(emptyText) + "</div>";

        return (
            "<section class=\"detail-section\">" +
            "<h4>" + escapeHtml(title) + "</h4>" +
            content +
            "</section>"
        );
    }

    function renderVideoResourcesTab(detailData) {
        const cardsHtml = detailData.videoResources.length
            ? detailData.videoResources.map(function (item) {
                const metaParts = [item.duration, item.speaker, item.source].filter(Boolean);
                const coverHtml = item.coverUrl
                    ? "<img class=\"video-cover\" src=\"" + escapeHtml(item.coverUrl) + "\" alt=\"" + escapeHtml(item.title) + "\">"
                    : "<div class=\"video-cover placeholder\">瑙嗛</div>";
                const videoOpenAttrs = getVideoOpenAttributes(item);
                const tagsHtml = item.tags.length
                    ? "<div class=\"detail-chip-row\">" + item.tags.map(function (tag) {
                        return "<span class=\"detail-pill detail-pill-soft\">" + escapeHtml(tag) + "</span>";
                    }).join("") + "</div>"
                    : "";
                const playActionHtml = videoOpenAttrs
                    ? "<div class=\"resource-actions\">" +
                    "<a class=\"detail-external-link practice-link\" href=\"" + escapeHtml(item.videoUrl) + "\"" + videoOpenAttrs + ">鎾斁瑙嗛</a>" +
                    "<a class=\"detail-external-link practice-link\" href=\"" + escapeHtml(item.videoUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">鏂扮獥鍙ｆ墦寮€</a>" +
                    "</div>"
                    : "<div class=\"detail-empty\">鏆傛棤鍙挱鏀剧殑瑙嗛鍦板潃</div>";

                return (
                    "<section class=\"resource-card resource-card-video\">" +
                    "<div class=\"resource-body\">" +
                    "<div class=\"video-summary-row\">" +
                    coverHtml +
                    "<span class=\"video-summary-text\">" +
                    (
                        videoOpenAttrs
                            ? "<a class=\"resource-title\" href=\"" + escapeHtml(item.videoUrl) + "\"" + videoOpenAttrs + ">" + escapeHtml(item.title) + "</a>"
                            : "<span class=\"resource-title\">" + escapeHtml(item.title) + "</span>"
                    ) +
                    "<span class=\"resource-meta\">" + escapeHtml(metaParts.join(" / ")) + "</span>" +
                    "<span class=\"resource-brief\">" + escapeHtml(item.summary || "鐐瑰嚮鎾斁锛屽湪鎮诞瑙嗛绐楀彛涓煡鐪嬭鎯?") + "</span>" +
                    "</span>" +
                    (
                        videoOpenAttrs
                            ? "<a class=\"resource-inline-action\" href=\"" + escapeHtml(item.videoUrl) + "\"" + videoOpenAttrs + ">鎾斁瑙嗛</a>"
                            : ""
                    ) +
                    "</div>" +
                    (item.summary ? "<p class=\"detail-paragraph\">" + escapeHtml(item.summary) + "</p>" : "") +
                    tagsHtml +
                    playActionHtml +
                    "</div>" +
                    "</section>"
                );
            }).join("")
            : "<div class=\"detail-empty\">褰撳墠鐭ヨ瘑鐐硅繕娌℃湁瑙嗛璧勬簮</div>";

        return "<div class=\"detail-card-list\">" + cardsHtml + "</div>";
    }

    function renderLegacyVideoPlayerStageUnused(videoResource) {
        const videoUrl = safeText(videoResource && videoResource.videoUrl, "").trim();
        if (!videoUrl) {
            return "<div class=\"video-modal-empty\">褰撳墠瑙嗛杩樻病鏈夊彲鎾斁鐨勫湴鍧€锛屼綘鍙互鍏堣ˉ鍏呰棰戦摼鎺ャ€?/div>";
        }

        if (isDirectVideoSource(videoUrl)) {
            const posterAttr = videoResource && videoResource.coverUrl
                ? " poster=\"" + escapeHtml(videoResource.coverUrl) + "\""
                : "";
            return "<video controls autoplay preload=\"metadata\"" + posterAttr + " src=\"" + escapeHtml(videoUrl) + "\"></video>";
        }

        return "<iframe src=\"" + escapeHtml(getEmbeddableVideoUrl(videoUrl)) + "\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen loading=\"lazy\"></iframe>";
    }

    function renderLegacyVideoPlayerModalUnused(rawNodeId, detailData, videoId) {
        if (!videoPlayerModal) return;

        const videos = detailData && Array.isArray(detailData.videoResources) ? detailData.videoResources : [];
        const currentVideo = findVideoResourceById(detailData, videoId);
        if (!currentVideo) {
            closeVideoPlayer();
            return;
        }

        const nodeInfo = detailData.node || {};
        const metaPills = [nodeInfo.name, currentVideo.duration, currentVideo.speaker, currentVideo.source].filter(Boolean);
        const tagsHtml = currentVideo.tags.length
            ? "<div class=\"video-modal-tags\">" + currentVideo.tags.map(function (tag) {
                return "<span class=\"video-modal-pill\">" + escapeHtml(tag) + "</span>";
            }).join("") + "</div>"
            : "";
        const actionsHtml = currentVideo.videoUrl
            ? "<div class=\"video-modal-actions\">" +
            "<a class=\"video-modal-action\" href=\"" + escapeHtml(currentVideo.videoUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">鏂扮獥鍙ｆ墦寮€</a>" +
            "</div>"
            : "";
        const sideListHtml = videos.length
            ? videos.map(function (item) {
                const activeClass = safeText(item.id, "") === safeText(currentVideo.id, "") ? " active" : "";
                const coverHtml = item.coverUrl
                    ? "<img class=\"video-modal-side-cover\" src=\"" + escapeHtml(item.coverUrl) + "\" alt=\"" + escapeHtml(item.title) + "\">"
                    : "<div class=\"video-modal-side-cover placeholder\">瑙嗛</div>";
                return (
                    "<button type=\"button\" class=\"video-modal-side-item" + activeClass + "\" data-video-switch=\"" + escapeHtml(item.id) + "\" data-video-node=\"" + escapeHtml(rawNodeId) + "\">" +
                    "<span class=\"video-modal-side-item-inner\">" +
                    coverHtml +
                    "<span class=\"video-modal-side-text\">" +
                    "<span class=\"video-modal-side-name\">" + escapeHtml(item.title) + "</span>" +
                    "<span class=\"video-modal-side-meta\">" + escapeHtml([item.duration, item.speaker].filter(Boolean).join(" / ")) + "</span>" +
                    "<span class=\"video-modal-side-brief\">" + escapeHtml(item.summary || item.source || "鐐瑰嚮鍒囨崲褰撳墠瑙嗛") + "</span>" +
                    "</span>" +
                    "</span>" +
                    "</button>"
                );
            }).join("")
            : "<div class=\"video-modal-empty\">鏆傛棤鍙敤瑙嗛</div>";

        state.videoModalNodeId = safeText(rawNodeId, "");
        state.videoModalVideoId = safeText(currentVideo.id, "");
        state.videoModalOpen = true;

        videoPlayerModal.innerHTML =
            "<div class=\"video-modal-backdrop\" data-video-close=\"backdrop\"></div>" +
            "<div class=\"video-modal-dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"video-modal-title\">" +
            "<button type=\"button\" class=\"video-modal-close\" data-video-close=\"button\" aria-label=\"Close\">×</button>" +
            "<div class=\"video-modal-shell\">" +
            "<section class=\"video-modal-main\">" +
            "<div class=\"video-modal-kicker\">瑙嗛瀛︿範</div>" +
            "<h3 id=\"video-modal-title\" class=\"video-modal-title\">" + escapeHtml(currentVideo.title) + "</h3>" +
            (
                metaPills.length
                    ? "<div class=\"video-modal-meta\">" + metaPills.map(function (item) {
                        return "<span class=\"video-modal-pill\">" + escapeHtml(item) + "</span>";
                    }).join("") + "</div>"
                    : ""
            ) +
            tagsHtml +
            "<div class=\"video-modal-stage\">" + renderVideoPlayerStage(currentVideo) + "</div>" +
            "<p class=\"video-modal-summary\">" + escapeHtml(currentVideo.summary || "浣犲彲浠ュ湪杩欓噷闆嗕腑瑙傜湅褰撳墠鐭ヨ瘑鐐圭殑鏁欏瑙嗛銆?") + "</p>" +
            actionsHtml +
            "</section>" +
            "<aside class=\"video-modal-side\">" +
            "<div class=\"video-modal-side-title\">鍚岀煡璇嗙偣瑙嗛</div>" +
            "<div class=\"video-modal-side-subtitle\">" + escapeHtml(nodeInfo.name || "") + "</div>" +
            "<div class=\"video-modal-side-list\">" + sideListHtml + "</div>" +
            "</aside>" +
            "</div>" +
            "</div>";
        videoPlayerModal.classList.add("active");
    }

    function closeVideoPlayer() {
        state.videoModalNodeId = null;
        state.videoModalVideoId = null;
        state.videoModalOpen = false;
        state.videoModalRequestToken += 1;
        if (!videoPlayerModal) return;
        videoPlayerModal.classList.remove("active");
        videoPlayerModal.innerHTML = "";
    }

    async function openVideoPlayer(rawNodeId, videoId) {
        const normalizedNodeId = safeText(rawNodeId || state.detailNodeId, "").trim();
        const normalizedVideoId = safeText(videoId, "").trim();
        if (!normalizedNodeId || !normalizedVideoId) return;

        suppressCanvasClear(320);
        const requestToken = state.videoModalRequestToken + 1;
        state.videoModalRequestToken = requestToken;

        const detailData = await ensureNodeDetailDataByRawId(normalizedNodeId);
        if (requestToken !== state.videoModalRequestToken) return;
        if (!detailData) return;

        renderVideoPlayerModal(normalizedNodeId, detailData, normalizedVideoId);
    }

    function handleVideoModalClick(event) {
        const target = event && event.target;
        if (!target || !target.closest) return;

        shieldPanelEvent(event);

        const closeTarget = target.closest("[data-video-close]");
        if (closeTarget) {
            event.preventDefault();
            closeVideoPlayer();
            return;
        }

        const switchTarget = target.closest("[data-video-switch]");
        if (switchTarget) {
            event.preventDefault();
            const nodeId = safeText(switchTarget.getAttribute("data-video-node") || state.videoModalNodeId, "").trim();
            const videoId = safeText(switchTarget.getAttribute("data-video-switch"), "").trim();
            if (nodeId && videoId) {
                openVideoPlayer(nodeId, videoId);
            }
        }
    }

    const mediaUiText = {
        enterPractice: "\u8fdb\u5165\u7ec3\u4e60",
        playVideo: "\u64ad\u653e\u89c6\u9891",
        openInNewWindow: "\u65b0\u7a97\u53e3\u6253\u5f00",
        noVideoResources: "\u5f53\u524d\u77e5\u8bc6\u70b9\u8fd8\u6ca1\u6709\u89c6\u9891\u8d44\u6e90",
        noPlayableVideo: "\u6682\u65e0\u53ef\u64ad\u653e\u7684\u89c6\u9891\u5730\u5740",
        overviewVideoHint: "\u70b9\u51fb\u64ad\u653e\uff0c\u5728\u60ac\u6d6e\u89c6\u9891\u7a97\u53e3\u4e2d\u67e5\u770b\u8be6\u60c5",
        videoPlaceholder: "\u89c6\u9891",
        noVideoLinkHint: "\u5f53\u524d\u89c6\u9891\u8fd8\u6ca1\u6709\u53ef\u64ad\u653e\u7684\u5730\u5740\uff0c\u4f60\u53ef\u4ee5\u5148\u8865\u5145\u89c6\u9891\u94fe\u63a5\u3002",
        videoStudy: "\u89c6\u9891\u5b66\u4e60",
        sameNodeVideos: "\u540c\u77e5\u8bc6\u70b9\u89c6\u9891",
        switchVideoHint: "\u70b9\u51fb\u5207\u6362\u5f53\u524d\u89c6\u9891",
        modalSummaryFallback: "\u4f60\u53ef\u4ee5\u5728\u8fd9\u91cc\u96c6\u4e2d\u89c2\u770b\u5f53\u524d\u77e5\u8bc6\u70b9\u7684\u6559\u5b66\u89c6\u9891\u3002",
        noAvailableVideos: "\u6682\u65e0\u53ef\u7528\u89c6\u9891",
    };

    function renderOverviewResourceList(title, items, emptyText) {
        const content = items.length
            ? "<ul class=\"detail-mini-list\">" + items.map(function (item) {
                const practiceRoute = item.resourceType === "exercise"
                    ? "/practice/" + encodeURIComponent(item.nodeId) + "/" + encodeURIComponent(item.id)
                    : "";
                const videoOpenAttrs = !practiceRoute ? getVideoOpenAttributes(item) : "";
                const itemAttrs = practiceRoute
                    ? " data-practice-route=\"" + practiceRoute + "\""
                    : videoOpenAttrs;
                const itemClass = practiceRoute || videoOpenAttrs
                    ? "detail-mini-item detail-mini-item-link"
                    : "detail-mini-item";
                const actionHtml = practiceRoute
                    ? "<span class=\"detail-mini-link\" data-practice-route=\"" + practiceRoute + "\">" + mediaUiText.enterPractice + "</span>"
                    : (
                        videoOpenAttrs
                            ? "<span class=\"detail-mini-link\"" + videoOpenAttrs + ">" + mediaUiText.playVideo + "</span>"
                            : ""
                    );
                return (
                    "<li class=\"" + itemClass + "\"" + itemAttrs + ">" +
                    "<span class=\"detail-mini-title\">" + escapeHtml(item.title) + "</span>" +
                    actionHtml +
                    "<span class=\"detail-mini-sub\">" + escapeHtml(item.summary || item.resourceLabel || item.duration || "") + "</span>" +
                    "</li>"
                );
            }).join("") + "</ul>"
            : "<div class=\"detail-empty\">" + escapeHtml(emptyText) + "</div>";

        return (
            "<section class=\"detail-section\">" +
            "<h4>" + escapeHtml(title) + "</h4>" +
            content +
            "</section>"
        );
    }

    function renderVideoResourcesTab(detailData) {
        const cardsHtml = detailData.videoResources.length
            ? detailData.videoResources.map(function (item) {
                const metaParts = [item.duration, item.speaker, item.source].filter(Boolean);
                const coverHtml = item.coverUrl
                    ? "<img class=\"video-cover\" src=\"" + escapeHtml(item.coverUrl) + "\" alt=\"" + escapeHtml(item.title) + "\">"
                    : "<div class=\"video-cover placeholder\">" + mediaUiText.videoPlaceholder + "</div>";
                const videoOpenAttrs = getVideoOpenAttributes(item);
                const tagsHtml = item.tags.length
                    ? "<div class=\"detail-chip-row\">" + item.tags.map(function (tag) {
                        return "<span class=\"detail-pill detail-pill-soft\">" + escapeHtml(tag) + "</span>";
                    }).join("") + "</div>"
                    : "";
                const playActionHtml = videoOpenAttrs
                    ? "<div class=\"resource-actions\">" +
                    "<a class=\"detail-external-link practice-link\" href=\"" + escapeHtml(item.videoUrl) + "\"" + videoOpenAttrs + ">" + mediaUiText.playVideo + "</a>" +
                    "<a class=\"detail-external-link practice-link\" href=\"" + escapeHtml(item.videoUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + mediaUiText.openInNewWindow + "</a>" +
                    "</div>"
                    : "<div class=\"detail-empty\">" + mediaUiText.noPlayableVideo + "</div>";

                return (
                    "<section class=\"resource-card resource-card-video\">" +
                    "<div class=\"resource-body\">" +
                    "<div class=\"video-summary-row\">" +
                    coverHtml +
                    "<span class=\"video-summary-text\">" +
                    (
                        videoOpenAttrs
                            ? "<a class=\"resource-title\" href=\"" + escapeHtml(item.videoUrl) + "\"" + videoOpenAttrs + ">" + escapeHtml(item.title) + "</a>"
                            : "<span class=\"resource-title\">" + escapeHtml(item.title) + "</span>"
                    ) +
                    "<span class=\"resource-meta\">" + escapeHtml(metaParts.join(" / ")) + "</span>" +
                    "<span class=\"resource-brief\">" + escapeHtml(item.summary || mediaUiText.overviewVideoHint) + "</span>" +
                    "</span>" +
                    (
                        videoOpenAttrs
                            ? "<a class=\"resource-inline-action\" href=\"" + escapeHtml(item.videoUrl) + "\"" + videoOpenAttrs + ">" + mediaUiText.playVideo + "</a>"
                            : ""
                    ) +
                    "</div>" +
                    (item.summary ? "<p class=\"detail-paragraph\">" + escapeHtml(item.summary) + "</p>" : "") +
                    tagsHtml +
                    playActionHtml +
                    "</div>" +
                    "</section>"
                );
            }).join("")
            : "<div class=\"detail-empty\">" + mediaUiText.noVideoResources + "</div>";

        return "<div class=\"detail-card-list\">" + cardsHtml + "</div>";
    }

    function renderVideoPlayerStage(videoResource) {
        const videoUrl = safeText(videoResource && videoResource.videoUrl, "").trim();
        if (!videoUrl) {
            return "<div class=\"video-modal-empty\">" + mediaUiText.noVideoLinkHint + "</div>";
        }

        if (isDirectVideoSource(videoUrl)) {
            const posterAttr = videoResource && videoResource.coverUrl
                ? " poster=\"" + escapeHtml(videoResource.coverUrl) + "\""
                : "";
            return "<video controls autoplay preload=\"metadata\"" + posterAttr + " src=\"" + escapeHtml(videoUrl) + "\"></video>";
        }

        return "<iframe src=\"" + escapeHtml(getEmbeddableVideoUrl(videoUrl)) + "\" allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\" allowfullscreen loading=\"lazy\"></iframe>";
    }

    function renderVideoPlayerModal(rawNodeId, detailData, videoId) {
        if (!videoPlayerModal) return;

        const videos = detailData && Array.isArray(detailData.videoResources) ? detailData.videoResources : [];
        const currentVideo = findVideoResourceById(detailData, videoId);
        if (!currentVideo) {
            closeVideoPlayer();
            return;
        }

        const nodeInfo = detailData.node || {};
        const metaPills = [nodeInfo.name, currentVideo.duration, currentVideo.speaker, currentVideo.source].filter(Boolean);
        const tagsHtml = currentVideo.tags.length
            ? "<div class=\"video-modal-tags\">" + currentVideo.tags.map(function (tag) {
                return "<span class=\"video-modal-pill\">" + escapeHtml(tag) + "</span>";
            }).join("") + "</div>"
            : "";
        const actionsHtml = currentVideo.videoUrl
            ? "<div class=\"video-modal-actions\">" +
            "<a class=\"video-modal-action\" href=\"" + escapeHtml(currentVideo.videoUrl) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + mediaUiText.openInNewWindow + "</a>" +
            "</div>"
            : "";
        const sideListHtml = videos.length
            ? videos.map(function (item) {
                const activeClass = safeText(item.id, "") === safeText(currentVideo.id, "") ? " active" : "";
                const coverHtml = item.coverUrl
                    ? "<img class=\"video-modal-side-cover\" src=\"" + escapeHtml(item.coverUrl) + "\" alt=\"" + escapeHtml(item.title) + "\">"
                    : "<div class=\"video-modal-side-cover placeholder\">" + mediaUiText.videoPlaceholder + "</div>";
                return (
                    "<button type=\"button\" class=\"video-modal-side-item" + activeClass + "\" data-video-switch=\"" + escapeHtml(item.id) + "\" data-video-node=\"" + escapeHtml(rawNodeId) + "\">" +
                    "<span class=\"video-modal-side-item-inner\">" +
                    coverHtml +
                    "<span class=\"video-modal-side-text\">" +
                    "<span class=\"video-modal-side-name\">" + escapeHtml(item.title) + "</span>" +
                    "<span class=\"video-modal-side-meta\">" + escapeHtml([item.duration, item.speaker].filter(Boolean).join(" / ")) + "</span>" +
                    "<span class=\"video-modal-side-brief\">" + escapeHtml(item.summary || item.source || mediaUiText.switchVideoHint) + "</span>" +
                    "</span>" +
                    "</span>" +
                    "</button>"
                );
            }).join("")
            : "<div class=\"video-modal-empty\">" + mediaUiText.noAvailableVideos + "</div>";

        state.videoModalNodeId = safeText(rawNodeId, "");
        state.videoModalVideoId = safeText(currentVideo.id, "");
        state.videoModalOpen = true;

        videoPlayerModal.innerHTML =
            "<div class=\"video-modal-backdrop\" data-video-close=\"backdrop\"></div>" +
            "<div class=\"video-modal-dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"video-modal-title\">" +
            "<button type=\"button\" class=\"video-modal-close\" data-video-close=\"button\" aria-label=\"Close\">&times;</button>" +
            "<div class=\"video-modal-shell\">" +
            "<section class=\"video-modal-main\">" +
            "<div class=\"video-modal-kicker\">" + mediaUiText.videoStudy + "</div>" +
            "<h3 id=\"video-modal-title\" class=\"video-modal-title\">" + escapeHtml(currentVideo.title) + "</h3>" +
            (
                metaPills.length
                    ? "<div class=\"video-modal-meta\">" + metaPills.map(function (item) {
                        return "<span class=\"video-modal-pill\">" + escapeHtml(item) + "</span>";
                    }).join("") + "</div>"
                    : ""
            ) +
            tagsHtml +
            "<div class=\"video-modal-stage\">" + renderVideoPlayerStage(currentVideo) + "</div>" +
            "<p class=\"video-modal-summary\">" + escapeHtml(currentVideo.summary || mediaUiText.modalSummaryFallback) + "</p>" +
            actionsHtml +
            "</section>" +
            "<aside class=\"video-modal-side\">" +
            "<div class=\"video-modal-side-title\">" + mediaUiText.sameNodeVideos + "</div>" +
            "<div class=\"video-modal-side-subtitle\">" + escapeHtml(nodeInfo.name || "") + "</div>" +
            "<div class=\"video-modal-side-list\">" + sideListHtml + "</div>" +
            "</aside>" +
            "</div>" +
            "</div>";
        videoPlayerModal.classList.add("active");
    }

    function renderRelationNodeList(items, emptyText) {
        if (!items.length) {
            return "<div class=\"detail-empty\">" + escapeHtml(emptyText) + "</div>";
        }

        return "<div class=\"detail-chip-row\">" + items.map(function (item) {
            return "<button type=\"button\" class=\"detail-link-chip\" data-node-focus=\"" + escapeHtml(item.id) + "\">" + escapeHtml(item.data.name) + "</button>";
        }).join("") + "</div>";
    }

    function renderRelationsTab(nodeDatum, relationSummary) {
        const edgeListHtml = relationSummary.edges.length
            ? "<ul class=\"relation-edge-list\">" + relationSummary.edges.map(function (edge) {
                const sourceNode = state.nodeById.get(edge.source);
                const targetNode = state.nodeById.get(edge.target);
                const label = (sourceNode ? sourceNode.data.name : edge.source) +
                    " → " +
                    (targetNode ? targetNode.data.name : edge.target);
                return (
                    "<li>" +
                    "<button type=\"button\" class=\"relation-edge-button\" data-edge-focus=\"" + escapeHtml(edge.id) + "\">" +
                    "<span class=\"relation-edge-name\">" + escapeHtml(label) + "</span>" +
                    "<span class=\"relation-edge-desc\">" + escapeHtml(edge.data.description || "关系") + "</span>" +
                    "</button>" +
                    "</li>"
                );
            }).join("") + "</ul>"
            : "<div class=\"detail-empty\">当前没有直接关系边</div>";

        return (
            "<section class=\"detail-section\"><h4>父节点</h4>" + renderRelationNodeList(relationSummary.parents, "暂无父节点") + "</section>" +
            "<section class=\"detail-section\"><h4>子节点</h4>" + renderRelationNodeList(relationSummary.children, "暂无子节点") + "</section>" +
            "<section class=\"detail-section\"><h4>相关节点</h4>" + renderRelationNodeList(relationSummary.related, "暂无相关节点") + "</section>" +
            "<section class=\"detail-section\"><h4>直接关系</h4>" + edgeListHtml + "</section>"
        );
    }

    function buildResourceActionItems(detailData) {
        const typeOrder = ["definition", "theorem", "law", "exercise", "example", "note", "other"];
        const items = [{ mode: "overview", filter: "", label: "概览" }];

        typeOrder.forEach(function (typeKey) {
            const count = detailData.textResources.filter(function (item) {
                return item.resourceType === typeKey;
            }).length;
            if (!count) return;
            items.push({
                mode: "text",
                filter: typeKey,
                label: textResourceTypeLabels[typeKey] || "其他",
                count: count,
            });
        });

        if (detailData.videoResources.length) {
            items.push({
                mode: "video",
                filter: "",
                label: "视频",
                count: detailData.videoResources.length,
            });
        }

        items.push({ mode: "relations", filter: "", label: "关系" });
        return items;
    }

    function isResourceActionActive(item) {
        if (state.detailViewMode !== item.mode) {
            return false;
        }
        if (item.mode === "text") {
            return state.detailTextFilter === item.filter;
        }
        return true;
    }

    function renderResourceActionArc(detailData) {
        const actions = buildResourceActionItems(detailData);
        if (!actions.length) return "";

        const total = actions.length;
        const startAngle = 208;
        const endAngle = 332;
        const radius = total > 6 ? 118 : 108;
        const centerX = 158;
        const centerY = 140;

        const buttonsHtml = actions.map(function (item, index) {
            const angle = total === 1
                ? (startAngle + endAngle) / 2
                : startAngle + ((endAngle - startAngle) * index) / (total - 1);
            const radian = angle * Math.PI / 180;
            const left = centerX + Math.cos(radian) * radius;
            const top = centerY + Math.sin(radian) * radius;
            const activeClass = isResourceActionActive(item) ? " active" : "";
            const countHtml = item.count ? "<span class=\"detail-arc-count\">" + escapeHtml(item.count) + "</span>" : "";

            return (
                "<button type=\"button\" class=\"detail-arc-btn" + activeClass + "\" " +
                "style=\"left:" + left.toFixed(2) + "px;top:" + top.toFixed(2) + "px;\" " +
                "data-panel-mode=\"" + escapeHtml(item.mode) + "\" " +
                (item.filter ? "data-panel-filter=\"" + escapeHtml(item.filter) + "\" " : "") +
                "title=\"" + escapeHtml(item.label) + "\">" +
                "<span class=\"detail-arc-label\">" + escapeHtml(item.label) + "</span>" +
                countHtml +
                "</button>"
            );
        }).join("");

        return "<div class=\"detail-action-arc\">" + buttonsHtml + "</div>";
    }

    function getCurrentPanelTitle() {
        if (state.detailViewMode === "text") {
            return textResourceTypeLabels[state.detailTextFilter] || "文本资源";
        }
        if (state.detailViewMode === "video") return "视频资源";
        if (state.detailViewMode === "relations") return "关系导航";
        return "知识点概览";
    }

    function renderRightDetailPanel(nodeDatum, detailData) {
        if (!rightControlContainer) return;

        const nodeInfo = detailData.node;
        const relationSummary = getNodeRelationSummary(nodeDatum);
        const headerMeta = [nodeInfo.modulePath, nodeInfo.difficulty, nodeInfo.stage].filter(Boolean);
        let bodyHtml = "";

        if (state.detailViewMode === "text") {
            bodyHtml = renderTextResourcesTab(detailData);
        } else if (state.detailViewMode === "video") {
            bodyHtml = renderVideoResourcesTab(detailData);
        } else if (state.detailViewMode === "relations") {
            bodyHtml = renderRelationsTab(nodeDatum, relationSummary);
        } else {
            bodyHtml = renderOverviewTab(nodeDatum, detailData, relationSummary);
        }

        rightControlContainer.innerHTML =
            "<div class=\"resource-side-panel active\">" +
            "<div class=\"resource-side-panel-inner\">" +
            "<div class=\"resource-side-header\">" +
            "<div class=\"resource-side-kicker\">节点资源面板</div>" +
            "<h3 class=\"resource-side-title\">" + escapeHtml(nodeInfo.name || nodeDatum.data.name) + "</h3>" +
            (headerMeta.length
                ? "<div class=\"resource-side-meta\">" + headerMeta.map(function (item) {
                    return "<span class=\"detail-pill detail-pill-soft\">" + escapeHtml(item) + "</span>";
                }).join("") + "</div>"
                : ""
            ) +
            "<div class=\"resource-side-current\">" + escapeHtml(getCurrentPanelTitle()) + "</div>" +
            "</div>" +
            "<div class=\"resource-side-body\">" +
            (state.detailLoading ? "<div class=\"detail-loading\">正在同步该知识点的详细资源...</div>" : "") +
            bodyHtml +
            "</div>" +
            "</div>" +
            "</div>";

        state.detailSidePanelOpen = true;
    }

    function clearRightDetailPanel() {
        state.detailSidePanelOpen = false;
        if (rightControlContainer) {
            rightControlContainer.innerHTML = "";
        }
    }

    function renderNodeDetailContent(nodeDatum, detailData) {
        if (!detailTitle || !detailContent) return;

        const nodeInfo = detailData.node;
        const relationSummary = getNodeRelationSummary(nodeDatum);
        const exerciseCount = detailData.textResources.filter(function (item) {
            return item.resourceType === "exercise";
        }).length;
        const metaParts = [nodeInfo.modulePath, nodeInfo.difficulty, nodeInfo.stage].filter(Boolean);
        const statHtml = [
            renderStatItem("文本", detailData.textResources.length),
            renderStatItem("视频", detailData.videoResources.length),
            renderStatItem("习题", exerciseCount),
            renderStatItem("后继", relationSummary.children.length),
        ].join("");

        const summary = nodeInfo.summary || nodeInfo.description || nodeDatum.data.details || "暂无知识点简介";
        const actionArcHtml = renderResourceActionArc(detailData);

        detailTitle.textContent = nodeInfo.name || nodeDatum.data.name;
        detailTitle.setAttribute("title", nodeInfo.name || nodeDatum.data.name);

        detailContent.innerHTML =
            "<div class=\"detail-panel\">" +
            (
                metaParts.length || nodeInfo.tags.length
                    ? "<div class=\"detail-meta-row\">" +
                    metaParts.map(function (item) {
                        return "<span class=\"detail-pill\">" + escapeHtml(item) + "</span>";
                    }).join("") +
                    nodeInfo.tags.map(function (item) {
                        return "<span class=\"detail-pill detail-pill-soft\">" + escapeHtml(item) + "</span>";
                    }).join("") +
                    "</div>"
                    : ""
            ) +
            "<div class=\"detail-stats-row\">" + statHtml + "</div>" +
            "<div class=\"detail-tabs-row\">" + tabHtml + "</div>" +
            (state.detailLoading ? "<div class=\"detail-loading\">正在加载该知识点的资源信息...</div>" : "") +
            "<div class=\"detail-body\">" + bodyHtml + "</div>" +
            "</div>";
    }

    function renderNodeDetailUi(nodeDatum, detailData) {
        if (!detailTitle || !detailContent) return;

        const nodeInfo = detailData.node;
        const relationSummary = getNodeRelationSummary(nodeDatum);
        const exerciseCount = detailData.textResources.filter(function (item) {
            return item.resourceType === "exercise";
        }).length;
        const metaParts = [nodeInfo.modulePath, nodeInfo.difficulty, nodeInfo.stage].filter(Boolean);
        const statHtml = [
            renderStatItem("文本", detailData.textResources.length),
            renderStatItem("视频", detailData.videoResources.length),
            renderStatItem("习题", exerciseCount),
            renderStatItem("后继", relationSummary.children.length),
        ].join("");
        const summary = nodeInfo.summary || nodeInfo.description || nodeDatum.data.details || "暂无知识点简介";
        const actionArcHtml = renderResourceActionArc(detailData);

        detailTitle.textContent = nodeInfo.name || nodeDatum.data.name;
        detailTitle.setAttribute("title", nodeInfo.name || nodeDatum.data.name);

        detailContent.innerHTML =
            "<div class=\"detail-panel detail-panel-compact\">" +
            (
                metaParts.length || nodeInfo.tags.length
                    ? "<div class=\"detail-meta-row\">" +
                    metaParts.map(function (item) {
                        return "<span class=\"detail-pill\">" + escapeHtml(item) + "</span>";
                    }).join("") +
                    nodeInfo.tags.map(function (item) {
                        return "<span class=\"detail-pill detail-pill-soft\">" + escapeHtml(item) + "</span>";
                    }).join("") +
                    "</div>"
                    : ""
            ) +
            "<div class=\"detail-stats-row\">" + statHtml + "</div>" +
            "<section class=\"detail-section detail-summary-section\">" +
            "<h4>核心摘要</h4>" +
            "<p class=\"detail-paragraph\">" + escapeHtml(truncateText(summary, 120) || "暂无知识点简介") + "</p>" +
            "<div class=\"detail-summary-tip\">点击下方弧形按钮，在右侧资源面板中查看详细内容。</div>" +
            "</section>" +
            actionArcHtml +
            "</div>";

        renderRightDetailPanel(nodeDatum, detailData);
    }

    async function loadNodeDetailContent(nodeDatum) {
        const requestToken = state.detailRequestToken + 1;
        state.detailRequestToken = requestToken;
        state.detailLoading = !state.detailCache.has(String(nodeDatum.data.rawId));
        renderNodeDetailUi(nodeDatum, state.detailCache.get(String(nodeDatum.data.rawId)) || buildFallbackNodeDetail(nodeDatum));

        const detailData = await fetchNodeDetailData(nodeDatum);
        if (requestToken !== state.detailRequestToken) {
            return;
        }
        if (String(state.detailNodeId) !== String(nodeDatum.data.rawId)) {
            return;
        }

        state.detailLoading = false;
        renderNodeDetailUi(nodeDatum, detailData);
    }

    function openNodeDetail(nodeId, keepOpen) {
        const nodeDatum = state.nodeById.get(String(nodeId));
        if (!nodeDatum || !nodeContainer || !detailTitle || !detailContent) return;

        const detailNodeId = String(nodeDatum.data.rawId);
        const sameNodeOpen = state.detailNodeId === detailNodeId && nodeContainer.classList.contains("active");
        if (sameNodeOpen && !keepOpen) {
            closeNodeDetail(false);
            return;
        }

        if (!sameNodeOpen) {
            state.detailViewMode = "overview";
            state.detailTextFilter = "all";
        }

        state.detailNodeId = detailNodeId;
        state.detailRelationTypes = new Set();
        state.detailSidePanelOpen = true;

        nodeContainer.classList.remove("hide");
        nodeContainer.classList.add("active");

        if (detailEditButton) {
            detailEditButton.setAttribute("title", "你可以在这里继续挂接自定义编辑逻辑");
        }

        renderNodeRelationRings(nodeDatum);
        loadNodeDetailContent(nodeDatum);
        refreshSupplementVisibility();
    }

    function closeNodeDetail(keepFocus) {
        state.detailNodeId = null;
        state.detailRelationTypes = new Set();
        state.detailLoading = false;
        state.detailRequestToken += 1;
        state.detailTextFilter = "all";

        if (nodeContainer) {
            nodeContainer.classList.remove("active");
            nodeContainer.classList.add("hide");
        }
        if (detailContent) detailContent.innerHTML = "";
        if (detailTitle) detailTitle.textContent = "";
        if (circleNameContainer) circleNameContainer.innerHTML = "";
        if (circleActionContainer) circleActionContainer.innerHTML = "";
        clearRightDetailPanel();
        closeVideoPlayer();

        refreshSupplementVisibility();

        if (!keepFocus) {
            state.activeNodeId = null;
            hideNodeEffect();
        }
    }

    function renderNodeRelationRings(nodeDatum) {
        if (!circleNameContainer || !circleActionContainer) return;
        circleNameContainer.innerHTML = "";
        circleActionContainer.innerHTML = "";

        const meta = nodeMetaById.get(String(nodeDatum.data.rawId));
        if (!meta || !Array.isArray(meta.relations) || !meta.relations.length) return;

        const namesList = document.createElement("ul");
        namesList.className = "circle-name-list";
        const actionList = document.createElement("ul");
        actionList.className = "circle-list";

        const total = meta.relations.length;
        const step = 90 / total;
        const nameStart = 90 - 90 / (total * 2);
        const labelRotate = 90 / (total * 2) - 2.46;

        meta.relations.forEach(function (relationType, index) {
            const titleText = meta.title[index] || relationCategoryLabels[relationType] || relationType;
            const angle = nameStart - step * index;

            const titleItem = document.createElement("li");
            titleItem.className = "circle-item circle-3-" + index;
            titleItem.setAttribute("data-id", relationType);
            titleItem.style.transform = "rotate(-" + angle + "deg)";
            titleItem.style.display = "none";

            const titleSpan = document.createElement("span");
            titleSpan.className = "title";
            titleSpan.textContent = titleText;
            titleItem.appendChild(titleSpan);
            namesList.appendChild(titleItem);

            const actionItem = document.createElement("li");
            actionItem.className = "circle-item circle-2-" + index;
            actionItem.setAttribute("data-id", relationType);
            actionItem.style.transform = "rotate(-" + (90 - step * index) + "deg)";

            const actionSpan = document.createElement("span");
            actionSpan.className = "title " + relationType;
            actionSpan.style.transform = "rotate(" + labelRotate + "deg)";
            actionItem.appendChild(actionSpan);
            actionList.appendChild(actionItem);

            actionItem.addEventListener("mouseover", function () {
                titleItem.style.display = "list-item";
            });

            actionItem.addEventListener("mouseout", function () {
                titleItem.style.display = "none";
            });

            actionItem.addEventListener("click", function () {
                suppressCanvasClear(260);
                const selected = actionItem.classList.toggle("selected");
                if (selected) state.detailRelationTypes.add(relationType);
                else state.detailRelationTypes.delete(relationType);
                refreshSupplementVisibility();
            });
        });

        circleNameContainer.appendChild(namesList);
        circleActionContainer.appendChild(actionList);
    }

    function rerenderActiveNodeDetail() {
        if (!state.detailNodeId) return;
        const nodeDatum = getNodeDatumByRawId(state.detailNodeId);
        if (!nodeDatum) return;
        renderNodeDetailUi(
            nodeDatum,
            state.detailCache.get(String(nodeDatum.data.rawId)) || buildFallbackNodeDetail(nodeDatum)
        );
    }

    function handleDetailContentClick(event) {
        const target = event && event.target;
        if (!target || !target.closest) return;

        shieldPanelEvent(event);

        const practiceTarget = target.closest("[data-practice-route]");
        if (practiceTarget) {
            const practiceRoute = safeText(
                practiceTarget.getAttribute("data-practice-route") || practiceTarget.getAttribute("href"),
                ""
            ).trim();
            if (practiceRoute) {
                event.preventDefault();
                window.location.href = practiceRoute;
            }
            return;
        }

        const videoTarget = target.closest("[data-video-open]");
        if (videoTarget) {
            const videoId = safeText(videoTarget.getAttribute("data-video-open"), "").trim();
            const nodeId = safeText(
                videoTarget.getAttribute("data-video-node") || state.detailNodeId,
                ""
            ).trim();
            if (videoId && nodeId) {
                event.preventDefault();
                openVideoPlayer(nodeId, videoId);
            }
            return;
        }

        const panelModeButton = target.closest("[data-panel-mode]");
        if (panelModeButton) {
            event.preventDefault();
            state.detailViewMode = safeText(panelModeButton.getAttribute("data-panel-mode"), "overview");
            if (state.detailViewMode === "text") {
                state.detailTextFilter = safeText(panelModeButton.getAttribute("data-panel-filter"), "all");
            }
            rerenderActiveNodeDetail();
            return;
        }

        const tabButton = target.closest("[data-detail-tab]");
        if (tabButton) {
            event.preventDefault();
            state.detailViewMode = safeText(tabButton.getAttribute("data-detail-tab"), "overview");
            rerenderActiveNodeDetail();
            return;
        }

        const filterButton = target.closest("[data-text-filter]");
        if (filterButton) {
            event.preventDefault();
            state.detailViewMode = "text";
            state.detailTextFilter = safeText(filterButton.getAttribute("data-text-filter"), "all");
            rerenderActiveNodeDetail();
            return;
        }

        const nodeButton = target.closest("[data-node-focus]");
        if (nodeButton) {
            event.preventDefault();
            const nodeId = safeText(nodeButton.getAttribute("data-node-focus"), "");
            if (nodeId) {
                handleNodeSelect(nodeId, true);
            }
            return;
        }

        const edgeButton = target.closest("[data-edge-focus]");
        if (edgeButton) {
            event.preventDefault();
            const edgeId = safeText(edgeButton.getAttribute("data-edge-focus"), "");
            if (edgeId) {
                activateRelation(edgeId, { keepInput: true });
            }
        }
    }

    async function clearTransientUi(options) {
        const settings = options || {};
        ensureRelationPopupRemoved();
        hideSuggestions();
        stopAutoplay();
        hideNodeEffect();
        setRelationListActive(-1);
        state.activeRelationId = null;

        closeNodeDetail(true);
        await applyBaseVisibility();
        await clearSpotlight();

        if (settings.clearInput && searchInput) {
            searchInput.value = "";
        }
    }

    function renderSuggestions(query) {
        if (!suggestionList) return;
        const keyword = safeText(query, "").trim().toLowerCase();
        suggestionList.innerHTML = "";

        if (!keyword) {
            suggestionList.style.display = "none";
            return;
        }

        const matches = state.nameEntries
            .filter(function (entry) { return entry.lowered.includes(keyword); })
            .slice(0, 8);

        if (!matches.length) {
            const li = document.createElement("li");
            li.className = "no-sug-result";
            li.textContent = "没有找到相关节点";
            suggestionList.appendChild(li);
            suggestionList.style.display = "block";
            return;
        }

        matches.forEach(function (entry) {
            const li = document.createElement("li");
            li.textContent = entry.name;
            li.addEventListener("click", function (event) {
                event.stopPropagation();
                searchInput.value = entry.name;
                suggestionList.style.display = "none";
                runSearch();
            });
            suggestionList.appendChild(li);
        });

        suggestionList.style.display = "block";
    }

    function hideSuggestions() {
        if (!suggestionList) return;
        suggestionList.innerHTML = "";
        suggestionList.style.display = "none";
    }

    async function runSearch() {
        if (!searchInput) return;
        const rawValue = safeText(searchInput.value, "").trim();
        if (!rawValue) {
            await clearTransientUi({ clearInput: false });
            return;
        }

        stopAutoplay();
        hideNodeEffect();
        hideSuggestions();
        const parts = rawValue
            .split(/[,\s，]+/)
            .map(function (item) { return item.trim(); })
            .filter(Boolean);

        if (parts.length <= 1) {
            const match = findNodeByName(parts[0] || rawValue);
            if (!match) {
                renderSuggestions(rawValue);
                return;
            }
            await handleNodeSelect(match.id, true);
            return;
        }

        const first = findNodeByName(parts[0]);
        const second = findNodeByName(parts[1]);

        if (!first || !second) {
            renderSuggestions(rawValue);
            return;
        }

        let paths = findPaths(first.id, second.id, 12);
        if (!paths.length) {
            paths = findPaths(second.id, first.id, 12);
        }

        if (!paths.length) {
            await ensureNodesExpanded([first.id, second.id]);
            await revealInteractionElements([first.id, second.id], []);
            await applySpotlight([first.id, second.id], [], "highlight", false);
            await focusElements([first.id, second.id], 450);
            return;
        }

        const nodeIds = new Set();
        const edgeIds = new Set();

        paths.forEach(function (path) {
            path.forEach(function (id) { nodeIds.add(id); });
            collectEdgeIdsForPath(path).forEach(function (id) { edgeIds.add(id); });
        });

        await ensureNodesExpanded(Array.from(nodeIds));
        await revealInteractionElements(Array.from(nodeIds), Array.from(edgeIds));
        await applySpotlight(Array.from(nodeIds), Array.from(edgeIds), "path", true);
        await focusElements(Array.from(nodeIds), 550);
    }

    function startAutoplay() {
        if (state.autoplayTimer) return;
        if (!getVisibleRelationEdges().length) return;

        if (videoAutoPlay) {
            videoAutoPlay.classList.add("play");
        }
        setRelationMenuOpen(true);

        const tick = function () {
            const visibleEdges = getVisibleRelationEdges();
            if (!visibleEdges.length) return;
            if (state.autoplayIndex >= visibleEdges.length) {
                state.autoplayIndex = 0;
            }
            activateRelation(visibleEdges[state.autoplayIndex].id, { keepInput: true, fromAutoplay: true });
            state.autoplayIndex += 1;
        };

        tick();
        state.autoplayTimer = window.setInterval(tick, 3000);
    }

    function stopAutoplay() {
        if (!state.autoplayTimer) {
            if (videoAutoPlay) videoAutoPlay.classList.remove("play");
            return;
        }
        window.clearInterval(state.autoplayTimer);
        state.autoplayTimer = null;
        if (videoAutoPlay) {
            videoAutoPlay.classList.remove("play");
        }
    }

    async function initialize() {
        const payload = await loadGraphPayload();
        const graphData = buildGraphData(payload.nodes || [], payload.links || []);
        state.nodes = graphData.nodes;
        state.edges = graphData.edges;
        state.treeRootId = graphData.tree.rootId;
        state.treeParentById = graphData.tree.parentMap;
        state.treeChildrenById = graphData.tree.treeChildren;
        state.treeDepthById = graphData.tree.depthMap;
        buildTreeDescendantCache();

        rebuildLookups();
        initializeCollapsedState();
        refreshCollapsedElements();
        refreshNodePositions();
        createGraph();
        await renderGraph();
        renderRelationList();

        setRelationMenuOpen(Boolean(getVisibleRelationEdges().length));
        if (playAutoButton) {
            playAutoButton.classList.toggle("disable", !getVisibleRelationEdges().length);
        }

        if (detailSearchButton) {
            detailSearchButton.addEventListener("click", function () {
                if (!state.detailNodeId || !searchInput) return;
                const nodeDatum = state.nodeById.get(String(state.detailNodeId));
                if (nodeDatum) {
                    searchInput.value = nodeDatum.data.name;
                    runSearch();
                }
            });
        }

        if (detailEditButton) {
            detailEditButton.addEventListener("click", function () {
                if (state.detailNodeId) {
                    console.log("edit hook reserved for node", state.detailNodeId);
                }
            });
        }

        if (detailContent) {
            detailContent.addEventListener("click", handleDetailContentClick);
        }

        if (rightControlContainer) {
            rightControlContainer.addEventListener("click", handleDetailContentClick);
        }

        if (videoPlayerModal) {
            videoPlayerModal.addEventListener("click", handleVideoModalClick);
            ["pointerdown", "mousedown"].forEach(function (eventName) {
                videoPlayerModal.addEventListener(eventName, shieldPanelEvent);
            });
        }

        if (graphContainer) {
            graphContainer.addEventListener("contextmenu", function (event) {
                event.preventDefault();
            });
        }

        [nodeDetailContainer, nodeContainer, rightControlContainer].forEach(function (element) {
            if (!element) return;
            ["pointerdown", "mousedown", "click"].forEach(function (eventName) {
                element.addEventListener(eventName, shieldPanelEvent);
            });
        });

        if (searchInput) {
            searchInput.addEventListener("input", function () {
                renderSuggestions(searchInput.value);
            });
            searchInput.addEventListener("keyup", function (event) {
                if (event.key === "Enter") {
                    runSearch();
                }
            });
        }

        if (searchIcon) {
            searchIcon.addEventListener("click", runSearch);
        }

        if (playAutoButton) {
            playAutoButton.addEventListener("click", function (event) {
                event.stopPropagation();
                setRelationMenuOpen(true);
                if (state.autoplayTimer) stopAutoplay();
                else startAutoplay();
            });
        }

        document.body.addEventListener("click", function (event) {
            const insideSearch = event.target && event.target.closest && event.target.closest("#relation-search-box");
            const insideRelation = event.target && event.target.closest && event.target.closest(".netLinkInfo-box");
            const insideList = event.target && event.target.closest && event.target.closest("#relationlist-container");
            const insideDetail = event.target && event.target.closest && event.target.closest("#node-detail-container");
            const insideRightPanel = event.target && event.target.closest && event.target.closest("#right-control-container");
            const insideVideoModal = event.target && event.target.closest && event.target.closest("#video-player-modal");
            const insideGraph = event.target && event.target.closest && event.target.closest("#graph");

            if (!insideSearch) hideSuggestions();
            if (!insideRelation && !insideList && !insideDetail && !insideRightPanel && !insideVideoModal && !insideGraph) {
                clearTransientUi({ clearInput: false });
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && state.videoModalOpen) {
                closeVideoPlayer();
            }
        });

        window.addEventListener("resize", function () {
            if (!state.graph) return;
            const viewport = getGraphViewportSize();
            refreshNodePositions();
            if (typeof state.graph.resize === "function") {
                state.graph.resize(viewport.width, viewport.height);
            }
            if (typeof state.graph.setData === "function") {
                state.graph.setData({
                    nodes: getRenderableNodes(),
                    edges: getRenderableEdges(),
                });
            }
            renderGraph().catch(function () {});
        });

    }

    initialize().catch(function (error) {
        console.error("G6 graph initialization failed:", error);
        graphContainer.innerHTML = "<div style=\"padding:24px;color:#fff;font-size:14px;\">G6 图谱加载失败，请打开控制台查看错误。</div>";
    });
})();
