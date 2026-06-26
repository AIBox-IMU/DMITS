import json as std_json
import os
import re
from datetime import datetime
from urllib import error as urllib_error
from urllib import request as urllib_request

from flask import Flask, render_template, json, jsonify, send_from_directory, Response, abort, request, redirect, url_for
from config import Config

try:
    from flask_cors import CORS
except Exception:
    def CORS(app):
        return app

GETDATA_IMPORT_ERROR = None
try:
    from getdata import getjson, get_node_detail, get_node_exercise_bundle
except Exception as import_error:
    GETDATA_IMPORT_ERROR = import_error

    def getjson():
        raise RuntimeError(f"getdata unavailable: {import_error}")

    def get_node_detail(node_id):
        return None

    def get_node_exercise_bundle(node_id, exercise_id=None):
        return None

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
# 下面两行是防止flask与vue产生冲突
app.jinja_env.variable_start_string = '<<'
app.jinja_env.variable_end_string = '>>'

SITE_PAGE_REGISTRY = [
    {
        "key": "portal",
        "endpoint": "INDEX",
        "title": "站点导航",
        "short_title": "导航页",
        "kicker": "Entry Portal",
        "summary": "作为整个站点的统一入口，集中展示所有业务页面与后续扩展模块。",
        "status": "统一入口",
        "tone": "portal",
    },
    {
        "key": "knowledge_graph",
        "endpoint": "knowledge_graph_page",
        "title": "知识图谱展示",
        "short_title": "知识图谱",
        "kicker": "Knowledge Graph",
        "summary": "查看知识点之间的结构关系、节点详情与图谱学习资源，是图谱型教学内容的核心展示页。",
        "status": "图谱主场景",
        "tone": "graph",
    },
    {
        "key": "cognitive_diagnosis",
        "endpoint": "cognitive_diagnosis_page",
        "title": "认知诊断",
        "short_title": "认知诊断",
        "kicker": "Diagnosis",
        "summary": "根据学生答题情况呈现知识掌握画像、风险诊断与干预建议。",
        "status": "诊断结果展示",
        "tone": "diagnosis",
    },
    {
        "key": "learning_path",
        "endpoint": "learning_path_page",
        "title": "学习路径推荐",
        "short_title": "学习路径",
        "kicker": "Learning Path",
        "summary": "在知识图谱基础上高亮推荐主路径、阶段任务与可选分支。",
        "status": "图谱联动展示",
        "tone": "path",
    },
    {
        "key": "q_matrix",
        "endpoint": "q_matrix_page",
        "title": "Q 矩阵",
        "short_title": "Q 矩阵",
        "kicker": "Q-Matrix",
        "summary": "建立习题与知识点之间的对应关系，展示热力矩阵、覆盖分析与候选关联。",
        "status": "矩阵展示",
        "tone": "matrix",
    },
    {
        "key": "model_center",
        "endpoint": "model_center_page",
        "title": "模型调用",
        "short_title": "模型调用",
        "kicker": "Model Workbench",
        "summary": "统一承接实体识别、上位词推荐、资源标签分类，以及认知诊断、学习路径、Q 矩阵等模型调用页面。",
        "status": "六类模型工作台",
        "tone": "model",
    },
    {
        "key": "micro_video",
        "endpoint": "micro_video_page",
        "title": "微视频",
        "short_title": "微视频",
        "kicker": "Micro Video",
        "summary": "预留微视频页面入口，后续可在这里接入知识点短视频、章节讲解与配套学习资源。",
        "status": "",
        "tone": "video",
    },
]

MODEL_PAGE_REGISTRY = [
    {
        "key": "entity_recognition",
        "title": "实体识别",
        "nav_title": "实体识别",
        "kicker": "Entity Recognition",
        "summary": "支持文档上传和文本输入，抽取数学术语、概念、公式与关系线索。",
        "hero_title": "把教材、题干和笔记里的关键实体抽出来",
        "hero_desc": "支持直接粘贴文本，也支持上传文档后由后台统一处理。后续接入真实实体识别模型后，这个页面可以直接继续复用。",
        "submit_label": "开始识别",
        "accent": "entity",
        "result_title": "识别结果",
        "result_subtitle": "输出实体列表、类型、置信度与证据片段。",
        "placeholder": "请粘贴教材片段、题目描述、定义文本或知识点说明。",
        "fields": [
            {
                "name": "text_input",
                "label": "文本输入",
                "type": "textarea",
                "required": False,
                "placeholder": "例如：设 G=(V,E) 是无向连通图。若 G 中不存在回路，则 G 是一棵树。",
                "help": "支持直接粘贴教材、题目、讲义、笔记等内容。",
            },
            {
                "name": "candidate_terms",
                "label": "候选术语（可选）",
                "type": "text",
                "required": False,
                "placeholder": "例如：无向连通图, 回路, 树",
                "help": "如果你已经有候选术语，可以一起提交，提高聚焦度。",
            },
        ],
        "accept": ".txt,.md,.json,.csv,.pdf,.doc,.docx",
    },
    {
        "key": "hypernym_recommendation",
        "title": "上位词推荐",
        "nav_title": "上位词推荐",
        "kicker": "Hypernym Builder",
        "summary": "为输入术语推荐上位词，并将多实体结果组织成知识树结构。",
        "hero_title": "让术语自动长成一棵可浏览的上位词树",
        "hero_desc": "既可以单独输入术语，也可以把实体识别结果粘贴进来，由后台统一生成上位词候选和树结构。",
        "submit_label": "开始推荐",
        "accent": "hypernym",
        "result_title": "上位词与树结构",
        "result_subtitle": "输出术语对应的上位词推荐、分层归类和树形结构。",
        "placeholder": "请输入术语、实体列表，或粘贴实体识别结果。",
        "fields": [
            {
                "name": "text_input",
                "label": "术语或实体输入",
                "type": "textarea",
                "required": False,
                "placeholder": "例如：无向图、有向图、连通图、树、生成树",
                "help": "多个术语可以用换行、逗号或顿号分隔。",
            },
            {
                "name": "tree_mode",
                "label": "组织方式",
                "type": "select",
                "required": True,
                "options": [
                    {"value": "tree", "label": "优先生成树结构"},
                    {"value": "list", "label": "优先展示推荐列表"},
                ],
                "help": "树结构更适合承接上一页的实体识别结果。",
            },
        ],
        "accept": ".txt,.md,.json,.csv",
    },
    {
        "key": "resource_tagging",
        "title": "多模态知识元自动挂载",
        "nav_title": "资源标签",
        "kicker": "Resource Tagging",
        "summary": "对文本资源进行知识点多标签分类，对视频资源按片段输出知识点标签。",
        "hero_title": "让习题、定义和视频资源自动挂上知识点标签",
        "hero_desc": "文本资源输出多标签分类；视频资源可依据标题和分段文本，生成视频块级别的知识点标签。",
        "submit_label": "开始分类",
        "accent": "tagging",
        "result_title": "标签分类结果",
        "result_subtitle": "输出整体标签、置信度，以及视频块级别的细分标签。",
        "placeholder": "请输入题目、定义、资源描述，或视频转写/分段说明。",
        "fields": [
            {
                "name": "resource_mode",
                "label": "资源类型",
                "type": "select",
                "required": True,
                "options": [
                    {"value": "text", "label": "文本资源"},
                    {"value": "video", "label": "视频资源"},
                ],
                "help": "视频资源建议同时填写标题和分段文本。",
            },
            {
                "name": "resource_title",
                "label": "资源标题",
                "type": "text",
                "required": False,
                "placeholder": "例如：树与生成树判定讲解",
                "help": "视频资源会优先参考标题进行知识点聚焦。",
            },
            {
                "name": "text_input",
                "label": "资源正文或分段文本",
                "type": "textarea",
                "required": False,
                "placeholder": "文本资源可直接粘贴离散数学定义或例题；视频资源建议一行一个片段描述或转写摘要。",
                "help": "如果上传视频文件但没有转写内容，系统会退化为基于标题和文件名的演示分类。",
            },
        ],
        "accept": ".txt,.md,.json,.csv,.mp4,.mov,.avi",
    },
    {
        "key": "model_cognitive_diagnosis",
        "title": "认知诊断",
        "nav_title": "认知诊断",
        "kicker": "Diagnosis Invocation",
        "summary": "像实体识别一样，通过输入学生作答记录实时生成认知诊断结果。",
        "hero_title": "把作答记录直接送进模型，生成诊断结论和干预建议",
        "hero_desc": "这不是原有的展示页迁移，而是一张新的模型调用页，用于提交学生答题表现并实时生成诊断结果。",
        "submit_label": "开始诊断",
        "accent": "diagnosis",
        "result_title": "诊断结论",
        "result_subtitle": "输出掌握度、风险点、证据和下一步干预动作。",
        "placeholder": "请粘贴学生答题记录、错因描述、阶段成绩或教师观察摘要。",
        "fields": [
            {
                "name": "student_name",
                "label": "学生名称",
                "type": "text",
                "required": False,
                "placeholder": "例如：王同学",
                "help": "便于结果页生成更自然的个体化描述。",
            },
            {
                "name": "text_input",
                "label": "答题记录与表现描述",
                "type": "textarea",
                "required": False,
                "placeholder": "例如：命题联结词判断基本正确，但量词否定经常出错；能识别树的定义，但在证明“无向连通图无回路则为树”时步骤不完整。",
                "help": "支持文本、结构化记录或教师摘要。",
            },
        ],
        "accept": ".txt,.md,.json,.csv",
    },
    {
        "key": "model_learning_path",
        "title": "学习路径推荐",
        "nav_title": "学习路径推荐",
        "kicker": "Path Invocation",
        "summary": "根据目标知识点和学习者状态，生成阶段化学习路径与任务建议。",
        "hero_title": "把目标、基础和诊断摘要拼成一条可执行学习路径",
        "hero_desc": "用于承接诊断摘要、学习目标和当前基础，实时生成推荐顺序、阶段任务和分支建议。",
        "submit_label": "生成路径",
        "accent": "path",
        "result_title": "路径推荐结果",
        "result_subtitle": "输出目标拆解、分阶段路线与资源建议。",
        "placeholder": "请粘贴学习目标、认知诊断摘要、当前基础和资源约束。",
        "fields": [
            {
                "name": "student_name",
                "label": "学习者名称",
                "type": "text",
                "required": False,
                "placeholder": "例如：李同学",
                "help": "可选，用于结果摘要展示。",
            },
            {
                "name": "target_topic",
                "label": "目标知识点",
                "type": "text",
                "required": False,
                "placeholder": "例如：树与生成树",
                "help": "明确目标后，推荐路径会更聚焦。",
            },
            {
                "name": "text_input",
                "label": "诊断摘要 / 学习约束",
                "type": "textarea",
                "required": False,
                "placeholder": "例如：图论基础尚可，但回路、连通与树的判定不稳定；计划两周内完成离散数学期中复习。",
                "help": "可输入诊断结论、学习时长、阶段目标等。",
            },
        ],
        "accept": ".txt,.md,.json,.csv",
    },
    {
        "key": "model_q_matrix",
        "title": "Q矩阵自动构建",
        "nav_title": "Q矩阵自动构建",
        "kicker": "Q-Matrix Invocation",
        "summary": "输入习题和知识点清单，实时生成题目到知识点的映射矩阵。",
        "hero_title": "把习题和知识点列表直接转成一张可审查的 Q 矩阵",
        "hero_desc": "适合作为数据准备和模型前处理页面，先快速得到候选矩阵，再进入你现有的 Q 矩阵展示页进行复核。",
        "submit_label": "构建矩阵",
        "accent": "matrix",
        "result_title": "Q矩阵结果",
        "result_subtitle": "输出候选关联矩阵、覆盖摘要和待复核关系。",
        "placeholder": "请粘贴习题文本，一题一行或一段一题。",
        "fields": [
            {
                "name": "knowledge_list",
                "label": "知识点列表",
                "type": "textarea",
                "required": False,
                "placeholder": "例如：命题逻辑\n图论基础\n数学归纳法",
                "help": "建议一行一个知识点。",
            },
            {
                "name": "text_input",
                "label": "习题文本列表",
                "type": "textarea",
                "required": False,
                "placeholder": "例如：判断命题 p→q 与 ¬p∨q 是否等价。\n设 G 是无向连通图，证明若 G 无回路，则 G 是一棵树。",
                "help": "建议一题一行或以空行分题。",
            },
        ],
        "accept": ".txt,.md,.json,.csv",
    },
]


