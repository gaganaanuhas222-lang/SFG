import { STATUS_CODES } from "../enums/status_codes"
import { assessment_type, paymet_history, student, timetable } from "./db_er.interfaces"

export interface API_RESPONCE {
    status : STATUS_CODES,
    message : string
}

export interface DASHBOARD_DATA extends API_RESPONCE{
    data : any
}

export interface STUDENT_DASHBOARD_DATA extends DASHBOARD_DATA{
    data : {
        timetable : timetable[],
        assessments : assessment_type[],
        paymentHistory : (OVERDUE_PAYMENTS | paymet_history)[]
    }
}

export interface ADMIN_DASHBOARD_DATA extends DASHBOARD_DATA {
    data : {
        studnets : student[],
        payments : paymet_history[],
        contents : assessment_type[],
        schedule : timetable[]
    }
}

export interface LOGIN_SIGNUP_RESULT {
    status: STATUS_CODES,
    message: string
}

export interface SLIP_REVIEW_REQ{
    slip_id : number,
    status : boolean,
}

export interface SLIP_REVIEW_RES extends API_RESPONCE{};


export interface RECENT_ACTIVITY{
    timestamp : number,
    activity : string,
}

export interface OVERDUE_PAYMENTS 
    extends Pick<student, "last_name" | "first_name" | "grade">{
    overdue_duration : number,
}