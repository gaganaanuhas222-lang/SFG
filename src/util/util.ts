import { NUMBER_CODES } from "../enums/number_codes";

export const PASSWORD_MIN_LEN = 6;

const MOBILE_NUMBER_LEN = 12;
const PASSWORD_REGEX = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{${PASSWORD_MIN_LEN},}$`);


export const trimString = (value: string) => value.trim();
export const removeAllSpaces = (value: string) => value.replace(/\s+/g, '');

export const isValidMobileNumber = (mobileNumber: string): boolean => {
    return mobileNumber.length === MOBILE_NUMBER_LEN
        && NUMBER_CODES.some(code => mobileNumber.startsWith(code))
}

export const isValdPassword = (password : string) => PASSWORD_REGEX.test(password);