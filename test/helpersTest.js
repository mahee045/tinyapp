const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');


const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// Test Attempts 
// Valid Email Test 
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID, `Expected user ID ${expectedUserID}, but got ${user.id}`);
  });
});

// Non-existent email from database 
  it('should return null if the email does not exist in the database', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isNull(user, "Expected null for a non-existent email");
  });


  ///URL Test cases

const { urlsForUser } = require("../helpers.js");


describe("urlsForUser", () => {
  const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user1" },
    c2xBmQ: { longURL: "https://www.example.com", userID: "user1" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "user2" },
  };

  it("should return URLs that belong to the specified user", () => {
    const expectedOutput = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user1" },
      c2xBmQ: { longURL: "https://www.example.com", userID: "user1" },
    };
    const result = urlsForUser("user1", urlDatabase);
    assert.deepEqual(result, expectedOutput);
  });

  it("should return an empty object if the user has no URLs", () => {
    const result = urlsForUser("user3", urlDatabase);
    assert.deepEqual(result, {});
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const emptyDatabase = {};
    const result = urlsForUser('user1', emptyDatabase);
    assert.deepEqual(result, {}); // Expecting an empty object
  });

  it("should not return URLs that do not belong to the specified user", () => {
    const expectedOutput = { i3BoGr: { longURL: "https://www.google.ca", userID: "user2" } };
    const result = urlsForUser("user2", urlDatabase);
    assert.deepEqual(result, expectedOutput);
  });
});