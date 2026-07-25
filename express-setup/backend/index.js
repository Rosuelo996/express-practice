import express from "express"

const app = express()

const PORT = 3000;

app.get("/", (req, res) => {
    console.log("GET / received");
    res.send("<h1>Postman practice</h1>")
})
app.post("/register", (req, res) => {
    res.sendStatus(201)
})
app.put("/user/:username", (req, res) => {
    res.sendStatus(200)
})
app.patch("/user/:username", (req, res) => {
    res.sendStatus(200)
})
app.delete("/user/:username", (req, res) => {
    res.sendStatus(200)
})

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
})



