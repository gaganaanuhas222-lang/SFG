import { Router } from "express";
import v1AuthRouter from "./auth/auth.v1.route";
const v1Router = Router();

v1Router.use("/auth",v1AuthRouter);

export default v1Router;
