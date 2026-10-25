import { Container, token } from "dockdi";
import { env } from "@env";

export const EnvToken = token<typeof env>("Env");

// Composition root: contexts add their own bindings here as slices are built.
export const container = new Container();
container.bind(EnvToken).toValue(env);
