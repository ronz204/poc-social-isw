// A post as the fake-data API owns it; `userId` points at its author.
export interface Post {
  readonly id: number;
  readonly userId: number;
  readonly title: string;
  readonly content: string;
}
