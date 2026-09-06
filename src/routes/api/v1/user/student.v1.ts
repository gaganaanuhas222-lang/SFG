import { Router } from "express";
import studnetV1Controller from "../../../../controllers/studnet.v1.controller";

const studentRouter = Router();
const {
    updateProfile,
    getDashboardData

} = studnetV1Controller;

// const stuUpdateRouter = Router();

// stuUpdateRouter.post("/personalInfo");
// stuUpdateRouter.post("/schoolDetails");
// stuUpdateRouter.post("/homeAddress");
// stuUpdateRouter.post("/guardian");
// stuUpdateRouter.post("/tdc"); // Tute Delivery Contacts

// studentRouter.use("/update",stuUpdateRouter);

studentRouter.post("/updateProfile",updateProfile);
studentRouter.post("/getDashboardData", getDashboardData);

export default studentRouter;