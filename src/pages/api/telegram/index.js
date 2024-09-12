import { query } from "@/lib/db";
import jwt from "jsonwebtoken";


// Função para validar o token
const validateToken = (token) => {
    try {
        // Verifique o token usando a chave secreta (que deve ser a mesma usada para gerar o token)
        const secret = process.env.TOKEN_USER;
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

    if (token !== process.env.TOKEN_USER) {
        res.status(401).json({ error: 'Unauthorized - Invalid Bearer token' });
        return;
    }

    if (req.method === 'POST') {
        try {
            // Coletar os dados do corpo da requisição
            const data = req.body;
            const text = req.body.text;
            const dataTelegram = {
                "chat_id": process.env.TOKEN_TELEGRAM,
                "text": text,
                "disable_notification": false
            };
            //const userImage = req.body.image;
            // Fazer um POST para a outra API
            const response = await fetch('https://api.telegram.org/bot6422010121:AAF1oGDHROer_1vvTpqyarSB5-POxLBo3tQ/sendMessage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Inclua outros headers se necessário
                },
                body: JSON.stringify(dataTelegram)
            });

            // Verificar a resposta da outra API
            if (!response.ok) {
                const errorText = await response.text(); // obter a mensagem de erro da resposta
                res.status(response.status).json({ message: `Erro na outra API: ${errorText}` });
                return; // garantir que não continuaremos após enviar a resposta
            }

            const result = await response.json();    

            // Retornar a resposta da outra API
            res.status(200).json({ response: { message: "success", result } });
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
