# 潘梓怡 · 作品集

三维视觉 / 电商设计个人作品集。纯静态页面，无构建依赖，双击 `index.html` 即可预览。

线上地址：https://pzy20030522.github.io/

## 结构

```
portfolio/
├── index.html            # 页面内容（文案、作品标题都在这里改）
├── assets/
│   ├── style.css         # 全部样式（配色在文件顶部 :root）
│   ├── main.js           # 滚动渐显、灯箱、导航状态
│   ├── icons/            # 软件图标 SVG
│   └── works/            # 作品图（已压缩为 WebP）
├── .nojekyll             # GitHub Pages 必需，别删
└── README.md
```

## 作品图片规则

- 详情页长图：按 2600px 高切成多张 `d1-00.webp`、`d1-01.webp`……灯箱里依次拼接，避免手机一次性解码超大图。
- 产品摄影：单张最长边 1600px。
- 封面：统一 900×1125（4:5）。

新增作品的步骤：把图压成 WebP 放进 `assets/works/`，然后在 `index.html` 里复制一个 `<article class="case">` 块，
改 `data-key`（文件名前缀）、`data-n`（张数）、`data-pad`（补零位数：10 张以上填 2，否则 1）、
`data-start`（文件名起始序号：`d1-00` 起始 0，`p1-1` 起始 1）。

## 部署

```bash
git add -A && git commit -m "update" && git push origin main
```

推到 `main` 后 GitHub Pages 约 1 分钟自动重建。
