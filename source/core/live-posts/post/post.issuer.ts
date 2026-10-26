// Gives every stored post an id no other post has.
export interface IPostIdIssuer {
  next(): string;
}
