// Gives every stored chat message an id no other message has.
export interface IChatIdIssuer {
  next(): string;
}
