import dotEnv from "dotenv";
import express from "express";
import apiRouter from "./routes/api/route";

dotEnv.config();

const { EXPRESS, HOST, PORT } = {
    EXPRESS: express(),
    HOST: process.env.HOST || 'localhost',
    PORT: Number(process.env.PORT) || 3000
}

EXPRESS.use(express.json());

EXPRESS.use("/", express.static("public/"));
EXPRESS.use("/api", apiRouter);

EXPRESS.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
})  