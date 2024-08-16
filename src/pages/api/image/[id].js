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


    switch (req.method) {
        case "PUT":

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

            try {
                // Coletar os dados do corpo da requisição
                const id = req.query.id;
                const data = req.body;
                const score = req.body.score;
                //const userImage = req.body.image;
                // Fazer um POST para a outra API


                const insertImages = await query({
                    // query: "UPDATE grace_user SET name = ?, avatar = ? WHERE id = ?",
                    // values: [userName, userId+'.jpg', userId],
                    query: "UPDATE grace_image set score = ? WHERE id = ?",
                    values: [score, id],

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
                const groupId = parseInt(req.query.id, 10); // Converter para número inteiro
                let group;

                switch (groupId) {
                    case 1:
                        group = "biblia";
                        break;
                    case 2:
                        group = "saudações";
                        break;
                    case 3:
                        group = "semana";
                        break;
                    case 4:
                        group = "motivação";
                        break;
                    case 5:
                        group = "outros";
                        break;
                    case 6:
                        group = "top 10";
                        break;
                    case 7:
                        group = "aleatorio";
                        break;
                    default:
                        group = null;
                        break;
                }

                console.log(groupId);
                console.log(group);

                let getImage;
                if (group === "aleatorio") {
                    getImage = await query({
                        query: "SELECT * FROM grace_image ORDER BY RAND() LIMIT 30",
                    });
                } else if (group === "top 10") {
                    getImage = await query({
                        query: "SELECT * FROM grace_image ORDER BY score DESC LIMIT 10",
                    });
                } else if (group === "semana") {
                    const diasDaSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
                    const hoje = new Date();
                    const diaDaSemana = diasDaSemana[hoje.getDay()];
                    getImage = await query({
                        query: "SELECT * FROM grace_image where grupo = ? and descricao LIKE ? ORDER BY RAND() DESC LIMIT 20",
                        values: [group, `%${diaDaSemana}%`],
                    });
                } else if (group) {
                    getImage = await query({
                        query: "SELECT * FROM grace_image where grupo = ? ORDER BY id DESC LIMIT 12",
                        values: [group],
                    });
                } else {
                    // Tratamento para caso group seja null
                    res.status(400).json({ response: "Invalid group ID" });
                    return;
                }

                if (getImage.length === 0) {
                    res.status(404).json({ response: "Images not found" });
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
