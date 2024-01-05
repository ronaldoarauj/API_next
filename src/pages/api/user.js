import { query } from "@/lib/db";

export default async function handler(req, res) {
  try {
    // Configurar o cabeçalho de Cache-Control
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

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
        const userId = req.body.id;
        const userName = req.body.name;
        const userImage = req.body.image;
        //LOG
        console.log('Received PUT request. User ID:', userId, 'Name:', userName);

        //const imageBase64 = Buffer.from(userImage, 'binary').toString('base64');

        // // Logs adicionais para depurar
        // console.log('Received PUT request. User ID:', userId, 'Name:', userName);
        // console.log('Received image:', userImage);

        // // Verifica se userImage já está em Base64 ou se precisa ser convertido
        // const isBase64 = /^data:image\/\w+;base64,/.test(userImage);
        // console.log('Is image already in Base64?');

        // let imageBase64;
        // if (isBase64) {
        //   imageBase64 = userImage; // Se já está em Base64, não precisa converter novamente
        // } else {
        //   // Se não estiver em Base64, converte
        //   imageBase64 = Buffer.from(userImage, 'binary').toString('base64');
        //   console.log('Converted image to Base64:', imageBase64);
        // }

        const updateUsers = await query({
          query: "UPDATE grace_user SET name = ?, avatar = ? WHERE id = ?",
          values: [userName, userImage, userId],
        });

        console.log('Database update successful.');

        const updateUser = {
          id: userId,
          name: userName,
        };
        res.status(200).json({ response: { message: "success", user: updateUser } });
        break;

      case "DELETE":
        const productIdToDelete = req.body.product_id;
        const deleteProducts = await query({
          query: "DELETE FROM products WHERE product_id = ?",
          values: [productIdToDelete],
        });
        res.status(200).json({ response: { message: "success", product_id: productIdToDelete } });
        break;

      default:
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
