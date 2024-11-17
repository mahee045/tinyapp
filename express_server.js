const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//setting ejs as engine viewer
app.set("view engine", "ejs") 

//new route handler 
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//route url show handler
app.get("/urls/:id", (req, res) => {
  const id = req.params.id; // Extract the ID from the URL
  const longURL = urlDatabase[id]; // Use the ID to fetch the long URL from the database

  if (!longURL) {
    return res.status(404).send("URL not found!");
  }

  const templateVars = { id, longURL }; 
  res.render("urls_show", templateVars); 
});

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});