def _build_site_pages():
    pages = []
    for item in SITE_PAGE_REGISTRY:
        page = dict(item)
        page["url"] = url_for(item["endpoint"])
        pages.append(page)
    return pages


def _build_model_pages():
    pages = []
    for item in MODEL_PAGE_REGISTRY:
        page = dict(item)
        page["url"] = url_for("model_workbench_page", page_key=item["key"])
        page["api_url"] = url_for("model_workbench_api", page_key=item["key"])
        pages.append(page)
    return pages


@app.context_processor
def inject_site_navigation():
    return {
        "site_pages": _build_site_pages(),
        "model_pages": _build_model_pages(),
    }


def _safe_text(value, fallback=""):
    if value is None:
        return fallback
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def _normalize_answer_payload(value):
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return _safe_text(value, "")


def _stringify_answer(value):
    normalized = _normalize_answer_payload(value)
    if isinstance(normalized, list):
        return "；".join(normalized)
    return normalized


def _normalize_string_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return []
        try:
            parsed = std_json.loads(stripped)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed if str(item).strip()]
        except (TypeError, ValueError, std_json.JSONDecodeError):
            pass
        return [segment.strip() for segment in re.split(r"[，,；;、\n]+", stripped) if segment.strip()]
    return [str(value).strip()]


def _normalize_option_label(option):
    if isinstance(option, dict):
        return _safe_text(
            option.get("label")
            or option.get("text")
            or option.get("value")
            or option.get("id"),
            "",
        )
    return _safe_text(option, "")


def _split_answer_tokens(value):
    if isinstance(value, list):
        return [str(item).strip().lower() for item in value if str(item).strip()]
    text = _safe_text(value, "")
    if not text:
        return []
    return [
        token.strip().lower()
        for token in re.split(r"[，,；;、/\s\n]+", text)
        if token.strip()
    ]


def _extract_keywords(text, limit=10):
    source = _safe_text(text, "")
    if not source:
        return []

    stopwords = {
        "因此", "所以", "以及", "或者", "如果", "那么", "需要", "可以", "进行",
        "一个", "一种", "这个", "那个", "其中", "通过", "根据", "对于", "相关",
        "学生", "答案", "题目", "知识点", "说明",
    }

    candidates = []
    for segment in re.split(r"[，,。；;：:\n]+", source):
        token = segment.strip()
        if 2 <= len(token) <= 18:
            candidates.append(token)

    candidates.extend(re.findall(r"[\u4e00-\u9fffA-Za-z0-9]{2,18}", source))

    seen = set()
    keywords = []
    for item in candidates:
        token = str(item).strip()
        if not token or token in stopwords:
            continue
        lowered = token.lower()
        if lowered in seen:
            continue
        seen.add(lowered)
        keywords.append(token)
        if len(keywords) >= limit:
            break
    return keywords


AI_FALLBACK_GRAPH = {
    "nodes": [
        {"id": "1", "name": "离散数学", "details": "课程根节点"},
        {"id": "2", "name": "命题逻辑", "details": "逻辑基础"},
        {"id": "3", "name": "等值演算", "details": "命题逻辑中的等值变换"},
        {"id": "4", "name": "基本等值式", "details": "基础变换规则"},
        {"id": "5", "name": "范式", "details": "析取范式与合取范式"},
        {"id": "6", "name": "推理理论", "details": "推理规则与证明"},
        {"id": "7", "name": "真值表", "details": "命题公式判定方法"},
        {"id": "8", "name": "集合", "details": "集合运算与关系"},
        {"id": "9", "name": "函数", "details": "映射与复合"},
    ],
    "links": [
        {"id": "edge-ai-1", "source": "1", "target": "2", "description": "包含"},
        {"id": "edge-ai-2", "source": "2", "target": "3", "description": "包含"},
        {"id": "edge-ai-3", "source": "3", "target": "4", "description": "包含"},
        {"id": "edge-ai-4", "source": "2", "target": "5", "description": "包含"},
        {"id": "edge-ai-5", "source": "2", "target": "6", "description": "包含"},
        {"id": "edge-ai-6", "source": "2", "target": "7", "description": "包含"},
        {"id": "edge-ai-7", "source": "1", "target": "8", "description": "包含"},
        {"id": "edge-ai-8", "source": "8", "target": "9", "description": "包含"},
    ],
}


def _stable_int(seed, modulo=100):
    if modulo <= 0:
        return 0

    text = _safe_text(seed, "")
    if not text:
        return 0

    total = 0
    for index, char in enumerate(text):
        total += (index + 1) * ord(char)
    return total % modulo


def _clamp_int(value, minimum, maximum):
    return max(minimum, min(maximum, int(round(value))))


def _normalize_ai_graph(nodes, links):
    normalized_nodes = []
    seen_node_ids = set()

    for index, raw_node in enumerate(nodes or []):
        node_id = _safe_text(raw_node.get("id"), str(index + 1))
        if not node_id or node_id in seen_node_ids:
            continue

        seen_node_ids.add(node_id)
        normalized_nodes.append({
            "id": node_id,
            "name": _safe_text(raw_node.get("name"), f"知识点 {index + 1}"),
            "details": _safe_text(raw_node.get("details") or raw_node.get("description"), ""),
        })

    if not normalized_nodes:
        normalized_nodes = [dict(item) for item in AI_FALLBACK_GRAPH["nodes"]]
        seen_node_ids = {item["id"] for item in normalized_nodes}

    normalized_links = []
    seen_pairs = set()
    for index, raw_link in enumerate(links or []):
        source = _safe_text(raw_link.get("source"), "")
        target = _safe_text(raw_link.get("target"), "")
        if source not in seen_node_ids or target not in seen_node_ids or source == target:
            continue

        pair_key = f"{source}->{target}"
        if pair_key in seen_pairs:
            continue
        seen_pairs.add(pair_key)

        normalized_links.append({
            "id": _safe_text(raw_link.get("id"), f"edge-{index + 1}"),
            "source": source,
            "target": target,
            "description": _safe_text(raw_link.get("description"), "包含"),
            "details": _safe_text(raw_link.get("details"), ""),
        })

    if not normalized_links:
        normalized_links = [dict(item) for item in AI_FALLBACK_GRAPH["links"]]

    return {
        "nodes": normalized_nodes,
        "links": normalized_links,
    }


def _load_ai_graph_payload():
    try:
        legacy_payload = _build_legacy_graph_payload()
        node_list = std_json.loads(legacy_payload.get("data1") or "[]")
        link_list = std_json.loads(legacy_payload.get("data2") or "[]")
        if not node_list:
            raise ValueError("empty graph payload")
        return _normalize_ai_graph(node_list, link_list)
    except Exception:
        return _normalize_ai_graph(
            AI_FALLBACK_GRAPH["nodes"],
            AI_FALLBACK_GRAPH["links"],
        )


