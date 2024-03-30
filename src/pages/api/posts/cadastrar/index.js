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





//   if (userData) {
//     console.log('Token válido! Dados do usuário:', userData);
//   } else {
//     console.log('Token inválido ou expirado.');
//   }

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

        // Verifica se o token é válido (neste exemplo, verifica se é 'AlterPass456')
        if (!userData) {
            res.status(401).json({ resposta: 'Unauthorized - Token não autorizado' });
            return;
        }

        switch (req.method) {
            // case "GET":
            //     if (req.query.id) {
            //         // Buscar um produto por ID
            //         const productId = req.query.id;
            //         const product = await query({
            //             query: "SELECT * FROM grace_version WHERE id = ?",
            //             values: [productId],
            //         });
            //         if (product.length === 0) {
            //             res.status(404).json({ error: "Product not found" });
            //         } else {
            //             res.status(200).json({ version: product[0] });
            //         }
            //     } else {
            //         // Listar todos os produtos
            //         const version = await query({
            //             query: "SELECT * FROM grace_version",
            //         });
            //         res.status(200).json({ version });
            //     }
            //     break;

            case "POST":
              const post = req.body.post;
              const postUser = req.body.user;
              const postDate = req.body.data;

              const getRegistroByDate = await query({
                query: "SELECT * FROM grace_post WHERE id_user = ? and data = ?",
                values: [postUser,postDate],
            });
            if (getRegistroByDate.length > 2) {
                res.status(203).json({resposta:"Já foi cadatrado mensagem nessa data!"});
                return;
            }
              const addProducts = await query({
                query: "INSERT INTO grace_post (post, id_user, data) VALUES (?,?,?)",
                values: [post,postUser,postDate],
              });
              const product = {
                post_id: addProducts.insertId,
                //product_name: post,
              };
              res.status(200).json({id_inserido: addProducts.insertId,  });
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
