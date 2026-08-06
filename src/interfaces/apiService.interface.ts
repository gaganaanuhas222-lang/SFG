import { STATUS_CODES } from "../enums/status_codes"

export interface LOGIN_SIGNUP_RESULT {
    status: STATUS_CODES,
    message: string
}