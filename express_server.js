const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080
//setting ejs as engine viewer
app.set("view engine", "ejs") 

///helper function
const { getUserByEmail } = require("./helpers");


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
  const user = users[userID];
  const templateVars = {
    user: user || null,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});
//route url show handler
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
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

///get route for error if short url does not exist
app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  // Iterate through the urlDatabase to find the long URL
  for (const userID in urlDatabase) {
    if (urlDatabase[userID][id]) {
      return res.redirect(urlDatabase[userID][id]);
    }
  }

  // If the short URL ID is not found, return an error
  res.status(404).send(`
    <html>
      <head>
        <title>Short URL Not Found</title>
      </head>
      <body>
        <h1>Error 404: Short URL Not Found</h1>
        <p>The short URL ID you provided does not exist in our database.</p>
        <a href="/urls">Go Back to TinyApp</a>
      </body>
    </html>
  `);
});


//POST route to create short url ONLY FOR LOGGED IN USERS
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res
      .status(403)
      .send(
        "Error: You must be logged in to create short URLs. Please log in first."
      );
  }

  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  // Associate the new URL with the logged-in user
  if (!urlDatabase[userID]) {
    urlDatabase[userID] = {};
  }
  urlDatabase[userID][shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

// POST route to delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

/// GET route to handle login
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect("/urls"); // Redirect logged-in users to /urls
  }
  const user = users[userID]; 
  const templateVars = { user }; 
  res.render("login", templateVars); 
});

// POST route to handle login and set a user cookie
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("Error: Email not found.");
  }

   // Check if the password matches the stored hashed password
   if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Error: Incorrect password.");
  }

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
  if (userID) {
    return res.redirect("/urls"); // Redirect logged-in users to /urls
  }
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
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Error: Email already registered.");
  }

   // Generate a hashed password
   const hashedPassword = bcrypt.hashSync(password, 12); 

  // Generate a new user ID and add user to the database
  const id = generateRandomString();
  users[id] = { id, email, password: hashedPassword };


  // Set user_id cookie and redirect
  req.session.user_id = id;
  res.redirect("/urls");
});


const urlDatabase = {
  userRandomID: {
    b2xVn2: "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
  },
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