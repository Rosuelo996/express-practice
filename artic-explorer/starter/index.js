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
  // TODO:
  // Use response.data.config.iiif_url and the imageId.
  if (!imageId) return null;

  const imageBase = response.data.config.iiif_url

  return `${imageBase}/${imageId}/full/843,/0/default.jpg`;
}

function cleanArtwork(response, item) {
  // TODO:
  // Return a simple object with:
  // title, artist, date, place, imageUrl
  return {
    title: item.title || "Untitled",
    artist: item.artist_title || "Unknown",
    date: item.date_display || "Unknown",
    place: item.place_of_origin || "Unknown",
    imageUrl: makeImageUrl(response, item.image_id),
  }
}

app.get("/", async (req, res) => {
  try {
    // TODO:
    // 1. Use axios.get(API_URL)
    const response = await axios.get(API_URL, {
    // 2. Add params: limit and fields
    params: {
      limit: 12,
      fields: "title,artist_title,date_display,place_of_origin,image_id"
    }
    })
    // 3. Pick one artwork
    const artworks = response.data.data
    const randomArtwork = pickRandom(artworks)
    // 4. Save it to lastArtwork
    lastArtwork = cleanArtwork(response, randomArtwork)
    // 5. Send page()
    res.send(page("Discover a random artwork", lastArtwork));
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).send(page("Something went wrong."));
  }
});

app.post("/search", async (req, res) => {
  const query = req.body.query;

  try {
    // TODO:
    // 1. Use axios.get(`${API_URL}/search`)
    const response = await axios.get(`${API_URL}/search`, {
    // 2. Add params: q, limit and fields
    params: {
      q: query,
      limit: 12,
      fields: "title,artist_title,date_display,place_of_origin,image_id",
    }
    })

    const artworks = response.data.data

    // 3. If no results, show message
    if (artworks.length === 0) {
      return res.send(page("Search failed", null, query))
    }
    
    // 4. Pick one artwork
    const randomArtwork = pickRandom(artworks)

    // 5. Save it to lastArtwork
    lastArtwork = cleanArtwork(response, randomArtwork)
    // 6. Send page()

    res.send(page(`Search for ${query}`, lastArtwork, query));
  } catch (error) {
    res.status(500).send(page("Search failed.", null, query));
  }
});

app.get("/download/:type", (req, res) => {
  if (!lastArtwork) {
    return res.send("No artwork downloaded yet.");
  }

  const type = req.params.type
  // TODO:
  // If type is txt, download text.
  if (type === "txt") {
    const text = `
    Title: ${lastArtwork.title}
    Artist: ${lastArtwork.artist}
    Date: ${lastArtwork.date}
    Place: ${lastArtwork.place}
    Image: ${lastArtwork.imageUrl}
    `
    res.setHeader("Content-Type", "text/plain")
    res.attachment("artwork.txt");
    return res.send(text)
  }
  // Otherwise download JSON.
  res.setHeader("Content-Type", "application/json")
  res.attachment("artwork.json");

  res.send(JSON.stringify(lastArtwork, null, 2));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
