import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

const possiblePaths = [
  path.join(__dirname, "../../quiz-app/dist/public"),
  path.join(__dirname, "../../quiz-app/dist"),
  path.join(__dirname, "../../../artifacts/quiz-app/dist/public"),
  path.join(__dirname, "../../../artifacts/quiz-app/dist"),
];

const frontendPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];

console.log("Frontend path:", frontendPath);
console.log("Exists:", fs.existsSync(frontendPath));

app.use(express.static(frontendPath));
app.get("*splat", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

export default app;