def _build_ai_graph_maps(graph):
    nodes = graph.get("nodes") or []
    links = graph.get("links") or []
    node_ids = [node["id"] for node in nodes]
    node_by_id = {node["id"]: node for node in nodes}

    adjacency = {node_id: [] for node_id in node_ids}
    reverse_adjacency = {node_id: [] for node_id in node_ids}
    indegree = {node_id: 0 for node_id in node_ids}
    edge_by_pair = {}

    for edge in links:
        source = edge["source"]
        target = edge["target"]
        if source not in adjacency or target not in reverse_adjacency:
            continue
        if target not in adjacency[source]:
            adjacency[source].append(target)
            reverse_adjacency[target].append(source)
            indegree[target] += 1
        edge_by_pair[(source, target)] = edge["id"]

    root_id = ""
    for node in nodes:
        if _safe_text(node.get("name"), "").lower() == "root":
            root_id = node["id"]
            break
    if not root_id:
        root_candidates = [node_id for node_id, value in indegree.items() if value == 0]
        root_id = root_candidates[0] if root_candidates else (node_ids[0] if node_ids else "")

    parent_map = {}
    depth_map = {}
    if root_id:
        parent_map[root_id] = None
        depth_map[root_id] = 0
        queue = [root_id]

        while queue:
            current = queue.pop(0)
            next_depth = depth_map.get(current, 0) + 1
            for child_id in adjacency.get(current, []):
                if child_id in depth_map:
                    continue
                parent_map[child_id] = current
                depth_map[child_id] = next_depth
                queue.append(child_id)

        for node_id in node_ids:
            if node_id not in depth_map:
                if node_id != root_id:
                    parent_map[node_id] = root_id
                    depth_map[node_id] = 1
                    if node_id not in adjacency[root_id]:
                        adjacency[root_id].append(node_id)
                        reverse_adjacency[node_id].append(root_id)
                else:
                    depth_map[node_id] = 0

    return {
        "node_by_id": node_by_id,
        "adjacency": adjacency,
        "reverse_adjacency": reverse_adjacency,
        "indegree": indegree,
        "edge_by_pair": edge_by_pair,
        "parent_map": parent_map,
        "depth_map": depth_map,
        "root_id": root_id,
    }


def _rank_ai_focus_nodes(graph, graph_maps, limit=8):
    root_id = graph_maps.get("root_id")
    ranked = []
    for node in graph.get("nodes") or []:
        node_id = node["id"]
        if node_id == root_id:
            continue

        out_degree = len(graph_maps["adjacency"].get(node_id, []))
        in_degree = len(graph_maps["reverse_adjacency"].get(node_id, []))
        depth = graph_maps["depth_map"].get(node_id, 99)
        score = out_degree * 2 + in_degree + max(0, 5 - depth)
        ranked.append((score, -depth, node["name"], node))

    ranked.sort(key=lambda item: (-item[0], item[1], item[2]))
    focus_nodes = [item[3] for item in ranked[:limit]]

    if not focus_nodes:
        focus_nodes = (graph.get("nodes") or [])[:limit]

    return focus_nodes


def _build_ai_mastery_snapshot(graph, graph_maps, limit=8):
    focus_nodes = _rank_ai_focus_nodes(graph, graph_maps, limit=limit)
    issue_pool = [
        "概念边界混淆",
        "条件与结论转换不稳定",
        "综合题迁移不足",
        "符号化表达不够稳定",
        "多步推理中间桥接缺失",
    ]
    advice_pool = [
        "先做 5 道基础判断题，稳定概念边界。",
        "把定义、反例和等价形式放在同一张笔记里对照复盘。",
        "针对应用层题目补一轮分步推理训练，再做综合题。",
        "建议先回到图谱中的前置节点复习，再继续当前节点。",
        "把错误样例整理成一张错因卡，下一轮训练前先快速浏览。",
    ]

    snapshot = []
    for index, node in enumerate(focus_nodes):
        name = node["name"]
        node_id = node["id"]
        base_mastery = 52 + _stable_int(name + "-mastery", 38)
        if index % 4 == 0:
            base_mastery -= 10
        if index % 5 == 2:
            base_mastery += 5
        mastery = _clamp_int(base_mastery, 38, 95)

        confidence = _clamp_int(74 + _stable_int(name + "-confidence", 22), 70, 96)
        attempts = 6 + _stable_int(name + "-attempts", 12)
        difficulty = _clamp_int(42 + _stable_int(name + "-difficulty", 44), 35, 92)
        remember = _clamp_int(mastery + 8 - _stable_int(name + "-remember", 8), 30, 97)
        understand = _clamp_int(mastery + 4 - _stable_int(name + "-understand", 9), 28, 96)
        apply = _clamp_int(mastery - 3 - _stable_int(name + "-apply", 11), 24, 92)
        transfer = _clamp_int(mastery - 9 - _stable_int(name + "-transfer", 12), 18, 88)
        trend_token = _stable_int(name + "-trend", 3)
        trend = "up" if trend_token == 0 else "steady" if trend_token == 1 else "down"
        trend_delta = 2 + _stable_int(name + "-delta", 7)
        risk_level = "high" if mastery < 60 else "medium" if mastery < 76 else "low"
        depth = graph_maps["depth_map"].get(node_id, 0)

        snapshot.append({
            "id": node_id,
            "name": name,
            "details": node.get("details", ""),
            "mastery": mastery,
            "confidence": confidence,
            "attempts": attempts,
            "difficulty": difficulty,
            "depth": depth,
            "trend": trend,
            "trend_delta": trend_delta,
            "risk_level": risk_level,
            "matrix": [remember, understand, apply, transfer],
            "mistake_pattern": issue_pool[_stable_int(name + "-mistake", len(issue_pool))],
            "advice": advice_pool[_stable_int(name + "-advice", len(advice_pool))],
        })

    return snapshot


def _build_ai_student_snapshot(mastery_snapshot):
    mastery_values = [item["mastery"] for item in mastery_snapshot]
    avg_mastery = round(sum(mastery_values) / len(mastery_values)) if mastery_values else 72
    answered_count = 90 + len(mastery_snapshot) * 7
    accuracy = _clamp_int(avg_mastery + 5, 55, 96)
    return {
        "id": "STU-2026-017",
        "name": "示例学生 A",
        "class_name": "软件工程 2302",
        "course_name": "离散数学智能学习",
        "recent_accuracy": accuracy,
        "answered_count": answered_count,
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }


def _build_cognitive_diagnosis_payload():
    graph = _load_ai_graph_payload()
    graph_maps = _build_ai_graph_maps(graph)
    mastery_snapshot = _build_ai_mastery_snapshot(graph, graph_maps, limit=8)
    student = _build_ai_student_snapshot(mastery_snapshot)

    mastery_values = [item["mastery"] for item in mastery_snapshot]
    average_mastery = round(sum(mastery_values) / len(mastery_values)) if mastery_values else 72
    high_risk_count = sum(1 for item in mastery_snapshot if item["risk_level"] == "high")
    strong_count = sum(1 for item in mastery_snapshot if item["mastery"] >= 80)
    expected_gain = max(8, high_risk_count * 4 + 6)

    sorted_by_risk = sorted(
        mastery_snapshot,
        key=lambda item: (item["mastery"], -item["difficulty"], item["name"]),
    )

    issues = []
    for item in sorted_by_risk[:3]:
        issues.append({
            "knowledge": item["name"],
            "title": item["mistake_pattern"],
            "evidence": f"最近 {item['attempts']} 次相关作答中，应用/迁移层得分明显低于识记层。",
            "impact": f"当前掌握度 {item['mastery']}%，若不补强，容易影响后续关联节点学习。",
            "action": item["advice"],
        })

    timeline = []
    for index, item in enumerate(mastery_snapshot[:6]):
        timeline.append({
            "label": f"阶段 {index + 1}",
            "knowledge": item["name"],
            "score": _clamp_int(item["mastery"] - 6 + index * 2, 35, 96),
            "change": ("+" if item["trend"] == "up" else "-" if item["trend"] == "down" else "±") + str(item["trend_delta"]),
        })

    actions = []
    for index, item in enumerate(sorted_by_risk[:4]):
        actions.append({
            "title": f"优先补强 {item['name']}",
            "detail": item["advice"],
            "duration_minutes": 18 + index * 6,
            "priority": "高" if index < 2 else "中",
        })

    return {
        "student": student,
        "summary": {
            "mastery_score": average_mastery,
            "diagnosis_confidence": round(sum(item["confidence"] for item in mastery_snapshot) / len(mastery_snapshot)) if mastery_snapshot else 86,
            "high_risk_count": high_risk_count,
            "strong_count": strong_count,
            "expected_gain": expected_gain,
        },
        "radar": [
            {"label": item["name"], "value": item["mastery"]}
            for item in mastery_snapshot[:6]
        ],
        "knowledge_cards": mastery_snapshot,
        "matrix_dimensions": ["识记", "理解", "应用", "迁移"],
        "matrix_rows": [
            {
                "id": item["id"],
                "name": item["name"],
                "values": item["matrix"],
                "risk_level": item["risk_level"],
            }
            for item in mastery_snapshot
        ],
        "issues": issues,
        "timeline": timeline,
        "actions": actions,
        "integration": {
            "status": "mock",
            "endpoint": "/api/cognitive-diagnosis",
            "replace_hint": "后续只需在 cognitive_diagnosis_api 中替换为真实认知诊断模型返回即可，前端结构无需改动。",
        },
    }


def _build_root_path(parent_map, target_id):
    current_id = _safe_text(target_id, "")
    if not current_id:
        return []

    path = []
    visited = set()
    while current_id and current_id not in visited:
        path.append(current_id)
        visited.add(current_id)
        current_id = parent_map.get(current_id)
    path.reverse()
    return path


def _build_learning_path_payload():
    graph = _load_ai_graph_payload()
    graph_maps = _build_ai_graph_maps(graph)
    mastery_snapshot = _build_ai_mastery_snapshot(graph, graph_maps, limit=10)
    student = _build_ai_student_snapshot(mastery_snapshot)
    profile_by_id = {item["id"]: item for item in mastery_snapshot}

    target_candidates = sorted(
        mastery_snapshot,
        key=lambda item: (
            item["mastery"],
            -(graph_maps["depth_map"].get(item["id"], 0)),
            -len(graph_maps["adjacency"].get(item["id"], [])),
        ),
    )
    primary_target = target_candidates[0] if target_candidates else None
    for item in target_candidates:
        if graph_maps["depth_map"].get(item["id"], 0) >= 2:
            primary_target = item
            break

    path_node_ids = _build_root_path(
        graph_maps["parent_map"],
        primary_target["id"] if primary_target else graph_maps.get("root_id", ""),
    )

    if primary_target:
        first_child = next(
            (
                child_id
                for child_id in graph_maps["adjacency"].get(primary_target["id"], [])
                if child_id not in path_node_ids
            ),
            "",
        )
        if first_child:
            path_node_ids.append(first_child)

    path_node_ids = [node_id for index, node_id in enumerate(path_node_ids) if node_id and node_id not in path_node_ids[:index]]
    path_node_set = set(path_node_ids)

    path_edge_ids = []
    for index in range(len(path_node_ids) - 1):
        pair = (path_node_ids[index], path_node_ids[index + 1])
        edge_id = graph_maps["edge_by_pair"].get(pair)
        if edge_id:
            path_edge_ids.append(edge_id)

    alternative_node_ids = []
    for index, node_id in enumerate(path_node_ids[:-1]):
        next_path_node = path_node_ids[index + 1]
        for child_id in graph_maps["adjacency"].get(node_id, []):
            if child_id == next_path_node or child_id in path_node_set or child_id in alternative_node_ids:
                continue
            alternative_node_ids.append(child_id)
            if len(alternative_node_ids) >= 4:
                break
        if len(alternative_node_ids) >= 4:
            break

    graph_nodes = []
    for node in graph.get("nodes") or []:
        node_id = node["id"]
        graph_nodes.append({
            "id": node_id,
            "name": node["name"],
            "details": node.get("details", ""),
            "depth": graph_maps["depth_map"].get(node_id, 0),
            "mastery": profile_by_id.get(node_id, {}).get("mastery", 0),
            "role": "path" if node_id in path_node_set else "alternative" if node_id in alternative_node_ids else "support",
        })

    graph_links = []
    for edge in graph.get("links") or []:
        graph_links.append({
            "id": edge["id"],
            "source": edge["source"],
            "target": edge["target"],
            "description": edge["description"],
            "role": "path" if edge["id"] in path_edge_ids else "support",
        })

    steps = []
    for index, node_id in enumerate(path_node_ids):
        node = graph_maps["node_by_id"].get(node_id, {"name": node_id, "details": ""})
        profile = profile_by_id.get(node_id)
        current_mastery = profile.get("mastery", 70) if profile else 70
        steps.append({
            "id": node_id,
            "title": node["name"],
            "detail": node.get("details") or "建议围绕该节点完成概念梳理、例题训练与一次小测验证。",
            "duration_minutes": 14 + index * 6,
            "mastery": current_mastery,
            "target_mastery": min(96, current_mastery + 12),
            "checkpoint": f"完成 1 轮知识回顾 + {4 + index} 道针对性练习题。",
        })

    phase_slices = [
        ("基础澄清", "先补概念与前置关系，避免后续路径空转。", path_node_ids[:2]),
        ("重点攻坚", "对当前薄弱节点做分层训练，优先修复高风险环节。", path_node_ids[1: max(3, len(path_node_ids) - 1)]),
        ("迁移应用", "把局部知识迁移到综合题场景，验证路径效果。", path_node_ids[-2:]),
    ]
    phases = []
    for title, summary, phase_node_ids in phase_slices:
        cleaned_ids = [node_id for index, node_id in enumerate(phase_node_ids) if node_id not in phase_node_ids[:index]]
        if not cleaned_ids:
            continue
        phases.append({
            "title": title,
            "summary": summary,
            "node_ids": cleaned_ids,
            "node_names": [
                graph_maps["node_by_id"].get(node_id, {}).get("name", node_id)
                for node_id in cleaned_ids
            ],
        })

    alternatives = []
    for node_id in alternative_node_ids:
        node = graph_maps["node_by_id"].get(node_id)
        if not node:
            continue
        alternatives.append({
            "id": node_id,
            "name": node["name"],
            "reason": "该分支与当前主路径相邻，可作为完成主路径后的拓展训练。",
        })

    current_mastery = primary_target["mastery"] if primary_target else 72
    estimated_minutes = sum(step["duration_minutes"] for step in steps)

    return {
        "student": student,
        "summary": {
            "current_mastery": current_mastery,
            "target_mastery": min(96, current_mastery + 14),
            "estimated_minutes": estimated_minutes,
            "expected_gain": max(8, min(22, 90 - current_mastery)),
            "focus_target": primary_target["name"] if primary_target else "核心知识点",
        },
        "graph": {
            "nodes": graph_nodes,
            "links": graph_links,
        },
        "recommended_path": {
            "node_ids": path_node_ids,
            "edge_ids": path_edge_ids,
            "target_id": primary_target["id"] if primary_target else "",
        },
        "focus_nodes": [
            {
                "id": item["id"],
                "name": item["name"],
                "mastery": item["mastery"],
                "gap": max(0, 88 - item["mastery"]),
            }
            for item in target_candidates[:4]
        ],
        "steps": steps,
        "phases": phases,
        "alternatives": alternatives,
        "integration": {
            "status": "mock",
            "endpoint": "/api/learning-path",
            "replace_hint": "后续可把 learning_path_api 的 mock 结果替换成真实推荐模型输出，前端仍沿用当前路径高亮与阶段面板。",
        },
    }


def _build_q_matrix_payload():
    graph = _load_ai_graph_payload()
    graph_maps = _build_ai_graph_maps(graph)
    knowledge_points = _rank_ai_focus_nodes(graph, graph_maps, limit=8)
    if not knowledge_points:
        knowledge_points = graph.get("nodes") or []

    matrix_rows = []
    exercises = []
    total_non_zero = 0
    knowledge_coverage = {item["id"]: 0 for item in knowledge_points}

    exercise_total = max(8, min(12, len(knowledge_points) + 2)) if knowledge_points else 8
    difficulty_labels = ["基础", "进阶", "综合"]
    source_labels = ["课堂练习", "课后作业", "单元测验"]

    for index in range(exercise_total):
        primary = knowledge_points[index % len(knowledge_points)]
        secondary = knowledge_points[(index + 2) % len(knowledge_points)] if len(knowledge_points) > 1 else primary
        tertiary = knowledge_points[(index + 4) % len(knowledge_points)] if len(knowledge_points) > 2 and index % 3 == 0 else None

        values = []
        for point in knowledge_points:
            level = 0
            if point["id"] == primary["id"]:
                level = 3
            elif point["id"] == secondary["id"]:
                level = 2
            elif tertiary and point["id"] == tertiary["id"]:
                level = 1

            values.append(level)
            if level > 0:
                total_non_zero += 1
                knowledge_coverage[point["id"]] += 1

        title = f"习题 {index + 1}：{primary['name']}综合训练"
        difficulty = difficulty_labels[index % len(difficulty_labels)]
        source = source_labels[index % len(source_labels)]

        exercises.append({
            "id": f"EX-{index + 1:02d}",
            "title": title,
            "difficulty": difficulty,
            "source": source,
        })
        matrix_rows.append({
            "exercise_id": f"EX-{index + 1:02d}",
            "title": title,
            "difficulty": difficulty,
            "source": source,
            "values": values,
        })

    candidates = []
    for index, row in enumerate(matrix_rows[:6]):
        knowledge_index = (index + 1) % len(knowledge_points) if knowledge_points else 0
        if not knowledge_points:
            break
        candidate_point = knowledge_points[knowledge_index]
        confidence = _clamp_int(62 + _stable_int(row["title"] + candidate_point["name"], 30), 60, 94)
        status = "recommended" if confidence >= 82 else "review" if confidence >= 72 else "weak"
        candidates.append({
            "exercise_title": row["title"],
            "knowledge_name": candidate_point["name"],
            "confidence": confidence,
            "status": status,
            "reason": "从题干关键词、解题步骤与已有关系模式综合推断得到的候选关联。",
        })

    knowledge_summary = []
    for point in knowledge_points:
        coverage = knowledge_coverage.get(point["id"], 0)
        knowledge_summary.append({
            "id": point["id"],
            "name": point["name"],
            "coverage": coverage,
            "coverage_rate": round((coverage / exercise_total) * 100) if exercise_total else 0,
        })

    matrix_cell_count = max(1, exercise_total * max(1, len(knowledge_points)))
    density = round((total_non_zero / matrix_cell_count) * 100, 1)
    avg_links = round(total_non_zero / max(1, exercise_total), 1)
    uncovered_count = sum(1 for point in knowledge_summary if point["coverage"] == 0)

    rules = [
        {
            "title": "每道题至少 1 个强关联知识点",
            "status": "pass",
            "detail": "当前所有演示题目都存在至少一个 2 级或 3 级关联。",
        },
        {
            "title": "每个知识点至少覆盖 2 道题",
            "status": "warn" if any(point["coverage"] < 2 for point in knowledge_summary) else "pass",
            "detail": "覆盖较低的知识点建议追加专项练习题，增强 Q 矩阵稳定性。",
        },
        {
            "title": "低置信候选关系待人工复核",
            "status": "review",
            "detail": "建议优先核查 72% 以下的候选关系，避免噪声传播到推荐模型。",
        },
    ]

    return {
        "stats": {
            "exercise_count": exercise_total,
            "knowledge_count": len(knowledge_points),
            "density": density,
            "avg_links": avg_links,
            "review_count": sum(1 for item in candidates if item["status"] != "recommended"),
            "uncovered_count": uncovered_count,
        },
        "knowledge_points": knowledge_summary,
        "exercises": exercises,
        "matrix_rows": matrix_rows,
        "candidates": candidates,
        "rules": rules,
        "integration": {
            "status": "mock",
            "endpoint": "/api/q-matrix",
            "replace_hint": "后续可将 q_matrix_api 的演示构造逻辑替换为真实 Q 矩阵模型输出，前端将自动复用新的矩阵与候选关系。",
        },
    }



@app.route('/')
def INDEX():
    pages = _build_site_pages()
    return render_template(
        "portal.html",
        encoding='UTF-8',
        current_page="portal",
        portal_pages=[page for page in pages if page["key"] != "portal"],
    )


@app.route('/knowledge-graph')
@app.route('/graph')
def knowledge_graph_page():
    return render_template("index.html", encoding='UTF-8', current_page="knowledge_graph")


@app.route('/model-center')
def model_center_page():
    return render_template(
        "model_center.html",
        encoding='UTF-8',
        current_page="model_center",
        model_pages=_build_model_pages(),
    )


