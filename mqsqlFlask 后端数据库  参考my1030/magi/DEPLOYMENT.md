# 部署说明

## 1. 部署前准备

- Python 3.9 及以上
- MySQL 5.7 / 8.x
- 将整个项目目录一起上传
- 不要漏掉项目根目录下的 `images` 文件夹，程序会通过 `/images/<filename>` 和根路径图片路由读取其中的图片资源

项目目录中，Flask 应用位于：

- `mqsqlFlask 后端数据库  参考my1030/magi`

## 2. 安装依赖

在 `magi` 目录执行：

```bash
pip install -r requirements.txt
```

## 3. 配置环境变量

复制 `.env.example` 为 `.env`，再按服务器实际情况修改：

```env
DEBUG=false
HOST=0.0.0.0
PORT=3000
WAITRESS_THREADS=8

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=graph

LLM_API_URL=
LLM_API_KEY=
LLM_MODEL=
LLM_TIMEOUT=30
```

说明：

- `DEBUG=false` 适合服务器环境
- `HOST=0.0.0.0` 允许外部访问
- `DB_*` 必须改成服务器可用的 MySQL 信息
- `LLM_*` 目前可先留空，后续你手动接入模型时再配置

## 4. 启动方式

### Windows 服务器

推荐直接使用 waitress：

```bash
python run_server.py
```

### Linux 服务器

有两种方式：

使用 waitress：

```bash
python run_server.py
```

或者使用 gunicorn：

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:3000 wsgi:app
```

## 5. 反向代理建议

如果你要对外正式开放，建议再加一层 Nginx：

- 80 / 443 端口由 Nginx 对外提供
- Nginx 反向代理到 `127.0.0.1:3000`
- HTTPS 证书也放在 Nginx 上处理

## 6. 当前项目的部署注意点

- 图谱和部分接口依赖 MySQL，数据库不可用时页面数据会受影响
- 认知诊断、学习路径推荐、Q 矩阵页面已保留模型接口占位
