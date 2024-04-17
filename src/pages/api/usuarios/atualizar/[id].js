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
    try {
        // Configurar o cabeçalho de Cache-Control
        res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

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

        switch (req.method) {

            case "PUT":
                const userId = req.body.id;
                const userName = req.body.name;
                const userEmail = req.body.email;
                const userStatus = req.body.status;
                const userScore = req.body.score;

                if (userId) {
                    // Buscar um produto por ID
                    const user = await query({
                        query: "SELECT id FROM grace_user WHERE id = ?",
                        values: [userId],
                    });
                    //console.log(user.length);
                    if (user.length === 0) {
                        res.status(404).json({ error: "user not found" });
                    } else {

                        const updateUser = await query({
                            query: "UPDATE grace_user SET name = ?, email = ?, status = ?, score = ? WHERE id = ?",
                            values: [userName, userEmail, userStatus, userScore, userId],
                        });
                        console.log(updateUser);
                        const resUser = {
                            id: userId,
                            name: userName,
                        };
                        res.status(200).json({ response: { message: "success", version: resUser } });
                    }
                }
                break;

            default:
                res.status(405).json({ resposta: "Method not allowed" });
        }
    } catch (error) {
        res.status(500).json({ resposta: error.message });
    }
}
