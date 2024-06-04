import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    try {

        // Configurar o cabeçalho de Cache-Control
        res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

        // Verifica se o token Bearer está presente no cabeçalho da requisição
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized - Bearer token missing' });
            return;
        }

        // Extrai o token Bearer da string
        const token = authorizationHeader.substring(7);


        // Verifica se o token é válido
        if (token !== process.env.TOKEN_USER) {
            res.status(401).json({ error: 'Unauthorized - Invalid Bearer token' });
            return;
        }

        switch (req.method) {

            case "PUT":
                const userEmail = req.body.email;
                const userPassword = req.body.password;


                const generateToken = async (user, password) => {
                    const payload = {
                        iss: "grace",
                        aud: user
                    };

                    //const token = jwt.sign(payload, password);
                    const options = {
                        algorithm: "HS256",
                        noTimestamp: true,
                    };

                    
                    var token = jwt.sign(payload, password, options);
                    //console.log(token)
                    return token;
                };

                const criptografada = await generateToken(userEmail, userPassword);

                const getRegistroByUser = await query({
                    query: "SELECT * FROM grace_user WHERE email = ? ",
                    values: [userEmail],
                });

                //console.log(userEmail);
                
                if (getRegistroByUser.length != 1) {
                    res.status(203).json({ resposta: "Erro cadastro não existente!" });
                    return;
                }
                const addUsers = await query({
                    query: "UPDATE grace_user SET email = ?, password = ? WHERE email = ? ",
                    values: [userEmail, criptografada, userEmail],
                });
                // const product = {
                //     user_id: addUsers.userEmail,
                //     //product_name: post,
                // };
                res.status(200).json({ email_atualizado: userEmail, });
                break;

            default:
                res.status(405).json({ resposta: "Method not allowed" });
        }
    } catch (error) {
        res.status(500).json({ resposta: error.message });
    }
}
