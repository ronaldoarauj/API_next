import { query } from "@/lib/db"; // Assuming this interacts with your database
import jwt from "jsonwebtoken";

export default async function handler(req, res) {

    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized - Bearer token missing' });
        return;
    }

    // Extrai o token Bearer da string
    const token = authorizationHeader.substring(7);

    if (token !== process.env.TOKEN_USER_BIBLE) {
        res.status(401).json({ error: 'Unauthorized - Invalid Bearer token' });
        return;
    }

    if (req.method === 'GET') {
        try {
            const response = await fetch('https://www.abibliadigital.com.br/api/verses/nvi/random', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json', // This might not be needed for the external API
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                res.status(response.status).json({ message: `Erro na outra API: ${errorText}` });
                return;
            }

            const apiData = await response.json();

            // Prepare the response data to include the API JSON
            const responseData = {
                book: apiData.book,
                chapter: apiData.chapter,
                number: apiData.number,
                text: apiData.text,
            };

            // Uncomment and modify if you actually want to update the user in the database
            const getBible = await query({
                query: "SELECT * FROM grace_biblia WHERE abbrev_pt = ? and chapter = ? and number = ?",
                values: [apiData.book.abbrev.pt, apiData.chapter, apiData.number],
            });
            if (getBible.length === 0) {
                const insertBible = await query({
                    query: "INSERT INTO grace_biblia (abbrev_pt, abbrev_en, name, author, `group`, version, chapter, number, text) VALUES (?,?,?,?,?,?,?,?,?)",
                    values: [apiData.book.abbrev.pt, apiData.book.abbrev.en, apiData.book.name, apiData.book.author, apiData.book.group, apiData.book.version, apiData.chapter, apiData.number, apiData.text],
                });
            }

            res.status(200).json(responseData);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Método ${req.method} não permitido`);
    }
}
