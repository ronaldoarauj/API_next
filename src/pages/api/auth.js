const { generateToken } = require('../middleware/jwt');

const dadosUser = {
  id: 1,
  name: 'teste novo',
  email: 'usuario@example.com',
};

const tokens = generateToken(dadosUser);
console.log(tokens);
