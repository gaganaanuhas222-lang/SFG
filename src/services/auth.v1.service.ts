import { STATUS_CODES } from "../enums/status_codes";
import { LOGIN_SIGNUP_RESULT } from "../interfaces/apiService.interface";
import { LOGIN } from "../interfaces/login.interface";
import { STUDENT_REGISTER } from "../interfaces/register.interface";
import { isValdPassword, isValidMobileNumber, PASSWORD_MIN_LEN, removeAllSpaces, trimString } from "../util/util";
import apiRepository from "../repository/auth.respository"

export default {
    async signup(signup: STUDENT_REGISTER): Promise<LOGIN_SIGNUP_RESULT> {
        
        const {
            fullName,
            grade,
            district,
            schoolName,
            whatsappNumber,
            password
        } = {
            fullName: trimString(signup.fullName ?? ''),
            grade: signup.grade ?? 0,
            district: trimString(signup.district ?? ''),
            schoolName: trimString(signup.schoolName ?? ''),
            whatsappNumber: trimString(
                removeAllSpaces(signup.whatsappNumber ?? '')
            ),
            password: signup.password ?? ''
        };

        // start validate values 
        if (!fullName
            || !grade
            || !district
            || !schoolName
            || !whatsappNumber
            || !password) {

            return {
                status: STATUS_CODES.BAD_REQUEST,
                message: "Pleace fill all fields",
            }
        }

        if (grade < 7 || grade > 11) {
            return {
                status: STATUS_CODES.BAD_REQUEST,
                message: "Invalid grade"
            }
        }

        if (!isValidMobileNumber(whatsappNumber)) {
            return {
                status: STATUS_CODES.BAD_REQUEST,
                message: "Invalid Whatsapp number"
            }
        }

        if (!isValdPassword(password)) {
            return {
                status: STATUS_CODES.BAD_REQUEST,
                message: `Your password must contain:
At least one lowercase letter
At least one uppercase letter
At least one digit
At least one special character (e.g. @$!%*?&)
Minimum length of ${PASSWORD_MIN_LEN} characters`
            }
        }

        // end validation

        const isSaveSignupData = await apiRepository.saveSignUpData({
            fullName,
            grade,
            district,
            schoolName,
            whatsappNumber,
            password
        })

        if (isSaveSignupData) {
            return {
                status: STATUS_CODES.OK,
                message: "Signup success"
            }

        } else {
            return {
                status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                message: "Somting went worng. pleace try again later"
            }
        }

    },

    async login(login: LOGIN): Promise<LOGIN_SIGNUP_RESULT> {
        return {
            status: STATUS_CODES.OK,
            message: ""
        }
    }

}