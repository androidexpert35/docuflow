// --- Split View Resizer ---
// Handles drag-to-resize between editor and preview panes.
// Supports horizontal (desktop) and vertical (mobile) layouts.

(function initSplitResizer() {
    const workspace = document.querySelector('.workspace');
    const editorPane = document.getElementById('editor-pane');
    const previewPane = document.getElementById('preview-pane');
    const resizer = document.getElementById('split-resizer');

    const SPLIT_MIN_PX = 220;
    let isResizing = false;

    function isStackedLayout() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    function setSplitFromPointer(clientX, clientY) {
        const rect = workspace.getBoundingClientRect();
        const stacked = isStackedLayout();

        if (!stacked) {
            const total = rect.width;
            const x = clientX - rect.left;
            const editorPx = clamp(x, SPLIT_MIN_PX, total - SPLIT_MIN_PX);
            const editorPct = (editorPx / total) * 100;
            editorPane.style.flex = `0 0 ${editorPct}%`;
            previewPane.style.flex = '1 1 auto';
            resizer.setAttribute('aria-orientation', 'vertical');
        } else {
            const total = rect.height;
            const y = clientY - rect.top;
            const editorPx = clamp(y, SPLIT_MIN_PX, total - SPLIT_MIN_PX);
            const editorPct = (editorPx / total) * 100;
            editorPane.style.flex = `0 0 ${editorPct}%`;
            previewPane.style.flex = '1 1 auto';
            resizer.setAttribute('aria-orientation', 'horizontal');
        }
    }

    function startResize(e) {
        isResizing = true;
        workspace.classList.add('is-resizing');
        try { resizer.setPointerCapture(e.pointerId); } catch (_) {}
    }

    function stopResize() {
        if (!isResizing) return;
        isResizing = false;
        workspace.classList.remove('is-resizing');
    }

    function onResizeMove(e) {
        if (!isResizing) return;
        setSplitFromPointer(e.clientX, e.clientY);
    }

    if (!resizer) return;

    resizer.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        startResize(e);
    });
    resizer.addEventListener('pointermove', onResizeMove);
    resizer.addEventListener('pointerup', stopResize);
    resizer.addEventListener('pointercancel', stopResize);

    // Keyboard accessibility: arrow keys to adjust split.
    resizer.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 5 : 2;
        const stacked = isStackedLayout();
        const rect = workspace.getBoundingClientRect();
        const current = editorPane.getBoundingClientRect();

        if (!stacked && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            e.preventDefault();
            const delta = (e.key === 'ArrowLeft' ? -step : step);
            const pct = ((current.width / rect.width) * 100) + delta;
            const minPct = (SPLIT_MIN_PX / rect.width) * 100;
            const maxPct = 100 - minPct;
            editorPane.style.flex = `0 0 ${clamp(pct, minPct, maxPct)}%`;
        }

        if (stacked && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault();
            const delta = (e.key === 'ArrowUp' ? -step : step);
            const pct = ((current.height / rect.height) * 100) + delta;
            const minPct = (SPLIT_MIN_PX / rect.height) * 100;
            const maxPct = 100 - minPct;
            editorPane.style.flex = `0 0 ${clamp(pct, minPct, maxPct)}%`;
        }
    });

    // Keep the current split sensible when orientation changes.
    window.addEventListener('resize', () => {
        if (!editorPane.style.flex) return;
        const rect = workspace.getBoundingClientRect();
        setSplitFromPointer(rect.left + rect.width * 0.45, rect.top + rect.height * 0.42);
    });
})();
