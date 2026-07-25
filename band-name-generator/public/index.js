// Import Express (the web server framework)
import express from "express";

// Import Morgan (logs every request in the terminal)
import morgan from "morgan";

// Import Body Parser (reads data sent from HTML forms)
import bodyParser from "body-parser";

// Used to build file paths that work on every operating system
import path from "path";

// Needed because ES modules don't have __dirname by default
import { fileURLToPath } from "url";

// ----------------------------------------------------
// Create the Express application
// ----------------------------------------------------
const app = express();

// Choose which port the server will listen on
const port = 3000;

// ----------------------------------------------------
// MIDDLEWARE
// ----------------------------------------------------

// Morgan logs every incoming request.
// Example:
// GET / 200 3.5 ms - 450
app.use(morgan("dev"));

// Body Parser reads form data and stores it in req.body.
//
// Without this:
// req.body -> undefined
//
// With this:
// req.body = {
//   streetName: "...",
//   petName: "..."
// }
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------------------------------------------
// __dirname setup (only needed when using ES Modules)
// ----------------------------------------------------

// Get the current file's full path
const __filename = fileURLToPath(import.meta.url);

// Get the folder this file lives in
const __dirname = path.dirname(__filename);

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------

// GET /
// Runs when someone visits:
// http://localhost:3000
app.get("/", (req, res) => {

  // Send the HTML file back to the browser.
  // sendFile requires the FULL path to the file.
  res.sendFile(path.join(__dirname, "index.html"));
});

// POST /submit
// Runs when the user submits the HTML form.
app.post("/submit", (req, res) => {

  // req.body contains the submitted form data
  console.log(req.body);

  // Read values from the form
  // ?? "" means:
  // If the value doesn't exist, use an empty string instead.
  const street = req.body.streetName ?? "";
  const pet = req.body.petName ?? "";

  // Combine the street and pet names
  // trim() removes any extra spaces at the beginning or end.
  // If both values are empty, use "Unnamed Band".
  const bandName = `${street} ${pet}`.trim() || "Unnamed Band";

  // Send a simple HTML response back to the browser
  res.send(`
    <h1>Your band name is: ${bandName}</h1>
    <p><a href="/">Go back</a></p>
  `);
});

// ----------------------------------------------------
// START THE SERVER
// ----------------------------------------------------

// Tell Express to start listening for requests on port 3000.
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});