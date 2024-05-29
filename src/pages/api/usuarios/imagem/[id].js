import { query } from "@/lib/db";
import jwt from "jsonwebtoken";


// Função para validar o token
const validateToken = (token) => {
    try {
        // Verifique o token usando a chave secreta (que deve ser a mesma usada para gerar o token)
        const secret = process.env.SECRET_API_KEY_JWT;
        const decoded = jwt.verify(token, secret);

        // Se a verificação for bem-sucedida, o 'decoded' conterá os dados do usuário
        return decoded;
    } catch (error) {
        // Se houver um erro (por exemplo, token inválido ou expirado), trate-o aqui
        console.error('Erro ao validar o token:', error.message);
        return null;
    }
};

export default async function handler(req, res) {

    // Verifica se o token Bearer está presente no cabeçalho da requisição
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        res.status(401).json({ resposta: 'Unauthorized - Bearer token missing' });
        return;
    }

    // Extrai o token Bearer da string
    const token = authorizationHeader.substring(7);
    const userData = validateToken(token);

    // Verifica se o token é válido (neste exemplo, verifica se é 'AlterPass456')
    if (!userData) {
        res.status(401).json({ resposta: 'Unauthorized - Token não autorizado' });
        return;
    }

    if (req.method === 'PUT') {
        try {
            // Coletar os dados do corpo da requisição
            const data = req.body;
            const userId = req.body.id;
            const userName = req.body.name;
            //const userImage = req.body.image;
            // Fazer um POST para a outra API
            const response = await fetch('http://sinforme.com.br/testeupload.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Inclua outros headers se necessário
                },
                body: JSON.stringify(data)
            });

            // Verificar a resposta da outra API
            if (!response.ok) {
                const errorText = await response.text(); // obter a mensagem de erro da resposta
                res.status(response.status).json({ message: `Erro na outra API: ${errorText}` });
                return; // garantir que não continuaremos após enviar a resposta
            }

            const result = await response.json();

            const updateUsers = await query({
                query: "UPDATE grace_user SET name = ?, avatar = ? WHERE id = ?",
                values: [userName, userId+'.jpg', userId],
              });
      
            //   console.log('Database update successful.');
      
              const updateUser = {
                id: userId,
                name: userName,
              };
            //   res.status(200).json({ response: { message: "success", user: updateUser } });
             

            // Retornar a resposta da outra API
            res.status(200).json({ response: { message: "success", user: updateUser } });
        } catch (error) {
            // Tratar erros
            res.status(500).json({ message: error.message });
        }
    } else {
        // Método não permitido
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Método ${req.method} não permitido`);
    }
}
