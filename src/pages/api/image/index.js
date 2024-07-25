import { query } from "@/lib/db";
import jwt from "jsonwebtoken";


// Função para validar o token
const validateToken = (token) => {
    try {

        const secret = process.env.SECRET_API_KEY_JWT;
        const decoded = jwt.verify(token, secret);

        return decoded;
    } catch (error) {
        console.error('Erro ao validar o token:', error.message);
        return null;
    }
};

export default async function handler(req, res) {

    
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        res.status(401).json({ resposta: 'Unauthorized - Bearer token missing' });
        return;
    }

    
    const token = authorizationHeader.substring(7);
    const userData = validateToken(token);

    
    if (!userData) {
        res.status(401).json({ resposta: 'Unauthorized - Token não autorizado' });
        return;
    }

    switch (req.method) {
        case "POST":
            try {
                // Coletar os dados do corpo da requisição
                const data = req.body;
                const image = req.body.image;
                const imageDescription = req.body.descricao;
                const imageGroup = req.body.grupo;
                const imageStatus = req.body.status;
                //const userImage = req.body.image;
                // Fazer um POST para a outra API


                const insertImages = await query({
                    // query: "UPDATE grace_user SET name = ?, avatar = ? WHERE id = ?",
                    // values: [userName, userId+'.jpg', userId],
                    query: "INSERT INTO grace_image (image, descricao, grupo, status) VALUES (?,?,?,?)",
                    values: [image, imageDescription, imageGroup, imageStatus],

                });

                //   console.log('Database update successful.');

                const insertImage = {
                    data,
                };
                //   res.status(200).json({ response: { message: "success", user: updateUser } });


                // Retornar a resposta da outra API
                res.status(200).json({ response: { message: "success", image: insertImage } });
            } catch (error) {
                // Tratar erros
                res.status(500).json({ message: error.message });
            }
            break;

        case "GET":

            try {

                var getImage = await query({
                    query: "SELECT * FROM grace_image  ORDER BY RAND() LIMIT 3",

                });

                if (getImage.length === 0) {
                    res.status(404).json({ response: "User not found" });
                } else {
                    res.status(200).json(getImage);
                }
            } catch (error) {
                // Tratar erros
                res.status(500).json({ message: error.message });
            }

            break;
        default:
            res.status(405).json({ error: "Método ${req.method} não permitido" });
    }
}