@app.route('/model-center/<page_key>')
def model_workbench_page(page_key):
    model_page = _get_model_page_config(page_key)
    if not model_page:
        abort(404)

    return render_template(
        "model_workbench.html",
        encoding='UTF-8',
        current_page="model_center",
        current_model_page=page_key,
        model_page=model_page,
        model_page_json=std_json.dumps(model_page, ensure_ascii=False),
        model_pages=_build_model_pages(),
    )


@app.route('/cognitive-diagnosis')
def cognitive_diagnosis_page():
    return render_template("cognitive_diagnosis.html", encoding='UTF-8', current_page="cognitive_diagnosis")


@app.route('/learning-path')
def learning_path_page():
    return render_template("learning_path.html", encoding='UTF-8', current_page="learning_path")


@app.route('/q-matrix')
def q_matrix_page():
    return render_template("q_matrix.html", encoding='UTF-8', current_page="q_matrix")


@app.route('/micro-video')
def micro_video_page():
    return render_template("micro_video.html", encoding='UTF-8', current_page="micro_video")

# @app.route('/magi')
# def MAGI():
#     return render_template("magi.html", encoding='UTF-8')

def _build_legacy_graph_payload():
    data,data2 = getjson()
    json_data = data.to_json(orient='records')
    json_data2 = data2.to_json(orient='records')
    return {'data1': json_data, 'data2': json_data2}


def _fallback_score_exercise(exercise, student_answer):
    normalized_answer = _normalize_answer_payload(student_answer)
    answer_text = _stringify_answer(normalized_answer)
    input_type = _safe_text(exercise.get("input_type"), "text").lower()
    reference_answer = _safe_text(exercise.get("answer"), "")
    rubric = _safe_text(exercise.get("rubric"), "")
    analysis_text = _safe_text(exercise.get("analysis"), "")

    if not answer_text:
        return {
            "score": 0,
            "max_score": 100,
            "mode": "fallback",
            "feedback": "当前还没有检测到作答内容，请先完成作答后再提交评分。",
            "strengths": [],
            "improvements": ["补充完整答案后重新提交评分。"],
        }

    choice_types = {"single_choice", "single", "radio", "choice", "select"}
    multi_choice_types = {"multiple_choice", "multiple", "checkbox", "multi_select"}

    if input_type in choice_types:
        score = 100 if answer_text.strip().lower() == reference_answer.strip().lower() else 20
        return {
            "score": score,
            "max_score": 100,
            "mode": "fallback",
            "feedback": "答案与参考答案一致。" if score == 100 else "答案与参考答案不一致，建议对照正确答案复习后重做。",
            "strengths": ["选择结果正确。"] if score == 100 else [],
            "improvements": [] if score == 100 else ["重新检查选项含义，并对照知识点概念进行判断。"],
        }

    if input_type in multi_choice_types:
        expected_set = set(_split_answer_tokens(reference_answer))
        student_set = set(_split_answer_tokens(normalized_answer))
        overlap_ratio = len(expected_set & student_set) / len(expected_set | student_set) if (expected_set or student_set) else 0.0
        score = int(round(overlap_ratio * 100))
        return {
            "score": score,
            "max_score": 100,
            "mode": "fallback",
            "feedback": "多选答案匹配度已按参考答案进行估算评分。",
            "strengths": ["部分关键选项选择正确。"] if score >= 60 else [],
            "improvements": ["核对遗漏或误选的选项，并结合正确答案理解原因。"],
        }

    keyword_source = "\n".join([reference_answer, rubric, analysis_text]).strip()
    keywords = _extract_keywords(keyword_source, limit=12)
    lowered_answer = answer_text.lower()
    matched_keywords = [
        keyword
        for keyword in keywords
        if keyword.lower() in lowered_answer
    ]
    keyword_ratio = (len(matched_keywords) / len(keywords)) if keywords else 0.0
    length_ratio = min(len(answer_text) / 160.0, 1.0)
    score = int(round(min(100, 18 + keyword_ratio * 58 + length_ratio * 24)))

    strengths = []
    if matched_keywords:
        strengths.append("答案覆盖了部分关键点：" + "、".join(matched_keywords[:4]) + "。")
    if len(answer_text) >= 60:
        strengths.append("作答内容较完整，具备一定展开说明。")

    improvements = []
    missing_keywords = [item for item in keywords if item not in matched_keywords]
    if missing_keywords:
        improvements.append("可以补充这些关键点：" + "、".join(missing_keywords[:4]) + "。")
    if len(answer_text) < 40:
        improvements.append("建议把推理过程写得更完整，避免只给结论。")

    if score >= 85:
        feedback = "答案整体较完整，关键概念覆盖较好。"
    elif score >= 60:
        feedback = "答案有一定基础，但仍有关键点可以补充。"
    else:
        feedback = "当前答案与参考要点还有较明显差距，建议先查看正确答案和解析后再练习。"

    return {
        "score": max(0, min(100, score)),
        "max_score": 100,
        "mode": "fallback",
        "feedback": feedback,
        "strengths": strengths,
        "improvements": improvements or ["对照参考答案补充核心概念和推理步骤。"],
    }


def _get_model_page_config(page_key):
    for item in MODEL_PAGE_REGISTRY:
        if item.get("key") == page_key:
            page = dict(item)
            page["url"] = url_for("model_workbench_page", page_key=item["key"])
            page["api_url"] = url_for("model_workbench_api", page_key=item["key"])
            return page
    return None


def _dedupe_preserve_order(items):
    seen = set()
    result = []
    for item in items:
        text = _safe_text(item, "")
        if not text:
            continue
        marker = text.lower()
        if marker in seen:
            continue
        seen.add(marker)
        result.append(text)
    return result


def _split_text_items(text):
    return _dedupe_preserve_order(
        [segment.strip() for segment in re.split(r"[\n,，、；;|]+", _safe_text(text, "")) if segment.strip()]
    )


def _split_sentences(text):
    return [segment.strip() for segment in re.split(r"[。！？!?；;\n]+", _safe_text(text, "")) if segment.strip()]


def _normalize_whitespace(text):
    return re.sub(r"\s+", " ", _safe_text(text, "")).strip()


def _extract_upload_bundle(file_storage):
    bundle = {
        "filename": "",
        "content_type": "",
        "size": 0,
        "text_preview": "",
        "note": "未上传文档",
    }

    if not file_storage or not _safe_text(getattr(file_storage, "filename", ""), ""):
        return bundle

    raw_bytes = file_storage.read() or b""
    filename = _safe_text(file_storage.filename, "")
    content_type = _safe_text(getattr(file_storage, "content_type", ""), "")
    extension = os.path.splitext(filename)[1].lower()
    text_preview = ""

    text_extensions = {".txt", ".md", ".json", ".csv", ".tsv", ".log", ".py"}
    if raw_bytes and (extension in text_extensions or content_type.startswith("text/") or "json" in content_type):
        for encoding in ("utf-8", "gbk"):
            try:
                text_preview = raw_bytes.decode(encoding)
                break
            except UnicodeDecodeError:
                continue

    bundle.update({
        "filename": filename,
        "content_type": content_type,
        "size": len(raw_bytes),
        "text_preview": _normalize_whitespace(text_preview[:4000]),
        "note": "已提取文件正文预览。" if text_preview else "暂未解析二进制正文，将优先使用文件名和手动输入。",
    })
    return bundle


def _collect_model_form_payload():
    json_payload = request.get_json(silent=True) if request.is_json else None
    source = json_payload if isinstance(json_payload, dict) else request.form
    payload = {}

    for key in source.keys():
        payload[key] = _safe_text(source.get(key), "")

    upload_bundle = _extract_upload_bundle(request.files.get("document")) if request.files else _extract_upload_bundle(None)
    payload["_upload"] = upload_bundle
    payload["_source_text"] = "\n".join(
        part for part in [payload.get("text_input", ""), upload_bundle.get("text_preview", "")]
        if _safe_text(part, "")
    ).strip()
    return payload


def _infer_entity_type(term):
    if any(keyword in term for keyword in ["图", "树", "回路", "路径", "顶点", "边", "命题", "谓词", "集合", "关系", "矩阵"]):
        return "数学对象"
    if any(keyword in term for keyword in ["连通", "无回路", "自反", "对称", "传递", "等价", "偏序", "相邻"]):
        return "性质指标"
    if any(keyword in term for keyword in ["归纳法", "反证法", "容斥原理", "鸽巢原理", "算法", "证明"]):
        return "规则方法"
    if any(keyword in term for keyword in ["邻接矩阵", "真值表", "哈斯图"]):
        return "表示方法"
    return "知识术语"


def _recommend_hypernym(term):
    if any(keyword in term for keyword in ["图", "树", "回路", "路径", "顶点", "边", "邻接矩阵", "生成树"]):
        return "图论概念", "术语与图、树、回路、邻接矩阵等图论核心对象高度相关。"
    if any(keyword in term for keyword in ["命题", "谓词", "量词", "真值表", "联结词"]):
        return "逻辑概念", "术语更适合归入命题逻辑或谓词逻辑层级。"
    if any(keyword in term for keyword in ["关系", "等价", "偏序", "哈斯图", "集合"]):
        return "关系与集合", "术语主要描述集合、关系及其结构性质。"
    if any(keyword in term for keyword in ["归纳法", "反证法", "容斥原理", "鸽巢原理", "计数"]):
        return "证明与计数方法", "术语属于离散数学中常见的证明或计数方法。"
    return "离散数学知识点", "默认归入离散数学通用知识点层级，后续可继续细化。"


