(function () {
    var common = window.IntelligenceCommon;
    if (!common) return;

    function buildBadge(text, level) {
        return '<span class="ai-inline-badge ' + common.riskBadgeClass(level) + '">' + common.escapeHtml(text) + '</span>';
    }

    function renderRadar(container, data) {
        if (!container) return;
        var items = common.safeList(data).slice(0, 6);
        if (!items.length) {
            container.innerHTML = '<div class="ai-empty">暂无诊断雷达数据。</div>';
            return;
        }

        var size = 330;
        var center = size / 2;
        var radius = 112;
        var levels = [0.25, 0.5, 0.75, 1];

        function pointAt(index, scale) {
            var angle = -Math.PI / 2 + index * (Math.PI * 2 / items.length);
            return {
                x: center + Math.cos(angle) * radius * scale,
                y: center + Math.sin(angle) * radius * scale
            };
        }

        var ringMarkup = levels.map(function (level) {
            var points = items.map(function (_, index) {
                var point = pointAt(index, level);
                return point.x.toFixed(1) + "," + point.y.toFixed(1);
            }).join(" ");
            return '<polygon points="' + points + '" fill="rgba(255,255,255,0.02)" stroke="rgba(132,205,255,0.16)" stroke-width="1"></polygon>';
        }).join("");

        var axisMarkup = items.map(function (item, index) {
            var end = pointAt(index, 1);
            var label = pointAt(index, 1.16);
            return ''
                + '<line x1="' + center + '" y1="' + center + '" x2="' + end.x.toFixed(1) + '" y2="' + end.y.toFixed(1) + '" stroke="rgba(132,205,255,0.16)" stroke-width="1"></line>'
                + '<text x="' + label.x.toFixed(1) + '" y="' + label.y.toFixed(1) + '" fill="#d9ecff" font-size="12" text-anchor="middle" dominant-baseline="middle">'
                + common.escapeHtml(item.label)
                + '</text>';
        }).join("");

        var valuePoints = items.map(function (item, index) {
            var point = pointAt(index, common.clamp(Number(item.value || 0) / 100, 0, 1));
            return point.x.toFixed(1) + "," + point.y.toFixed(1);
        }).join(" ");

        var dotMarkup = items.map(function (item, index) {
            var point = pointAt(index, common.clamp(Number(item.value || 0) / 100, 0, 1));
            return '<circle cx="' + point.x.toFixed(1) + '" cy="' + point.y.toFixed(1) + '" r="5.5" fill="#f7b955" stroke="#fff9e7" stroke-width="2"></circle>';
        }).join("");

        container.innerHTML = ''
            + '<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="认知诊断雷达图">'
            + '<defs>'
            + '<linearGradient id="diagRadarFill" x1="0%" y1="0%" x2="100%" y2="100%">'
            + '<stop offset="0%" stop-color="rgba(56,189,248,0.56)"></stop>'
            + '<stop offset="100%" stop-color="rgba(247,185,85,0.36)"></stop>'
            + '</linearGradient>'
            + '</defs>'
            + ringMarkup
            + axisMarkup
            + '<polygon points="' + valuePoints + '" fill="url(#diagRadarFill)" stroke="#7dd3fc" stroke-width="2.5"></polygon>'
            + dotMarkup
            + '<circle cx="' + center + '" cy="' + center + '" r="4" fill="#e9f7ff"></circle>'
            + '</svg>';
    }

    function renderLegend(container, data) {
        if (!container) return;
        container.innerHTML = common.safeList(data).slice(0, 6).map(function (item) {
            return ''
                + '<div class="diagnosis-radar-item">'
                + '<div class="diagnosis-radar-head">'
                + '<span class="diagnosis-radar-name">' + common.escapeHtml(item.label) + '</span>'
                + '<strong>' + common.toPercent(item.value) + '</strong>'
                + '</div>'
                + '<div class="diagnosis-radar-meta">该模块当前掌握度用于汇总学生的认知诊断主视图。</div>'
                + '</div>';
        }).join("");
    }

    function renderKnowledgeCards(container, items) {
        if (!container) return;
        container.innerHTML = common.safeList(items).map(function (item) {
            return ''
                + '<article class="diagnosis-knowledge-card">'
                + '<div class="diagnosis-knowledge-head">'
                + '<div>'
                + '<div class="diagnosis-knowledge-title">' + common.escapeHtml(item.name) + '</div>'
                + '<div class="diagnosis-knowledge-meta">尝试 ' + common.escapeHtml(item.attempts) + ' 次 · 置信度 ' + common.toPercent(item.confidence) + '</div>'
                + '</div>'
                + '<div class="diagnosis-score">' + common.toPercent(item.mastery) + '<small> mastery</small></div>'
                + '</div>'
                + '<div class="diagnosis-kpis">'
                + '<div class="diagnosis-kpi"><strong>' + common.toPercent(item.matrix[0]) + '</strong><span>识记</span></div>'
                + '<div class="diagnosis-kpi"><strong>' + common.toPercent(item.matrix[1]) + '</strong><span>理解</span></div>'
                + '<div class="diagnosis-kpi"><strong>' + common.toPercent(item.matrix[2]) + '</strong><span>应用</span></div>'
                + '</div>'
                + '<div class="diagnosis-knowledge-meta">' + buildBadge(item.risk_level === "high" ? "高风险" : item.risk_level === "medium" ? "待巩固" : "稳定", item.risk_level) + ' ' + buildBadge(item.trend === "up" ? "上升" : item.trend === "down" ? "波动" : "稳定", item.trend === "down" ? "warning" : "success") + '</div>'
                + '<div class="diagnosis-knowledge-meta">' + common.escapeHtml(item.mistake_pattern) + '</div>'
                + '<div class="ai-progress ' + common.progressTone(item.mastery) + '"><span style="width:' + common.toPercent(item.mastery) + '"></span></div>'
                + '<div class="diagnosis-knowledge-meta">' + common.escapeHtml(item.advice) + '</div>'
                + '</article>';
        }).join("");
    }

    function renderMatrix(headContainer, bodyContainer, dimensions, rows) {
        if (!headContainer || !bodyContainer) return;
        headContainer.innerHTML = '<tr><th>知识点</th>' + common.safeList(dimensions).map(function (label) {
            return '<th>' + common.escapeHtml(label) + '</th>';
        }).join("") + '<th>风险</th></tr>';

        bodyContainer.innerHTML = common.safeList(rows).map(function (row) {
            return '<tr>'
                + '<td>' + common.escapeHtml(row.name) + '</td>'
                + common.safeList(row.values).map(function (value) {
                    var level = Number(value || 0) < 60 ? "high" : Number(value || 0) < 78 ? "medium" : "low";
                    return '<td data-level="' + level + '">' + common.toPercent(value) + '</td>';
                }).join("")
                + '<td>' + buildBadge(row.risk_level === "high" ? "高" : row.risk_level === "medium" ? "中" : "低", row.risk_level) + '</td>'
                + '</tr>';
        }).join("");
    }

    function renderIssues(container, items) {
        if (!container) return;
        container.innerHTML = common.safeList(items).map(function (item) {
            return ''
                + '<article class="diagnosis-issue-card">'
                + '<div class="diagnosis-knowledge-head">'
                + '<div class="diagnosis-issue-title">' + common.escapeHtml(item.knowledge) + ' · ' + common.escapeHtml(item.title) + '</div>'
                + buildBadge("重点关注", "warning")
                + '</div>'
                + '<div class="diagnosis-issue-text"><strong>证据：</strong>' + common.escapeHtml(item.evidence) + '</div>'
                + '<div class="diagnosis-issue-text"><strong>影响：</strong>' + common.escapeHtml(item.impact) + '</div>'
                + '<div class="diagnosis-issue-text"><strong>建议：</strong>' + common.escapeHtml(item.action) + '</div>'
                + '</article>';
        }).join("");
    }

    function renderTimeline(container, items) {
        if (!container) return;
        container.innerHTML = common.safeList(items).map(function (item) {
            return ''
                + '<article class="timeline-card">'
                + '<div class="timeline-bar"><span style="height:' + common.clamp(Number(item.score || 0), 8, 100) + '%"></span></div>'
                + '<span class="timeline-title">' + common.escapeHtml(item.label) + '</span>'
                + '<span class="timeline-meta">' + common.escapeHtml(item.knowledge) + '</span>'
                + '<span class="timeline-meta">得分 ' + common.toPercent(item.score) + ' · 变化 ' + common.escapeHtml(item.change) + '</span>'
                + '</article>';
        }).join("");
    }

    function renderActions(container, items) {
        if (!container) return;
        container.innerHTML = common.safeList(items).map(function (item) {
            return ''
                + '<article class="diagnosis-action-card">'
                + '<div class="diagnosis-action-head">'
                + '<div class="diagnosis-action-title">' + common.escapeHtml(item.title) + '</div>'
                + buildBadge(item.priority + "优先级", item.priority === "高" ? "danger" : "warning")
                + '</div>'
                + '<div class="diagnosis-action-text">' + common.escapeHtml(item.detail) + '</div>'
                + '<div class="diagnosis-action-text">建议投入时长：' + common.escapeHtml(item.duration_minutes) + ' 分钟</div>'
                + '</article>';
        }).join("");
    }

    document.addEventListener("DOMContentLoaded", async function () {
        try {
            var payload = await common.fetchPayload("/api/cognitive-diagnosis");
            var student = payload.student || {};
            var summary = payload.summary || {};

            common.byId("diag-student-name").textContent = common.safeText(student.name, "示例学生");
            common.byId("diag-student-meta").innerHTML = ''
                + '<span class="ai-chip">' + common.escapeHtml(student.class_name || "班级待定") + '</span>'
                + '<span class="ai-chip">' + common.escapeHtml(student.course_name || "课程待定") + '</span>'
                + '<span class="ai-chip">最近更新 ' + common.escapeHtml(student.last_updated || "--") + '</span>';

            common.byId("diag-mastery-score").textContent = common.toPercent(summary.mastery_score);
            common.byId("diag-high-risk-count").textContent = summary.high_risk_count || 0;
            common.byId("diag-expected-gain").textContent = "+" + (summary.expected_gain || 0) + "%";
            common.byId("diag-overview-grid").innerHTML = ''
                + '<div class="ai-metric-card"><span class="ai-metric-label">最近作答正确率</span><span class="ai-metric-value">' + common.toPercent(student.recent_accuracy) + '</span><span class="ai-metric-footnote">累计作答 ' + common.escapeHtml(student.answered_count) + ' 题</span></div>'
                + '<div class="ai-metric-card"><span class="ai-metric-label">诊断置信度</span><span class="ai-metric-value">' + common.toPercent(summary.diagnosis_confidence) + '</span><span class="ai-metric-footnote">基于当前演示接口输出</span></div>'
                + '<div class="ai-metric-card"><span class="ai-metric-label">稳定掌握模块</span><span class="ai-metric-value">' + common.escapeHtml(summary.strong_count) + '</span><span class="ai-metric-footnote">掌握度 80% 以上</span></div>';

            renderRadar(common.byId("diag-radar"), payload.radar);
            renderLegend(common.byId("diag-radar-legend"), payload.radar);
            renderKnowledgeCards(common.byId("diag-knowledge-grid"), payload.knowledge_cards);
            renderMatrix(common.byId("diag-matrix-head"), common.byId("diag-matrix-body"), payload.matrix_dimensions, payload.matrix_rows);
            renderIssues(common.byId("diag-issues-grid"), payload.issues);
            renderTimeline(common.byId("diag-timeline"), payload.timeline);
            renderActions(common.byId("diag-actions-grid"), payload.actions);

            // common.byId("diag-integration-note").innerHTML = '<strong>接口说明：</strong>' + common.escapeHtml(payload.integration && payload.integration.replace_hint ? payload.integration.replace_hint : "后端模型接口待接入。");
        } catch (error) {
            common.byId("diag-page-root").innerHTML = '<div class="ai-card"><div class="ai-empty">认知诊断页面加载失败：' + common.escapeHtml(error.message || "unknown error") + "</div></div>";
        }
    });
})();
