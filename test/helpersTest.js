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
