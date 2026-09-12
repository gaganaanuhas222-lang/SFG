import { Request, Response } from "express";
import { STATUS_CODES } from "../enums/status_codes";
import { API_RESPONCE, LOGIN_SIGNUP_RESULT } from "../interfaces/apiService.interface";

export const sendBadResponce = (req : Request, res : Response, message? : string) => sendResponce(res,STATUS_CODES.BAD_REQUEST,{
    status : STATUS_CODES.BAD_REQUEST,
    message : message ?  message : "Bad Request" 
})

export const sendNotFoundResponce = (req : Request, res : Response) => sendResponce(res,STATUS_CODES.BAD_REQUEST,{
    status : STATUS_CODES.NOT_FOUND,
    message : "Not Found"
})

export const sendInternalServerErrorResponce = (req : Request, res : Response) => sendResponce(res,STATUS_CODES.INTERNAL_SERVER_ERROR,{
    status : STATUS_CODES.INTERNAL_SERVER_ERROR,
    message : "Internal server error"
})

export const sendResponce = (res : Response, status : STATUS_CODES, data : API_RESPONCE) => res.status(status).send(data); 