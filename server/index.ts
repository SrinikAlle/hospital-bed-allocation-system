import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const app = express();
const staticPath = path.resolve(dirname, "public");

app.use(express.static(staticPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log("Hospital Bed Allocation System running on port " + port);
});
