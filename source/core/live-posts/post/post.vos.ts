// A visitor's post as the server stores it; every field is built by the server.
export interface LivePost {
  readonly id: string;
  readonly author: string;
  readonly content: string;
  readonly time: string;
}
