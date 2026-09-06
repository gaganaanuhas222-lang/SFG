import { API_RESPONCE, DASHBOARD_DATA } from "../interfaces/apiService.interface";


export default {
    async addNewStudent(data: any): Promise<API_RESPONCE>{
        return {} as API_RESPONCE;
    },

    async editStudent(data : any): Promise<API_RESPONCE>{
        return {} as API_RESPONCE;
    },

    async getDashboardData() : Promise<DASHBOARD_DATA> {
        return {} as DASHBOARD_DATA;
    },

    async addContent(data : any): Promise<API_RESPONCE>{
        return {} as API_RESPONCE;

    },

    async updateSchedule(data : any): Promise<API_RESPONCE>{
        return {} as API_RESPONCE;

    },

    async slipReview(data : any): Promise<API_RESPONCE>{
        return {} as API_RESPONCE;

    },

    async publishLiveClass(data : any): Promise<API_RESPONCE>{
        return {} as API_RESPONCE;

    },

    async newAnnouncement(data : any) : Promise<API_RESPONCE>{
        return {} as API_RESPONCE;

    },

    async updateBankDetails(data : any) : Promise<API_RESPONCE>{
        return {} as API_RESPONCE;

    }
}