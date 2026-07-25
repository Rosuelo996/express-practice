// app.post("/recipe", (req, res) => {
//   console.log(req.body);
//   // TODO 1) Get the user's choice
//   const choice = req.body.choice;

  // TODO 2) Unpack the flat pack
  // const data = JSON.parse(recipesFlatPack);

  // TODO 3) Select the correct recipe (from data.recipes)
  // let recipe = null;
  // data.recipes.forEach(function(r) {
  //   if (r.id === choice) recipe = r;
  // });

  // TODO 4) If no recipe, send a simple message + back link
  // if (!recipe) {
  //   res.send("<p>Please pick Chicken, Beef, or Fish.</p><a href='/'>Back</a>");
  //   return;
  // }

  // TODO 5) Build toppings HTML using forEach
  // let toppingsHtml = "";
  // recipe.ingredients.toppings.forEach(function(t) {
  //   toppingsHtml += "<li>" + t.quantity + " - " + t.name + "</li>";
  // });

  // TODO 6) Send the full HTML response using nested properties
  // res.send(
  //   "<!DOCTYPE html>" +
  //   "<html><body>" +
  //   "<a href='/'>← Back</a>" +
  //   "<h1>" + recipe.name + "</h1>" +
  //   "<p>Protein: " +
  //     recipe.ingredients.protein.name +
  //     " (" +
  //     recipe.ingredients.protein.preparation +
  //     ")" +
  //   "</p>" +
  //   "<h3>Toppings</h3>" +
  //   "<ul>" + toppingsHtml + "</ul>" +
  //   "</body></html>"
  // );

  // Starter behavior (so the server runs before you finish)
//   res.send(
//     "<p>Not finished yet. Go to index.js and complete the TODOs.</p><a href='/'>Back</a>",
//   );
// });