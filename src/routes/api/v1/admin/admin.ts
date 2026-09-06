import { Router } from "express";

const adminRouter  = Router();

adminRouter.post("/addNewStudent");
adminRouter.post("/editStudent");

// adminRouter.post("/getIncativeStudnets");
// adminRouter.post("/getRecentActivity");
// adminRouter.post("/getOverduePayments");
adminRouter.post("/getDashboardData");

adminRouter.post("/addContent");
adminRouter.post("/updateSchedule");

adminRouter.post("/slipReview");

adminRouter.post("/publishLiveClass");

adminRouter.post("/newAnnouncement");

adminRouter.post("/updateBank");



export default adminRouter;

