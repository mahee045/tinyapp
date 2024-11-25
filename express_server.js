const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080
//setting ejs as engine viewer
app.set("view engine", "ejs") 

///helper function
const { getUserByEmail } = require("./helpers");
const { urlsForUser } = require("./helpers");

// cookie session
const cookieSession = require("cookie-session");


app.use(
  cookieSession({
    name: "session",
    keys: ["your-secure-key1", "your-secure-key2"], // Use secure, random keys
    maxAge: 24 * 60 * 60 * 1000, // Optional: Session expires after 24 hours
  })
);

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

  ///Random String Generator for shorter URL
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}
///url encoded
app.use(express.urlencoded({ extended: true }));

///route definition 
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login"); // Redirect non-logged-in users to login
  }
  const user = users[userID];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

//new route handler and user
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    return res.status(401).send("Please log in or register to view URLs.");
  }

  const user = users[userID];
  const userURLs = urlsForUser(userID, urlDatabase);

  const templateVars = {
    user,
    urls: userURLs,
  };

  res.render("urls_index", templateVars);
});

//database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user1" },
  c2xBmQ: { longURL: "https://www.example.com", userID: "user1" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2" },
};

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    return res.status(401).send("Error: You must log in to view this page.");
  }

  const url = urlDatabase[req.params.id];

  if (!url) {
    return res.status(404).send("Error: URL not found.");
  }

  if (url.userID !== userID) {
    return res
      .status(403)
      .send("Error: You do not have permission to view this URL.");
  }

  const user = users[userID];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: url.longURL,
  };

  res.render("urls_show", templateVars);
});

//route url show handler
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;

  if (!urlDatabase[id]) {
    return res.status(404).send("Error: URL not found.");
  }

  if (!userID) {
    return res.status(403).send("Error: You must log in to edit this URL.");
  }

  if (urlDatabase[id].userID !== userID) {
    return res
      .status(403)
      .send("Error: You do not have permission to edit this URL.");
  }

  urlDatabase[id].longURL = req.body.longURL;
  res.redirect("/urls");
});

//viewing permission, and ownership
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;

  if (!userID) {
    return res.status(403).send("Error: You must log in to delete this URL.");
  }

  if (!urlDatabase[id]) {
    return res.status(404).send("Error: URL not found.");
  }

  if (urlDatabase[id].userID !== userID) {
    return res.status(403).send("Error: You do not have permission to delete this URL.");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});



///get route for error if short url does not exist
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];

  if (!url) {
    return res.status(404).send("Error: Short URL not found.");
  }

  res.redirect(url.longURL);
});

//POST route to create short url ONLY FOR LOGGED IN USERS
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    return res.status(403).send("Error: You must be logged in to create short URLs.");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  // Save the new URL with associated userID
  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls/${shortURL}`);
});



/// GET route to handle login
app.get("/login", (req, res) => {
  const userID = req.session.user_id;

  // Redirect to /urls if user is already logged in
  if (userID) {
    return res.redirect("/urls");
  }

  const templateVars = { user: null }; // Pass null if no user is logged in
  res.render("login", templateVars);
});

// POST route to handle login and set a user cookie
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = getUserByEmail(email, users);

  // Handle invalid email
  if (!user) {
    return res.status(403).send("Error: Email not found.");
  }

  // Handle invalid password
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Error: Incorrect password.");
  }

  // Set session and redirect
  req.session.user_id = user.id;
  res.redirect("/urls");
});


/// POST route logout 
app.post("/logout", (req, res) => {
  req.session = null; 
  res.redirect("/login");
});

// Registration page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;

  // Redirect to /urls if user is already logged in
  if (userID) {
    return res.redirect("/urls");
  }

  const templateVars = { user: null }; // Pass null if no user is logged in
  res.render("register", templateVars);
});

///POST route register user
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).send("Error: Email and password cannot be empty.");
  }

  // Check if email is already registered
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Error: Email already registered.");
  }

  // Hash password and add user
  const hashedPassword = bcrypt.hashSync(password, 12);
  const id = generateRandomString();
  users[id] = { id, email, password: hashedPassword };

  // Set user_id session and redirect to /urls
  req.session.user_id = id;
  res.redirect("/urls");
});

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