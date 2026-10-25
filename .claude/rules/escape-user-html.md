---
paths:
  - "source/**/*.ts"
  - "source/**/*.tsx"
---

# HTML Escaping Conventions

This governs how text typed by a visitor reaches the page. Posts and chat messages are shown to every other connected visitor, so a single unescaped value is stored XSS against all of them.

---

## Render visitor text only through the escaping path

- Every visitor-supplied string (author name, post text, chat text) is rendered through the HTML renderer's normal escaping, never concatenated into markup by hand, because string-built HTML bypasses escaping silently.
- Never route visitor-supplied content into a raw or unescaped HTML sink, including attribute values, because attributes break out with a quote and are easy to forget.
- The same holds for text pushed to clients over the WebSocket: clients insert it as text, not as markup.
- Verify what the renderer escapes by default before relying on it; don't assume.

---

## Non-goals

- Doesn't cover trusted, server-authored markup, only content that originates from a visitor or a third-party API.
