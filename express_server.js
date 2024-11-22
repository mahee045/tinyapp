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

//new route handler 
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//route url show handler
app.get("/u/:id", (req, res) => {
  const id = req.params.id; // Extract the ID from the URL
  const longURL = urlDatabase[id]; // THE LONG url will equal short URL

  if (!longURL) {
    return res.status(404).send("URL not found!");
  }

  res.redirect(longURL); // Redirecting long URL
});
///route to display details for a specfic short url
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (!longURL) {
    return res.status(404).send("URL not found!");
  }

  const templateVars = { id, longURL };
  res.render("urls_show", templateVars);
});

//POST route to create short url
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; 
  const shortURL = generateRandomString(); // Call the function to get a random string
  urlDatabase[shortURL] = longURL; // Store the id-longURL key-value to urlDatabase
  console.log(`Added: ${shortURL} -> ${longURL}`); 
  res.redirect(`/urls/${shortURL}`); // Redirect to the details page for the new short URL
  
});

// POST route to delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id; // 
  delete urlDatabase[id]; // 
  res.redirect("/urls"); // 
});

// POST route to update a long URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  if (!urlDatabase[id]) {
    return res.status(404).send("Short URL not found!");
  }
  urlDatabase[id] = newLongURL;
  console.log(`Updated: ${id} -> ${newLongURL}`);
  res.redirect("/urls");
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