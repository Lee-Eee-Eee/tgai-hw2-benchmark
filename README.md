# SVG 动画实验

[GitHub Pages](https://lee-eee-eee.github.io/tgai-hw2-benchmark/)

两项任务是鹈鹕骑自行车与霸王龙三步上篮。网页可并排回放八套 Agent 配置的输出，支持切换题目、重播与打开原始 HTML。GLM 上篮另存接力前的中间稿。

- `demos/` 保存实验原始 HTML。
- `media/` 的画面来自 GPT-6.2 Astra 和 Claude Fable 5.2 的鹈鹕或上篮，以及 Gemini 4 Neon 的上篮。英文字体 Young Serif 与 Source Serif 4 随附 SIL Open Font License。
- `data.js` 保存模型配置与播放器索引，`index.html` 含原始提示词、用时表及直接链接。

本地可运行 `python -m http.server 8000`，然后打开 `http://localhost:8000/`。
