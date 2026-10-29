// Loads a Botpress webchat once, and lets the AI Tools page open it and hide
// it again when the member leaves the page.

let loading = null;
let loadedFor = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = false;
    el.onload = resolve;
    el.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(el);
  });
}

export function loadBotpress(tool) {
  if (loading && loadedFor === tool.id) return loading;
  if (loading) {
    // A different bot is already on the page; a reload is the clean way to switch.
    return Promise.reject(new Error('Another assistant is already open. Refresh the page to switch.'));
  }
  loadedFor = tool.id;
  loading = (async () => {
    const [inject, ...rest] = tool.scripts;
    await loadScript(inject);
    for (const src of rest) await loadScript(src);
    // Give the widget a moment to start.
    for (let i = 0; i < 50 && !document.querySelector('.bpChatContainer'); i += 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
  })().catch((err) => {
    loading = null;
    loadedFor = null;
    throw err;
  });
  return loading;
}

export function openBotpress() {
  window.botpress?.open?.();
}

// Show the chat only on the AI Tools page (see .ai-tools-active in index.css).
export function setBotpressVisible(visible) {
  document.body.classList.toggle('ai-tools-active', visible);
  if (!visible) {
    try {
      window.botpress?.close?.();
    } catch {
      /* the widget may not be ready yet */
    }
  }
}
