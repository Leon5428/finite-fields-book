# 开发与维护说明

面向教材源码的本地阅读、构建和维护。普通读者可直接使用 [在线教材](https://husihuang.github.io/finite-fields-book/)，项目内容与学习说明见 [README](README.md)。

## 本地构建与阅读

本仓库使用 Jupyter Book 1，版本由 `requirements.txt` 固定。GitHub Pages 工作流使用 Python 3.11；本地建议使用相同版本，并在独立的 Python 虚拟环境中安装依赖。

在仓库根目录运行：

```bash
python -m pip install -r requirements.txt
jupyter-book build . --all
python -m http.server 8000 --bind 127.0.0.1 --directory _build/html
```

打开 <http://127.0.0.1:8000/>。构建产物位于 `_build/html/`。修改交互脚本或样式后，请使用 `--all` 确保静态资源同步更新。

构建默认不执行 Notebook，而是使用其已保存的输出。修改 Notebook 代码后，应重新运行并保存，再构建教材。

## Python 实验

```bash
python -m pip install notebook
python -m notebook appendices/experiments.ipynb
```

使用 Python 3 内核并顺序执行。`finitefield.py` 与 Notebook 应保持在同一目录；SageMath 示例需要独立的 SageMath 环境。

## 源码结构

| 路径 | 用途 |
|---|---|
| `intro.md` | 教材首页 |
| `chapters/` | 19 章数学正文 |
| `appendices/` | 记号、实现、Notebook 与参考文献 |
| `knowledge.md` | 知识图谱与学习状态页面 |
| `_static/` | 样式、交互脚本与本地 MathJax |
| `_config.yml`、`_toc.yml` | 书名、构建选项与目录 |
| `tools/` | 数学验证、浏览器检查及历史编辑脚本 |
| `.github/workflows/deploy-book.yml` | GitHub Pages 构建与发布 |

历史重构脚本用于记录编辑过程，不能重复作用于已经完成的正文。

## 发布

现有工作流在推送到 `main` 后构建并发布 `_build/html/`，也支持从 GitHub Actions 手动触发。发布结果以 GitHub Actions 的运行状态及 Pages 部署结果为准。

## 知识图谱与学习记录

`_static/knowledge-data.js` 维护概念摘要、公式、条件、正文锚点与五类学习关系；`knowledge.js` 负责浏览与记录，`knowledge.css` 负责显示。扩充图谱时应明确数学假设及边的含义，避免将一般学习关联标为逻辑推导。

概念学习记录使用浏览器本地键 `finitefields:learning:v1`，不上传服务器；章末笔记另行保存。导入 JSON 时逐概念合并，同一概念的较新记录优先，格式无效的文件不修改现有记录。修改数据结构时应保持旧记录可读，或提供迁移方式。

## 验证

`tools/` 包含有限域运算、知识图谱、夜间模式、手机边栏等检查脚本。部分浏览器检查依赖当前开发环境的 Playwright 和 Edge 路径，并默认访问 `http://127.0.0.1:8765`；在其他环境运行前，请按实际安装位置和预览端口调整。

修改数学正文应核对假设、证明与公式；修改界面应检查深浅色模式、手机视口、键盘操作和交互状态。`VALIDATION.json` 汇总本地检查结果，更详细的测试产物位于 `_build/`，这些结果不代表对所有设备或数学内容的形式化验证。
