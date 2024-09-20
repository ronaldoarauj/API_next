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
                const userQuizScore = req.body.quizScore || null; // Set to null if not provided
                const userGracaScore = req.body.gracaScore || null;
                const userSScore = req.body.sScore || null;
                const userMScore = req.body.mScore || null;
                const userGameScore = req.body.gameScore || null;

                if (userId) {
                    // Buscar por ID
                    const user = await query({
                        query: "SELECT id FROM grace_user WHERE id = ?",
                        values: [userId],
                    });
                    //console.log(user.length);
                    if (user.length === 0) {
                        res.status(404).json({ error: "user not found" });
                    } else {

                        // Construct update query with optional fields
                        let updateQuery = "UPDATE grace_user SET ";
                        let values = [];

                        if (userName) {
                            updateQuery += "name = ?, ";
                            values.push(userName);
                        }
                        if (userEmail) {
                            updateQuery += "email = ?, ";
                            values.push(userEmail);
                        }
                        if (userQuizScore) {
                            updateQuery += "quiz_score = ?, ";
                            values.push(userQuizScore);
                        }
                        if (userGracaScore) {
                            updateQuery += "graca_score = ?, ";
                            values.push(userGracaScore);
                        }
                        if (userSScore) {
                            updateQuery += "s_score = ?, ";
                            values.push(userSScore);
                        }
                        if (userMScore) {
                            updateQuery += "m_score = ?, ";
                            values.push(userMScore);
                        }
                        if (userGameScore) {
                            updateQuery += "game_score = ?, ";
                            values.push(userGameScore);
                        }
                        if (userStatus) {
                            updateQuery += "status = ? ";
                            values.push(userStatus);
                        }
                        // updateQuery += "quiz_score = ?, graca_score = ? "; // Always include these fields
                        // values.push(userQuizScore, userGracaScore);
                        updateQuery += "WHERE id = ?";
                        values.push(userId);

                        //console.log(updateQuery);

                        // const updateUser = await query({
                        //     query: "UPDATE grace_user SET name = ?, email = ?, status = ?, quiz_score = ?, graca_score = ? WHERE id = ?",
                        //     values: [userName, userEmail, userStatus, userQuizScore, userGracaScore, userId],
                        // });

                        const updateUser = await query({
                            query: updateQuery,
                            values: values,
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
