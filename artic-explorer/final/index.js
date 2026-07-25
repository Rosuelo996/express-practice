import express from "express";
import axios from "axios";

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const API_URL = "https://api.artic.edu/api/v1/artworks";

let lastArtwork = null;

function page(message, artwork = null, query = "") {
  return `
    <!doctype html>
    <html>
      <head>
        <title>Art Institute Explorer</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <main>
          <h1>Art Institute Explorer</h1>

          <form method="POST" action="/search">
            <input name="query" placeholder="Search (Monet, cats, portrait...)" value="${query}" />
            <button>Search</button>
          </form>

          <p class="message">${message}</p>

          ${artwork ? artworkCard(artwork) : ""}

          <p>Server-side API calls with Axios • No API key needed</p>
        </main>
      </body>
    </html>
  `;
}

function artworkCard(artwork) {
  return `
    <section class="card">
      <div class="image">
        ${artwork.imageUrl ? `<img src="${artwork.imageUrl}" alt="${artwork.title}" />` : "No image"}
      </div>

      <div class="info">
        <h2>${artwork.title}</h2>
        <p><strong>Artist:</strong> ${artwork.artist}</p>
        <p><strong>Date:</strong> ${artwork.date}</p>
        <p><strong>Place:</strong> ${artwork.place}</p>

        <div class="actions">
          <a href="/download/json">Download JSON</a>
          <a href="/download/txt">Download TXT</a>
        </div>
      </div>
    </section>
  `;
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function makeImageUrl(response, imageId) {
  if (!imageId) return null;

  const imageBase = response.data.config.iiif_url;
  return `${imageBase}/${imageId}/full/843,/0/default.jpg`;
}

function cleanArtwork(response, item) {
  return {
    title: item.title || "Untitled",
    artist: item.artist_title || "Unknown",
    date: item.date_display || "Unknown",
    place: item.place_of_origin || "Unknown",
    imageUrl: makeImageUrl(response, item.image_id)
  };
}

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        limit: 12,
        fields: "title,artist_title,date_display,place_of_origin,image_id"
      }
    });

    const artworks = response.data.data;
    const randomArtwork = pickRandom(artworks);

    lastArtwork = cleanArtwork(response, randomArtwork);

    res.send(page("Random artwork pulled live from the API.", lastArtwork));
  } catch (error) {
    res.status(500).send(page("Something went wrong."));
  }
});

app.post("/search", async (req, res) => {
  const query = req.body.query;

  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: {
        q: query,
        limit: 12,
        fields: "title,artist_title,date_display,place_of_origin,image_id"
      }
    });

    const artworks = response.data.data;

    if (artworks.length === 0) {
      return res.send(page("No artwork found.", null, query));
    }

    const randomArtwork = pickRandom(artworks);

    lastArtwork = cleanArtwork(response, randomArtwork);

    res.send(page(`Showing a result for "${query}".`, lastArtwork, query));
  } catch (error) {
    res.status(500).send(page("Search failed.", null, query));
  }
});

app.get("/download/:type", (req, res) => {
  if (!lastArtwork) {
    return res.send("No artwork downloaded yet.");
  }

  if (req.params.type === "txt") {
    const text = `
Title: ${lastArtwork.title}
Artist: ${lastArtwork.artist}
Date: ${lastArtwork.date}
Place: ${lastArtwork.place}
Image: ${lastArtwork.imageUrl}
`;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", "attachment; filename=artwork.txt");
    return res.send(text);
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", "attachment; filename=artwork.json");
  res.send(JSON.stringify(lastArtwork, null, 2));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
