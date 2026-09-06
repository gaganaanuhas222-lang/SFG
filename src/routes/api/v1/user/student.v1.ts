import { Router } from "express";

const studentRouter = Router();
// const stuUpdateRouter = Router();

// stuUpdateRouter.post("/personalInfo");
// stuUpdateRouter.post("/schoolDetails");
// stuUpdateRouter.post("/homeAddress");
// stuUpdateRouter.post("/guardian");
// stuUpdateRouter.post("/tdc"); // Tute Delivery Contacts

// studentRouter.use("/update",stuUpdateRouter);

studentRouter.post("/updateProfile");
studentRouter.post("/getDashboardData")

export default studentRouter;