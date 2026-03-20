// --- Editor Markdown Syntax Highlighting ---
// Overlay technique: coloured <pre> backdrop behind a transparent <textarea>.

(function () {
    const input = document.getElementById('md-input');
    const backdrop = document.getElementById('editor-backdrop');
    const highlightEl = document.getElementById('editor-highlight');

    if (!input || !backdrop || !highlightEl) return;

    // --- Helpers ---

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function span(cls, content) {
        return '<span class="' + cls + '">' + content + '</span>';
    }

    // --- Tokeniser / Highlighter ---

    function highlightMarkdown(text) {
        var lines = text.split('\n');
        var result = [];
        var inCodeBlock = false;

        for (var i = 0; i < lines.length; i++) {
            var raw = lines[i];
            var escaped = escapeHtml(raw);

            // ---- Code fence open / close ----
            if (/^```/.test(raw)) {
                if (!inCodeBlock) {
                    inCodeBlock = true;
                    var lang = raw.slice(3).trim();
                    var markerPart = span('md-code-block-marker', escapeHtml('```'));
                    var langPart = lang ? span('md-code-block-lang', escapeHtml(lang)) : '';
                    result.push(markerPart + langPart);
                } else {
                    inCodeBlock = false;
                    result.push(span('md-code-block-marker', escapeHtml('```')));
                }
                continue;
            }

            if (inCodeBlock) {
                result.push(span('md-code-block-content', escaped));
                continue;
            }

            // ---- Headings ----
            var headingMatch = raw.match(/^(#{1,6})\s(.*)$/);
            if (headingMatch) {
                var marker = escapeHtml(headingMatch[1] + ' ');
                var headingText = highlightInline(escapeHtml(headingMatch[2]));
                result.push(span('md-heading-marker', marker) + span('md-heading', headingText));
                continue;
            }

            // ---- Horizontal rule ----
            if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(raw)) {
                result.push(span('md-hr', escaped));
                continue;
            }

            // ---- Blockquote ----
            var bqMatch = raw.match(/^(&gt;|>)\s?(.*)/);
            if (!bqMatch) bqMatch = escaped.match(/^(&gt;)\s?(.*)/);
            if (raw.charAt(0) === '>') {
                var bqMarker = escapeHtml('> ');
                var bqRest = highlightInline(escapeHtml(raw.slice(raw.indexOf('>') + 1).replace(/^\s/, '')));
                result.push(span('md-blockquote-marker', bqMarker) + span('md-blockquote-text', bqRest));
                continue;
            }

            // ---- Table separator (|---|---|) ----
            if (/^\|?[\s\-:|]+\|[\s\-:|]+\|?\s*$/.test(raw) && raw.includes('-')) {
                result.push(span('md-table-separator', escaped));
                continue;
            }

            // ---- Table row ----
            if (/^\|.+\|/.test(raw)) {
                var tableLine = escaped.replace(/\|/g, span('md-table-pipe', '|'));
                result.push(highlightInline(tableLine));
                continue;
            }

            // ---- Unordered list ----
            var ulMatch = raw.match(/^(\s*)([-*+])\s(.*)$/);
            if (ulMatch) {
                var indent = escapeHtml(ulMatch[1]);
                var bullet = span('md-list-marker', escapeHtml(ulMatch[2]));
                var listText = highlightInline(escapeHtml(ulMatch[3]));
                result.push(indent + bullet + ' ' + listText);
                continue;
            }

            // ---- Ordered list ----
            var olMatch = raw.match(/^(\s*)(\d+\.)\s(.*)$/);
            if (olMatch) {
                var olIndent = escapeHtml(olMatch[1]);
                var num = span('md-list-marker', escapeHtml(olMatch[2]));
                var olText = highlightInline(escapeHtml(olMatch[3]));
                result.push(olIndent + num + ' ' + olText);
                continue;
            }

            // ---- Default: inline highlights only ----
            result.push(highlightInline(escaped));
        }

        return result.join('\n');
    }

    // --- Inline highlighting (operates on already-escaped HTML) ---

    function highlightInline(line) {
        // Order matters: bold-italic before bold before italic

        // Inline code  `code`
        line = line.replace(/(`)((?:(?!`).)+?)(`)/g, function (_, o, code, c) {
            return span('md-code-marker', o) + span('md-code-inline', code) + span('md-code-marker', c);
        });

        // Bold-italic ***text*** or ___text___
        line = line.replace(/(\*{3}|_{3})((?:(?!\1).)+?)(\1)/g, function (_, o, txt, c) {
            return span('md-bold-italic-marker', o) + span('md-bold-italic', txt) + span('md-bold-italic-marker', c);
        });

        // Bold **text** or __text__
        line = line.replace(/(\*{2}|_{2})((?:(?!\1).)+?)(\1)/g, function (_, o, txt, c) {
            return span('md-bold-marker', o) + span('md-bold', txt) + span('md-bold-marker', c);
        });

        // Italic *text* or _text_ (single)
        line = line.replace(/((?:^|[^\\*_]))(\*|_)((?:(?!\2).)+?)(\2)/g, function (_, pre, o, txt, c) {
            return pre + span('md-italic-marker', o) + span('md-italic', txt) + span('md-italic-marker', c);
        });

        // Images ![alt](url)
        line = line.replace(/(!\[)((?:(?!\]).)*?)(\]\()((?:(?!\)).)*?)(\))/g, function (_, ex, alt, mid, url, cl) {
            return span('md-image-marker', ex) + span('md-link-text', alt) + span('md-link-bracket', mid) + span('md-link-url', url) + span('md-link-bracket', cl);
        });

        // Links [text](url)
        line = line.replace(/(\[)((?:(?!\]).)*?)(\]\()((?:(?!\)).)*?)(\))/g, function (_, ob, txt, mid, url, cl) {
            return span('md-link-bracket', ob) + span('md-link-text', txt) + span('md-link-bracket', mid) + span('md-link-url', url) + span('md-link-bracket', cl);
        });

        // HTML tags
        line = line.replace(/(&lt;\/?[a-zA-Z][^&]*?&gt;)/g, function (_, tag) {
            return span('md-html-tag', tag);
        });

        return line;
    }

    // --- Sync scroll ---

    function syncScroll() {
        backdrop.scrollTop = input.scrollTop;
        backdrop.scrollLeft = input.scrollLeft;
    }

    // --- Update highlighted backdrop ---

    function updateHighlight() {
        // Append a trailing newline so the backdrop height matches the textarea
        highlightEl.innerHTML = highlightMarkdown(input.value) + '\n';
        syncScroll();
    }

    // --- Event wiring ---

    input.addEventListener('input', updateHighlight);
    input.addEventListener('scroll', syncScroll);

    // Initial paint
    updateHighlight();
})();
