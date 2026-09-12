import { assessment_type, live_class, paymet_history, student, timetable } from "../interfaces/db_er.interfaces";

export default {
    async updateStudentProfile(s : student) : Promise<boolean>{
        return false;
    },

    async readTimetable() : Promise<timetable>{
        return {} as timetable;
    },

    async readAssessment() : Promise<assessment_type>{
        return {} as assessment_type;
    },

    async readPaymentHistory() : Promise<paymet_history[]>{
        return [] as paymet_history[]
    }
}