import { Router } from "express";
import v1AuthRouter from "./auth/v1.auth.route";
const v1Router = Router();

v1Router.use("/auth",v1AuthRouter);

export default v1Router;
