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
    deleteId = "",
  } = state;

  const template = await readFile(
    new URL("./views/index.html", import.meta.url),
    "utf-8",
  );

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
  const html = await renderPage({
    message: "Use the panels to test REST methods.",
  });
  res.send(html);
});

// GET (read)
app.post("/get-post", async (req, res) => {
  const id = (req.body.id || "").trim();

  if (!id) {
    return res.send(
      await renderPage({
        message: "Enter a post ID to fetch.",
      }),
    );
  }

  try {
    // TODO:
    // - call GET `${API_BASE}/posts/${id}`
    const response = await axios.get(`${API_BASE}/posts/${id}`, {
      validateStatus: () => true,
    });
    // - render response.data
    const data = response.data;

    if (response.status === 404 || !data || Object.keys(data).length === 0) {
      return res.send(
        await renderPage({ message: `Post ${id} not found`, getId: id }),
      );
    }

    const html = await renderPage({
      message: `GET success (post: ${id})`,
      cardJson: data,
      getId: id,
    });
    res.send(html);
  } catch (err) {
    console.log(err.response?.data || err.message);

    res
      .status(500)
      .send(await renderPage({ message: "GET failed. Try again.", getId: id }));
  }
});

// POST (create)
app.post("/create-post", async (req, res) => {
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!title || !body) {
    return res.send(
      await renderPage({
        message: "Title and body are required. Try again.",
        createTitle: title,
        createBody: body,
      }),
    );
  }

  try {
    // TODO:
    // - call POST `${API_BASE}/posts` with body { title, body, userId: 1 }
    const response = await axios.post(`${API_BASE}/posts`, {
      title,
      body,
      userId: 1,
    });
    const data = response.data;

    const html = await renderPage({
      message: "POST success (created post).",
      cardJson: data,
      createTitle: title,
      createBody: body,
    });
    res.send(html);
  } catch (err) {
    console.log(err.response?.data || err.message);

    const html = await renderPage({
      message: "Failed to CREATE post. Try again.",
      createTitle: title,
      createBody: body,
    });
    res.status(500).send(html);
  }
});

// PUT (replace)
app.post("/replace-post", async (req, res) => {
  const id = (req.body.id || "").trim();
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!id || !title || !body) {
    return res.send(
      await renderPage({
        message: "Post ID, title and body are required. Try again.",
        putId: id,
        putTitle: title,
        putBody: body,
      }),
    );
  }

  try {
    // TODO:
    // - call PUT `${API_BASE}/posts/${id}` with full object { id, title, body, userId: 1 }
    const response = await axios.put(`${API_BASE}/posts/${id}`, {
      id,
      title,
      body,
      userId: 1,
    });
    const data = response.data;

    const html = await renderPage({
      message: `PUT success (replaced post ${id})`,
      cardJson: data,
      putId: id,
      putTitle: title,
      putBody: body,
    });
    res.send(html);
  } catch (err) {
    console.log(err.response?.data || err.message);

    const html = await renderPage({
      message: "Failed to replace post. Try again",
      putId: id,
      putTitle: title,
      putBody: body,
    });
    res.status(500).send(html);
  }
});

// PATCH (partial update)
app.post("/patch-post", async (req, res) => {
  const id = (req.body.id || "").trim();
  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!id) {
    return res.send(
      await renderPage({
        message: "PATCH needs an ID.",
        patchId: id,
        patchTitle: title,
        patchBody: body,
      }),
    );
  }

  // TODO:
  // - build a patch object with only fields provided
  const patch = {};
  if (title) patch.title = title;
  if (body) patch.body = body;

  if (Object.keys(patch).length === 0) {
    return res.send(
      await renderPage({
        message: "Provide at least a title or body to PATCH.",
        patchId: id,
      }),
    );
  }

  try {
    // - call PATCH `${API_BASE}/posts/${id}`
    const response = await axios.patch(`${API_BASE}/posts/${id}`, patch, {
      validateStatus: () => true,
    });
    const data = response.data;

    if (response.status === 404 || !data || Object.keys(data).length === 0) {
      return res.send(
        await renderPage({
          message: `Post ${id} not found.`,
          patchId: id,
          patchTitle: title,
          patchBody: body,
        }),
      );
    }

    const html = await renderPage({
      message: `PATCH success (updated post ${id}).`,
      cardJson: data,
      patchId: id,
      patchTitle: title,
      patchBody: body,
    });
    res.send(html);
  } catch {
    res.status(500).send(
      await renderPage({
        message: "PATCH failed. Try again.",
        patchId: id,
        patchTitle: title,
        patchBody: body,
      }),
    );
  }
});

// DELETE (remove)
app.post("/delete-post", async (req, res) => {
  const id = (req.body.id || "").trim();

  if (!id) {
    return res.send(
      await renderPage({
        message: "Enter a post ID to delete.",
      }),
    );
  }

  try {
    // TODO:
    // - call DELETE `${API_BASE}/posts/${id}`
    const response = await axios.delete(`${API_BASE}/posts/${id}`, {
      validateStatus: () => true,
    });

    if (response.status === 404) {
      return res.send(
        await renderPage({
          message: "Post not found. Try again.",
          deleteId: id,
        }),
      );
    }

    const html = await renderPage({
      message: `DELETE success (post ${id} deleted)`,
      cardJson: { status: response.status, data: response.data },
      deleteId: id,
    });
    res.send(html);
  } catch {
    res.status(500).send(
      await renderPage({
        message: "DELETE failed. Try again.",
        deleteId: id,
      }),
    );
  }
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
