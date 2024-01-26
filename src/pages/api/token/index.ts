import { NextApiRequest, NextApiResponse } from "next";

export default async function token(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método não permitido
  }

  const { username, password } = req.body;

  // Aqui você deve realizar a lógica de autenticação, verificar o usuário e senha
  // Este é um exemplo simples, substitua com a lógica real do seu aplicativo
  if (username === "seu_usuario" && password === "sua_senha") {
    // Se as credenciais são válidas, vamos gerar um token JWT
    const token = 'Teste'

    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }
}
