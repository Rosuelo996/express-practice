import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Flat-packed JSON string (minified, like over the internet)
const recipesFlatPack = `{"recipes":[{"id":"chicken","name":"Chicken Taco","ingredients":{"protein":{"name":"Chicken","preparation":"Grilled"},"toppings":[{"quantity":"1/2 cup","name":"lettuce"},{"quantity":"1/4 cup","name":"cheese"},{"quantity":"2 tbsp","name":"guacamole"}]}},{"id":"beef","name":"Beef Taco","ingredients":{"protein":{"name":"Beef","preparation":"Ground"},"toppings":[{"quantity":"1/4 cup","name":"onion"},{"quantity":"1 tbsp","name":"cilantro"},{"quantity":"1/4 cup","name":"cheddar"}]}},{"id":"fish","name":"Fish Taco","ingredients":{"protein":{"name":"Fish","preparation":"Fried"},"toppings":[{"quantity":"1/2 cup","name":"cabbage"},{"quantity":"1/2","name":"avocado"}]}}]}`;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/recipe", (req, res) => {
  console.log(req.body);
  // TODO 1) Get the user's choice
  const choice = req.body.choice;
  console.log(choice)

  // TODO 2) Unpack the flat pack
  const data = JSON.parse(recipesFlatPack)

  // TODO 3) Select the correct recipe (from data.recipes)
  const recipe = data.recipes.find((item) => item.id === choice)

  // TODO 4) If no recipe, send a simple message + back link
  if (!recipe) {
    res.send("<p>Please select Chicken, Beef or Fish.</p><a href="/">BACK</a>")
    return;
  }

  // TODO 5) Build toppings HTML using forEach
  let toppingsHtml = ""

recipe.ingredients.toppings.forEach((topping) => {
  toppingsHtml += `<li>${topping.quantity} - ${topping.name}</li>`
})
console.log(toppingsHtml)


  // TODO 6) Send the full HTML response using nested properties
   res.send(`
    <!DOCTYPE html>
    <html>
    <body>

    <a href="/"> ← Back <a/>

    <h1>${recipe.name}<h1/>

    <p>
    Protein: ${recipe.ingredients.protein.name}
    (${recipe.ingredients.protein.preparation})
    </p>

    <h3>Toppings</h3>

    <ul>
    ${toppingsHtml}
    </ul>
    
    </body>
    </html>
    `)
})

// Starter behavior (so the server runs before you finish)
//   res.send(
//     "<p>Not finished yet. Go to index.js and complete the TODOs.</p><a href='/'>Back</a>",
//   );
// });

app.listen(port, () => {
  console.log("Server running at http://localhost:" + port);
});

