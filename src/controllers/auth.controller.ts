import { Request, Response } from "express";
import authService from "../services/auth.v1.service";
import { LOGIN } from "../interfaces/login.interface";
import { STUDENT_REGISTER } from "../interfaces/register.interface";
import { sendInternalServerErrorResponce } from "../status/status";

export default {
    async login(
        req: Request,
        res: Response) {

        try {
            const result = await authService.login(req.body as LOGIN);
            res.status(result.status).send(result);

        } catch (e) {
            console.log(e);
            sendInternalServerErrorResponce(req, res);
        }
    },

    async signup(
        req: Request,
        res: Response) {

        try {
            const result = await authService.signup(req.body as STUDENT_REGISTER);
            res.status(result.status).send(result);


        } catch (e) {
            console.log(e);
            sendInternalServerErrorResponce(req, res);
        }
    }
}