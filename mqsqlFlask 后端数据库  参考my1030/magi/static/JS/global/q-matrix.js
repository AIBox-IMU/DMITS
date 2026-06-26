(function () {
    var common = window.IntelligenceCommon;
    if (!common) return;

    function buildBadge(text, level) {
        return '<span class="ai-inline-badge ' + common.riskBadgeClass(level) + '">' + common.escapeHtml(text) + '</span>';
    }

    function renderHeatmap(headContainer, bodyContainer, knowledgePoints, rows) {
        if (!headContainer || !bodyContainer) return;
        headContainer.innerHTML = '<tr><th>习题 / 知识点</th>'
            + common.safeList(knowledgePoints).map(function (point) {
                return '<th>' + common.escapeHtml(point.name) + '</th>';
            }).join("")
            + '</tr>';

        bodyContainer.innerHTML = common.safeList(rows).map(function (row) {
            return '<tr>'
                + '<td><strong>' + common.escapeHtml(row.title) + '</strong><div class="ai-mini-meta">' + common.escapeHtml(row.difficulty) + ' · ' + common.escapeHtml(row.source) + '</div></td>'
                + common.safeList(row.values).map(function (value) {
                    return '<td class="q-cell"><span class="q-cell-level lv' + Number(value || 0) + '">' + Number(value || 0) + '</span></td>';
                }).join("")
                + '</tr>';
        }).join("");
    }

    function renderKnowledgeList(container, items) {
        if (!container) return;
        container.innerHTML = common.safeList(items).map(function (item) {
            return ''
                + '<article class="q-knowledge-item">'
                + '<div class="q-knowledge-head">'
                + '<div class="q-knowledge-title">' + common.escapeHtml(item.name) + '</div>'
                + buildBadge(common.toPercent(item.coverage_rate), item.coverage < 2 ? "warning" : "success")
                + '</div>'
                + '<div class="q-knowledge-meta">当前被 ' + common.escapeHtml(item.coverage) + ' 道习题覆盖。覆盖率越高，后续诊断与推荐模型越稳定。</div>'
                + '<div class="ai-progress ' + common.progressTone(item.coverage_rate) + '"><span style="width:' + common.toPercent(item.coverage_rate) + '"></span></div>'
                + '</article>';
        }).join("");
    }

    function renderCandidates(container, items) {
        if (!container) return;
        container.innerHTML = common.safeList(items).map(function (item) {
            return ''
                + '<article class="q-candidate-item">'
                + '<div class="q-candidate-head">'
                + '<div class="q-candidate-title">' + common.escapeHtml(item.exercise_title) + '</div>'
                + buildBadge(item.status === "recommended" ? "建议保留" : item.status === "review" ? "待复核" : "弱关联", item.status)
                + '</div>'
                + '<div class="q-candidate-meta">候选知识点：' + common.escapeHtml(item.knowledge_name) + '</div>'
                + '<div class="q-candidate-meta">' + common.escapeHtml(item.reason) + '</div>'
                + '<div class="q-confidence"><strong>置信度 ' + common.toPercent(item.confidence) + '</strong><div class="ai-progress ' + common.progressTone(item.confidence) + '"><span style="width:' + common.toPercent(item.confidence) + '"></span></div></div>'
                + '</article>';
        }).join("");
    }

    function renderRules(container, items) {
        if (!container) return;
        container.innerHTML = common.safeList(items).map(function (item) {
            return ''
                + '<article class="q-rule-item">'
                + '<div class="q-rule-head">'
                + '<div class="q-rule-title">' + common.escapeHtml(item.title) + '</div>'
                + buildBadge(item.status === "pass" ? "通过" : item.status === "warn" ? "提醒" : "待处理", item.status)
                + '</div>'
                + '<div class="q-rule-meta">' + common.escapeHtml(item.detail) + '</div>'
                + '</article>';
        }).join("");
    }

    document.addEventListener("DOMContentLoaded", async function () {
        try {
            var payload = await common.fetchPayload("/api/q-matrix");
            var stats = payload.stats || {};
            common.byId("q-exercise-count").textContent = stats.exercise_count || 0;
            common.byId("q-knowledge-count").textContent = stats.knowledge_count || 0;
            common.byId("q-density").textContent = common.toPercent(stats.density);
            common.byId("q-avg-links").textContent = stats.avg_links || 0;
            common.byId("q-stats-grid").innerHTML = ''
                + '<div class="ai-metric-card"><span class="ai-metric-label">待人工复核</span><span class="ai-metric-value">' + common.escapeHtml(stats.review_count || 0) + '</span><span class="ai-metric-footnote">优先检查低置信候选关系</span></div>'
                + '<div class="ai-metric-card"><span class="ai-metric-label">未覆盖知识点</span><span class="ai-metric-value">' + common.escapeHtml(stats.uncovered_count || 0) + '</span><span class="ai-metric-footnote">建议补题扩充矩阵稳定性</span></div>';

            renderHeatmap(common.byId("q-heatmap-head"), common.byId("q-heatmap-body"), payload.knowledge_points, payload.matrix_rows);
            renderKnowledgeList(common.byId("q-knowledge-list"), payload.knowledge_points);
            renderCandidates(common.byId("q-candidate-list"), payload.candidates);
            renderRules(common.byId("q-rule-list"), payload.rules);
            // common.byId("q-integration-note").innerHTML = '<strong>接口说明：</strong>' + common.escapeHtml(payload.integration && payload.integration.replace_hint ? payload.integration.replace_hint : "后端模型接口待接入。");
        } catch (error) {
            common.byId("q-page-root").innerHTML = '<div class="ai-card"><div class="ai-empty">Q 矩阵页面加载失败：' + common.escapeHtml(error.message || "unknown error") + "</div></div>";
        }
    });
})();
