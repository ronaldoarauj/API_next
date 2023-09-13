// middleware/jwt.js
import jwt from 'jsonwebtoken';

// middleware/jwt.js
const jwt = require('jsonwebtoken');

function validarToken(token) {
  if (!token) {
    const error = new Error('Token not provided');
    error.statusCode = 401;
    throw error;
  }

  token = token.replace('Bearer ', '');

  const chave = 'K9xkrz0w5e1ykju8';

  try {
    const [header, payload, signature] = token.split('.');
    const validarAssinatura = jwt.verify(`${header}.${payload}`, chave);

    if (signature === validarAssinatura) {
      const dadosToken = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));

      if (dadosToken.exp > Math.floor(Date.now() / 1000)) {
        return dadosToken; // Token válido
      } else {
        const error = new Error('Token expired');
        error.statusCode = 401;
        throw error;
      }
    } else {
      const error = new Error('Invalid token signature');
      error.statusCode = 401;
      throw error;
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      error.statusCode = 401;
    }
    throw error;
  }
}

module.exports = { validarToken };
