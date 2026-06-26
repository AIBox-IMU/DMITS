/*
 Navicat MySQL Data Transfer

 Source Server         : MySQL
 Source Server Type    : MySQL
 Source Server Version : 80029
 Source Host           : localhost:3306
 Source Schema         : graph

 Target Server Type    : MySQL
 Target Server Version : 80029
 File Encoding         : 65001

 Date: 17/05/2026 09:12:42
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for convertlinks
-- ----------------------------
DROP TABLE IF EXISTS `convertlinks`;
CREATE TABLE `convertlinks`  (
  `id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `source` int NOT NULL,
  `target` int NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `isShown` tinyint NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of convertlinks
-- ----------------------------

-- ----------------------------
-- Table structure for convertnodes
-- ----------------------------
DROP TABLE IF EXISTS `convertnodes`;
CREATE TABLE `convertnodes`  (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `image` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `isShown` tinyint NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of convertnodes
-- ----------------------------

-- ----------------------------
-- Table structure for node_text_resources
-- ----------------------------
DROP TABLE IF EXISTS `node_text_resources`;
CREATE TABLE `node_text_resources`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `node_id` int NOT NULL COMMENT '对应 convertnodes.id',
  `resource_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'definition/theorem/law/exercise/example/note',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标题',
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '摘要',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '正文/题干兜底字段',
  `question` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '题目正文',
  `answer` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '参考答案',
  `analysis` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '题目解析',
  `rubric` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '评分标准',
  `input_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'text/single_choice/multiple_choice',
  `options` json NULL COMMENT '选择题选项JSON数组',
  `source` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '来源',
  `difficulty` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '难度',
  `estimated_time` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '预计耗时',
  `tags` json NULL COMMENT '标签JSON数组',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ntr_node_id`(`node_id`) USING BTREE,
  INDEX `idx_ntr_type`(`resource_type`) USING BTREE,
  INDEX `idx_ntr_node_sort`(`node_id`, `sort_order`) USING BTREE,
  INDEX `idx_ntr_node_type_sort`(`node_id`, `resource_type`, `sort_order`) USING BTREE,
  CONSTRAINT `fk_ntr_node_id` FOREIGN KEY (`node_id`) REFERENCES `convertnodes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '节点文本资源表（含习题资源）' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of node_text_resources
-- ----------------------------
INSERT INTO `node_text_resources` VALUES (1, 3, 'definition', '定义：命题', '命题是可以判断真假的陈述句。', '不是真就是假的陈述句称为命题。', NULL, NULL, NULL, NULL, NULL, NULL, '教材第1章', '基础', NULL, '[\"定义\", \"必会\"]', 1, '2026-04-17 23:18:02', '2026-04-17 23:18:02');
INSERT INTO `node_text_resources` VALUES (5, 3, 'exercise', '判断逆否命题', '考查命题蕴含与逆否命题等值关系', '设 p->q 为真，以下哪个结论一定成立？', '设 p->q 为真，以下哪个结论一定成立？', 'B', '在命题逻辑中，p->q 与其逆否命题 !q->!p 等值。因此当 p->q 为真时，!q->!p 一定为真。', '选对 B 得满分；若说明“逆否命题与原命题等值”可判为高质量作答。', 'single_choice', '[\"A. p 为真\", \"B. !q->!p 为真\", \"C. q->p 为真\", \"D. !p->!q 为真\"]', '命题逻辑练习', '中等', '5分钟', '[\"命题\", \"逆否命题\", \"单选\"]', 1, '2026-04-17 23:20:26', '2026-04-17 23:20:26');

-- ----------------------------
-- Table structure for node_video_resources
-- ----------------------------
DROP TABLE IF EXISTS `node_video_resources`;
CREATE TABLE `node_video_resources`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `node_id` int NOT NULL COMMENT '对应 convertnodes.id',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标题',
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '摘要',
  `cover_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '封面地址',
  `video_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '视频地址',
  `duration` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '时长',
  `speaker` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '主讲人',
  `source` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '来源',
  `tags` json NULL COMMENT '标签JSON数组',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_nvr_node_id`(`node_id`) USING BTREE,
  INDEX `idx_nvr_node_sort`(`node_id`, `sort_order`) USING BTREE,
  CONSTRAINT `fk_nvr_node_id` FOREIGN KEY (`node_id`) REFERENCES `convertnodes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '节点视频资源表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of node_video_resources
-- ----------------------------
INSERT INTO `node_video_resources` VALUES (5, 3, '命题与非命题辨析', '通过具体例子讲解什么是命题，什么不是命题。', '/static/videos/0c85c3cff126fa5c6d1409174037e632770afdda.jpg', '/static/videos/144238503-1-192.mp4', '12:15', '李老师', '教学视频', '[\"命题\", \"辨析\", \"基础\"]', 2, '2026-04-17 23:20:54', '2026-04-20 19:57:24');

-- ----------------------------
-- Table structure for text_resource_node_links
-- ----------------------------
DROP TABLE IF EXISTS `text_resource_node_links`;
CREATE TABLE `text_resource_node_links`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `resource_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `node_id` bigint NOT NULL,
  `relation_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '',
  `relation_label` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '',
  `sort_order` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_resource_id`(`resource_id`) USING BTREE,
  INDEX `idx_node_id`(`node_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of text_resource_node_links
-- ----------------------------
INSERT INTO `text_resource_node_links` VALUES (1, '1', 4, '关联知识点', '关联知识点', 0);
INSERT INTO `text_resource_node_links` VALUES (2, '1', 5, '关联知识点', '关联知识点', 0);

SET FOREIGN_KEY_CHECKS = 1;

-- Records of convertnodes (filtered ID 2-50)
INSERT INTO `convertnodes` VALUES (2, '命题逻辑', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (3, '命题', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (4, '命题的真值', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (5, '命题符号化', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (6, '真命题', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (7, '假命题', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (8, '简单命题/原子命題', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (9, '复合命题', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (10, '基本复合命题', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (11, '否定式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (12, '合取式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (13, '析取式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (14, '蕴涵式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (15, '等价式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (16, '与非式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (17, '或非式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (18, '联结词（逻辑联结词）', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (19, '基本联结词', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (20, '否定', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (21, '合取', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (22, '析取', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (23, '蕴涵', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (24, '等价', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (25, '与非', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (26, '或非', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (27, '优先级', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (28, '联结词全功能集', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (29, '合式公式（或 命題公式，简称公式）', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (30, '命题常项', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (31, '命题变项', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (32, '公式的层次', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (33, '0 层公式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (34, '$n+1(n \\geqslant 0)$层公式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (35, '$k$层公式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (36, '赋值或解释', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (37, '成真赋值', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (38, '成假赋值', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (39, '真值函数', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (40, '真值表', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (41, '公式的分类', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (42, '重言式或永真式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (43, '矛盾式或永假式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (44, '可满足式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (45, '非重言式的可满足式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (46, '范式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (47, '文字', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (48, '简单析取式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (49, '简单合取式', '/static/imgs/snow.png', '', 1);

INSERT INTO `convertnodes` VALUES (50, '极小项', '/static/imgs/snow.png', '', 1);


-- Records of convertlinks (filtered by nodes ID 2-50)
INSERT INTO `convertlinks` VALUES ('edge10', 10, 11, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge11', 10, 12, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge12', 10, 13, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge13', 10, 14, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge14', 10, 15, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge15', 10, 16, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge16', 10, 17, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge17', 2, 18, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge18', 18, 19, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge19', 19, 20, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge2', 2, 3, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge20', 19, 21, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge21', 19, 22, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge22', 19, 23, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge23', 19, 24, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge24', 19, 25, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge25', 19, 26, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge26', 18, 27, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge27', 18, 28, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge28', 2, 29, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge29', 29, 30, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge3', 3, 4, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge30', 29, 31, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge31', 29, 32, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge32', 32, 33, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge33', 32, 34, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge34', 32, 35, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge35', 29, 36, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge36', 36, 37, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge37', 36, 38, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge38', 29, 39, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge39', 29, 40, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge4', 3, 5, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge40', 29, 41, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge41', 41, 42, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge42', 41, 43, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge43', 41, 44, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge44', 41, 45, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge45', 29, 46, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge46', 46, 47, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge47', 46, 48, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge48', 46, 49, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge49', 46, 50, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge5', 3, 6, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge6', 3, 7, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge7', 3, 8, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge8', 3, 9, '包含', '', 1);

INSERT INTO `convertlinks` VALUES ('edge9', 9, 10, '包含', '', 1);