def _detect_knowledge_tags(title, text, limit=6):
    haystack = (_safe_text(title, "") + "\n" + _safe_text(text, "")).lower()
    rules = [
        ("命题逻辑", ["命题", "联结词", "真值表", "蕴含", "等价"]),
        ("谓词逻辑", ["谓词", "量词", "全称量词", "存在量词", "∃", "∀", "否定"]),
        ("集合与关系", ["集合", "关系", "自反", "对称", "传递", "等价关系"]),
        ("偏序与哈斯图", ["偏序", "哈斯图", "极大元", "极小元", "上确界", "下确界"]),
        ("图论基础", ["图", "顶点", "边", "度", "邻接矩阵"]),
        ("树与生成树", ["树", "生成树", "回路", "无向连通图", "叶子"]),
        ("组合计数", ["排列", "组合", "容斥原理", "二项式", "鸽巢原理"]),
        ("数学归纳法", ["归纳法", "归纳假设", "归纳步骤", "基例"]),
    ]

    matches = []
    for tag_name, keywords in rules:
        hit_keywords = [keyword for keyword in keywords if keyword.lower() in haystack]
        if hit_keywords:
            matches.append({
                "name": tag_name,
                "confidence": min(96, 66 + len(hit_keywords) * 8),
                "reason": "命中关键词：" + "、".join(hit_keywords[:3]),
            })

    if not matches:
        for keyword in _extract_keywords(haystack, limit=limit):
            matches.append({
                "name": keyword,
                "confidence": 60,
                "reason": "从文本高频词中生成的候选标签。",
            })

    return matches[:limit]


def _build_entity_recognition_payload(form_payload):
    source_text = _safe_text(form_payload.get("_source_text"), "") or _safe_text(form_payload.get("candidate_terms"), "")
    if not source_text:
        source_text = "设 G=(V,E) 是无向连通图。若 G 中不存在回路，则 G 是一棵树。"

    term_patterns = [
        r"无向连通图",
        r"无向图",
        r"有向图",
        r"生成树",
        r"邻接矩阵",
        r"真值表",
        r"等价关系",
        r"偏序关系",
        r"数学归纳法",
        r"容斥原理",
        r"鸽巢原理",
        r"回路",
        r"树",
        r"路径",
        r"顶点",
        r"边",
        r"命题",
        r"谓词",
        r"量词",
    ]
    extracted_terms = []
    for pattern in term_patterns:
        extracted_terms.extend(re.findall(pattern, source_text))

    extracted_terms.extend(_split_text_items(form_payload.get("candidate_terms", "")))
    if not extracted_terms:
        extracted_terms.extend(tag.get("name") for tag in _detect_knowledge_tags("", source_text, limit=6))
    terms = _dedupe_preserve_order(extracted_terms)[:10]

    sentences = _split_sentences(source_text)
    entities = []
    for index, term in enumerate(terms):
        evidence = next((sentence for sentence in sentences if term in sentence), sentences[0] if sentences else source_text)
        entity_type = _infer_entity_type(term)
        hypernym, _ = _recommend_hypernym(term)
        entities.append({
            "name": term,
            "type": entity_type,
            "hypernym": hypernym,
            "confidence": max(62, min(97, 88 - index * 3)),
            "evidence": evidence[:120],
        })

    groups = {}
    for entity in entities:
        groups.setdefault(entity["type"], []).append(entity["name"])

    return {
        "mode": "mock",
        "headline": "已完成实体识别演示处理",
        "summary": "页面已经打通“文本/文档输入 -> 后端处理 -> 前端结果展示”的完整链路，后续替换成真实实体识别模型即可。",
        "overview_metrics": [
            {"label": "候选实体数", "value": str(len(entities)), "footnote": "当前返回到页面的实体条目数"},
            {"label": "实体类型数", "value": str(len(groups)), "footnote": "按术语角色做了粗分类"},
            {"label": "输入来源", "value": "文档+文本" if form_payload.get("_upload", {}).get("filename") else "文本", "footnote": "支持上传和直接输入两种入口"},
            {"label": "最高置信度", "value": str(max([item["confidence"] for item in entities] or [0])) + "%", "footnote": "便于快速筛选优先确认项"},
        ],
        "entities": entities,
        "groups": [{"title": title, "items": items} for title, items in groups.items()],
        "suggestions": [
            "如果后续接入真实 NER 模型，可直接复用当前结果卡片与证据片段区域。",
            "上位词推荐页可以直接承接本页识别出的实体列表。",
        ],
        "upload": form_payload.get("_upload", {}),
        "integration": {
            "endpoint": "/api/model-workbench/entity_recognition",
            "replace_hint": "将当前规则演示逻辑替换为真实实体识别模型返回即可。",
        },
    }


def _build_hypernym_payload(form_payload):
    raw_terms = _split_text_items(form_payload.get("text_input", ""))
    if not raw_terms:
        raw_terms = [item["name"] for item in _build_entity_recognition_payload(form_payload).get("entities", [])]
    terms = raw_terms[:10]

    recommendations = []
    tree_groups = {}
    for term in terms:
        hypernym, reason = _recommend_hypernym(term)
        tree_groups.setdefault(hypernym, []).append(term)
        recommendations.append({
            "term": term,
            "hypernym": hypernym,
            "confidence": 84 if any(keyword in term for keyword in ["图", "树", "关系", "逻辑", "归纳", "矩阵", "量词", "命题"]) else 76,
            "reason": reason,
        })

    tree = {
        "name": "离散数学知识体系",
        "children": [
            {
                "name": group_name,
                "children": [{"name": term} for term in group_terms],
            }
            for group_name, group_terms in tree_groups.items()
        ],
    }

    return {
        "mode": "mock",
        "headline": "已生成上位词推荐结果",
        "summary": "当前结果可以作为术语归类的第一版候选，也可以继续接入真实模型提升层级语义质量。",
        "overview_metrics": [
            {"label": "术语数", "value": str(len(terms)), "footnote": "参与上位词推荐的术语总数"},
            {"label": "上位层级数", "value": str(len(tree_groups)), "footnote": "当前生成的一级上位词节点数"},
            {"label": "组织方式", "value": "树结构" if form_payload.get("tree_mode", "tree") == "tree" else "推荐列表", "footnote": "与页面中的展示模式对应"},
            {"label": "最高置信度", "value": str(max([item["confidence"] for item in recommendations] or [0])) + "%", "footnote": "建议优先确认高置信候选"},
        ],
        "recommendations": recommendations,
        "tree": tree,
        "suggestions": [
            "如果术语来自实体识别结果，可以将上一页返回的实体名批量传入本页。",
            "后续可将树节点继续映射到知识图谱中的本体层级。",
        ],
        "integration": {
            "endpoint": "/api/model-workbench/hypernym_recommendation",
            "replace_hint": "将规则推荐替换为真实上位词模型输出后，前端树结构无需改动。",
        },
    }


def _build_resource_tagging_payload(form_payload):
    resource_mode = _safe_text(form_payload.get("resource_mode"), "text") or "text"
    resource_title = _safe_text(form_payload.get("resource_title"), "") or form_payload.get("_upload", {}).get("filename", "")
    source_text = _safe_text(form_payload.get("_source_text"), "")

    if not source_text:
        source_text = "在无向图的邻接矩阵中，第 i 行第 j 列元素表示顶点 vi 与 vj 是否相邻。"

    overall_tags = _detect_knowledge_tags(resource_title, source_text, limit=6)
    blocks = []

    if resource_mode == "video":
        segments = [segment for segment in source_text.splitlines() if segment.strip()]
        if not segments:
            segments = _split_sentences(source_text)
        segments = segments[:4] or [resource_title or "视频片段 1"]
        for index, segment in enumerate(segments, start=1):
            block_tags = _detect_knowledge_tags(resource_title, segment, limit=3)
            blocks.append({
                "title": f"视频块 {index}",
                "summary": segment[:88],
                "tags": block_tags,
            })
    else:
        blocks.append({
            "title": "文本资源",
            "summary": source_text[:120],
            "tags": overall_tags[:4],
        })

    return {
        "mode": "mock",
        "headline": "已完成资源标签分类",
        "summary": "文本资源当前返回多标签候选；视频资源则按分段描述生成块级标签，后续可以替换成真实分类模型和切分模型。",
        "overview_metrics": [
            {"label": "资源类型", "value": "视频" if resource_mode == "video" else "文本", "footnote": "对应本次提交的资源类型"},
            {"label": "整体标签数", "value": str(len(overall_tags)), "footnote": "资源级多标签候选数量"},
            {"label": "块级结果数", "value": str(len(blocks)), "footnote": "视频模式下代表切分后的片段数"},
            {"label": "最高置信度", "value": str(max([item["confidence"] for item in overall_tags] or [0])) + "%", "footnote": "可作为人工复核优先级依据"},
        ],
        "tags": overall_tags,
        "blocks": blocks,
        "upload": form_payload.get("_upload", {}),
        "integration": {
            "endpoint": "/api/model-workbench/resource_tagging",
            "replace_hint": "后续可将视频切分与多标签分类分别替换为真实模型输出。",
        },
    }


def _build_diagnosis_workbench_payload(form_payload):
    student_name = _safe_text(form_payload.get("student_name"), "") or "当前学生"
    source_text = _safe_text(form_payload.get("_source_text"), "")
    if not source_text:
        source_text = "命题逻辑基础较稳，但量词否定经常出错；能判断简单图是否连通，但对树与回路的判定不熟练，数学归纳法证明步骤不完整。"

    tags = _detect_knowledge_tags("", source_text, limit=4)
    weakness_hits = sum(source_text.count(keyword) for keyword in ["弱", "错", "不会", "困难", "失分", "偏低"])
    strength_hits = sum(source_text.count(keyword) for keyword in ["稳定", "较好", "熟练", "掌握", "正确"])
    overall_score = max(35, min(92, 72 - weakness_hits * 4 + strength_hits * 3))

    risks = []
    actions = []
    for index, tag in enumerate(tags[:3], start=1):
        confidence = max(46, overall_score - index * 8)
        risks.append({
            "title": tag["name"],
            "level": "high" if index == 1 else "medium",
            "evidence": tag["reason"],
            "score": f"{confidence}%",
        })
        actions.append({
            "title": f"{tag['name']}专项干预",
            "owner": "教师 / 系统",
            "detail": f"围绕 {tag['name']} 设计 2-3 组分层练习，并观察下一次作答是否改善。",
        })

    breakdown = []
    for index, tag in enumerate(tags[:4], start=1):
        breakdown.append({
            "name": tag["name"],
            "score": max(42, min(90, overall_score - index * 5 + 8)),
            "note": "建议作为下一轮复习与诊断关注项。",
        })

    return {
        "mode": "mock",
        "headline": f"已生成 {student_name} 的认知诊断结果",
        "summary": "这是新的模型调用页，不替代原有可视化展示页。你可以先在这里提交记录生成结果，再跳转到诊断展示页做更强的可视化呈现。",
        "overview_metrics": [
            {"label": "综合掌握度", "value": str(overall_score) + "%", "footnote": "根据输入记录做的演示估计"},
            {"label": "高风险点数", "value": str(len(risks)), "footnote": "建议优先干预的知识主题数量"},
            {"label": "学生对象", "value": student_name, "footnote": "支持面向单个学生或小组记录"},
            {"label": "建议动作数", "value": str(len(actions)), "footnote": "可直接转给教师侧作为干预清单"},
        ],
        "risks": risks,
        "actions": actions,
        "breakdown": breakdown,
        "integration": {
            "endpoint": "/api/model-workbench/model_cognitive_diagnosis",
            "replace_hint": "后续可直接将当前页的演示诊断逻辑替换成真实认知诊断模型。",
        },
    }


