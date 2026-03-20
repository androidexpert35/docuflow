// --- Markdown Renderer ---
// Handles parsing, Prism syntax highlighting, and page title sync.

const defaultText = `# Welcome to DocuFlow ✨

> A sleek, client-side Markdown editor with **live preview**, **real-time syntax highlighting**, and **one-click PDF export** — no server, no sign-up, no data leaves your browser.

---

## 🎨 Rich Text Formatting

You can write in **bold**, *italic*, or go all-in with ***bold italic***. Need to reference code? Use \`inline code\` right inside a sentence.

Here's a [link to the repo](https://github.com/androidexpert35/docuflow) and an image example:

![DocuFlow](https://img.shields.io/badge/DocuFlow-Markdown_to_PDF-3b82f6?style=for-the-badge)

---

## 📋 Lists & Checklists

### What DocuFlow can do:
- ✅ Real-time Markdown rendering
- ✅ Editor syntax highlighting as you type
- ✅ Export pixel-perfect A4 PDFs
- ✅ Clickable Table of Contents in PDFs
- ✅ 300+ language syntax highlighting via Prism.js

### Getting started:
1. Write your Markdown on the left
2. Watch the preview update instantly on the right
3. Click **Save PDF** when you're ready — done!

---

## 💻 Code Blocks

DocuFlow highlights 300+ languages automatically.

\`\`\`kotlin
class DocuFlow {
    // One-click PDF generation
    fun exportPdf(markdown: String): ByteArray {
        val html = MarkdownParser.render(markdown)
        return PdfEngine.generate(html, pageSize = A4)
    }
}
\`\`\`

\`\`\`javascript
// Real-time preview rendering
function render() {
    const html = marked.parse(editor.value);
    preview.innerHTML = html;
    Prism.highlightAllUnder(preview);
}
\`\`\`

\`\`\`python
# Even Python looks great!
def fibonacci(n: int) -> list[int]:
    a, b = 0, 1
    return [(a, b := (b, a + b))[0] for _ in range(n)]
\`\`\`

---

## 📊 Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Live Preview | ✅ Ready | Side-by-side split view |
| Syntax Highlighting | ✅ Ready | Editor + Preview |
| PDF Export | ✅ Ready | A4, clickable TOC |
| Smart Page Breaks | ✅ Ready | No orphaned headings |
| Responsive | ✅ Ready | Mobile-friendly |

---

## 💡 Blockquotes

> *"The best tool is the one that gets out of your way."*
>
> DocuFlow is pure HTML, CSS & JavaScript — open it in any browser, start writing, export. That's it.

---

## 🔗 Heading Anchors & TOC

Every heading becomes a clickable anchor in the exported PDF. This means you can build a **Table of Contents** that actually works:

- [Welcome](#welcome-to-docuflow-)
- [Rich Text](#-rich-text-formatting)
- [Code Blocks](#-code-blocks)
- [Tables](#-tables)

---

### Try it now — edit this text and watch the magic happen! 🚀
`;

const input = document.getElementById('md-input');
const preview = document.getElementById('doc-render');

// Custom heading renderer: adds id for PDF internal link navigation
const renderer = new marked.Renderer();
renderer.heading = function(text, level, raw, slugger) {
    const id = slugger.slug(raw);
    return '<h' + level + ' id="' + id + '">' + text + '</h' + level + '>\n';
};

const defaultTitle = document.title;

function render() {
    try {
        const html = marked.parse(input.value, { breaks: true, gfm: true, headerIds: true, renderer: renderer });
        preview.innerHTML = html;
        if (window.Prism) Prism.highlightAllUnder(preview);

        // Sync browser tab title with the document's first heading
        const h1 = preview.querySelector('h1');
        document.title = h1 ? h1.textContent.trim() : defaultTitle;
    } catch (e) { console.error(e); }
}

if (window.Prism) {
    Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
}

input.addEventListener('input', render);
input.value = defaultText;
input.dispatchEvent(new Event('input'));
