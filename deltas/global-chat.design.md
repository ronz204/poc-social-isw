# Global Chat — Design

> The right panel's content: the message list and the chat form. Presentation layer of global-chat.spec.md.

## Scope

Covers the message list, the chat form and their states.

Non-goals:

- The panel's frame and the connection status: page-shell.design.md.
- Highlighting one's own messages, presence, a character counter; not wanted.
- Colors and theme.

## Layout

Top to bottom inside the panel:

- **Message list:** oldest at the top, newest at the bottom, scrolling on its own. Each message shows a round avatar with the author's initials, then the author name and the formatted time, with the text in a bubble under them.
- **Chat form:** at the bottom, the visitor's avatar, the text field and a round, icon-only send button, all the same height; an inline message line for errors. The name comes from the header field (see page-shell.design.md).

## States

- While there are no chat messages, the list shows "No messages yet".
- While the history arrives on connect, the list shows the stored messages with the newest at the bottom and scrolled into view.
- While the connection is not open, the form is disabled (see page-shell.design.md).
- While the server rejects a message as invalid, the message line shows the reason under the form.
- While a previous error is shown and the visitor sends a valid message, the message line is cleared.

## Interactions

- When the visitor submits the form with a text while connected and a name set in the header, the client sends the chat message; the rules are in global-chat.spec.md (Contract and invariant 3).
- The send button has no visible text, so it carries the accessible name "Send".
- When the form is sent, the text field is cleared. The name is kept and saved by the header field, shared with the publish form.
- When a message arrives and the visitor is at the bottom of the list, the list scrolls to show it.
- When a message arrives and the visitor has scrolled up to read, the list does not move.
- When the server answers with an error, the text already cleared is not restored.

There are no confirmation steps. Author name and text are shown as text, never as markup (see global-chat.spec.md, invariant 7).

## Consumes

| Source | Used for |
|---|---|
| WebSocket chat history on connect | The initial list |
| WebSocket chat broadcast | New items at the bottom |
| WebSocket error reply to a chat message | The inline message line |
| The header name field | The author name of each chat message |

It writes the chat message (name and text).

## Deferred / Open questions

- Wording of the rejection messages beyond showing them inline; first lines are "Your name and message can't be empty, and the message can't pass 200 characters." for an invalid message.
- Format and locale of the time: the server's string is shown as it comes (global-chat.spec.md).
- Whether a "new messages" hint is needed when the visitor has scrolled up.
- Accessibility: focus after sending, announcing new messages.

## Acceptance criteria

1. Given two browsers open on the page, when one sends a message, then both show it at the bottom of the list. [manual: two browser windows]
2. Given messages were sent, when a third browser opens the page, then it shows them with the newest at the bottom. [manual: open a third window afterwards]
3. Given the visitor is at the bottom, when a message arrives, then the list scrolls to show it. [manual: send from the other browser]
4. Given the visitor has scrolled up, when a message arrives, then the scroll position does not change. [manual: scroll up and send from the other browser]
5. Given no messages exist, when the page loads, then the list says "No messages yet". [manual: restart the server and load the page]
6. Given an empty text, when the visitor sends, then the message line shows an error and the other browser receives nothing. [manual: send an empty text]
7. Given a filled form, when the visitor sends, then the text field is empty and the header still holds the name. [manual: send and look at the form]

---

Last updated: 2026-10-27.
