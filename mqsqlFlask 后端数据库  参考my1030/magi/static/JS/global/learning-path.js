(function () {
    var common = window.IntelligenceCommon;
    if (!common) return;

    var state = {
        payload: null,
        graph: null,
        graphNodes: [],
        graphEdges: [],
        selectedNodeId: "",
        stepMap: new Map(),
        pathNodeSet: new Set(),
        pathEdgeSet: new Set()
    };

    function buildBadge(text, level) {
        return '<span class="ai-inline-badge ' + common.riskBadgeClass(level) + '">' + common.escapeHtml(text) + '</span>';
    }

    function byId(id) {
        return common.byId(id);
    }

    function setText(id, value) {
        var element = byId(id);
        if (!element) return;
        element.textContent = value;
    }

    function setHtml(id, value) {
        var element = byId(id);
        if (!element) return;
        element.innerHTML = value;
    }

    function buildGraphData(payload) {
        var graphStage = document.querySelector(".path-graph-stage");
        var width = Math.max(graphStage ? graphStage.clientWidth : 720, 360);
        var height = Math.max(graphStage ? graphStage.clientHeight : 620, 420);
        var rawNodes = common.safeList(payload.graph && payload.graph.nodes);
        var rawEdges = common.safeList(payload.graph && payload.graph.links);
        var pathNodeIds = common.safeList(payload.recommended_path && payload.recommended_path.node_ids).map(String);
        if (!pathNodeIds.length) {
            pathNodeIds = common.safeList(payload.steps).map(function (step) { return String(step.id); });
        }

        var nodeById = new Map(rawNodes.map(function (node) { return [String(node.id), node]; }));
        var edgeByPair = new Map(rawEdges.map(function (edge) {
            return [String(edge.source) + "->" + String(edge.target), edge];
        }));
        var stepById = state.stepMap;

        var count = Math.max(1, pathNodeIds.length);
        var topY = 92;
        var bottomY = Math.max(topY, height - 92);
        var verticalGap = count > 1 ? (bottomY - topY) / (count - 1) : 0;
        var centerX = width / 2;

        var nodes = pathNodeIds.map(function (nodeId, index) {
            var graphNode = nodeById.get(nodeId) || {};
            var step = stepById.get(nodeId) || {};
            var position = {
                x: centerX,
                y: topY + index * verticalGap
            };

            return {
                id: String(nodeId),
                data: {
                    title: step.title || graphNode.name || nodeId,
                    detail: step.detail || graphNode.details || "该知识点正在等待路径推荐说明。",
                    mastery: Number(step.mastery || graphNode.mastery || 0),
                    stepIndex: index + 1,
                    fill: "#123150",
                    stroke: "#f7b955",
                    size: 52
                },
                x: position.x,
                y: position.y,
                style: {
                    x: position.x,
                    y: position.y
                }
            };
        });

        var edges = [];
        for (var index = 0; index < pathNodeIds.length - 1; index += 1) {
            var sourceId = pathNodeIds[index];
            var targetId = pathNodeIds[index + 1];
            var rawEdge = edgeByPair.get(sourceId + "->" + targetId) || {};
            edges.push({
                id: String(rawEdge.id || ("path-edge-" + index)),
                source: String(sourceId),
                target: String(targetId),
                data: {
                    description: rawEdge.description || "下一步",
                    role: "path"
                }
            });
        }

        return {
            width: width,
            height: height,
            nodes: nodes,
            edges: edges
        };
    }

    function renderStepList(steps) {
        var container = byId("path-steps");
        if (!container) return;

        container.innerHTML = common.safeList(steps).map(function (step, index) {
            return ''
                + '<article class="path-step-item" data-node-id="' + common.escapeHtml(step.id) + '">'
                + '<div class="path-step-top">'
                + '<div class="path-step-title"><span class="path-step-index">' + (index + 1) + '</span>' + common.escapeHtml(step.title) + '</div>'
                + buildBadge("目标 " + common.toPercent(step.target_mastery), step.mastery < 60 ? "danger" : step.mastery < 78 ? "warning" : "success")
                + '</div>'
                + '<div class="path-step-body">' + common.escapeHtml(step.detail) + '</div>'
                + '<div class="path-step-body">当前掌握度 ' + common.toPercent(step.mastery) + ' · 预计 ' + common.escapeHtml(step.duration_minutes) + ' 分钟 · ' + common.escapeHtml(step.checkpoint) + '</div>'
                + '</article>';
        }).join("");

        Array.prototype.forEach.call(container.querySelectorAll(".path-step-item"), function (item) {
            item.addEventListener("click", function () {
                focusNode(item.getAttribute("data-node-id"));
            });
        });
    }

    function renderPhases(phases) {
        var container = byId("path-phases");
        if (!container) return;

        container.innerHTML = common.safeList(phases).map(function (phase) {
            return ''
                + '<article class="path-phase-card">'
                + '<h3>' + common.escapeHtml(phase.title) + '</h3>'
                + '<div class="ai-section-subtitle">' + common.escapeHtml(phase.summary) + '</div>'
                + '<ul class="path-node-list">' + common.safeList(phase.node_names).map(function (name) {
                    return '<li>' + common.escapeHtml(name) + '</li>';
                }).join("") + '</ul>'
                + '</article>';
        }).join("");
    }

    function renderAlternatives(items) {
        var container = byId("path-alternatives");
        if (!container) return;

        var html = common.safeList(items).map(function (item) {
            return ''
                + '<article class="path-alt-card">'
                + '<h3>' + common.escapeHtml(item.name) + '</h3>'
                + '<div class="ai-section-subtitle">' + common.escapeHtml(item.reason) + '</div>'
                + '</article>';
        }).join("");

        container.innerHTML = html || '<div class="ai-empty">当前推荐路径已经较集中，暂时没有额外分支需要优先处理。</div>';
    }

    function renderFocusStrip(items) {
        var container = byId("path-focus-strip");
        if (!container) return;

        container.innerHTML = common.safeList(items).map(function (item) {
            return '<span class="ai-pill">' + common.escapeHtml(item.name) + ' · 差距 ' + common.toPercent(item.gap) + '</span>';
        }).join("");
    }

    function updateSelectedPanels(nodeId) {
        state.selectedNodeId = String(nodeId || "");

        var note = byId("path-detail-note");
        var step = state.stepMap.get(state.selectedNodeId);
        if (note) {
            if (step) {
                note.innerHTML = '<strong>当前焦点：</strong>' + common.escapeHtml(step.title) + '。' + common.escapeHtml(step.detail) + ' 当前掌握度 ' + common.toPercent(step.mastery) + '，目标提升到 ' + common.toPercent(step.target_mastery) + '。';
            } else {
                note.innerHTML = '<strong>当前焦点：</strong>可从右侧步骤卡或图谱节点中选择一个阶段，查看路径说明。';
            }
        }

        Array.prototype.forEach.call(document.querySelectorAll(".path-step-item"), function (item) {
            item.classList.toggle("is-active", item.getAttribute("data-node-id") === state.selectedNodeId);
        });

        if (!state.graph || typeof state.graph.setElementState !== "function") return;

        var stateMap = {};
        state.graphNodes.forEach(function (node) {
            var nodeStates = ["path"];
            if (node.id === state.selectedNodeId) nodeStates.push("focus");
            stateMap[node.id] = nodeStates;
        });

        state.graphEdges.forEach(function (edge) {
            stateMap[edge.id] = ["path"];
        });

        state.graph.setElementState(stateMap, false);
    }

    function focusNode(nodeId) {
        if (!nodeId) return;
        updateSelectedPanels(nodeId);

        if (state.graph && typeof state.graph.focusElement === "function") {
            Promise.resolve(state.graph.focusElement(String(nodeId), { duration: 380 })).catch(function () { });
        }
    }

    function createGraph(payload) {
        var graphData = buildGraphData(payload);
        state.graphNodes = graphData.nodes;
        state.graphEdges = graphData.edges;

        if (!window.G6) {
            setHtml("learning-path-graph", '<div class="ai-empty">图谱组件未加载，暂时无法展示推荐路径视图。</div>');
            return;
        }

        state.graph = new window.G6.Graph({
            container: "learning-path-graph",
            width: graphData.width,
            height: graphData.height,
            autoResize: true,
            padding: [56, 60, 56, 60],
            data: {
                nodes: graphData.nodes,
                edges: graphData.edges
            },
            behaviors: ["drag-canvas", "zoom-canvas"],
            node: {
                type: "circle",
                style: {
                    size: function (datum) { return datum.data.size || 38; },
                    fill: function (datum) { return datum.data.fill; },
                    stroke: function (datum) { return datum.data.stroke; },
                    lineWidth: 2,
                    shadowBlur: 16,
                    shadowColor: "rgba(247, 185, 85, 0.22)",
                    label: true,
                    labelText: function (datum) { return datum.data.stepIndex + ". " + datum.data.title; },
                    labelPlacement: "right",
                    labelFill: "#eaf6ff",
                    labelFontSize: 13,
                    labelBackground: true,
                    labelBackgroundFill: "rgba(5, 16, 31, 0.82)",
                    labelBackgroundStroke: "rgba(132,205,255,0.16)",
                    labelBackgroundLineWidth: 1,
                    labelBackgroundRadius: 10,
                    labelPadding: [3, 8],
                    cursor: "pointer"
                },
                state: {
                    focus: {
                        stroke: "#8ae8ff",
                        lineWidth: 3,
                        halo: true,
                        haloStroke: "#8ae8ff",
                        haloLineWidth: 16,
                        haloStrokeOpacity: 0.26
                    },
                    path: {
                        stroke: "#fff2cd",
                        lineWidth: 3,
                        halo: true,
                        haloStroke: "#f7b955",
                        haloLineWidth: 14,
                        haloStrokeOpacity: 0.22
                    }
                }
            },
            edge: {
                type: "line",
                style: {
                    stroke: function (datum) {
                        return datum.data.role === "path" ? "#f7b955" : "rgba(137, 200, 255, 0.28)";
                    },
                    lineWidth: function (datum) {
                        return datum.data.role === "path" ? 2.6 : 1.2;
                    },
                    strokeOpacity: function (datum) {
                        return datum.data.role === "path" ? 0.95 : 0.32;
                    },
                    lineDash: function (datum) {
                        return datum.data.role === "path" ? null : [5, 7];
                    },
                    endArrow: true,
                    label: true,
                    labelText: function (datum) {
                        return datum.data.role === "path" ? (datum.data.description || "包含") : "";
                    },
                    labelFill: "#f8fbff",
                    labelFontSize: 10,
                    labelBackground: true,
                    labelBackgroundFill: "rgba(14, 26, 41, 0.85)",
                    labelBackgroundRadius: 8,
                    labelPadding: [2, 7],
                    cursor: "pointer"
                },
                state: {
                    path: {
                        stroke: "#f7b955",
                        lineWidth: 3,
                        halo: true,
                        haloStroke: "#f7b955",
                        haloLineWidth: 8,
                        haloStrokeOpacity: 0.18
                    }
                }
            }
        });

        state.graph.on(window.G6.NodeEvent ? window.G6.NodeEvent.CLICK : "node:click", function (event) {
            var nodeId = event && event.target ? event.target.id : "";
            if (!nodeId) return;
            focusNode(nodeId);
        });

        Promise.resolve(state.graph.render()).then(function () {
            updateSelectedPanels(
                (payload.recommended_path && payload.recommended_path.target_id)
                || (payload.recommended_path && payload.recommended_path.node_ids && payload.recommended_path.node_ids[payload.recommended_path.node_ids.length - 1])
                || ""
            );

            if (payload.recommended_path && payload.recommended_path.node_ids && payload.recommended_path.node_ids.length && typeof state.graph.focusElement === "function") {
                Promise.resolve(state.graph.focusElement(payload.recommended_path.node_ids, { duration: 420 })).catch(function () { });
            }
        });
    }

    document.addEventListener("DOMContentLoaded", async function () {
        try {
            var payload = await common.fetchPayload("/api/learning-path");
            state.payload = payload;
            state.pathNodeSet = new Set(common.safeList(payload.recommended_path && payload.recommended_path.node_ids).map(String));
            state.pathEdgeSet = new Set(common.safeList(payload.recommended_path && payload.recommended_path.edge_ids).map(String));
            state.stepMap = new Map(common.safeList(payload.steps).map(function (item) { return [String(item.id), item]; }));

            var student = payload.student || {};
            var summary = payload.summary || {};

            setText("path-student-name", common.safeText(student.name, "示例学生"));
            setHtml("path-student-meta",
                '<span class="ai-chip">' + common.escapeHtml(student.class_name || "班级待定") + '</span>'
                + '<span class="ai-chip">' + common.escapeHtml(student.course_name || "课程待定") + '</span>'
                + '<span class="ai-chip">更新 ' + common.escapeHtml(student.last_updated || "--") + '</span>'
            );

            setText("path-focus-target", common.safeText(summary.focus_target, "核心知识点"));
            setText("path-current-mastery", common.toPercent(summary.current_mastery));
            setText("path-target-mastery", common.toPercent(summary.target_mastery));
            setText("path-estimated-minutes", (summary.estimated_minutes || 0) + " min");
            setText("path-expected-gain", "+" + (summary.expected_gain || 0) + "%");

            renderFocusStrip(payload.focus_nodes);
            renderStepList(payload.steps);
            renderPhases(payload.phases);
            renderAlternatives(payload.alternatives);
            setHtml("path-integration-note",
                '<strong>接口说明：</strong>' + common.escapeHtml(
                    payload.integration && payload.integration.replace_hint
                        ? payload.integration.replace_hint
                        : "后端模型接口待接入。"
                )
            );

            createGraph(payload);
        } catch (error) {
            setHtml("path-page-root",
                '<div class="ai-card"><div class="ai-empty">学习路径页面加载失败：'
                + common.escapeHtml(error && error.message ? error.message : "unknown error")
                + "</div></div>"
            );
        }
    });
})();
