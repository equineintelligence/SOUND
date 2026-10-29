// Loads a Botpress webchat once and opens it from the AI Tools page.
//
// Botpress normally shows a floating chat bubble on every page. Sound hides
// that bubble (so it never covers the bottom tabs) and opens the chat from the
// "Start a chat" button instead. Leaving the AI Tools page closes the chat.

let loading = null;
let loadedFor = null;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = false;
    el.onload = resolve;
    el.onerror = () => reject(new Error('The assistant could not be loaded. Check your connection and try again.'));
    document.head.appendChild(el);
  });
}

// The widget lives in a shadow root under #fab-root; page CSS can't reach it,
// so the rule that hides the bubble is added inside it.
async function hideBubble() {
  for (let i = 0; i < 100; i += 1) {
    const root = document.getElementById('fab-root')?.shadowRoot;
    if (root) {
      if (!root.querySelector('style[data-sound]')) {
        const style = document.createElement('style');
        style.setAttribute('data-sound', '');
        style.textContent = '.bpFab { display: none !important; }';
        root.appendChild(style);
      }
      return;
    }
    await wait(100);
  }
}

export function loadBotpress(tool) {
  if (loading && loadedFor === tool.id) return loading;
  if (loading) {
    return Promise.reject(new Error('Another assistant is already open. Refresh the page to switch.'));
  }
  loadedFor = tool.id;
  loading = (async () => {
    const [inject, ...rest] = tool.scripts;
    await loadScript(inject);
    const ready = new Promise((resolve) => {
      try {
        window.botpress.on('webchat:initialized', resolve);
      } catch {
        resolve();
      }
      setTimeout(resolve, 10000);
    });
    for (const src of rest) await loadScript(src);
    await ready;
    await hideBubble();
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

export function closeBotpress() {
  try {
    window.botpress?.close?.();
  } catch {
    /* the widget may not be ready yet */
  }
}

// Starts a fresh conversation. Botpress's own restartConversation() does
// nothing in the bubble version of the webchat, so this uses the chat's
// built-in "New conversation" button, found behind the back arrow.
export async function newBotpressConversation() {
  openBotpress();
  const findInChat = async (selector) => {
    for (let i = 0; i < 40; i += 1) {
      const el = document.getElementById('fab-root')?.shadowRoot?.querySelector(selector);
      if (el) return el;
      await wait(100);
    }
    return null;
  };
  const already = document
    .getElementById('fab-root')
    ?.shadowRoot?.querySelector('.bpConversationHistoryNewConversationButton');
  if (!already) {
    const history = await findInChat('[aria-label="Show Recent Conversations Button"]');
    if (!history) throw new Error('A new chat could not be started. Use the back arrow in the chat instead.');
    history.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
  }
  const newButton = await findInChat('.bpConversationHistoryNewConversationButton');
  if (!newButton) throw new Error('A new chat could not be started. Use the back arrow in the chat instead.');
  newButton.click();
}
