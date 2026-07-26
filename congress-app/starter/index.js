import express from "express";
import axios from "axios";
import { readFile } from "node:fs/promises";

const app = express();
const PORT = 3000;

// INSERT YOUR API KEY HERE
const API_KEY = "Ux2Uc9WfjbwFgnuH8rGksFg27XsH6jlePA64TY4B";
const BASE_URL = "https://api.congress.gov/v3";

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
        <p><strong>Updated:</strong> ${item.updated}</p>
        <p><strong>Bill Number:</strong> ${item.number}</p>
      </section>
    `
    : "";

  return template
    .replace("{{MESSAGE}}", message)
    .replace("{{QUERY}}", query)
    .replace("{{CARD}}", card);
}

/*
  GET /
  - Make a request to Congress.gov using Axios
  - Include the API key
  - Log response.data
  - Get the bills array
  - Pick ONE random bill
  - Render it on the page
*/
app.get("/", async (req, res) => {

  try {
    const response = await axios.get(`${BASE_URL}/bill`, {
      params: {
        api_key: API_KEY, 
        format: "json",
        limit: 20,
      }
    })

    const bills = response?.data?.bills || []

    if (bills.length === 0) {
      const html = await renderPage({
        message: "No bills returned from APi"
      })
      return res.send(html)
    }

    const bill = pickRandom(bills)

    const item = {
      title: bill.title || "Untitled Bill",
      chamber: bill.originChamber || "Unknown",
      updated: bill.updateDate || "Unknown",
      number: bill.number || "",
    }

    const html = await renderPage({
      message: "Showing recent Bill from Congress.gov",
      item,
    });

    res.send(html);
  } catch (err) {
    console.log(err.response?.data || err.message);

    const html = await renderPage({
      message: "Error loading data. Please check your API key",
      item: null,
    });

    res.status(500).send(html);
  }
});

/*
  POST /search
  - Log req.body
  - Make a new Axios request
  - Get the bills array
  - Filter results locally
  - Handle empty results
  - Pick ONE matching result
  - Render it
*/
app.post("/search", async (req, res) => {
  const { chamber, query } = req.body;
  const selectedChamber = (chamber || "").toLowerCase();
  const searchQuery = (query || "").toLowerCase();

  console.log(req.body)
  try {
    const response = await axios.get(`${BASE_URL}/bill`, {
      params: {
      api_key: API_KEY,
      format: "json",
      limit: 250,
      }
    })

    const bills = response?.data?.bills || []

    const filtered = bills.filter((bill) => {
      const title = (bill.title || "").toLowerCase();
      const chamber = (bill.originChamber || "").toLowerCase()
      const titleMatch = title.includes(searchQuery)
      const chamberMatch = chamber === selectedChamber
      return titleMatch && chamberMatch
    })

    if (filtered.length === 0) {
      const html = await renderPage({
        message: "No results found for your search",
        query: query || "",
      })
      return res.send(html)
    }

    const bill = pickRandom(filtered)

    const item = {
      title: bill.title || "Untitled Bill",
      chamber: bill.originChamber || "Unknown",
      updated: bill.updateDate || "Unknown",
      number: bill.number || "",
    };

    const html = await renderPage({
      message: "Search result from Congress.gov",
      query: query || "",
      item,
    });

    res.send(html);
  } catch (err) {
    console.log(err.response?.data || err.message)
    const html = await renderPage({
      message: "Search failed.",
      query,
      item: null,
    });

    res.status(500).send(html);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
