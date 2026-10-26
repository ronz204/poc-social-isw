// The page's one WebSocket, shared by live posts and chat; each script picks the message types it knows.
export const socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`);
