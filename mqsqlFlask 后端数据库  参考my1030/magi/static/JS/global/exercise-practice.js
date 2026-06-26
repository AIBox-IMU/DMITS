(function () {
    const context = window.__PRACTICE_CONTEXT__ || {};

    const elements = {
        nodeTitle: document.getElementById("practice-node-title"),
        nodeSummary: document.getElementById("practice-node-summary"),
        nodeMetaPills: document.getElementById("node-meta-pills"),
        nodeGoals: document.getElementById("node-goals"),
        nodePath: document.getElementById("node-path"),
        exerciseMeta: document.getElementById("exercise-meta"),
        exerciseTitle: document.getElementById("exercise-title"),
        exerciseQuestion: document.getElementById("exercise-question"),
        exerciseOptions: document.getElementById("exercise-options"),
        answerInputContainer: document.getElementById("answer-input-container"),
        submitAnswerButton: document.getElementById("submit-answer-btn"),
        showAnswerButton: document.getElementById("show-answer-btn"),
        scoreResultCard: document.getElementById("score-result-card"),
        scoreResultBadge: document.getElementById("score-result-badge"),
        scoreResultFeedback: document.getElementById("score-result-feedback"),
        scoreStrengthList: document.getElementById("score-strength-list"),
        scoreImprovementList: document.getElementById("score-improvement-list"),
        correctAnswerCard: document.getElementById("correct-answer-card"),
        correctAnswerContent: document.getElementById("correct-answer-content"),
        correctAnalysisContent: document.getElementById("correct-analysis-content"),
        exerciseList: document.getElementById("exercise-list"),
        exerciseCountPill: document.getElementById("exercise-count-pill"),
        toast: document.getElementById("practice-toast"),
    };

    const state = {
        nodeId: safeText(context.nodeId, ""),
        exerciseId: safeText(context.exerciseId, ""),
        payload: null,
        scoreResult: null,
        answerVisible: false,
        submitting: false,
    };

    function safeText(value, fallback) {
        if (value === undefined || value === null) {
            return fallback || "";
        }
        return String(value);
    }

    function ensureArray(value) {
        if (Array.isArray(value)) return value;
        if (value === undefined || value === null || value === "") return [];
        return [value];
    }

    function escapeHtml(value) {
        return safeText(value, "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatBlockText(value) {
        const text = safeText(value, "").trim();
        if (!text) {
            return "<div class=\"practice-empty\">暂无内容</div>";
        }
        return escapeHtml(text).replace(/\n/g, "<br>");
    }

    function normalizeOption(option, index) {
        if (option && typeof option === "object") {
            const label = safeText(option.label || option.text || option.value || option.id, "").trim();
            const value = safeText(option.value || option.id || option.label || option.text || ("option-" + (index + 1)), "").trim();
            return {
                value: value || ("option-" + (index + 1)),
                label: label || ("选项 " + (index + 1)),
            };
        }

        const text = safeText(option, "").trim();
        return {
            value: text || ("option-" + (index + 1)),
            label: text || ("选项 " + (index + 1)),
        };
    }

    function isSingleChoice(exercise) {
        const inputType = safeText(exercise && exercise.input_type, "").toLowerCase();
        return inputType === "single_choice" || inputType === "single" || inputType === "radio" || inputType === "choice" || inputType === "select";
    }

    function isMultipleChoice(exercise) {
        const inputType = safeText(exercise && exercise.input_type, "").toLowerCase();
        return inputType === "multiple_choice" || inputType === "multiple" || inputType === "checkbox" || inputType === "multi_select";
    }

    function getCurrentExercise() {
        return state.payload && state.payload.current_exercise ? state.payload.current_exercise : null;
    }

    function getQuestionText(exercise) {
        return safeText(
            exercise && (exercise.question || exercise.content || exercise.summary),
            ""
        ).trim();
    }

    function setLoadingState() {
        if (elements.nodeTitle) elements.nodeTitle.textContent = "正在加载知识点...";
        if (elements.nodeSummary) elements.nodeSummary.textContent = "正在同步题目与资源信息，请稍候。";
        if (elements.exerciseTitle) elements.exerciseTitle.textContent = "正在加载题目...";
        if (elements.exerciseQuestion) {
            elements.exerciseQuestion.innerHTML = "<div class=\"practice-empty\">题干加载中...</div>";
        }
        if (elements.answerInputContainer) {
            elements.answerInputContainer.innerHTML = "<div class=\"practice-empty\">作答区初始化中...</div>";
        }
    }

    function showToast(message) {
        if (!elements.toast) return;
        elements.toast.textContent = safeText(message, "");
        elements.toast.classList.remove("is-hidden");
        window.clearTimeout(showToast.timerId);
        showToast.timerId = window.setTimeout(function () {
            elements.toast.classList.add("is-hidden");
        }, 2200);
    }

    function updateShowAnswerButton() {
        if (!elements.showAnswerButton) return;
        const exercise = getCurrentExercise();
        const hasAnswer = !!(exercise && (safeText(exercise.answer, "").trim() || safeText(exercise.analysis, "").trim()));
        elements.showAnswerButton.disabled = !hasAnswer;
        elements.showAnswerButton.textContent = hasAnswer
            ? (state.answerVisible ? "隐藏正确答案" : "显示正确答案")
            : "暂无参考答案";
    }

    function renderNodeSummary(nodeInfo) {
        if (elements.nodeTitle) {
            elements.nodeTitle.textContent = safeText(nodeInfo.name, "未命名知识点");
        }
        if (elements.nodeSummary) {
            elements.nodeSummary.textContent = safeText(nodeInfo.summary || nodeInfo.description, "当前知识点暂未配置摘要。");
        }
        if (elements.nodeMetaPills) {
            const pills = [
                safeText(nodeInfo.module_path || nodeInfo.modulePath, "").trim(),
                safeText(nodeInfo.difficulty, "").trim(),
                safeText(nodeInfo.stage, "").trim(),
            ].filter(Boolean);
            const tags = ensureArray(nodeInfo.tags).map(function (item) {
                return safeText(item, "").trim();
            }).filter(Boolean);

            elements.nodeMetaPills.innerHTML = pills.concat(tags).length
                ? pills.concat(tags).map(function (item) {
                    return "<span class=\"practice-pill\">" + escapeHtml(item) + "</span>";
                }).join("")
                : "<div class=\"practice-empty\">当前知识点还没有补充难度、阶段或标签信息。</div>";
        }
        if (elements.nodeGoals) {
            const goals = ensureArray(nodeInfo.learning_goals || nodeInfo.learningGoals).map(function (item) {
                return safeText(item, "").trim();
            }).filter(Boolean);
            elements.nodeGoals.innerHTML = goals.length
                ? "<strong>学习目标</strong><ul class=\"practice-bullet-list\">" + goals.map(function (item) {
                    return "<li>" + escapeHtml(item) + "</li>";
                }).join("") + "</ul>"
                : "<strong>学习目标</strong><div class=\"practice-empty\">当前没有配置学习目标。</div>";
        }
        if (elements.nodePath) {
            const pathText = safeText(nodeInfo.module_path || nodeInfo.modulePath, "").trim();
            elements.nodePath.innerHTML = pathText
                ? "<strong>所属章节</strong><div>" + escapeHtml(pathText) + "</div>"
                : "<strong>所属章节</strong><div class=\"practice-empty\">当前没有配置章节路径。</div>";
        }
    }

    function renderExerciseMeta(exercise) {
        if (!elements.exerciseMeta) return;
        const metaItems = [
            safeText(exercise.resource_label || exercise.resourceLabel, "习题").trim(),
            safeText(exercise.difficulty, "").trim(),
            safeText(exercise.source, "").trim(),
            safeText(exercise.estimated_time || exercise.estimatedTime, "").trim(),
        ].filter(Boolean);

        elements.exerciseMeta.innerHTML = metaItems.map(function (item) {
            return "<span class=\"practice-pill\">" + escapeHtml(item) + "</span>";
        }).join("");
    }

    function renderExerciseOptions(exercise) {
        if (!elements.exerciseOptions) return;
        const options = ensureArray(exercise.options).map(normalizeOption);
        const isSingle = isSingleChoice(exercise);
        const isMulti = isMultipleChoice(exercise);

        if (!(isSingle || isMulti) || !options.length) {
            elements.exerciseOptions.innerHTML = "";
            return;
        }

        const inputType = isMulti ? "checkbox" : "radio";
        const listHtml = options.map(function (option) {
            return (
                "<label class=\"practice-option-item\">" +
                "<input type=\"" + inputType + "\" name=\"exercise-option\" value=\"" + escapeHtml(option.value) + "\">" +
                "<span>" + escapeHtml(option.label) + "</span>" +
                "</label>"
            );
        }).join("");

        elements.exerciseOptions.innerHTML =
            "<div class=\"practice-option-list\">" + listHtml + "</div>" +
            "<div class=\"practice-choice-hint\">" + (isMulti ? "可多选，提交时会按组合答案评分。" : "请选择一个最符合题意的答案。") + "</div>";
    }

    function renderAnswerInput(exercise) {
        if (!elements.answerInputContainer) return;
        const options = ensureArray(exercise.options).map(normalizeOption);
        const isSingle = isSingleChoice(exercise);
        const isMulti = isMultipleChoice(exercise);

        if ((isSingle || isMulti) && options.length) {
            const inputType = isMulti ? "checkbox" : "radio";
            const hintText = isMulti ? "请勾选所有你认为正确的选项。" : "请从下列选项中选择一个答案。";
            elements.answerInputContainer.innerHTML =
                "<div class=\"practice-choice-answer\">" +
                "<div class=\"practice-choice-hint\">" + escapeHtml(hintText) + "</div>" +
                options.map(function (option) {
                    return (
                        "<label class=\"practice-option-item\">" +
                        "<input type=\"" + inputType + "\" name=\"practice-answer\" value=\"" + escapeHtml(option.value) + "\">" +
                        "<span>" + escapeHtml(option.label) + "</span>" +
                        "</label>"
                    );
                }).join("") +
                "</div>";
            return;
        }

        elements.answerInputContainer.innerHTML =
            "<textarea id=\"practice-answer-text\" placeholder=\"请在这里输入你的作答内容，可以写结论、推理过程、证明思路或计算步骤。\"></textarea>";
    }

    function renderExerciseContent(exercise) {
        if (!exercise) {
            if (elements.exerciseTitle) elements.exerciseTitle.textContent = "当前知识点还没有习题资源";
            if (elements.exerciseQuestion) {
                elements.exerciseQuestion.innerHTML = "<div class=\"practice-empty\">请先为该知识点补充 `resource_type = exercise` 的文本资源。</div>";
            }
            if (elements.exerciseOptions) elements.exerciseOptions.innerHTML = "";
            if (elements.answerInputContainer) {
                elements.answerInputContainer.innerHTML = "<div class=\"practice-empty\">当前没有可作答的习题。</div>";
            }
            return;
        }

        if (elements.exerciseTitle) {
            elements.exerciseTitle.textContent = safeText(exercise.title, "未命名习题");
        }
        if (elements.exerciseQuestion) {
            elements.exerciseQuestion.innerHTML = formatBlockText(getQuestionText(exercise) || "当前没有配置题干内容。");
        }
        renderExerciseMeta(exercise);
        renderExerciseOptions(exercise);
        renderAnswerInput(exercise);
    }

    function renderExerciseList(payload) {
        if (!elements.exerciseList) return;
        const exerciseList = ensureArray(payload.exercise_list);
        if (elements.exerciseCountPill) {
            elements.exerciseCountPill.textContent = "共 " + exerciseList.length + " 题";
        }

        if (!exerciseList.length) {
            elements.exerciseList.innerHTML = "<div class=\"practice-empty\">当前知识点还没有其他习题。</div>";
            return;
        }

        elements.exerciseList.innerHTML = exerciseList.map(function (item, index) {
            const isActive = safeText(item.id, "") === state.exerciseId;
            const metaParts = [
                safeText(item.difficulty, "").trim(),
                safeText(item.source, "").trim(),
                safeText(item.estimated_time || item.estimatedTime, "").trim(),
            ].filter(Boolean);
            return (
                "<button type=\"button\" class=\"practice-exercise-item" + (isActive ? " is-active" : "") + "\" data-exercise-id=\"" + escapeHtml(item.id) + "\">" +
                "<span class=\"practice-exercise-item-title\">" + escapeHtml((index + 1) + ". " + safeText(item.title, "未命名习题")) + "</span>" +
                (metaParts.length ? "<span class=\"practice-exercise-item-meta\">" + escapeHtml(metaParts.join(" / ")) + "</span>" : "") +
                (safeText(item.summary, "").trim() ? "<span class=\"practice-exercise-item-summary\">" + escapeHtml(item.summary) + "</span>" : "") +
                "</button>"
            );
        }).join("");
    }

    function renderScoreResult() {
        if (!elements.scoreResultCard || !elements.scoreResultBadge || !elements.scoreResultFeedback) return;
        if (!state.scoreResult) {
            elements.scoreResultCard.classList.add("is-hidden");
            return;
        }

        const result = state.scoreResult;
        elements.scoreResultBadge.textContent = safeText(result.score, "0") + " / " + safeText(result.max_score || result.maxScore, "100");
        elements.scoreResultFeedback.textContent = safeText(result.feedback, "已完成评分。");
        elements.scoreStrengthList.innerHTML = ensureArray(result.strengths).length
            ? ensureArray(result.strengths).map(function (item) {
                return "<li>" + escapeHtml(item) + "</li>";
            }).join("")
            : "<li>当前未返回单独优点说明。</li>";
        elements.scoreImprovementList.innerHTML = ensureArray(result.improvements).length
            ? ensureArray(result.improvements).map(function (item) {
                return "<li>" + escapeHtml(item) + "</li>";
            }).join("")
            : "<li>当前未返回单独改进建议。</li>";
        elements.scoreResultCard.classList.remove("is-hidden");
    }

    function renderCorrectAnswer() {
        if (!elements.correctAnswerCard || !elements.correctAnswerContent || !elements.correctAnalysisContent) return;

        const exercise = getCurrentExercise();
        if (!exercise || !state.answerVisible) {
            elements.correctAnswerCard.classList.add("is-hidden");
            return;
        }

        elements.correctAnswerContent.innerHTML = formatBlockText(exercise.answer || "当前没有配置正确答案。");
        elements.correctAnalysisContent.innerHTML = formatBlockText(exercise.analysis || exercise.rubric || "当前没有配置解析。");
        elements.correctAnswerCard.classList.remove("is-hidden");
    }

    function renderPage(payload) {
        const nodeInfo = payload && payload.node ? payload.node : {};
        renderNodeSummary(nodeInfo);
        renderExerciseContent(payload ? payload.current_exercise : null);
        renderExerciseList(payload || {});
        updateShowAnswerButton();
        renderScoreResult();
        renderCorrectAnswer();
    }

    function collectAnswer() {
        const exercise = getCurrentExercise();
        if (!exercise) return "";

        const options = ensureArray(exercise.options);
        if (isSingleChoice(exercise) && options.length) {
            const checked = document.querySelector("input[name='practice-answer']:checked");
            return checked ? checked.value : "";
        }

        if (isMultipleChoice(exercise) && options.length) {
            return Array.prototype.slice.call(document.querySelectorAll("input[name='practice-answer']:checked"))
                .map(function (input) { return input.value; })
                .filter(Boolean);
        }

        const textarea = document.getElementById("practice-answer-text");
        return textarea ? textarea.value.trim() : "";
    }

    async function fetchPracticePayload() {
        const response = await fetch("/api/node/" + encodeURIComponent(state.nodeId) + "/exercise/" + encodeURIComponent(state.exerciseId), {
            credentials: "same-origin",
        });
        const payload = await response.json();
        if (!response.ok || !payload || payload.code !== 0) {
            throw new Error(payload && payload.message ? payload.message : "习题数据加载失败");
        }
        return payload.data;
    }

    async function loadPracticePage() {
        setLoadingState();

        try {
            const payload = await fetchPracticePayload();
            state.payload = payload;
            state.scoreResult = null;
            state.answerVisible = false;

            const currentExercise = payload && payload.current_exercise ? payload.current_exercise : null;
            if (currentExercise && safeText(currentExercise.id, "") && safeText(currentExercise.id, "") !== state.exerciseId) {
                window.location.replace("/practice/" + encodeURIComponent(state.nodeId) + "/" + encodeURIComponent(currentExercise.id));
                return;
            }

            renderPage(payload);
        } catch (error) {
            if (elements.nodeTitle) elements.nodeTitle.textContent = "习题加载失败";
            if (elements.nodeSummary) elements.nodeSummary.textContent = safeText(error && error.message, "请检查当前知识点下是否存在习题资源。");
            if (elements.exerciseTitle) elements.exerciseTitle.textContent = "暂时无法进入练习";
            if (elements.exerciseQuestion) {
                elements.exerciseQuestion.innerHTML = "<div class=\"practice-empty\">" + escapeHtml(safeText(error && error.message, "请稍后重试。")) + "</div>";
            }
            if (elements.answerInputContainer) {
                elements.answerInputContainer.innerHTML = "<div class=\"practice-empty\">当前无法加载作答区。</div>";
            }
        }
    }

    async function submitAnswer() {
        if (state.submitting) return;
        const exercise = getCurrentExercise();
        if (!exercise) {
            showToast("当前没有可提交的习题。");
            return;
        }

        const answer = collectAnswer();
        const isEmptyArray = Array.isArray(answer) && !answer.length;
        if (!answer || isEmptyArray) {
            showToast("请先完成作答后再提交评分。");
            return;
        }

        state.submitting = true;
        if (elements.submitAnswerButton) {
            elements.submitAnswerButton.disabled = true;
            elements.submitAnswerButton.textContent = "评分中...";
        }

        try {
            const response = await fetch("/api/exercise/score", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    node_id: state.nodeId,
                    exercise_id: state.exerciseId,
                    answer: answer,
                }),
            });
            const payload = await response.json();
            if (!response.ok || !payload || payload.code !== 0) {
                throw new Error(payload && payload.message ? payload.message : "评分失败");
            }

            state.scoreResult = payload.data;
            renderScoreResult();
            showToast(payload.data && payload.data.mode === "llm" ? "已完成大模型评分。" : "已完成本地评分。");
        } catch (error) {
            showToast(safeText(error && error.message, "评分失败，请稍后重试。"));
        } finally {
            state.submitting = false;
            if (elements.submitAnswerButton) {
                elements.submitAnswerButton.disabled = false;
                elements.submitAnswerButton.textContent = "提交评分";
            }
        }
    }

    function handleExerciseListClick(event) {
        const button = event.target && event.target.closest ? event.target.closest("[data-exercise-id]") : null;
        if (!button) return;

        const nextExerciseId = safeText(button.getAttribute("data-exercise-id"), "").trim();
        if (!nextExerciseId || nextExerciseId === state.exerciseId) return;

        window.location.href = "/practice/" + encodeURIComponent(state.nodeId) + "/" + encodeURIComponent(nextExerciseId);
    }

    function toggleAnswerVisibility() {
        const exercise = getCurrentExercise();
        if (!exercise) return;
        if (!(safeText(exercise.answer, "").trim() || safeText(exercise.analysis, "").trim())) {
            showToast("当前题目还没有配置标准答案。");
            return;
        }

        state.answerVisible = !state.answerVisible;
        updateShowAnswerButton();
        renderCorrectAnswer();
    }

    function bindEvents() {
        if (elements.submitAnswerButton) {
            elements.submitAnswerButton.addEventListener("click", submitAnswer);
        }
        if (elements.showAnswerButton) {
            elements.showAnswerButton.addEventListener("click", toggleAnswerVisibility);
        }
        if (elements.exerciseList) {
            elements.exerciseList.addEventListener("click", handleExerciseListClick);
        }
    }

    bindEvents();
    loadPracticePage();
})();
