import { Router } from "express";
import adminV1Controller from "../../../../controllers/admin.v1.controller";

const adminRouter  = Router();
const {
    addNewStudnet,
    editStudent,
    getDashboardData,
    addContent,
    updateSchedule,
    slipReview,
    publishLiveClass,
    newAnnouncement,
    updateBankDetails

} = adminV1Controller;

adminRouter.post("/addNewStudent", addNewStudnet);
adminRouter.post("/editStudent", editStudent);

// adminRouter.post("/getIncativeStudnets");
// adminRouter.post("/getRecentActivity");
// adminRouter.post("/getOverduePayments");
adminRouter.post("/getDashboardData",getDashboardData);

adminRouter.post("/addContent", addContent);
adminRouter.post("/updateSchedule",updateSchedule);

adminRouter.post("/slipReview", slipReview);

adminRouter.post("/publishLiveClass", publishLiveClass);
adminRouter.post("/newAnnouncement", newAnnouncement);

adminRouter.post("/updateBankDetails", updateBankDetails);

export default adminRouter;

