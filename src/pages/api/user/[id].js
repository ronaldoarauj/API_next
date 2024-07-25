import { query } from "@/lib/db";

export default async function Produto(req, res) {
  // console.log(request.query.id);

  // Verifica se o token Bearer está presente no cabeçalho da requisição
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized - Bearer token missing' });
    return;
  }

  // Extrai o token Bearer da string
  const token = authorizationHeader.substring(7);

  
  if (token !== process.env.TOKEN_USER) {
    res.status(401).json({ error: 'Unauthorized - Invalid Bearer token' });
    return;
  }

  switch (req.method) {
    case "GET":
      if (req.query.id) {
        // Buscar um produto por ID
        const userId = req.query.id;
        const user = await query({
          query: "SELECT name, email, status, avatar FROM grace_user WHERE id = ?",
          values: [userId],
        });
        if (user.length === 0) {
          res.status(404).json({ error: "User not found" });
        } else {
          const { name, email, status, avatar } = user[0];
          const avatarFinal = avatar ?? ""; 

          // Decode em Base64 duas vezes
          const image = Buffer.from(avatarFinal, 'base64').toString();
          // const prexis = 'data:image/jpeg;base64,';
          // const imagefinal = prexis+image;
          const imagefinal = image;

          res.status(200).json({
            user: {
              name,
              email,
              status,
              imagefinal, // Adicione a string base64 da imagem aqui
            },
          });
        }
      } else {
        // Listar todos os produtos
        const users = await query({
          query: "SELECT * FROM grace_user",
        });
        res.status(200).json({ users });
      }
      break;
  }
}

