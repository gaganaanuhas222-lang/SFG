import { STATUS_CODES } from "../enums/status_codes"

export interface API_RESPONCE {
    status : STATUS_CODES,
    message : string
}

export interface DASHBOARD_DATA extends API_RESPONCE{
    data : any
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

export interface BANK_DETAILS {
    bank_name : string,
    acc_name : string,
    acc_number : number,
    branch : string,
}

export interface RECENT_ACTIVITY{
    timestamp : number,
    activity : string,
}

export interface OVERDUE_PAYMENTS 
    extends Pick<student, "last_name" | "first_name" | "grade">{
    overdue_duration : number,
}