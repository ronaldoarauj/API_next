import { query } from "../../lib/db2";

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

        // Verifica se o token é válido (neste exemplo, verifica se é 'AlterPass456')
        if (token !== process.env.TOKEN_USER) {
            res.status(401).json({ error: 'Unauthorized - Invalid Bearer token' });
            return;
        }

        switch (req.method) {
            case "GET":
                if (req.query.id) {
                    // Buscar um produto por ID
                    const userId = req.query.id;
                    const user = await query({
                        query: "SELECT * FROM grace_user WHERE id = ?",
                        values: [userId],
                    });
                    if (user.length === 0) {
                        res.status(404).json({ error: "Product not found" });
                    } else {
                        res.status(200).json({ user: user[0] });
                    }
                } else {
                    // Listar todos os produtos
                    const users = await query({
                        query: "SELECT id, name, email, status, avatar FROM grace_user",
                    });
                    // Converte os avatares de buffer para base64
                    const usersWithBase64Avatar = users.map(user => {
                        if (Buffer.isBuffer(user.avatar)) {
                            return {
                                ...user,
                                avatar: Buffer.from(user.avatar, 'base64').toString(),
                            };
                        }
                        return user;
                    });

                    res.status(200).json({ users: usersWithBase64Avatar });
                }
                break;

            case "POST":
                const postUserName = req.body.product_name;
                const addProducts = await query({
                    query: "INSERT INTO products (product_name) VALUES (?)",
                    values: [postUserName],
                });
                const product = {
                    product_id: addProducts.insertId,
                    product_name: productName,
                };
                res.status(200).json({ response: { message: "success", product } });
                break;

            case "PUT":

                const dataAtual = new Date();

                const dia = dataAtual.getDate();
                const mes = dataAtual.getMonth() + 1; // Janeiro é 0
                const ano = dataAtual.getFullYear();
                const dataFormatada = `${ano}/${mes}/${dia}`
                //   console.log(`Data atual: ${ano}/${mes}/${dia}`);
                //   console.log(`Data formatada: ${dataFormatada}`);

                const postId = req.body.id;
                const postDescricao = req.body.descricao;
                const postDescricaoHtml = '<p>A&ccedil;&otilde;es que estamos comprando para Hoje:</p><p>' + postDescricao + '</p><p>&nbsp;</p><p>DISCLAIMER. O conte&uacute;do apresentado nesta pagina n&atilde;o trata de recomenda&ccedil;&atilde;o, indica&ccedil;&atilde;o e/ou aconselhamento de investimento, sendo &uacute;nica e exclusiva responsabilidade do investidor a tomada de decis&atilde;o. O objetivo desta pagina &eacute; compartilhar informa&ccedil;&otilde;es sobre nosso projeto, que n&atilde;o deve ser replicado sem orienta&ccedil;&atilde;o profissional, pois, existe risco de perda de capital.</p><p>&nbsp;</p>'
                //LOG
                // console.log('Received PUT request. User ID:', postId, 'postDescricao:', postDescricao);


                const updatePosts = await query({
                    query: "UPDATE post SET descricao = ?, data = ? WHERE id_post = ?",
                    values: [postDescricao, dataFormatada, postId],
                });

                // console.log('Database update successful.');

                const updatePost = {
                    id: postId,
                    postDescricao: postDescricao,
                    data: dataFormatada,
                };
                res.status(200).json({ response: { message: "success", post: updatePost } });
                break;

            default:
                res.status(405).json({ error: "Method not allowed" });

            //   case "DELETE":
            //     const productIdToDelete = req.body.product_id;
            //     const deleteProducts = await query({
            //       query: "DELETE FROM products WHERE product_id = ?",
            //       values: [productIdToDelete],
            //     });
            //     res.status(200).json({ response: { message: "success", product_id: productIdToDelete } });
            //     break;

            //   default:
            //     res.status(405).json({ error: "Method not allowed" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
