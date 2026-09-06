import { Router } from "express";
import apiController from "../../../../controllers/auth.v1.controller";

const authRouter = Router();

authRouter.post("/login",apiController.login);
authRouter.post("/signup",apiController.signup);

export default authRouter;
