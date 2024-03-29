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

        switch (req.method) {

            case "PUT":
                var refreshToken = req.body.refresh_token;
                const refreshTokenData = validateToken(refreshToken);

                if (!refreshTokenData) {
                    res.status(401).json({ resposta: 'Unauthorized - Token não autorizado' });
                    return;
                } else if (refreshTokenData) {

                    // // Divida o JWT em partes
                    // let tokenArray = refreshToken.split('.');

                    // if (tokenArray.length !== 3) {
                    //     throw new Error('Token JWT inválido');
                    // }

                    // Extraia os dados do payload
                    const id = refreshTokenData.id;
                    const nome = refreshTokenData.nome;
                    const email = refreshTokenData.iss;

                    // // Verifique a data de vencimento do token
                    // if (refreshTokenData.exp < Math.floor(Date.now() / 1000)) {
                    //     throw new Error('Token JWT expirado');
                    // }


                    const payload = {
                        iss: email,
                        aud: 'Grace API',
                        id: id,
                        nome: nome
                    };
                    const secret = process.env.SECRET_API_KEY_JWT;
                    
                    const token = jwt.sign(payload, secret, {
                        expiresIn: "1h", noTimestamp: true
                    });


                    const refreshToken = jwt.sign(payload, secret, {
                        expiresIn: "30d", noTimestamp: true
                    });
                    //console.log(token);
                    // const updateVersion = {
                    //   token: token,
                    //   version: 'versionName',
                    // };
                    res.status(200).json({ access_token: token, refresh_token: refreshToken, type: 'Bearer' });

                }
                break;

            default:
                res.status(405).json({ error: "Method not allowed" });
        }

    } catch (error) {

    }
}