const bcrypt = require('bcrypt');

const users = [
  { id: 'joel', email: 'joel@joel.joel', passwordHash: bcrypt.hashSync('joel', 10) },
  { id: 'sam', email: 'sam@sam.sam', passwordHash: bcrypt.hashSync('sam', 10) },
{ id: 'morgan', email: 'morgan@morgan.morgan', passwordHash: bcrypt.hashSync('morgan', 10) }];

async function getUserById(id) {
  return users.find(user => user.id === id);
}
async function getUserByEmail(email) {
  const lowerEmail = email.toLowerCase();
  return users.find(user => user.email.toLowerCase() === lowerEmail);
}
async function authenticateUser(email, password) {
  const foundUser = await getUserByEmail(email);
  if (foundUser && (await bcrypt.compare(password, foundUser.passwordHash))) {
    return foundUser;
  }
  return undefined;
}

module.exports = {
  getUserById,
  authenticateUser,
};