def _build_learning_path_workbench_payload(form_payload):
    student_name = _safe_text(form_payload.get("student_name"), "") or "当前学习者"
    target_topic = _safe_text(form_payload.get("target_topic"), "") or "树与生成树"
    source_text = _safe_text(form_payload.get("_source_text"), "")
    tag_names = [item["name"] for item in _detect_knowledge_tags(target_topic, source_text or target_topic, limit=4)] or [target_topic]

    steps = [
        {
            "phase": "阶段 1",
            "title": "补齐前置基础",
            "goal": f"先把 {tag_names[0]} 的核心概念和基本题型补稳。",
            "focus": tag_names[:2],
        },
        {
            "phase": "阶段 2",
            "title": "集中突破目标主题",
            "goal": f"围绕 {target_topic} 做针对性训练和错因修正。",
            "focus": tag_names[:3],
        },
        {
            "phase": "阶段 3",
            "title": "迁移与综合应用",
            "goal": "通过综合题、变式题和情境题完成迁移。",
            "focus": tag_names[-2:] or tag_names[:1],
        },
    ]

    branches = [
        {"title": "提速分支", "detail": "如果基础正确率已稳定，可提前进入综合题训练。"},
        {"title": "巩固分支", "detail": "如果阶段测验波动较大，先回到薄弱知识点做小步复练。"},
    ]

    return {
        "mode": "mock",
        "headline": f"已为 {student_name} 生成学习路径建议",
        "summary": "这张页面负责接收目标、诊断摘要和约束条件，输出一条可以直接执行的学习路径；原有学习路径可视化页仍可继续保留做图形化展示。",
        "overview_metrics": [
            {"label": "目标主题", "value": target_topic, "footnote": "本次路径推荐的主目标"},
            {"label": "阶段数", "value": str(len(steps)), "footnote": "已拆分为多个可执行阶段"},
            {"label": "重点主题数", "value": str(len(tag_names)), "footnote": "会反复出现在路径中的核心知识点"},
            {"label": "建议周期", "value": "2-3 周", "footnote": "可根据真实学习节奏继续调整"},
        ],
        "steps": steps,
        "branches": branches,
        "milestones": [
            f"完成 {steps[0]['title']} 后进行一次基础测验。",
            f"完成 {steps[1]['title']} 后复盘典型错题并更新诊断。",
            "在综合应用阶段加入 1 次限时训练验证迁移能力。",
        ],
        "integration": {
            "endpoint": "/api/model-workbench/model_learning_path",
            "replace_hint": "后续只需把当前阶段化推荐结果替换为真实模型输出即可。",
        },
    }


def _build_q_matrix_workbench_payload(form_payload):
    knowledge_points = _split_text_items(form_payload.get("knowledge_list", ""))
    exercise_text = _safe_text(form_payload.get("text_input"), "")
    exercises = [segment.strip() for segment in re.split(r"\n\s*\n|\n", exercise_text) if segment.strip()]

    if not knowledge_points:
        knowledge_points = [item["name"] for item in _detect_knowledge_tags("", exercise_text, limit=5)]
    if not knowledge_points:
        knowledge_points = ["命题逻辑", "图论基础", "数学归纳法"]
    if not exercises:
        exercises = [
            "判断命题 p→q 与 ¬p∨q 是否等价，并说明理由。",
            "设 G 是无向连通图，证明若 G 无回路，则 G 是一棵树。",
            "用数学归纳法证明 1+2+...+n=n(n+1)/2。",
        ]

    matrix_rows = []
    strong_links = 0
    total_cells = max(1, len(exercises) * len(knowledge_points))
    review_items = []

    for exercise_index, exercise in enumerate(exercises, start=1):
        exercise_tags = [item["name"] for item in _detect_knowledge_tags("", exercise, limit=5)]
        cells = []
        for point in knowledge_points:
            level = 0
            if point in exercise:
                level = 3
            elif point in exercise_tags:
                level = 2
            elif any(keyword in exercise for keyword in point.split()):
                level = 1

            if level >= 2:
                strong_links += 1
            if level == 1:
                review_items.append({
                    "title": f"习题 {exercise_index} - {point}",
                    "detail": "当前是弱关联，建议人工复核是否需要提升或删除该关系。",
                })

            cells.append({
                "value": level,
                "confidence": 56 + level * 12,
            })

        matrix_rows.append({
            "label": f"习题 {exercise_index}",
            "text": exercise[:80],
            "cells": cells,
        })

    density = int(round((strong_links / total_cells) * 100))
    avg_links = round(strong_links / max(1, len(exercises)), 1)

    return {
        "mode": "mock",
        "headline": "已生成候选 Q 矩阵",
        "summary": "当前结果适合先做候选关系生成，再交给你已有的 Q 矩阵展示页继续热力图审查和关系校验。",
        "overview_metrics": [
            {"label": "习题数", "value": str(len(exercises)), "footnote": "本次参与构建的题目数量"},
            {"label": "知识点数", "value": str(len(knowledge_points)), "footnote": "矩阵列维度"},
            {"label": "矩阵密度", "value": str(density) + "%", "footnote": "强中关联占所有单元格的比例"},
            {"label": "平均强关联", "value": str(avg_links), "footnote": "每题平均关联到的知识点数量"},
        ],
        "knowledge_points": knowledge_points,
        "matrix": {
            "columns": knowledge_points,
            "rows": matrix_rows,
        },
        "reviews": review_items[:8],
        "integration": {
            "endpoint": "/api/model-workbench/model_q_matrix",
            "replace_hint": "将当前候选矩阵生成逻辑替换为真实 Q 矩阵模型后，前端表格与复核区可直接复用。",
        },
    }


def _build_model_workbench_payload(page_key, form_payload):
    builders = {
        "entity_recognition": _build_entity_recognition_payload,
        "hypernym_recommendation": _build_hypernym_payload,
        "resource_tagging": _build_resource_tagging_payload,
        "model_cognitive_diagnosis": _build_diagnosis_workbench_payload,
        "model_learning_path": _build_learning_path_workbench_payload,
        "model_q_matrix": _build_q_matrix_workbench_payload,
    }
    builder = builders.get(page_key)
    if not builder:
        return None
    return builder(form_payload)


def _resolve_llm_api_url():
    api_url = _safe_text(app.config.get("LLM_API_URL"), "")
    if not api_url:
        return ""
    if api_url.endswith("/chat/completions"):
        return api_url
    if api_url.endswith("/v1"):
        return api_url + "/chat/completions"
    if api_url.endswith("/v1/"):
        return api_url.rstrip("/") + "/chat/completions"
    return api_url.rstrip("/") + "/v1/chat/completions"


def _extract_chat_message_text(response_payload):
    choices = response_payload.get("choices") or []
    if not choices:
        return ""

    message = choices[0].get("message") or {}
    content = message.get("content")

    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict):
                parts.append(_safe_text(item.get("text"), ""))
            else:
                parts.append(_safe_text(item, ""))
        return "\n".join(part for part in parts if part)
    return ""


def _parse_json_object_from_text(text):
    raw_text = _safe_text(text, "")
    if not raw_text:
        return None

    try:
        parsed = std_json.loads(raw_text)
        if isinstance(parsed, dict):
            return parsed
    except (TypeError, ValueError, std_json.JSONDecodeError):
        pass

    match = re.search(r"\{[\s\S]*\}", raw_text)
    if not match:
        return None

    try:
        parsed = std_json.loads(match.group(0))
        if isinstance(parsed, dict):
            return parsed
    except (TypeError, ValueError, std_json.JSONDecodeError):
        return None
    return None


