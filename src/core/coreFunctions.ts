import { STATUS_CODES } from "../enums/status_codes";
import { CustomError } from "../Error/CustomError";

export const tryExecute = async <T> (func : () => any ): Promise<T> => {
    try {
        return func() as T;
    } catch (e) {
        if (e instanceof CustomError) return {
            status: STATUS_CODES.BAD_REQUEST,
            message: e.getSafeMesassage()
        } as T;

        return {
            status: STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: "",
        } as T
    }
}