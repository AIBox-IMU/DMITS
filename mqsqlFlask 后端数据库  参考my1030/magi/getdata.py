import json
import os

import pandas as pd
import pymysql

from config import Config, load_dotenv_file


TEXT_RESOURCE_TYPE_LABELS = {
    "definition": "瀹氫箟",
    "theorem": "瀹氱悊",
    "law": "瀹氬緥",
    "exercise": "涔犻",
    "example": "渚嬮",
    "note": "绗旇",
    "other": "鍏朵粬",
}


def _get_db_settings():
    load_dotenv_file()
    return {
        "host": os.getenv("DB_HOST", Config.DB_HOST),
        "port": int(os.getenv("DB_PORT", str(Config.DB_PORT))),
        "user": os.getenv("DB_USER", Config.DB_USER),
        "password": os.getenv("DB_PASSWORD", Config.DB_PASSWORD),
        "db": os.getenv("DB_NAME", Config.DB_NAME),
        "charset": "utf8mb4",
    }


def get_db_connection(cursorclass=None):
    settings = _get_db_settings()
    if cursorclass is not None:
        settings["cursorclass"] = cursorclass
    return pymysql.connect(**settings)


def _safe_json_loads(value):
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return value
    text = str(value).strip()
    if not text or text[0] not in ("{", "["):
        return None
    try:
        return json.loads(text)
    except (TypeError, ValueError, json.JSONDecodeError):
        return None


def _ensure_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, tuple):
        return list(value)
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return []
        parsed = _safe_json_loads(stripped)
        if isinstance(parsed, list):
            return parsed
        return [stripped]
    return [value]


def _normalize_text_type(value):
    normalized = str(value or "").strip().lower()
    mapping = {
        "definition": "definition",
        "瀹氫箟": "definition",
        "theorem": "theorem",
        "瀹氱悊": "theorem",
        "law": "law",
        "瀹氬緥": "law",
        "exercise": "exercise",
        "涔犻": "exercise",
        "example": "example",
        "渚嬮": "example",
        "note": "note",
        "绗旇": "note",
    }
    return mapping.get(normalized, normalized or "other")


def _normalize_text_resource(item):
    resource_type = _normalize_text_type(
        item.get("resource_type") or item.get("type") or item.get("category")
    )
    tags = _ensure_list(item.get("tags"))
    options = _ensure_list(item.get("options"))
    related_nodes = _normalize_related_nodes(
        item.get("related_nodes")
        or item.get("relatedNodes")
        or item.get("knowledge_nodes")
        or item.get("knowledgeNodes")
        or item.get("linked_nodes")
        or item.get("linkedNodes")
        or item.get("related_node_ids")
        or item.get("relatedNodeIds")
        or item.get("knowledge_node_ids")
        or item.get("knowledgeNodeIds")
        or item.get("linked_node_ids")
        or item.get("linkedNodeIds")
    )
    return {
        "id": str(item.get("id") or ""),
        "node_id": str(item.get("node_id") or ""),
        "resource_type": resource_type,
        "resource_label": TEXT_RESOURCE_TYPE_LABELS.get(resource_type, "鍏朵粬"),
        "title": str(item.get("title") or "").strip(),
        "summary": str(item.get("summary") or "").strip(),
        "content": str(item.get("content") or "").strip(),
        "question": str(item.get("question") or item.get("prompt") or "").strip(),
        "answer": str(
            item.get("answer")
            or item.get("reference_answer")
            or item.get("correct_answer")
            or ""
        ).strip(),
        "analysis": str(item.get("analysis") or item.get("explanation") or "").strip(),
        "rubric": str(item.get("rubric") or "").strip(),
        "input_type": str(item.get("input_type") or item.get("answer_type") or "text").strip(),
        "options": options,
        "estimated_time": str(item.get("estimated_time") or "").strip(),
        "source": str(item.get("source") or "").strip(),
        "difficulty": str(item.get("difficulty") or "").strip(),
        "tags": [str(tag).strip() for tag in tags if str(tag).strip()],
        "sort_order": int(item.get("sort_order") or 0),
        "related_nodes": related_nodes,
    }


def _normalize_video_resource(item):
    tags = _ensure_list(item.get("tags"))
    return {
        "id": str(item.get("id") or ""),
        "node_id": str(item.get("node_id") or ""),
        "title": str(item.get("title") or "").strip(),
        "summary": str(item.get("summary") or "").strip(),
        "cover_url": str(item.get("cover_url") or item.get("cover") or item.get("image") or "").strip(),
        "video_url": str(item.get("video_url") or item.get("url") or "").strip(),
        "duration": str(item.get("duration") or "").strip(),
        "speaker": str(item.get("speaker") or item.get("teacher") or "").strip(),
        "source": str(item.get("source") or "").strip(),
        "tags": [str(tag).strip() for tag in tags if str(tag).strip()],
        "sort_order": int(item.get("sort_order") or 0),
    }


