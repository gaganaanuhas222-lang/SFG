import { LOGIN_TYPE } from "../enums/loginType"

export interface LOGIN {
    login_type : LOGIN_TYPE,
    login_data : STUDENT_LOGIN | COORDINATOR_LOGIN
}

export interface STUDENT_LOGIN {
    studentId: string,
    password: string,
}

export interface COORDINATOR_LOGIN {
    accessCode: string
}