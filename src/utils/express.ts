import config from "../config";
import express from "express";
import { expressLogger } from "./logger/express";
import rateLimit from "express-rate-limit";

export const app = express();
app.use(expressLogger);

app.enable("trust proxy");
app.use(rateLimit({
  skip: req => config.apiRatelimitIpWhitelist.includes(req.ip),
}));

app.get("/ping", (_, res) => res.sendStatus(200));

app.listen(config.apiPort);