def _score_with_llm(exercise, student_answer):
    api_url = _resolve_llm_api_url()
    api_key = _safe_text(app.config.get("LLM_API_KEY"), "")
    model = _safe_text(app.config.get("LLM_MODEL"), "")

    if not api_url or not api_key or not model:
        return None

    answer_text = _stringify_answer(student_answer)
    reference_answer = _safe_text(exercise.get("answer"), "")
    rubric = _safe_text(exercise.get("rubric"), "")
    analysis_text = _safe_text(exercise.get("analysis"), "")
    question_text = _safe_text(exercise.get("question"), "") or _safe_text(exercise.get("content"), "")
    options = exercise.get("options") or []

    prompt = (
        "你是一名严格但鼓励式的数学/知识图谱学习辅导老师。"
        "请根据题目、参考答案、评分要点和学生作答进行评分。"
        "只返回 JSON，不要输出额外说明。"
        "\n\n题目标题：{title}"
        "\n题目内容：{question}"
        "\n题目选项：{options}"
        "\n参考答案：{reference_answer}"
        "\n评分要点：{rubric}"
        "\n解析：{analysis}"
        "\n学生作答：{student_answer}"
        "\n\n请输出 JSON，格式严格为："
        '{"score": 0-100 的整数, "feedback": "总体评价", "strengths": ["优点1"], "improvements": ["改进点1"]}'
    ).format(
        title=_safe_text(exercise.get("title"), "未命名习题"),
        question=question_text or "暂无题干",
        options="；".join(_normalize_option_label(item) for item in options if _normalize_option_label(item)) or "无",
        reference_answer=reference_answer or "无",
        rubric=rubric or "无",
        analysis=analysis_text or "无",
        student_answer=answer_text or "无",
    )

    body = {
        "model": model,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": "你是一个只输出 JSON 的评分助手。"},
            {"role": "user", "content": prompt},
        ],
    }

    request_payload = std_json.dumps(body).encode("utf-8")
    request_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    request_obj = urllib_request.Request(api_url, data=request_payload, headers=request_headers, method="POST")

    try:
        with urllib_request.urlopen(request_obj, timeout=int(app.config.get("LLM_TIMEOUT", 30))) as response:
            response_body = response.read().decode("utf-8")
    except (urllib_error.URLError, urllib_error.HTTPError, TimeoutError, ValueError):
        return None

    try:
        response_payload = std_json.loads(response_body)
    except (TypeError, ValueError, std_json.JSONDecodeError):
        return None

    content_text = _extract_chat_message_text(response_payload)
    parsed_result = _parse_json_object_from_text(content_text)
    if not parsed_result:
        return None

    try:
        score_value = int(round(float(parsed_result.get("score", 0))))
    except (TypeError, ValueError):
        score_value = 0

    return {
        "score": max(0, min(100, score_value)),
        "max_score": 100,
        "mode": "llm",
        "feedback": _safe_text(parsed_result.get("feedback"), "已完成大模型评分。"),
        "strengths": _normalize_string_list(parsed_result.get("strengths")),
        "improvements": _normalize_string_list(parsed_result.get("improvements")),
    }


def _score_exercise_answer(exercise, student_answer):
    llm_result = _score_with_llm(exercise, student_answer)
    if llm_result:
        return llm_result
    return _fallback_score_exercise(exercise, student_answer)


def _build_empty_node_detail(node_id):
    return {
        'node': {
            'id': str(node_id),
            'name': '',
            'image': '',
            'summary': '',
            'description': '',
            'module_path': '',
            'difficulty': '',
            'stage': '',
            'learning_goals': [],
            'prerequisites': [],
            'successors': [],
            'tags': [],
        },
        'text_resources': [],
        'video_resources': [],
    }


def _build_empty_exercise_payload(node_id):
    return {
        'node': {
            'id': str(node_id),
            'name': '',
            'image': '',
            'summary': '',
            'description': '',
            'module_path': '',
            'difficulty': '',
            'stage': '',
            'learning_goals': [],
            'prerequisites': [],
            'successors': [],
            'tags': [],
        },
        'current_exercise': None,
        'exercise_list': [],
        'exercise_count': 0,
        'current_index': -1,
    }


def _exercise_matches(payload, exercise_id):
    current = payload.get("current_exercise") or {}
    return _safe_text(current.get("id"), "") == _safe_text(exercise_id, "")


@app.route('/api/model-workbench/<page_key>', methods=['GET', 'POST'])
def model_workbench_api(page_key):
    model_page = _get_model_page_config(page_key)
    if not model_page:
        return jsonify({
            'code': 4042,
            'message': 'model workbench page not found',
            'data': None,
        }), 404

    try:
        payload = _build_model_workbench_payload(page_key, _collect_model_form_payload())
        return jsonify({
            'code': 0,
            'message': 'ok',
            'data': payload,
        })
    except Exception as exc:
        return jsonify({
            'code': 5007,
            'message': f'model workbench error: {str(exc)}',
            'data': _build_model_workbench_payload(page_key, {}),
        }), 500


@app.route('/api/graph', methods=['GET', 'POST'])
def graph_api():
    try:
        payload = _build_legacy_graph_payload()
        return jsonify({
            'code': 0,
            'message': 'ok',
            'data': {
                'nodes': json.loads(payload['data1']),
                'links': json.loads(payload['data2'])
            }
        })
    except Exception as exc:
        return jsonify({
            'code': 5001,
            'message': f'database error: {str(exc)}',
            'data': {
                'nodes': [],
                'links': []
            }
        }), 500


@app.route('/api/cognitive-diagnosis', methods=['GET', 'POST'])
def cognitive_diagnosis_api():
    try:
        return jsonify({
            'code': 0,
            'message': 'ok',
            'data': _build_cognitive_diagnosis_payload(),
        })
    except Exception as exc:
        return jsonify({
            'code': 5004,
            'message': f'cognitive diagnosis mock error: {str(exc)}',
            'data': _build_cognitive_diagnosis_payload(),
        }), 500


@app.route('/api/learning-path', methods=['GET', 'POST'])
def learning_path_api():
    try:
        return jsonify({
            'code': 0,
            'message': 'ok',
            'data': _build_learning_path_payload(),
        })
    except Exception as exc:
        return jsonify({
            'code': 5005,
            'message': f'learning path mock error: {str(exc)}',
            'data': _build_learning_path_payload(),
        }), 500


@app.route('/api/q-matrix', methods=['GET', 'POST'])
def q_matrix_api():
    try:
        return jsonify({
            'code': 0,
            'message': 'ok',
            'data': _build_q_matrix_payload(),
        })
    except Exception as exc:
        return jsonify({
            'code': 5006,
            'message': f'q matrix mock error: {str(exc)}',
            'data': _build_q_matrix_payload(),
        }), 500


@app.route('/api/node/<node_id>/detail', methods=['GET'])
def node_detail_api(node_id):
    try:
        payload = get_node_detail(node_id)
        if not payload:
            return jsonify({
                'code': 4041,
                'message': 'node not found',
                'data': None,
            }), 404

        return jsonify({
            'code': 0,
            'message': 'ok',
            'data': payload,
        })
    except Exception as exc:
        return jsonify({
            'code': 5002,
            'message': f'database error: {str(exc)}',
            'data': _build_empty_node_detail(node_id)
        }), 500


@app.route('/practice/<node_id>')
def practice_node_page(node_id):
    payload = get_node_exercise_bundle(node_id)
    if not payload:
        return abort(404)

    current_exercise = payload.get("current_exercise") or {}
    current_exercise_id = _safe_text(current_exercise.get("id"), "")
    if current_exercise_id:
        return redirect(url_for("practice_page", node_id=node_id, exercise_id=current_exercise_id))

    return render_template(
        "exercise_practice.html",
        encoding='UTF-8',
        node_id=str(node_id),
        exercise_id="",
    )


@app.route('/practice/<node_id>/<exercise_id>')
def practice_page(node_id, exercise_id):
    payload = get_node_exercise_bundle(node_id, exercise_id)
    if not payload:
        return abort(404)

    current_exercise = payload.get("current_exercise")
    if current_exercise and not _exercise_matches(payload, exercise_id):
        return redirect(
            url_for(
                "practice_page",
                node_id=node_id,
                exercise_id=_safe_text(current_exercise.get("id"), ""),
            )
        )

    return render_template(
        "exercise_practice.html",
        encoding='UTF-8',
        node_id=str(node_id),
        exercise_id=str(exercise_id),
    )


@app.route('/api/node/<node_id>/exercise/<exercise_id>', methods=['GET'])
def node_exercise_api(node_id, exercise_id):
    try:
        payload = get_node_exercise_bundle(node_id, exercise_id)
        if not payload:
            return jsonify({
                'code': 4042,
                'message': 'node not found',
                'data': None,
            }), 404

        if payload.get("current_exercise") and not _exercise_matches(payload, exercise_id):
            return jsonify({
                'code': 4043,
                'message': 'exercise not found',
                'data': payload,
            }), 404

        return jsonify({
            'code': 0,
            'message': 'ok',
            'data': payload,
        })
    except Exception as exc:
        return jsonify({
            'code': 5003,
            'message': f'exercise data error: {str(exc)}',
            'data': _build_empty_exercise_payload(node_id),
        }), 500


@app.route('/api/exercise/score', methods=['POST'])
def score_exercise_api():
    payload = request.get_json(silent=True) or {}
    node_id = _safe_text(payload.get("node_id") or payload.get("nodeId"), "")
    exercise_id = _safe_text(payload.get("exercise_id") or payload.get("exerciseId"), "")
    student_answer = payload.get("answer")

    if not node_id or not exercise_id:
        return jsonify({
            'code': 4001,
            'message': 'node_id and exercise_id are required',
            'data': None,
        }), 400

    exercise_payload = get_node_exercise_bundle(node_id, exercise_id)
    if not exercise_payload:
        return jsonify({
            'code': 4044,
            'message': 'node not found',
            'data': None,
        }), 404

    current_exercise = exercise_payload.get("current_exercise")
    if not current_exercise or not _exercise_matches(exercise_payload, exercise_id):
        return jsonify({
            'code': 4045,
            'message': 'exercise not found',
            'data': None,
        }), 404

    score_result = _score_exercise_answer(current_exercise, student_answer)
    score_result["exercise_id"] = exercise_id
    score_result["exercise_title"] = _safe_text(current_exercise.get("title"), "")
    score_result["student_answer"] = _normalize_answer_payload(student_answer)

    return jsonify({
        'code': 0,
        'message': 'ok',
        'data': score_result,
    })


@app.route('/GETJSON', methods=['GET', 'POST'])
@app.route('/getJSON', methods=['GET', 'POST'])
def GETJSON():
    try:
        return jsonify(_build_legacy_graph_payload())
    except Exception as exc:
        return jsonify({
            'error': f'database error: {str(exc)}'
        }), 500


@app.route('/images/<path:filename>')
def serve_images(filename):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.abspath(os.path.join(base_dir, "..", "..", "images"))
    return send_from_directory(images_dir, filename)


@app.route('/favicon.ico')
def favicon():
    return Response(status=204)


@app.route('/<path:filename>')
def serve_legacy_root_assets(filename):
    allowed_ext = ('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico')
    if not filename.lower().endswith(allowed_ext):
        return abort(404)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.abspath(os.path.join(base_dir, "..", "..", "images"))
    target_file = os.path.join(images_dir, filename)
    if os.path.isfile(target_file):
        return send_from_directory(images_dir, filename)
    return abort(404)

if __name__ == '__main__':
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG'],
    )
