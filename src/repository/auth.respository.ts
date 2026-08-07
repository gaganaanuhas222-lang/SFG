import { LOGIN_TYPE } from "../enums/loginType";
import { LOGIN } from "../interfaces/login.interface";
import { STUDENT_REGISTER } from "../interfaces/register.interface";

export default {
    async saveSignUpData(loginData: STUDENT_REGISTER): Promise<boolean> {

        return true;
    },

    async getLoginData<T>(login: LOGIN): Promise<T> {
        switch (login.login_type) {
            case LOGIN_TYPE.STUDENT_LOGIN:
                // student get data login
                return {
                    password: "",
                    studentId: ""
                } as T;

            case LOGIN_TYPE.COORDINATOR_LOGIN:
                // cordinatoer get data login 
                return {
                    accessCode: "123"
                } as T;
        }
    }
}