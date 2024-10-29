import jwt from "jsonwebtoken";

// const validateToken = (token) => {
//     try {
//         const secret = process.env.TOKEN_USER_BIBLE;
//         const decoded = jwt.verify(token, secret);

//     } catch (error) {
//         console.error('Erro ao validar o token:', error.message);
//         return null;
//     }
// }

export default async function handler(req, res) {

        // Verifica se o token Bearer está presente no cabeçalho da requisição
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized - Bearer token missing' });
            return;
        }

        // Extrai o token Bearer da string
        const token = authorizationHeader.substring(7);

        if (token !== process.env.TOKEN_USER_BIBLE) {
            res.status(401).json({ error: `Unauthorized - Invalid Bearer token ${token}` });
            return;
        }

    if (req.method === 'GET') {
        const { version, abbrev, chapter } = req.query;

        if (!version || !abbrev || !chapter) {
            res.status(400).json({ message: "Parâmetros 'version', 'abbrev' e 'chapter' são obrigatórios" });
            return;
        }

        try {
            const response = await fetch(`https://www.abibliadigital.com.br/api/verses/${version}/${abbrev}/${chapter}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer${token}`, 
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Erro na outra API: ${errorText}`);
                res.status(response.status).json({ message: `Erro na outra API: ${errorText}` });
                return;
            }

            const apiData = await response.json();
            res.status(200).json(apiData);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Método ${req.method} não permitido`);
    }
}
