(function () {
    var common = window.IntelligenceCommon;
    var config = window.MODEL_WORKBENCH_CONFIG || {};

    function byId(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return common ? common.escapeHtml(value) : String(value || "");
    }

    function safeList(value) {
        return Array.isArray(value) ? value : [];
    }

    function safeText(value, fallback) {
        if (value === undefined || value === null || value === "") {
            return fallback || "";
        }
        return String(value);
    }

    function toneBadgeClass(level) {
        if (level === "high" || level === "danger") return " is-danger";
        if (level === "medium" || level === "warning") return " is-warning";
        return "";
    }

    function renderEmpty(targetId, message) {
        var target = byId(targetId);
        if (!target) return;
        target.innerHTML = '<div class="ai-empty">' + escapeHtml(message) + '</div>';
    }

    function renderMetrics(payload) {
        var target = byId("model-metric-grid");
        if (!target) return;
        var metrics = safeList(payload.overview_metrics);
        if (!metrics.length) {
            target.innerHTML = "";
            return;
        }

        target.innerHTML = metrics.map(function (item) {
            return ''
                + '<div class="model-metric-item">'
                + '<strong>' + escapeHtml(item.label) + '</strong>'
                + '<span>' + escapeHtml(item.value) + '</span>'
                + '<small>' + escapeHtml(item.footnote) + '</small>'
                + '</div>';
        }).join("");
    }

    function renderSummary(payload) {
        var target = byId("model-summary-panel");
        if (!target) return;

        var upload = payload.upload || {};
        var integration = payload.integration || {};
        var chips = [
            '处理模式：' + safeText(payload.mode, "unknown"),
            upload.filename ? ('文件：' + upload.filename) : '文件：未上传',
            integration.endpoint ? ('接口：' + integration.endpoint) : '接口：已接通'
        ];

        target.innerHTML = ''
            + '<div class="model-summary-card">'
            + '<h3>' + escapeHtml(payload.headline || config.title || "模型结果") + '</h3>'
            + '<p>' + escapeHtml(payload.summary || "已完成处理。") + '</p>'
            + '</div>'
            + '<div class="model-chip-row">' + chips.map(function (chip) {
                return '<span class="model-chip">' + escapeHtml(chip) + '</span>';
            }).join("") + '</div>'
            + '<div class="model-note-card">'
            + '<h3>集成说明</h3>'
            + '<p>' + escapeHtml(integration.replace_hint || "后续可将当前演示逻辑替换为真实模型输出。") + '</p>'
            + (upload.note ? '<p class="model-muted">上传解析：' + escapeHtml(upload.note) + '</p>' : '')
            + '</div>';
    }

    function renderEntityResult(payload) {
        var primary = byId("model-primary-panel");
        var secondary = byId("model-secondary-panel");
        var tertiary = byId("model-tertiary-panel");

        primary.innerHTML = '<div class="model-result-list">' + safeList(payload.entities).map(function (entity) {
            return ''
                + '<div class="model-entity-row">'
                + '<div class="model-entity-head">'
                + '<strong>' + escapeHtml(entity.name) + '</strong>'
                + '<span class="model-inline-badge">' + escapeHtml(entity.confidence + "%") + '</span>'
                + '</div>'
                // + '<p>类型：' + escapeHtml(entity.type) + '</p>'
                // + '<p>推荐上位词：' + escapeHtml(entity.hypernym) + '</p>'
                + '<p>证据片段：' + escapeHtml(entity.evidence) + '</p>'
                + '</div>';
        }).join("") + '</div>';

        secondary.innerHTML = '<div class="model-note-stack">' + safeList(payload.groups).map(function (group) {
            return ''
                + '<div class="model-note-card">'
                + '<h3>' + escapeHtml(group.title) + '</h3>'
                + '<div class="model-tag-cloud">' + safeList(group.items).map(function (item) {
                    return '<span class="model-chip">' + escapeHtml(item) + '</span>';
                }).join("") + '</div>'
                + '</div>';
        }).join("") + '</div>';

        tertiary.innerHTML = '<div class="model-note-stack">' + safeList(payload.suggestions).map(function (item) {
            return '<div class="model-note-card"><p>' + escapeHtml(item) + '</p></div>';
        }).join("") + '</div>';
    }

    function renderHypernymResult(payload) {
        var primary = byId("model-primary-panel");
        var secondary = byId("model-secondary-panel");
        var tertiary = byId("model-tertiary-panel");

        primary.innerHTML = '<div class="model-result-list">' + safeList(payload.recommendations).map(function (item) {
            return ''
                + '<div class="model-result-card">'
                + '<h3>' + escapeHtml(item.term) + '</h3>'
                + '<p>推荐上位词：' + escapeHtml(item.hypernym) + '</p>'
                + '<p>置信度：' + escapeHtml(item.confidence + "%") + '</p>'
                + '<p>' + escapeHtml(item.reason) + '</p>'
                + '</div>';
        }).join("") + '</div>';

        var treeChildren = safeList(payload.tree && payload.tree.children);
        secondary.innerHTML = '<div class="model-tree">' + treeChildren.map(function (node) {
            return ''
                + '<div class="model-tree-node">'
                + '<strong>' + escapeHtml(node.name) + '</strong>'
                + '<div class="model-tree-children">' + safeList(node.children).map(function (leaf) {
                    return '<span class="model-tree-leaf">' + escapeHtml(leaf.name) + '</span>';
                }).join("") + '</div>'
                + '</div>';
        }).join("") + '</div>';

        tertiary.innerHTML = '<div class="model-note-stack">' + safeList(payload.suggestions).map(function (item) {
            return '<div class="model-note-card"><p>' + escapeHtml(item) + '</p></div>';
        }).join("") + '</div>';
    }

    function renderTaggingResult(payload) {
        var primary = byId("model-primary-panel");
        var secondary = byId("model-secondary-panel");
        var tertiary = byId("model-tertiary-panel");

        primary.innerHTML = '<div class="model-result-list">' + safeList(payload.tags).map(function (tag) {
            return ''
                + '<div class="model-result-card">'
                + '<h3>' + escapeHtml(tag.name) + '</h3>'
                + '<p>置信度：' + escapeHtml(tag.confidence + "%") + '</p>'
                + '<p>' + escapeHtml(tag.reason) + '</p>'
                + '</div>';
        }).join("") + '</div>';

        secondary.innerHTML = '<div class="model-result-list">' + safeList(payload.blocks).map(function (block) {
            return ''
                + '<div class="model-block-row">'
                + '<div class="model-block-head"><strong>' + escapeHtml(block.title) + '</strong></div>'
                + '<p>' + escapeHtml(block.summary) + '</p>'
                + '<div class="model-tag-cloud">' + safeList(block.tags).map(function (tag) {
                    return '<span class="model-chip">' + escapeHtml(tag.name + " " + tag.confidence + "%") + '</span>';
                }).join("") + '</div>'
                + '</div>';
        }).join("") + '</div>';

        tertiary.innerHTML = payload.upload && payload.upload.filename
            ? '<div class="model-note-card"><h3>上传文件</h3><p>' + escapeHtml(payload.upload.filename) + '</p><p class="model-muted">' + escapeHtml(payload.upload.note || "") + '</p></div>'
            : '<div class="ai-empty">当前未上传额外文件。</div>';
    }

    function renderDiagnosisResult(payload) {
        var primary = byId("model-primary-panel");
        var secondary = byId("model-secondary-panel");
        var tertiary = byId("model-tertiary-panel");

        primary.innerHTML = '<div class="model-result-list">' + safeList(payload.risks).map(function (risk) {
            return ''
                + '<div class="model-review-row">'
                + '<div class="model-review-head">'
                + '<strong>' + escapeHtml(risk.title) + '</strong>'
                + '<span class="model-inline-badge' + toneBadgeClass(risk.level) + '">' + escapeHtml(risk.score) + '</span>'
                + '</div>'
                + '<p>风险等级：' + escapeHtml(risk.level) + '</p>'
                + '<p>依据：' + escapeHtml(risk.evidence) + '</p>'
                + '</div>';
        }).join("") + '</div>';

        secondary.innerHTML = '<div class="model-result-list">' + safeList(payload.actions).map(function (action) {
            return ''
                + '<div class="model-action-row">'
                + '<div class="model-action-head"><strong>' + escapeHtml(action.title) + '</strong><span class="model-inline-badge">' + escapeHtml(action.owner) + '</span></div>'
                + '<p>' + escapeHtml(action.detail) + '</p>'
                + '</div>';
        }).join("") + '</div>';

        tertiary.innerHTML = '<div class="model-result-list">' + safeList(payload.breakdown).map(function (item) {
            return ''
                + '<div class="model-result-card">'
                + '<h3>' + escapeHtml(item.name) + '</h3>'
                + '<p>掌握度：' + escapeHtml(item.score + "%") + '</p>'
                + '<p>' + escapeHtml(item.note) + '</p>'
                + '</div>';
        }).join("") + '</div>';
    }

    function renderPathResult(payload) {
        var primary = byId("model-primary-panel");
        var secondary = byId("model-secondary-panel");
        var tertiary = byId("model-tertiary-panel");

        primary.innerHTML = '<div class="model-result-list">' + safeList(payload.steps).map(function (step) {
            return ''
                + '<div class="model-step-row">'
                + '<div class="model-step-head"><strong>' + escapeHtml(step.phase + " · " + step.title) + '</strong></div>'
                + '<p>' + escapeHtml(step.goal) + '</p>'
                + '<div class="model-tag-cloud">' + safeList(step.focus).map(function (focus) {
                    return '<span class="model-chip">' + escapeHtml(focus) + '</span>';
                }).join("") + '</div>'
                + '</div>';
        }).join("") + '</div>';

        secondary.innerHTML = '<div class="model-result-list">' + safeList(payload.branches).map(function (branch) {
            return ''
                + '<div class="model-result-card">'
                + '<h3>' + escapeHtml(branch.title) + '</h3>'
                + '<p>' + escapeHtml(branch.detail) + '</p>'
                + '</div>';
        }).join("") + '</div>';

        tertiary.innerHTML = '<div class="model-note-stack">' + safeList(payload.milestones).map(function (item) {
            return '<div class="model-note-card"><p>' + escapeHtml(item) + '</p></div>';
        }).join("") + '</div>';
    }

    function renderQMatrixResult(payload) {
        var primary = byId("model-primary-panel");
        var secondary = byId("model-secondary-panel");
        var tertiary = byId("model-tertiary-panel");
        var matrix = payload.matrix || {};

        primary.innerHTML = '<div class="model-table-wrap"><table class="model-table">'
            + '<thead><tr><th>习题</th>' + safeList(matrix.columns).map(function (column) {
                return '<th>' + escapeHtml(column) + '</th>';
            }).join("") + '</tr></thead>'
            + '<tbody>' + safeList(matrix.rows).map(function (row) {
                return '<tr><td><strong>' + escapeHtml(row.label) + '</strong><br><span class="model-muted">' + escapeHtml(row.text) + '</span></td>'
                    + safeList(row.cells).map(function (cell) {
                        return '<td><span class="model-cell-level lv' + escapeHtml(cell.value) + '">' + escapeHtml(String(cell.value)) + '</span>'
                            + '<div class="model-muted">' + escapeHtml(cell.confidence + "%") + '</div></td>';
                    }).join("")
                    + '</tr>';
            }).join("") + '</tbody>'
            + '</table></div>';

        secondary.innerHTML = '<div class="model-tag-cloud">' + safeList(payload.knowledge_points).map(function (item) {
            return '<span class="model-chip">' + escapeHtml(item) + '</span>';
        }).join("") + '</div>';

        tertiary.innerHTML = safeList(payload.reviews).length
            ? '<div class="model-result-list">' + safeList(payload.reviews).map(function (item) {
                return '<div class="model-review-row"><div class="model-review-head"><strong>' + escapeHtml(item.title) + '</strong></div><p>' + escapeHtml(item.detail) + '</p></div>';
            }).join("") + '</div>'
            : '<div class="ai-empty">当前没有待复核关系。</div>';
    }

    function renderPayload(payload) {
        renderMetrics(payload);
        renderSummary(payload);

        if (config.key === "entity_recognition") return renderEntityResult(payload);
        if (config.key === "hypernym_recommendation") return renderHypernymResult(payload);
        if (config.key === "resource_tagging") return renderTaggingResult(payload);
        if (config.key === "model_cognitive_diagnosis") return renderDiagnosisResult(payload);
        if (config.key === "model_learning_path") return renderPathResult(payload);
        if (config.key === "model_q_matrix") return renderQMatrixResult(payload);

        renderEmpty("model-primary-panel", "当前页面尚未配置结果渲染器。");
        renderEmpty("model-secondary-panel", "当前页面尚未配置结果渲染器。");
        renderEmpty("model-tertiary-panel", "当前页面尚未配置结果渲染器。");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        var submitButton = byId("model-submit-button");
        var statusNode = byId("model-run-status");
        var form = byId("model-workbench-form");
        if (!form) return;

        submitButton.disabled = true;
        submitButton.textContent = "处理中...";
        if (statusNode) statusNode.textContent = "处理中";

        try {
            var response = await fetch(config.api_url, {
                method: "POST",
                body: new FormData(form),
                credentials: "same-origin"
            });
            var payload = await response.json();
            if (!response.ok) {
                throw new Error(payload && payload.message ? payload.message : "request failed");
            }
            renderPayload(payload.data || {});
            if (statusNode) statusNode.textContent = "调用完成";
        } catch (error) {
            renderEmpty("model-summary-panel", "调用失败：" + (error.message || "unknown error"));
            renderEmpty("model-primary-panel", "当前无法展示结果。");
            renderEmpty("model-secondary-panel", "请检查输入后重试。");
            renderEmpty("model-tertiary-panel", "如果后端已替换为真实模型，也请检查接口可用性。");
            if (statusNode) statusNode.textContent = "调用失败";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = safeText(config.submit_label, "提交");
        }
    }

    function bindForm() {
        var form = byId("model-workbench-form");
        if (!form) return;
        form.addEventListener("submit", handleSubmit);
    }

    bindForm();
})();
