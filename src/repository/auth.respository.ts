import { LOGIN } from "../interfaces/login.interface";
import { STUDENT_REGISTER } from "../interfaces/register.interface";

export default {
    async saveSignUpData(loginData : STUDENT_REGISTER) : Promise<boolean> {
        return true;
    },

    async getLoginData() : Promise<LOGIN>{
        return {
            accessCode : ''
        }
    }
}