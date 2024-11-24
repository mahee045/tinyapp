const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//setting ejs as engine viewer
app.set("view engine", "ejs") 

const cookieParser = require("cookie-parser"); // Import the cookie-parser middleware
app.use(cookieParser()); // Use the middleware to parse cookies

///object stores and access the users in the app
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Find a user by their email
function findUserByEmail(email) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null; // Return null if no user is found
}

  ///Random String Generator for shorter URL
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}
///url encoded
app.use(express.urlencoded({ extended: true }));

///route definition 
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

//new route handler and username
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});
//route url show handler
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (!longURL) {
    return res.status(404).send("URL not found!");
  }

  const templateVars = {
    user,
    id,
    longURL,
  };
  res.render("urls_show", templateVars);
});

//POST route to create short url
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// POST route to delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// POST route to update a long URL
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (!longURL) {
    return res.status(404).send("URL not found!");
  }

  const templateVars = {
    user,
    id,
    longURL,
  };
  res.render("urls_show", templateVars);
});

/// GET route to handle login
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"]; 
  const user = users[userID]; 
  const templateVars = { user }; 
  res.render("login", templateVars); 
});

// POST route to handle login and set a username cookie
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  if (!user) {
    return res.status(403).send("Error: Email not found.");
  }

  if (user.password !== password) {
    return res.status(403).send("Error: Incorrect password.");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

/// POST route logout 
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Registration page
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = { user };
  res.render("register", templateVars);
});

///POST route register user
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).send("Error: Email and password cannot be empty.");
  }

  // Check for duplicate email
  if (findUserByEmail(email)) {
    return res.status(400).send("Error: Email already registered.");
  }

  // Generate a new user ID and add user to the database
  const id = generateRandomString();
  users[id] = { id, email, password };

   // Log the updated users object for debugging
   console.log("Updated users object:", users);

  // Set user_id cookie and redirect
  res.cookie("user_id", id);
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