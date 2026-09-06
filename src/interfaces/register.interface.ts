export interface STUDENT_REGISTER {
    fullName : string,
    grade : number,
    district : string,
    schoolName : string,
    whatsappNumber : string,

    medium? : string,
    isVerfy?: boolean,
    insitute? : string,
    password? : string,
    passwordHash? : string,
}