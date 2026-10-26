// The current moment; the domain never reads the clock itself.
export interface IClock {
  now(): Date;
}
