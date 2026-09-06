import { Router } from "express";
import v1AuthRouter from "./auth/auth.v1";
import v1AdminRouter from "./admin/admin.v1";
import v1StudentRouter from "./user/student.v1";

const v1Router = Router();

v1Router.use("/auth",v1AuthRouter);
v1Router.use("/admin",v1AdminRouter);
v1Router.use("/student",v1StudentRouter);

export default v1Router;
