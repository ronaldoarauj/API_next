import jwt from 'jsonwebtoken';

function generateToken(dadosUser) {
  // Chave secreta usada para assinar o token
  const chave = 'token';

  // Configuração do token (header e payload)
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const duracao = 60 * 60; // 1 hora em segundos
  const duracaoRefresh = 7 * 24 * 60 * 60; // 7 dias em segundos

  // Tratar caracteres especiais corretamente
  const iss = Buffer.from(dadosUser.email).toString('base64');
  const nome = JSON.stringify(dadosUser.name);

  const payload = {
    iss: iss,
    aud: 'Grace API',
    exp: Math.floor(Date.now() / 1000) + duracao, // Timestamp de expiração
    id: dadosUser.id,
    nome: nome,
  };

  const payloadRefresh = {
    iss: iss,
    aud: 'Grace API',
    exp: Math.floor(Date.now() / 1000) + duracaoRefresh, // Timestamp de expiração
    id: dadosUser.id,
    nome: nome,
  };

  // Gerar tokens e assinaturas
  const token = jwt.sign(payload, chave);
  const refresh_token = jwt.sign(payloadRefresh, chave);

  return {
    access_token: token,
    refresh_token: refresh_token,
    type: 'Bearer',
  };
}

module.exports = { generateToken };