def _merge_resources(items):
    merged = []
    seen = set()
    for item in items:
        if not item:
            continue
        item_id = str(item.get("id") or "").strip()
        dedupe_key = item_id or json.dumps(item, ensure_ascii=False, sort_keys=True)
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)
        merged.append(item)
    merged.sort(key=lambda item: (int(item.get("sort_order") or 0), str(item.get("title") or "")))
    return merged


def _normalize_related_node_entry(value):
    if value is None:
        return None

    if isinstance(value, dict):
        node_id = str(
            value.get("id")
            or value.get("node_id")
            or value.get("related_node_id")
            or value.get("knowledge_node_id")
            or ""
        ).strip()
        if not node_id:
            return None
        return {
            "id": node_id,
            "name": str(value.get("name") or value.get("node_name") or "").strip(),
            "relation_type": str(
                value.get("relation_type")
                or value.get("relationType")
                or value.get("type")
                or ""
            ).strip(),
            "relation_label": str(
                value.get("relation_label")
                or value.get("relationLabel")
                or value.get("label")
                or ""
            ).strip(),
            "sort_order": int(value.get("sort_order") or 0),
        }

    node_id = str(value).strip()
    if not node_id:
        return None
    return {
        "id": node_id,
        "name": "",
        "relation_type": "",
        "relation_label": "",
        "sort_order": 0,
    }


def _merge_related_nodes(items):
    merged_by_id = {}

    for item in items:
        normalized = _normalize_related_node_entry(item)
        if not normalized:
            continue
        node_id = normalized["id"]
        current = merged_by_id.get(node_id)
        if not current:
            merged_by_id[node_id] = normalized
            continue
        if not current.get("name") and normalized.get("name"):
            current["name"] = normalized["name"]
        if not current.get("relation_type") and normalized.get("relation_type"):
            current["relation_type"] = normalized["relation_type"]
        if not current.get("relation_label") and normalized.get("relation_label"):
            current["relation_label"] = normalized["relation_label"]
        current["sort_order"] = min(
            int(current.get("sort_order") or 0),
            int(normalized.get("sort_order") or 0),
        )

    return sorted(
        merged_by_id.values(),
        key=lambda item: (
            int(item.get("sort_order") or 0),
            str(item.get("name") or ""),
            str(item.get("id") or ""),
        ),
    )


def _normalize_related_nodes(value):
    items = []
    for entry in _ensure_list(value):
        normalized = _normalize_related_node_entry(entry)
        if normalized:
            items.append(normalized)
    return _merge_related_nodes(items)


def _fetch_related_node_rows(cursor, resource_ids):
    if not resource_ids:
        return []

    collected_rows = []
    for table_name in ("text_resource_node_links", "exercise_node_links"):
        if not _table_exists(cursor, table_name):
            continue

        columns = _get_table_columns(cursor, table_name)
        resource_column = next(
            (
                column_name
                for column_name in ("resource_id", "text_resource_id", "exercise_id")
                if column_name in columns
            ),
            None,
        )
        node_column = next(
            (
                column_name
                for column_name in ("node_id", "related_node_id", "knowledge_node_id")
                if column_name in columns
            ),
            None,
        )
        if not resource_column or not node_column:
            continue

        selected_columns = [
            f"links.`{resource_column}` AS resource_id",
            f"links.`{node_column}` AS node_id",
            "nodes.`name` AS node_name",
        ]
        if "relation_type" in columns:
            selected_columns.append("links.`relation_type` AS relation_type")
        if "relation_label" in columns:
            selected_columns.append("links.`relation_label` AS relation_label")
        if "sort_order" in columns:
            selected_columns.append("links.`sort_order` AS sort_order")

        placeholders = ", ".join(["%s"] * len(resource_ids))
        order_sql = ""
        if "sort_order" in columns:
            order_sql = f" ORDER BY links.`sort_order` ASC, links.`{node_column}` ASC"

        cursor.execute(
            """
            SELECT {columns}
            FROM `{table_name}` AS links
            LEFT JOIN `convertnodes` AS nodes
              ON nodes.`id` = links.`{node_column}`
            WHERE links.`{resource_column}` IN ({placeholders})
            {order_sql}
            """.format(
                columns=", ".join(selected_columns),
                table_name=table_name,
                node_column=node_column,
                resource_column=resource_column,
                placeholders=placeholders,
                order_sql=order_sql,
            ),
            tuple(resource_ids),
        )
        collected_rows.extend(cursor.fetchall() or [])

    return collected_rows


