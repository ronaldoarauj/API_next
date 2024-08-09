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

        // Verifica se o token é válido
        if (!userData) {
            res.status(401).json({ resposta: 'Unauthorized - Token não autorizado' });
            return;
        }

        switch (req.method) {
            case "GET":
                if (req.query.id) {
                    // Buscar um produto por ID
                    //const scoreId = req.query.id;
                    const groupId = parseInt(req.query.id, 10); // Converter para número inteiro
                    console.log(groupId);
                    if (groupId != "null" && groupId !== "undefined") {

                        if (groupId == 1) {
                            var score = await query({
                                //query: "SELECT id, name, email, status, score FROM grace_user ORDER BY score DESC",
                                query: "SELECT  * FROM grace_user ORDER BY s_score DESC, id DESC LIMIT 10",
                                //values: [userId],
                            });

                        } else if (groupId == 2){
                            var score = await query({
                                //query: "SELECT id, name, email, status, score FROM grace_user ORDER BY score DESC",
                                query: "SELECT  * FROM grace_user ORDER BY m_score DESC, id DESC LIMIT 10",
                                //values: [userId],
                            });
                        } else {
                            var score = await query({
                                query: "SELECT  * FROM grace_user where s_score > 0 ORDER BY s_score DESC, id DESC LIMIT 10",
                            });
                        }

                    } else {
                        // Listar todos os produtos
                        res.status(404).json({ resposta: "User not found" });
                    }

                    const formattedUsers = score.map((item) => ({
                        id: item.id,
                        name: item.name,
                        email: item.email,
                        status: item.status,
                        quizScore: item.quiz_score,
                        gracaScore: item.graca_score,
                        sScore: item.s_score,
                        mScore: item.m_score,
                        avatar: item.avatar
                    }));

                    //console.log(item.id);
                    if (score.length === 0) {
                        res.status(404).json({ response: "User not found 1" });
                    } else {
                        res.status(200).json(formattedUsers);
                    }
                } else {
                    // Listar todos os produtos
                    res.status(404).json({ response: "User not found" });
                }
                break;

            case "PUT":
                const groupId = parseInt(req.query.id, 10);

                if (groupId) {
                    console.log(groupId);
                    if(groupId == 1){
                        const updateScore = await query({
                            query: "UPDATE grace_user SET s_score = 0",
                            //values: [versionName, versionId],
                        });
                    }else{
                        const updateScore = await query({
                            query: "UPDATE grace_user SET m_score = 0",
                            //values: [versionName, versionId],
                        });                       
                    }

                    // const updateVersion = {
                    //     id: versionId,
                    //     version: versionName,
                    // };
                    res.status(200).json({ response: { message: "success"} });

                }
                break;

            // case "DELETE":
            //   const productIdToDelete = req.body.product_id;
            //   const deleteProducts = await query({
            //     query: "DELETE FROM products WHERE product_id = ?",
            //     values: [productIdToDelete],
            //   });
            //   res.status(200).json({ response: { message: "success", product_id: productIdToDelete } });
            //   break;

            default:
                res.status(405).json({ resposta: "Method not allowed" });
        }
    } catch (error) {
        res.status(500).json({ resposta: error.message });
    }
}
