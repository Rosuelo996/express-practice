import express from "express";
import axios from "axios";
import { readFile } from "node:fs/promises";

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const API_BASE = "https://jsonplaceholder.typicode.com";

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function renderPage(state = {}) {
  const {
    message = "Ready.",
    cardJson = null,
    getId = "",
    createTitle = "",
    createBody = "",
    putId = "",
    putTitle = "",
    putBody = "",
    patchId = "",
    patchTitle = "",
    patchBody = "",
    deleteId = ""
  } = state;

  const template = await readFile(new URL("./views/index.html", import.meta.url), "utf-8");

  const card = cardJson
    ? `<div class="card"><pre>${escapeHtml(JSON.stringify(cardJson, null, 2))}</pre></div>`
    : "";

  return template
    .replace("{{MESSAGE}}", escapeHtml(message))
    .replace("{{CARD}}", card)
    .replace("{{GET_ID}}", escapeHtml(getId))
    .replace("{{CREATE_TITLE}}", escapeHtml(createTitle))
    .replace("{{CREATE_BODY}}", escapeHtml(createBody))
    .replace("{{PUT_ID}}", escapeHtml(putId))
    .replace("{{PUT_TITLE}}", escapeHtml(putTitle))
    .replace("{{PUT_BODY}}", escapeHtml(putBody))
    .replace("{{PATCH_ID}}", escapeHtml(patchId))
    .replace("{{PATCH_TITLE}}", escapeHtml(patchTitle))
    .replace("{{PATCH_BODY}}", escapeHtml(patchBody))
    .replace("{{DELETE_ID}}", escapeHtml(deleteId));
}

app.get("/", async (req, res) => {
  const html = await renderPage({ message: "Use the panels to test REST methods." });
  res.send(html);
});

app.post("/get-post", async (req, res) => {
  const id = (req.body.id || "").trim();

  if (!id) {
    return res.send(await renderPage({ message: "Enter a post ID to fetch." }));
  }

  try {
    const response = await axios.get(`${API_BASE}/posts/${id}`, { validateStatus: () => true });

    if (response.status === 404 || !response.data || Object.keys(response.data).length === 0) {
      return res.send(await renderPage({ message: `Post ${id} not found.`, getId: id }));
    }

    res.send(await renderPage({ message: `GET success (post ${id}).`, getId: id, cardJson: response.data }));
  } catch {
    res.status(500).send(await renderPage({ message: "GET failed. Try again.", getId: id }));
  }
});

app.post("/create-post", async (req, res) => {
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!title || !body) {
    return res.send(await renderPage({ message: "Title and body are required.", createTitle: title, createBody: body }));
  }

  try {
    const response = await axios.post(`${API_BASE}/posts`, { title, body, userId: 1 }, { validateStatus: () => true });
    res.send(await renderPage({ message: "POST success (created post).", createTitle: title, createBody: body, cardJson: response.data }));
  } catch {
    res.status(500).send(await renderPage({ message: "POST failed. Try again.", createTitle: title, createBody: body }));
  }
});

app.post("/replace-post", async (req, res) => {
  const id = (req.body.id || "").trim();
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!id || !title || !body) {
    return res.send(await renderPage({ message: "PUT needs ID + title + body.", putId: id, putTitle: title, putBody: body }));
  }

  try {
    const response = await axios.put(`${API_BASE}/posts/${id}`, { id: Number(id), title, body, userId: 1 }, { validateStatus: () => true });
    res.send(await renderPage({ message: `PUT success (replaced post ${id}).`, putId: id, putTitle: title, putBody: body, cardJson: response.data }));
  } catch {
    res.status(500).send(await renderPage({ message: "PUT failed. Try again.", putId: id, putTitle: title, putBody: body }));
  }
});

app.post("/patch-post", async (req, res) => {
  const id = (req.body.id || "").trim();
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!id) {
    return res.send(await renderPage({ message: "PATCH needs an ID.", patchTitle: title, patchBody: body }));
  }

  const patch = {};
  if (title) patch.title = title;
  if (body) patch.body = body;

  if (Object.keys(patch).length == 0) {
    return res.send(await renderPage({ message: "Provide at least title or body to PATCH.", patchId: id }));
  }

  try {
    const response = await axios.patch(`${API_BASE}/posts/${id}`, patch, { validateStatus: () => true });
    res.send(await renderPage({ message: `PATCH success (updated post ${id}).`, patchId: id, patchTitle: title, patchBody: body, cardJson: response.data }));
  } catch {
    res.status(500).send(await renderPage({ message: "PATCH failed. Try again.", patchId: id, patchTitle: title, patchBody: body }));
  }
});

app.post("/delete-post", async (req, res) => {
  const id = (req.body.id || "").trim();

  if (!id) {
    return res.send(await renderPage({ message: "Enter a post ID to delete." }));
  }

  try {
    const response = await axios.delete(`${API_BASE}/posts/${id}`, { validateStatus: () => true });
    res.send(await renderPage({ message: `DELETE success (post ${id} deleted).`, deleteId: id, cardJson: { status: response.status, data: response.data } }));
  } catch {
    res.status(500).send(await renderPage({ message: "DELETE failed. Try again.", deleteId: id }));
  }
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
