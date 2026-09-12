import { tryExecute } from "../core/coreFunctions";
import { STATUS_CODES } from "../enums/status_codes";
import { CustomError } from "../Error/CustomError";
import { API_RESPONCE, STUDENT_DASHBOARD_DATA } from "../interfaces/apiService.interface";
import { student } from "../interfaces/db_er.interfaces";
import studentRepository from "../repository/student.repository";
import { isValidStudent } from "../util/util";

export default {
    async updateProfile(stu: student): Promise<API_RESPONCE> {
       const res = await tryExecute<API_RESPONCE>(async ()=> {
            if (!isValidStudent(stu)) {
                throw new CustomError().setSafeMessage("Invalid student data");
            }

            const isUpdate = await studentRepository.updateStudentProfile(stu);

            if (isUpdate) {
                return {
                    status: STATUS_CODES.OK,
                    message: "profile is updated."
                }
            }

            throw new CustomError().setSafeMessage("Fail to update student profile");
        });
       
        return res; 
    },

    async getDashboardData(): Promise<STUDENT_DASHBOARD_DATA> {
        const res = tryExecute<STUDENT_DASHBOARD_DATA>( async ()=>{        
            const timetable = await studentRepository.readTimetable();
            const assessments = await studentRepository.readAssessment();
            const paymentHistory = await studentRepository.readPaymentHistory();

            return {
                timetable,
                assessments,
                paymentHistory
            }
        });

        return res;
    }
}
