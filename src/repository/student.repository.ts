type assessment_type = tute | recordings | live_class;

export default {
    async updateStudentProfile() : Promise<boolean>{
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