// --- Markdown Renderer ---
// Handles parsing, Prism syntax highlighting, and page title sync.

const defaultText = `# Compact Code PDF

## Preview vs Print
1. **Preview (Screen):** Large font, horizontal slider.
2. **Print (PDF):** Small font, text wrap, **backgrounds enabled**.

This is \`inline code\` and it should have a grey background in the PDF.

\`\`\`kotlin
package com.wrap.test

class PdfGenerator {
    // This very long line will wrap nicely in the PDF and print perfectly.
    fun generateSecureToken(userId: String, timestamp: Long): String {
        val veryLongToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c_CODE_END_PART"
        
        return veryLongToken
    }
}
\`\`\`

## Data Table
| ID | User   | Token (Truncated) | Status |
|----|--------|-------------------|--------|
| 01 | Admin  | eyJhbGciOiJIUz..  | OK     |
| 02 | Guest  | SflKxwRJSMeK..    | ERR    |
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
