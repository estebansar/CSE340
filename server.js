import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "src/views"));

app.get("/", (req, res) => {
  const title = "Welcome Home";
  res.render("home", { title });
});

app.get("/about", (req, res) => {
  const title = "About Me";
  res.render("about", { title });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});