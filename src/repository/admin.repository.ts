import { ADMIN_DASHBOARD_DATA, DASHBOARD_DATA, SLIP_REVIEW_REQ } from "../interfaces/apiService.interface";
import { announcement, assessment_type, bank_details, live_class, student, timetable } from "../interfaces/db_er.interfaces";

type pro_boolean = Promise<boolean>; 

export default {
    async addNewStudent(s : student) : pro_boolean{
        return false;
    },

    async updateStudnet(s : student) : pro_boolean{
        return false;
    },

    async readDashBoardData() : Promise<ADMIN_DASHBOARD_DATA>{
        return {} as ADMIN_DASHBOARD_DATA;
    },

    async addContent(content : assessment_type) : pro_boolean {
        return false;
    },

    async writeSchedule(timetable : timetable) : pro_boolean {
        return false;
    },

    async updateSlip(sr : SLIP_REVIEW_REQ) : pro_boolean {
        return false;
    },

    async writeLiveClassSchedule(data : live_class) : pro_boolean{
        return false;
    },

    async writeNewAnnoucement(data : announcement) : pro_boolean{
        return false;
    },

    async updateBankDetails(data : bank_details) : pro_boolean{
        return false;
    }

}