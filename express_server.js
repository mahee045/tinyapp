const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//setting ejs as engine viewer
app.set("view engine", "ejs") 

  ///Random String Generator for shorter URL
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}
///url encoded
app.use(express.urlencoded({ extended: true }));

///route definition 
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

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

//defining log request body with dummy response
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; 
  const shortURL = generateRandomString(); // Call the function to get a random string
  urlDatabase[shortURL] = longURL; // Store the mapping in the database
  console.log(`Added: ${shortURL} -> ${longURL}`); 

  res.send("Ok"); // Respond with 'Ok' (we will replace this)
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

//