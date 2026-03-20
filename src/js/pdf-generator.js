// --- PDF Generator ---
// Uses html2pdf.js to capture the preview and generate a PDF
// with proper page breaks and internal link annotations.

async function generatePDF() {
    const btn = document.getElementById('btn-pdf');
    btn.disabled = true;

    // Show loading overlay
    const overlay = document.createElement('div');
    overlay.className = 'pdf-overlay';
    overlay.innerHTML = '<div class="spinner"></div><div class="label">Generating PDF\u2026</div>';
    document.body.appendChild(overlay);

    try {
        const element = document.getElementById('doc-render');
        const h1 = element.querySelector('h1');
        const filename = h1
            ? h1.textContent.trim().replace(/[<>:"\/\\|?*]/g, '_') + '.pdf'
            : 'document.pdf';

        // Switch to PDF capture mode (styles adjust for print layout)
        element.classList.add('pdf-mode');

        // Group each heading (+ consecutive sub-headings) with the first
        // following content sibling so they never split across pages.
        _groupHeadings(element);

        // Let the browser apply the new layout before capturing
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

        // Record link/heading positions for internal PDF navigation
        const linkData = _collectInternalLinks(element);

        const opt = {
            margin:      linkData.marginMM,
            filename:    filename,
            image:       { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale:           2,
                useCORS:         true,
                logging:         false,
                letterRendering: true,
                backgroundColor: '#ffffff'
            },
            jsPDF: {
                unit:        'mm',
                format:      'a4',
                orientation: 'portrait',
                compress:    true
            },
            pagebreak: {
                mode:  ['css', 'legacy'],
                avoid: ['p', 'li', 'tr', 'table', 'thead', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'img', 'ul', 'ol', '.heading-group']
            }
        };

        // Generate PDF, inject internal links, then save
        const worker = html2pdf().set(opt).from(element).toContainer().toCanvas().toImg().toPdf();

        await worker.get('pdf').then(function(pdf) {
            const totalPages = pdf.internal.getNumberOfPages();
            linkData.links.forEach(link => {
                if (link.page > totalPages || link.targetPage > totalPages) return;
                pdf.setPage(link.page);
                pdf.link(link.x, link.y, link.w, link.h, { pageNumber: link.targetPage });
            });
        });

        await worker.save();

        element.classList.remove('pdf-mode');
        _ungroupHeadings(element);
    } catch (err) {
        console.error('PDF generation failed:', err);
        const el = document.getElementById('doc-render');
        el.classList.remove('pdf-mode');
        _ungroupHeadings(el);
    } finally {
        overlay.remove();
        btn.disabled = false;
    }
}

// --- Helper: group headings with their following content ---
function _groupHeadings(element) {
    const headingSel = 'h1, h2, h3, h4, h5, h6';
    const topHeadings = Array.from(element.querySelectorAll(headingSel))
        .filter(h => !h.previousElementSibling || !h.previousElementSibling.matches(headingSel));

    topHeadings.forEach(heading => {
        const wrapper = document.createElement('div');
        wrapper.className = 'heading-group';
        heading.parentNode.insertBefore(wrapper, heading);
        wrapper.appendChild(heading);

        // Pull in any consecutive sub-headings (e.g. h2 then h3)
        while (wrapper.nextElementSibling && wrapper.nextElementSibling.matches(headingSel)) {
            wrapper.appendChild(wrapper.nextElementSibling);
        }

        // Pull in the first content element after the headings
        if (wrapper.nextElementSibling && !wrapper.nextElementSibling.matches(headingSel)) {
            wrapper.appendChild(wrapper.nextElementSibling);
        }
    });
}

// --- Helper: restore flat structure ---
function _ungroupHeadings(element) {
    element.querySelectorAll('.heading-group').forEach(g => {
        while (g.firstChild) g.parentNode.insertBefore(g.firstChild, g);
        g.remove();
    });
}

// --- Helper: collect internal anchor link positions ---
function _collectInternalLinks(element) {
    const marginMM = 20;
    const usableWidthMM = 210 - marginMM * 2;   // 170mm
    const usableHeightMM = 297 - marginMM * 2;   // 257mm
    const pxPerMM = element.scrollWidth / usableWidthMM;
    const pageHeightPx = usableHeightMM * pxPerMM;
    const elemRect = element.getBoundingClientRect();

    // Map every id to a destination page
    const destinations = {};
    element.querySelectorAll('[id]').forEach(el => {
        const y = el.getBoundingClientRect().top - elemRect.top;
        destinations[el.id] = { page: Math.floor(y / pageHeightPx) + 1 };
    });

    // Collect internal anchor links with bounding boxes
    const links = [];
    element.querySelectorAll('a[href^="#"]').forEach(a => {
        const rect = a.getBoundingClientRect();
        const y = rect.top - elemRect.top;
        const x = rect.left - elemRect.left;
        const targetId = a.getAttribute('href').substring(1);
        const dest = destinations[targetId];
        if (dest) {
            links.push({
                page:       Math.floor(y / pageHeightPx) + 1,
                x:          marginMM + x / pxPerMM,
                y:          marginMM + (y % pageHeightPx) / pxPerMM,
                w:          rect.width / pxPerMM,
                h:          rect.height / pxPerMM,
                targetPage: dest.page
            });
        }
    });

    return { marginMM, links };
}
