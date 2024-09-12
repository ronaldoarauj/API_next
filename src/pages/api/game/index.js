import { query } from "@/lib/db";
import jwt from "jsonwebtoken";



// Função para validar o token
const validateToken = (token) => {
    try {

        const secret = process.env.TOKEN_USER;
        const decoded = jwt.verify(token, secret);

        return decoded;
    } catch (error) {
        console.error('Erro ao validar o token:', error.message);
        return null;
    }
};

export default async function handler(req, res) {
    try {
        // Configurar o cabeçalho de Cache-Control
        res.charset = 'utf-8',
            res.setHeader('Content-Type', 'charset=utf-8', 'Cache-Control', 's-maxage=10, stale-while-revalidate');

        // Verifica se o token Bearer está presente no cabeçalho da requisição
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            res.status(401).json({ resposta: 'Unauthorized - Bearer token missing' });
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

                var game = await query({
                    query: "SELECT * FROM grace_game ORDER BY RAND() LIMIT 1",

                });

                const formattedGame = game.map((item) => ({
                    id: item.id,
                    texto: item.texto,
                }));
                if (game.length === 0) {
                    res.status(404).json({ response: "User not found" });
                } else {
                    res.status(200).json(formattedGame);
                }

                break;

            default:
                res.status(405).json({ resposta: "Method not allowed" });
        }
    } catch (error) {
        res.status(500).json({ resposta: error.message });
    }
}
