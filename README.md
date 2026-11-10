# 潘梓怡 · 作品集

陶瓷艺术设计个人作品集网站。纯静态页面，无构建依赖，双击 `index.html` 即可预览。

## 结构

```
portfolio/
├── index.html          # 页面内容（作品、关于、联系方式都在这里改）
├── assets/
│   ├── style.css       # 全部样式（配色、字体、布局变量在文件顶部 :root）
│   └── main.js         # 滚动渐显、导航栏状态等交互
├── .nojekyll           # GitHub Pages 必需，别删
└── README.md
```

## 常见修改

**改文案 / 加作品**：编辑 `index.html`，复制一段 `<article class="card reveal">...</article>` 改标题和文字即可。
主推大卡片是 `class="card card-wide"`，会横跨两列。

**换配色**：`assets/style.css` 顶部的 `:root` 里改 `--paper`（底色）、`--cobalt`（主色）、`--clay`（点缀色）。

**放真实作品图**：把图片放进 `assets/img/`，然后把卡片里的 `<div class="thumb" data-variant="sea">…</div>` 换成：

```html
<div class="thumb">
  <img src="assets/img/work-01.jpg" alt="海韵飞歌" loading="lazy">
</div>
```

并给 `.thumb img` 加一条 `object-fit:cover; width:100%; height:100%;` 的样式。

## 部署（GitHub Pages）

```bash
git add -A && git commit -m "update"
git push origin main
```

推上去后在仓库 Settings → Pages 里把 Source 设为 `Deploy from a branch` → `main` / `root`，
等 1 分钟左右访问 `https://<用户名>.github.io/<仓库名>/` 。
