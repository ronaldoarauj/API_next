// import { query } from "@/lib/db";

// export default async function Produto(req, res) {
//     // console.log(request.query.id);

//     switch (req.method) {
//         case "GET":
//           if (req.query.id) {
//             // Buscar um produto por ID
//             const productId = req.query.id;
//             const product = await query({
//               query: "SELECT * FROM grace_user WHERE id = ?",
//               values: [productId],
//             });
//             if (product.length === 0) {
//               res.status(404).json({ error: "Product not found" });
//             } else {
//               res.status(200).json({ product: product[0] });
//             }
//           } else {
//             // Listar todos os produtos
//             const products = await query({
//               query: "SELECT * FROM grace_user",
//             });
//             res.status(200).json({ products });
//           }
//           break;
//       }
// }

