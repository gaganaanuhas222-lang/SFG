import { STATUS_CODES } from "../enums/status_codes";
import { LOGIN_SIGNUP_RESULT } from "../interfaces/apiService.interface";
import { COORDINATOR_LOGIN, LOGIN, STUDENT_LOGIN } from "../interfaces/login.interface";
import { STUDENT_REGISTER } from "../interfaces/register.interface";
import { isValdPassword, isValidMobileNumber, PASSWORD_MIN_LEN, removeAllSpaces, trimString } from "../util/util";
import authRepository from "../repository/auth.respository"
import { LOGIN_TYPE } from "../enums/loginType";
import { passwordToHash, stringToHash } from "../security/security";
import { CRYPTO_ALGO_TYPES } from "../enums/cryptoAlgoTypes";
import { DIGEST } from "../enums/digest";
import { APP_CONFIG } from "../app";

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

        const passwordHash = passwordToHash(password);

        const isSaveSignupData = await authRepository.saveSignUpData({
            fullName,
            grade,
            district,
            schoolName,
            whatsappNumber,
            passwordHash
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

        switch (login.login_type) {
            case LOGIN_TYPE.STUDENT_LOGIN:
                const studentData = login.login_data as STUDENT_LOGIN;

                if (!studentData.password || !studentData.studentId) break;

                const savedStudentData = await authRepository.getLoginData<STUDENT_LOGIN>(login);
                const passwordHash = stringToHash(
                    studentData.password,
                    APP_CONFIG.PASSWORD_ALGO,
                    APP_CONFIG.PASSWORD_DIGEST
                );

                if (savedStudentData.password === passwordHash
                    && savedStudentData.studentId === trimString(studentData.studentId)) return {
                        status: STATUS_CODES.OK,
                        message: "Login success"
                    }

                break;

            case LOGIN_TYPE.COORDINATOR_LOGIN:
                const cordinaterData = login.login_data as COORDINATOR_LOGIN;

                if (!cordinaterData.accessCode) break;

                const savedCordinaterData = await authRepository.getLoginData<COORDINATOR_LOGIN>(login);

                if (savedCordinaterData.accessCode === trimString(cordinaterData.accessCode)) return {
                    status: STATUS_CODES.OK,
                    message: "Login success"
                }

                break;
        }

        return {
            status: STATUS_CODES.BAD_REQUEST,
            message: "Bad Login credentials"
        }
    }

}