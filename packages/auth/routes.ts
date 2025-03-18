import { auth } from "./server";
import { toNextJsHandler } from "better-auth/next-js";

export const authHandler = toNextJsHandler(auth);
