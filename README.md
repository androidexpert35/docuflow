<p align="center">
  <img src="https://img.icons8.com/fluency/96/document.png" alt="DocuFlow Logo" width="80"/>
</p>

<h1 align="center">DocuFlow</h1>

<p align="center">
  <strong>A sleek, client-side Markdown-to-PDF converter with live preview, syntax highlighting, and clickable table of contents.</strong>
</p>

<p align="center">
  <a href="https://www.antoniocirielli.it/tools/md-to-pdf-converter"><img src="https://img.shields.io/badge/🌐_Live_Demo-antoniocirielli.it-3b82f6?style=for-the-badge" alt="Live Demo"></a>&nbsp;
  <img src="https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge" alt="MIT License">&nbsp;
  <img src="https://img.shields.io/badge/zero-backend-f59e0b?style=for-the-badge" alt="Zero Backend">
</p>

<br/>

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Live Preview** | Side-by-side editor with real-time Markdown rendering |
| **PDF Export** | One-click, high-quality A4 PDF generation — entirely client-side |
| **Syntax Highlighting** | 300+ languages via Prism.js with a custom neon dark theme |
| **Clickable TOC** | Internal anchor links that work inside the generated PDF |
| **Smart Page Breaks** | Headings stay grouped with their content — no orphaned titles |
| **Resizable Panels** | Drag the split bar to resize editor & preview (keyboard-accessible) |
| **Responsive** | Stacks vertically on tablets and phones |
| **No Server Required** | Pure HTML/CSS/JS — nothing to install, no data leaves your browser |

<br/>

## 🚀 Live Demo

**👉 [www.antoniocirielli.it/tools/md-to-pdf-converter](https://www.antoniocirielli.it/tools/md-to-pdf-converter)**

<br/>

## 📂 Project Structure

```
docuflow/
├── index.html              # Entry point
└── src/
    ├── css/
    │   ├── variables.css   # Design tokens & custom properties
    │   ├── layout.css      # Workspace, editor, preview, scrollbar
    │   ├── header.css      # Top bar, branding, Save PDF button
    │   ├── split-resizer.css
    │   ├── document.css    # Rendered Markdown typography & code theme
    │   ├── pdf-mode.css    # PDF capture overrides & page-break rules
    │   ├── pdf-overlay.css # Loading spinner overlay
    │   ├── print.css       # @media print fallback
    │   └── responsive.css  # Breakpoints (992 / 768 / 420 px)
    └── js/
        ├── renderer.js     # Markdown parsing, Prism, title sync
        ├── pdf-generator.js# html2pdf.js pipeline & link injection
        └── split-resizer.js# Drag-to-resize split view
```

<br/>

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Markdown Parser | [marked.js](https://marked.js.org/) v4.3 |
| Syntax Highlighting | [Prism.js](https://prismjs.com/) v1.29 + Autoloader |
| PDF Engine | [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) v0.10 (html2canvas + jsPDF) |
| UI Framework | [Bootstrap](https://getbootstrap.com/) 5.3 |
| Fonts | [Inter](https://rsms.me/inter/) · [JetBrains Mono](https://www.jetbrains.com/lp/mono/) |
| Icons | [Material Symbols Rounded](https://fonts.google.com/icons) |

All dependencies are loaded from CDN — **zero build step required**.

<br/>

## ⚡ Getting Started

### Use Online
Open the [live demo](https://www.antoniocirielli.it/tools/md-to-pdf-converter) and start writing.

### Run Locally
```bash
git clone https://github.com/<your-username>/md-to-pdf-converter.git
cd md-to-pdf-converter
# Open index.html in your browser — that's it!
```

> **Tip:** Use a simple local server to avoid CORS issues with font loading:
> ```bash
> npx serve .
> ```

<br/>

## 📖 Usage

1. **Write** your Markdown in the left editor panel.
2. **Preview** the rendered document in real time on the right.
3. Click **Save PDF** — a polished A4 PDF is generated and downloaded instantly.

The PDF filename is automatically derived from your document's first `# Heading`.

<br/>

## 🔧 How the PDF Engine Works

DocuFlow doesn't just print the page — it runs a multi-step pipeline:

1. **Layout prep** — Heading chains (e.g. `h2` → `h3`) are grouped with their first content block to prevent orphaned titles across pages.
2. **Rasterize** — `html2canvas` captures the preview at 2× resolution onto a canvas.
3. **Paginate** — `jsPDF` slices the canvas into A4 pages with 20 mm margins.
4. **Link injection** — DOM bounding-rect positions of every `#anchor` link are converted to PDF coordinates, and `pdf.link()` annotations are injected so the table of contents is fully clickable inside the PDF.
5. **Cleanup** — Heading groups are unwrapped and the DOM is restored.

<br/>

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<br/>

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<br/>

---

<p align="center">
  Made with ☕ by <a href="https://www.antoniocirielli.it">Antonio Cirielli</a>
</p>
