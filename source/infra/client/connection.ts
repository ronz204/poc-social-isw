const FIRST_WAIT_MS = 1000;
const MAX_WAIT_MS = 10000;

// The wait before retry number `attempt` (from 0): it doubles each time and stops at the cap.
export const reconnectDelay = (attempt: number) => Math.min(FIRST_WAIT_MS * 2 ** attempt, MAX_WAIT_MS);

// Chat messages carry these types; every other known type belongs to the posts list.
const CHAT_TYPES = new Set(["chat", "chat-history", "chat-error"]);
const POST_TYPES = new Set(["post", "history", "error"]);

type Listener<T> = (value: T) => void;

// The page's one WebSocket, shared by live posts and chat. It reopens itself after any close.
export const createConnection = (url: string, Socket: typeof WebSocket = WebSocket) => {
  const openListeners: Listener<void>[] = [];
  const closeListeners: Listener<void>[] = [];
  const postListeners: Listener<any>[] = [];
  const chatListeners: Listener<any>[] = [];
  let socket: WebSocket;
  let attempt = 0;

  const route = (text: string) => {
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return;
    }
    // Each message reaches one list; an unknown type reaches none.
    if (CHAT_TYPES.has(data?.type)) chatListeners.forEach((listener) => listener(data));
    else if (POST_TYPES.has(data?.type)) postListeners.forEach((listener) => listener(data));
  };

  const open = () => {
    socket = new Socket(url);
    socket.addEventListener("open", () => {
      attempt = 0;
      openListeners.forEach((listener) => listener());
    });
    socket.addEventListener("message", (event) => route(event.data as string));
    socket.addEventListener("close", () => {
      closeListeners.forEach((listener) => listener());
      setTimeout(open, reconnectDelay(attempt++));
    });
  };
  open();

  return {
    send: (text: string) => socket.send(text),
    onOpen: (listener: Listener<void>) => void openListeners.push(listener),
    onClose: (listener: Listener<void>) => void closeListeners.push(listener),
    onPosts: (listener: Listener<any>) => void postListeners.push(listener),
    onChat: (listener: Listener<any>) => void chatListeners.push(listener),
  };
};
