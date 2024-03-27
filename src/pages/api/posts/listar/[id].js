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

const validarData = (date, qt) => {

    var currentDate = date;
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = month.toString().padStart(2, '0');

    if(qt == 2){
        var formattedDate = `${day}/${month}`;
    }else{
        var formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
    }
    
    return formattedDate;

}

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
            case "GET":
                if (req.query.id) {


                    //console.log(formattedDate);
                    const formattedDate = new Date();
                    // Buscar um produto por ID
                    const postId = req.query.id;
                    if (validarData(formattedDate, 2) != '23/11'){
                        var post = await query({
                            query: "SELECT * FROM grace_post WHERE id_user = ? ORDER BY 1 DESC LIMIT 5",
                            values: [postId],
                        });
                    }else{
                        var post = await query({
                            query: "SELECT * FROM grace_post WHERE id_user = ? ORDER BY 1 DESC",
                            values: [postId],
                        });                      
                    }


                    const formattedPosts = post.map((item) => ({
                        id: item.id,
                        id_user: item.id_user,
                        post: item.post,
                        data: validarData(item.data, 3)
                    }));
                    if (post.length === 0) {
                        res.status(404).json({ response: "User not found" });
                    } else {
                        res.status(200).json(formattedPosts);
                    }
                } else {
                    // Listar todos os produtos
                    res.status(404).json({ response: "User not found" });
                }
                break;

            // case "PUT":
            //     const versionId = req.body.id;
            //     const versionName = req.body.version;

            //     if (versionId) {
            //         // Buscar um produto por ID
            //         const product = await query({
            //             query: "SELECT * FROM grace_version WHERE id = ?",
            //             values: [versionId],
            //         });
            //         if (product.length === 0) {
            //             res.status(404).json({ error: "version not found" });
            //         } else {

            //             const updateVersions = await query({
            //                 query: "UPDATE grace_version SET version = ? WHERE id = ?",
            //                 values: [versionName, versionId],
            //             });
            //             const updateVersion = {
            //                 id: versionId,
            //                 version: versionName,
            //             };
            //             res.status(200).json({ response: { message: "success", version: updateVersion } });
            //         }
            //     }
            //     break;

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
