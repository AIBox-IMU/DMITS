(function () {
    function byId(id) {
        return document.getElementById(id);
    }

    function safeList(value) {
        return Array.isArray(value) ? value : [];
    }

    function safeText(value, fallback) {
        if (value === undefined || value === null) {
            return fallback || "";
        }
        return String(value);
    }

    function clamp(value, minimum, maximum) {
        return Math.max(minimum, Math.min(maximum, value));
    }

    function toPercent(value) {
        var number = Number(value || 0);
        if (!Number.isFinite(number)) {
            number = 0;
        }
        return Math.round(number) + "%";
    }

    function escapeHtml(value) {
        return safeText(value, "").replace(/[&<>"']/g, function (char) {
            return ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[char] || char;
        });
    }

    function riskBadgeClass(level) {
        if (level === "high" || level === "danger" || level === "weak") {
            return "is-danger";
        }
        if (level === "medium" || level === "warning" || level === "review") {
            return "is-warning";
        }
        return "is-success";
    }

    function progressTone(value) {
        var number = Number(value || 0);
        if (number < 60) return "is-danger";
        if (number < 78) return "is-warning";
        return "is-success";
    }

    async function fetchPayload(url) {
        var response = await fetch(url, {
            credentials: "same-origin"
        });
        var payload = await response.json();
        if (!response.ok) {
            throw new Error(payload && payload.message ? payload.message : "request failed");
        }
        return payload && Object.prototype.hasOwnProperty.call(payload, "data") ? payload.data : payload;
    }

    function setProgress(element, value) {
        if (!element) return;
        element.className = "ai-progress " + progressTone(value);
        var bar = element.querySelector("span");
        if (bar) {
            bar.style.width = clamp(Number(value || 0), 0, 100) + "%";
        }
    }

    window.IntelligenceCommon = {
        byId: byId,
        safeList: safeList,
        safeText: safeText,
        escapeHtml: escapeHtml,
        toPercent: toPercent,
        fetchPayload: fetchPayload,
        riskBadgeClass: riskBadgeClass,
        progressTone: progressTone,
        setProgress: setProgress,
        clamp: clamp
    };
})();
