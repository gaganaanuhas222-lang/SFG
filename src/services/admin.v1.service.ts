import { tryExecute } from "../core/coreFunctions";
import { CustomError } from "../Error/CustomError";
import { ADMIN_DASHBOARD_DATA, API_RESPONCE, DASHBOARD_DATA, SLIP_REVIEW_REQ } from "../interfaces/apiService.interface";
import { isValidStudent } from "../util/util";
import adminRepository from "../repository/admin.repository";
import { STATUS_CODES } from "../enums/status_codes";
import { assessment_type, student, timetable } from "../interfaces/db_er.interfaces";

export default {
    async addNewStudent(stu: student): Promise<API_RESPONCE> {
        const res = await tryExecute<API_RESPONCE>(async () => {
            if (!isValidStudent(stu)) {
                throw new CustomError().setSafeMessage("Invalid student data");
            }

            const isAdded = await adminRepository.addNewStudent(stu);
            if (isAdded) return {
                status: STATUS_CODES.OK,
                message: "New student added"
            } as API_RESPONCE;

            throw new CustomError().setSafeMessage("Fail to add student");
        });
        return res;
    },

    async editStudent(stu: student): Promise<API_RESPONCE> {
        const res = await tryExecute<API_RESPONCE>(async () => {
            if (!isValidStudent(stu)) {
                throw new CustomError().setSafeMessage("Invalid student data");
            }

            const isUpdate = await adminRepository.updateStudnet(stu);
            if (isUpdate) return {
                status: STATUS_CODES.OK,
                message: "Student update"
            } as API_RESPONCE;

            throw new CustomError().setSafeMessage("Fail to update studnet profile");

        });
        return res;
    },

    async getDashboardData(): Promise<ADMIN_DASHBOARD_DATA> {
        const res = tryExecute<ADMIN_DASHBOARD_DATA>(async () => {
            const r = await adminRepository.readDashBoardData();
            return r;
        });
        return res;
    },

    async addContent(data: assessment_type): Promise<API_RESPONCE> {
        return {} as API_RESPONCE;

    },

    async updateSchedule(data: timetable): Promise<API_RESPONCE> {
        return {} as API_RESPONCE;

    },

    async slipReview(data: SLIP_REVIEW_REQ): Promise<API_RESPONCE> {
        return {} as API_RESPONCE;

    },

    async publishLiveClass(data: any): Promise<API_RESPONCE> {
        return {} as API_RESPONCE;

    },

    async newAnnouncement(data: any): Promise<API_RESPONCE> {
        return {} as API_RESPONCE;

    },

    async updateBankDetails(data: any): Promise<API_RESPONCE> {
        return {} as API_RESPONCE;

    }
}