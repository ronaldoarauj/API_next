// import { query } from "@/lib/db";

// export default async function handler(req, res) {
//   try {
//     // Configurar o cabeçalho de Cache-Control
//     res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

//     switch (req.method) {
//       case "GET":
//         if (req.query.id) {
//           // Buscar um produto por ID
//           const productId = req.query.id;
//           const product = await query({
//             query: "SELECT * FROM grace_version WHERE id = ?",
//             values: [productId],
//           });
//           if (product.length === 0) {
//             res.status(404).json({ error: "Product not found" });
//           } else {
//             res.status(200).json({ version: product[0] });
//           }
//         } else {
//           // Listar todos os produtos
//           const version = await query({
//             query: "SELECT * FROM grace_version",
//           });
//           res.status(200).json({ version });
//         }
//         break;

//       // case "POST":
//       //   const postUserName = req.body.product_name;
//       //   const addProducts = await query({
//       //     query: "INSERT INTO products (product_name) VALUES (?)",
//       //     values: [postUserName],
//       //   });
//       //   const product = {
//       //     product_id: addProducts.insertId,
//       //     product_name: productName,
//       //   };
//       //   res.status(200).json({ response: { message: "success", product } });
//       //   break;

//       case "PUT":
//         const versionId = req.body.id;
//         const versionName = req.body.version;

//         if (versionId) {
//           // Buscar um produto por ID
//           const product = await query({
//             query: "SELECT * FROM grace_version WHERE id = ?",
//             values: [versionId],
//           });
//           if (product.length === 0) {
//             res.status(404).json({ error: "version not found" });
//           } else {

//             const updateVersions = await query({
//               query: "UPDATE grace_version SET version = ? WHERE id = ?",
//               values: [versionName, versionId],
//             });
//             const updateVersion = {
//               id: versionId,
//               version: versionName,
//             };
//             res.status(200).json({ response: { message: "success", version: updateVersion } });
//           }
//         }
//         break;

//       // case "DELETE":
//       //   const productIdToDelete = req.body.product_id;
//       //   const deleteProducts = await query({
//       //     query: "DELETE FROM products WHERE product_id = ?",
//       //     values: [productIdToDelete],
//       //   });
//       //   res.status(200).json({ response: { message: "success", product_id: productIdToDelete } });
//       //   break;

//       default:
//         res.status(405).json({ error: "Method not allowed" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }
