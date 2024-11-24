// Find a user by their email
const getUserByEmail = function (email, database) {
  for (const userID in database) {
    if (database[userID].email === email) {
      return database[userID]; // Return the user object if email matches
    }
  }
  return null; // Return null if no user is found
};

module.exports = { getUserByEmail };