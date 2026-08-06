import dotEnv from "dotenv";
import express from "express";
import apiRouter from "./routes/api/router";
import { sendBadResponce, sendNotFoundResponce } from "./status/status";

dotEnv.config();

const { EXPRESS, HOST, PORT } = {
    EXPRESS: express(),
    HOST: process.env.HOST || 'localhost',
    PORT: Number(process.env.PORT) || 3000
}

EXPRESS.use(express.json());

EXPRESS.use("/", express.static("public/"));
EXPRESS.use("/api", apiRouter);

EXPRESS.post(/.*/, sendBadResponce);
EXPRESS.get(/.*/, sendNotFoundResponce);

EXPRESS.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
})  