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

            case "POST":
                const userName = req.body.name;
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
                
                if (getRegistroByUser.length > 1) {
                    res.status(203).json({ resposta: "Erro ao cadastrar cadastro existente!" });
                    return;
                }
                const addUsers = await query({
                    query: "INSERT INTO grace_user (name, email, password) VALUES (?,?,?)",
                    values: [userName, userEmail, criptografada],
                });
                const product = {
                    user_id: addUsers.insertId,
                    //product_name: post,
                };
                res.status(200).json({ id_inserido: addUsers.insertId, });
                break;

            case "PUT":
                const versionId = req.body.id;
                const versionName = req.body.version;

                if (versionId) {
                    // Buscar um produto por ID
                    const product = await query({
                        query: "SELECT * FROM grace_version WHERE id = ?",
                        values: [versionId],
                    });
                    if (product.length === 0) {
                        res.status(404).json({ error: "version not found" });
                    } else {

                        const updateVersions = await query({
                            query: "UPDATE grace_version SET version = ? WHERE id = ?",
                            values: [versionName, versionId],
                        });
                        const updateVersion = {
                            id: versionId,
                            version: versionName,
                        };
                        res.status(200).json({ response: { message: "success", version: updateVersion } });
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
