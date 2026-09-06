import { API_RESPONCE, DASHBOARD_DATA } from "../interfaces/apiService.interface";
import studentRepository from "../repository/student.repository";

export default {
    async updateProfile(stu : student) : Promise<API_RESPONCE>{
        

        return {} as API_RESPONCE;
    },

    async getDashboardData() : Promise<DASHBOARD_DATA>{
        return {} as DASHBOARD_DATA;
    }
}