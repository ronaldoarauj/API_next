import { query } from "@/lib/db";

export default async function handler(req, res) {
  try {
    // Configurar o cabeçalho de Cache-Control
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

    switch (req.method) {
      case "GET":
        if (req.query.id) {
          // Buscar um produto por ID
          const productId = req.query.id;
          const product = await query({
            query: "SELECT * FROM grace_user WHERE id = ?",
            values: [productId],
          });
          if (product.length === 0) {
            res.status(404).json({ error: "Product not found" });
          } else {
            res.status(200).json({ product: product[0] });
          }
        } else {
          // Listar todos os produtos
          const products = await query({
            query: "SELECT * FROM grace_user",
          });
          res.status(200).json({ products });
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
        const productId = req.body.product_id;
        const productName = req.body.product_name;
        const updateProducts = await query({
          query: "UPDATE products SET product_name = ? WHERE product_id = ?",
          values: [productName, productId],
        });
        const updatedProduct = {
          product_id: productId,
          product_name: productName,
        };
        res.status(200).json({ response: { message: "success", product: updatedProduct } });
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
