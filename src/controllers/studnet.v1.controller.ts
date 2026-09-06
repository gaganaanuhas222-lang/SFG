import { Response, Request } from "express"
import studentV1Service from "../services/student.v1.service"
import { sendResponce } from "../status/status";

export default {
    async updateProfile(req : Request, res : Response){
       const r = await studentV1Service.updateProfile(req.body as student);
       sendResponce(res, r.status, r);
    },

    async getDashboardData(req : Request, res : Response){
        const k = await studentV1Service.getDashboardData();
        sendResponce(res, k.status, k);
    }
}