def _attach_related_nodes_to_text_resources(cursor, text_resources, current_node_id):
    resource_ids = [
        str(item.get("id") or "").strip()
        for item in text_resources
        if str(item.get("id") or "").strip()
    ]
    related_rows = _fetch_related_node_rows(cursor, resource_ids)
    related_nodes_by_resource = {}

    for row in related_rows:
        resource_id = str((row or {}).get("resource_id") or "").strip()
        node_id = str((row or {}).get("node_id") or "").strip()
        if not resource_id or not node_id:
            continue
        related_nodes_by_resource.setdefault(resource_id, []).append(
            {
                "id": node_id,
                "name": str((row or {}).get("node_name") or "").strip(),
                "relation_type": str((row or {}).get("relation_type") or "").strip(),
                "relation_label": str((row or {}).get("relation_label") or "").strip(),
                "sort_order": int((row or {}).get("sort_order") or 0),
            }
        )

    current_node_id = str(current_node_id or "").strip()
    for item in text_resources:
        existing_related_nodes = _normalize_related_nodes(item.get("related_nodes"))
        linked_related_nodes = related_nodes_by_resource.get(str(item.get("id") or "").strip(), [])
        merged_related_nodes = _merge_related_nodes(existing_related_nodes + linked_related_nodes)

        if current_node_id and not any(node.get("id") == current_node_id for node in merged_related_nodes):
            merged_related_nodes.insert(
                0,
                {
                    "id": current_node_id,
                    "name": "",
                    "relation_type": "primary",
                    "relation_label": "\u5f53\u524d\u77e5\u8bc6\u70b9",
                    "sort_order": -1,
                },
            )

        item["related_nodes"] = _merge_related_nodes(merged_related_nodes)

    return text_resources


def _table_exists(cursor, table_name):
    cursor.execute("SHOW TABLES LIKE %s", (table_name,))
    return cursor.fetchone() is not None


def _get_table_columns(cursor, table_name):
    cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
    columns = set()
    for row in cursor.fetchall():
        if isinstance(row, dict):
            field_name = row.get("Field")
        else:
            field_name = row[0] if row else None
        if field_name:
            columns.add(field_name)
    return columns


def _fetch_optional_table_rows(cursor, table_name, desired_columns, node_id):
    if not _table_exists(cursor, table_name):
        return []

    columns = _get_table_columns(cursor, table_name)
    if "node_id" not in columns:
        return []

    selected_columns = [column for column in desired_columns if column in columns]
    if not selected_columns:
        return []

    select_sql = ", ".join(f"`{column}`" for column in selected_columns)
    order_parts = []
    if "sort_order" in columns:
        order_parts.append("`sort_order` ASC")
    if "id" in columns:
        order_parts.append("`id` ASC")
    order_sql = f" ORDER BY {', '.join(order_parts)}" if order_parts else ""

    cursor.execute(
        f"SELECT {select_sql} FROM `{table_name}` WHERE `node_id`=%s{order_sql}",
        (node_id,),
    )
    rows = cursor.fetchall()
    if rows and isinstance(rows[0], dict):
        return [{column: row.get(column) for column in selected_columns} for row in rows]
    return [dict(zip(selected_columns, row)) for row in rows]


def getjson():
    mysql = get_db_connection()
    cursor = mysql.cursor()
    sql = "select * from convertnodes"
    sql2 = "select * from convertlinks"
    cursor.execute(sql)

    results = pd.DataFrame(cursor.fetchall(), columns=["id", "name", "image", "details", "isShown"])
    cursor.execute(sql2)
    results2 = pd.DataFrame(
        cursor.fetchall(),
        columns=["id", "source", "target", "description", "details", "isShown"],
    )

    cursor.close()
    mysql.close()
    return results, results2


