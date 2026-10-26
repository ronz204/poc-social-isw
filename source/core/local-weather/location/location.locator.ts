import type { Place } from "./location.vos";

// Finds where a client IP approximately is; null when it finds nothing (a normal outcome).
export interface ILocationLocator {
  locate(ip: string): Place | null;
}
