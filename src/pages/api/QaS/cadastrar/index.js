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
        const userData = validateToken(token);

        
        if (!userData) {
            res.status(401).json({ resposta: 'Unauthorized - Token não autorizado' });
            return;
        }

        switch (req.method) {

            case "POST":
                const userName = req.body.question;
                const userEmail = req.body.options;
                const userPassword = req.body.correctAnswer;

                var qA = await query({
                    query: "SELECT * FROM grace_qa  ORDER BY RAND() LIMIT 3",

                });


                var utf8 = require('utf8');
                const formattedQA = qA.map((item) => ({
                    id: item.id,
                    perguntas: utf8.decode(item.perguntas),
                    respostas: utf8.decode(item.respostas),
                    resposta_correta: utf8.decode(item.resposta_correta),
                }));
                if (qA.length === 0) {
                    res.status(404).json({ response: "User not found" });
                } else {
                    res.status(200).json(formattedQA);
                }

                break;

            default:
                res.status(405).json({ resposta: "Method not allowed" });
        }
    } catch (error) {
        res.status(500).json({ resposta: error.message });
    }
}