def get_node_detail(node_id):
    mysql = get_db_connection(cursorclass=pymysql.cursors.DictCursor)
    cursor = mysql.cursor()

    try:
        cursor.execute(
            """
            SELECT id, name, image, details, isShown
            FROM convertnodes
            WHERE id=%s
            LIMIT 1
            """,
            (node_id,),
        )
        node_row = cursor.fetchone()
        if not node_row:
            return None

        raw_details = node_row.get("details") or ""
        details_payload = _safe_json_loads(raw_details)
        if not isinstance(details_payload, dict):
            details_payload = {}

        text_resources = [
            _normalize_text_resource(item)
            for item in _ensure_list(
                details_payload.get("text_resources") or details_payload.get("textResources")
            )
            if isinstance(item, dict)
        ]
        video_resources = [
            _normalize_video_resource(item)
            for item in _ensure_list(
                details_payload.get("video_resources") or details_payload.get("videoResources")
            )
            if isinstance(item, dict)
        ]

        text_table_rows = _fetch_optional_table_rows(
            cursor,
            "node_text_resources",
            [
                "id",
                "node_id",
                "resource_type",
                "type",
                "category",
                "title",
                "summary",
                "content",
                "question",
                "prompt",
                "answer",
                "reference_answer",
                "correct_answer",
                "analysis",
                "explanation",
                "rubric",
                "input_type",
                "answer_type",
                "options",
                "estimated_time",
                "source",
                "difficulty",
                "tags",
                "related_nodes",
                "related_node_ids",
                "knowledge_nodes",
                "knowledge_node_ids",
                "sort_order",
            ],
            node_id,
        )
        video_table_rows = _fetch_optional_table_rows(
            cursor,
            "node_video_resources",
            [
                "id",
                "node_id",
                "title",
                "summary",
                "cover_url",
                "cover",
                "image",
                "video_url",
                "url",
                "duration",
                "speaker",
                "teacher",
                "source",
                "tags",
                "sort_order",
            ],
            node_id,
        )

        text_resources.extend(_normalize_text_resource(item) for item in text_table_rows)
        video_resources.extend(_normalize_video_resource(item) for item in video_table_rows)

        text_resources = _merge_resources(text_resources)
        text_resources = _attach_related_nodes_to_text_resources(cursor, text_resources, node_id)
        video_resources = _merge_resources(video_resources)

        summary = (
            details_payload.get("summary")
            or details_payload.get("definition")
            or details_payload.get("description")
            or (raw_details if not details_payload else "")
        )
        description = details_payload.get("description") or summary

        return {
            "node": {
                "id": str(node_row.get("id")),
                "name": str(node_row.get("name") or "").strip(),
                "image": str(node_row.get("image") or "").strip(),
                "summary": str(summary or "").strip(),
                "description": str(description or "").strip(),
                "module_path": str(
                    details_payload.get("module_path")
                    or details_payload.get("modulePath")
                    or details_payload.get("chapter_path")
                    or details_payload.get("chapterPath")
                    or ""
                ).strip(),
                "difficulty": str(details_payload.get("difficulty") or "").strip(),
                "stage": str(details_payload.get("stage") or details_payload.get("grade") or "").strip(),
                "learning_goals": [
                    str(item).strip()
                    for item in _ensure_list(
                        details_payload.get("learning_goals") or details_payload.get("learningGoals")
                    )
                    if str(item).strip()
                ],
                "prerequisites": [
                    str(item).strip()
                    for item in _ensure_list(details_payload.get("prerequisites"))
                    if str(item).strip()
                ],
                "successors": [
                    str(item).strip()
                    for item in _ensure_list(details_payload.get("successors"))
                    if str(item).strip()
                ],
                "tags": [
                    str(item).strip()
                    for item in _ensure_list(details_payload.get("tags"))
                    if str(item).strip()
                ],
            },
            "text_resources": text_resources,
            "video_resources": video_resources,
        }
    finally:
        cursor.close()
        mysql.close()


def get_node_exercise_bundle(node_id, exercise_id=None):
    detail_payload = get_node_detail(node_id)
    if not detail_payload:
        return None

    exercises = [
        item
        for item in detail_payload.get("text_resources", [])
        if str(item.get("resource_type") or "").strip().lower() == "exercise"
    ]

    if exercises:
        current_exercise = None
        target_exercise_id = str(exercise_id or "").strip()
        if target_exercise_id:
            for item in exercises:
                if str(item.get("id") or "").strip() == target_exercise_id:
                    current_exercise = item
                    break
        if current_exercise is None:
            current_exercise = exercises[0]
    else:
        current_exercise = None

    exercise_list = []
    for index, item in enumerate(exercises):
        exercise_list.append(
            {
                "id": str(item.get("id") or f"exercise-{index + 1}"),
                "title": str(item.get("title") or f"涔犻 {index + 1}").strip(),
                "summary": str(item.get("summary") or "").strip(),
                "difficulty": str(item.get("difficulty") or "").strip(),
                "source": str(item.get("source") or "").strip(),
                "estimated_time": str(item.get("estimated_time") or "").strip(),
                "tags": [
                    str(tag).strip()
                    for tag in _ensure_list(item.get("tags"))
                    if str(tag).strip()
                ],
            }
        )

    current_index = -1
    if current_exercise:
        current_id = str(current_exercise.get("id") or "").strip()
        for index, item in enumerate(exercise_list):
            if str(item.get("id") or "").strip() == current_id:
                current_index = index
                break

    return {
        "node": detail_payload.get("node") or {},
        "current_exercise": current_exercise,
        "exercise_list": exercise_list,
        "exercise_count": len(exercises),
        "current_index": current_index,
    }


if __name__ == "__main__":
    getjson()
