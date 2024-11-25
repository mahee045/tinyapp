// Find a user by their email
const getUserByEmail = function (email, database) {
  for (const userID in database) {
    if (database[userID].email === email) {
      return database[userID]; // Return the user object if email matches
    }
  }
  return null; // Return null if no user is found
};


///url filtering\
const urlsForUser = (id, urlDatabase) => {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

module.exports = { getUserByEmail, urlsForUser };

