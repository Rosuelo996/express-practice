import express from "express";
import axios from "axios";
import { readFile } from "node:fs/promises";

const app = express();
const PORT = 3000;

// INSERT YOUR API KEY HERE
const API_KEY = "YOUR_API_KEY_HERE";

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function renderPage({ message = "", query = "", item = null }) {
  const template = await readFile(
    new URL("./views/index.html", import.meta.url),
    "utf-8",
  );

  const card = item
    ? `
      <section class="card">
        <h2>${item.title}</h2>
        <p><strong>Chamber:</strong> ${item.chamber}</p>
        <p><strong>Introduced:</strong> ${item.introduced}</p>
        <p><strong>Bill Number:</strong> ${item.number}</p>
      </section>
    `
    : "";

  return template
    .replace("{{MESSAGE}}", message)
    .replace("{{QUERY}}", query)
    .replace("{{CARD}}", card);
}

// HOME PAGE
app.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://api.congress.gov/v3/bill", {
      params: {
        api_key: API_KEY,
        format: "json",
        limit: 20,
      },
    });

    const bills = response?.data?.bills || [];

    if (bills.length === 0) {
      const errorHtml = await renderPage({
        message: "No bills returned from the API.",
      });

      return res.send(errorHtml);
    }

    const bill = pickRandom(bills);

    const item = {
      title: bill.title || "Untitled Bill",
      chamber: bill.originChamber || "Unknown",
      introduced: bill.introducedDate || "Unknown",
      number: bill.number || "",
    };

    const html = await renderPage({
      message: "Showing a recent bill from Congress.gov",
      item,
    });

    res.send(html);
  } catch (err) {
    console.log(err.response?.data || err.message);

    const html = await renderPage({
      message: "Problem retrieving data. Check your API key.",
    });

    res.status(500).send(html);
  }
});

// SEARCH
app.post("/search", async (req, res) => {
  const chamberRaw = (req.body.chamber || "").trim().toLowerCase();

  const queryRaw = (req.body.query || "").trim().toLowerCase();

  const chamberWanted =
    chamberRaw === "house" ? "House" : chamberRaw === "senate" ? "Senate" : "";

  try {
    // Congress API search is unreliable,
    // so we fetch a larger list and filter locally.
    const response = await axios.get("https://api.congress.gov/v3/bill", {
      params: {
        api_key: API_KEY,
        format: "json",
        limit: 250,
      },
    });

    const bills = response?.data?.bills || [];

    const filtered = bills.filter((bill) => {
      const title = (bill.title || "").toLowerCase();
      const chamber = bill.originChamber || "";

      const titleMatches = !queryRaw || title.includes(queryRaw);

      const chamberMatches = !chamberWanted || chamber === chamberWanted;

      return titleMatches && chamberMatches;
    });

    if (filtered.length === 0) {
      const html = await renderPage({
        message: "No results found for your search.",
        query: req.body.query || "",
      });

      return res.send(html);
    }

    const bill = pickRandom(filtered);

    const item = {
      title: bill.title || "Untitled Bill",
      chamber: bill.originChamber || "Unknown",
      introduced: bill.introducedDate || "Unknown",
      number: bill.number || "",
    };

    const html = await renderPage({
      message: "Search result from Congress.gov",
      query: req.body.query || "",
      item,
    });

    res.send(html);
  } catch (err) {
    console.log(err.response?.data || err.message);

    const html = await renderPage({
      message: "Search failed. API error or rate limit hit.",
      query: req.body.query || "",
    });

    res.status(500).send(html);
  }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
