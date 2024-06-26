import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  try {
    // Configurar o cabeçalho de Cache-Control
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

    switch (req.method) {
      //   case "POST":
      //     if (req.query.id) {
      //       // Buscar um produto por ID
      //       const productId = req.query.id;
      //       const product = await query({
      //         query: "SELECT * FROM grace_version WHERE id = ?",
      //         values: [productId],
      //       });
      //       if (product.length === 0) {
      //         res.status(404).json({ error: "Product not found" });
      //       } else {
      //         res.status(200).json({ version: product[0] });
      //       }
      //     } else {
      //       // Listar todos os produtos
      //       const version = await query({
      //         query: "SELECT * FROM grace_version",
      //       });
      //       res.status(200).json({ version });
      //     }
      //     break;

      // case "POST":
      //   const postUserName = req.body.product_name;
      //   const addProducts = await query({
      //     query: "INSERT INTO products (product_name) VALUES (?)",
      //     values: [postUserName],
      //   });
      //   const product = {
      //     product_id: addProducts.insertId,
      //     product_name: productName,
      //   };
      //   res.status(200).json({ response: { message: "success", product } });
      //   break;

      case "POST":
        const userName = req.body.email;
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
          return token;
        };

        const criptografada = await generateToken(userName, userPassword);

        if (userName) {
          // Buscar um produto por ID
          const user = await query({
            query: "SELECT * FROM grace_user WHERE email = ? AND password = ?",
            values: [userName, criptografada],
          });
          if (user.length === 0) {
            res.status(404).json({ error: "version not found 2", criptografada: criptografada });
          } else {

            const secret = process.env.SECRET_API_KEY_JWT;
            const payload = {
              iss: userName,
              aud: 'Grace API',
              id: user[0].id.toString(),
              nome: user[0].name
            };

            const token = jwt.sign(payload, secret, {
              expiresIn: "90d", noTimestamp: true
            });
            const refreshToken = jwt.sign(payload, secret, {
              expiresIn: "1y", noTimestamp: true
            });
            //console.log(token);
            // const updateVersion = {
            //   token: token,
            //   version: 'versionName',
            // };
            res.status(200).json({ access_token: token, refresh_token: refreshToken, type: 'Bearer' });
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
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
