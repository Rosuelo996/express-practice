# Taco Town (Starter - HTML + Express + ES Modules)

## Setup
1) Install:
   npm install

2) Run:
   npm run dev

3) Open:
   http://localhost:3000

## What you have
- `recipe.json` (pretty formatted)
- `index.js` contains the same data as one long JSON string (flat pack)
- `views/index.html` has the buttons (POST /recipe)

## Your job (in index.js)
Inside `POST /recipe`:
1) Read the user's choice from `req.body.choice`
2) `JSON.parse()` the flat-pack string
3) Select the correct recipe from `data.recipes`
4) Build a simple HTML response that shows:
   - recipe name
   - protein name + preparation (nested)
   - toppings list (loop with `forEach`)
If no recipe found, show: "Please pick Chicken, Beef, or Fish."
