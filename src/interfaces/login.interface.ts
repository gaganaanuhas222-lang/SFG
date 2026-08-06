
export type LOGIN = STUDENT_LOGIN | COORDINATOR_LOGIN;

export interface STUDENT_LOGIN {
    studentId: string,
    password: string,
}

export interface COORDINATOR_LOGIN {
    accessCode: string
}