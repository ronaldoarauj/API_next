import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

// const validateToken = (token) => {
//     try {
//         const secret = process.env.TOKEN_USER_BIBLE;
//         const decoded = jwt.verify(token, secret);

//     } catch (error) {
//         console.error('Erro ao validar o token:', error.message);
//         return null;
//     }
// }

export default async function handler(req, res) {

        // Verifica se o token Bearer está presente no cabeçalho da requisição
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
        const { version, abbrev, chapter } = req.query;

        if (!version || !abbrev || !chapter) {
            res.status(400).json({ message: "Parâmetros 'version', 'abbrev' e 'chapter' são obrigatórios" });
            return;
        }

        try {
            const response = await fetch(`https://www.abibliadigital.com.br/api/verses/${version}/${abbrev}/${chapter}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Erro na outra API: ${errorText}`);
                res.status(response.status).json({ message: `Erro na outra API: ${errorText}` });
                return;
            }

            const apiData = await response.json();

            // if (Array.isArray(apiData.verses)) {
            //     //console.log(apiData.verses);
            //     const insertPromises = apiData.verses.map(verse => {
            //         return insertVerse(verse);
            //       });
            //     // const insertPromises = apiData.map(verse => {
            //     //   return insertVerse(verse);
            //     // });
            
            //     await Promise.all(insertPromises);
            
            //     res.status(200).json(apiData);
            //   } else {
            //     // ... tratamento caso apiData não seja um array ...
            //   }

            //   async function insertVerse(verseData) {
            //     try {
            //         console.log('aqui');
            //       //const client = await pool.connect();
            //       try {
            //         // Query SQL ajustada para inserir todos os campos do versículo
            //         const checkQuery = 'SELECT * FROM grace_biblia WHERE abbrev_pt = ? AND chapter = ? AND number = ?';
            //         const checkValues = [verseData.book.abbrev.pt, verseData.chapter, verseData.number];
            //         const checkResult = await query(checkQuery, checkValues);
              
            //         if (checkResult.rows.length === 0) {
            //           // Se o versículo não existe, insere
            //           const insertQuery = `
            //             INSERT INTO grace_biblia (
            //               abbrev_pt, abbrev_en, name, author, "group", version, chapter, number, text
            //             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            //           `;
            //           const insertValues = [
            //             verseData.book.abbrev.pt,
            //             verseData.book.abbrev.en,
            //             verseData.book.name,
            //             verseData.book.author,
            //             verseData.book.group,
            //             verseData.book.version,
            //             verseData.chapter,
            //             verseData.number,
            //             verseData.text
            //           ];
            //           await query(insertQuery, insertValues);
            //         } else {
            //           console.log('Versículo já existe:', verseData);
            //         }
            //       } finally {
            //         client.release();
            //       }
            //     } catch (error) {
            //       console.error('Erro ao inserir versículo:', error.message);
            //     }
            // }

            // // Uncomment and modify if you actually want to update the user in the database
            // const getBible = await query({
            //     query: "SELECT * FROM grace_biblia WHERE abbrev_pt = ? and chapter = ? and number = ?",
            //     values: [apiData.book.abbrev.pt, apiData.chapter, apiData.number],
            // });
            // if (getBible.length === 0) {
            //     const insertBible = await query({
            //         query: "INSERT INTO grace_biblia (abbrev_pt, abbrev_en, name, author, `group`, version, chapter, number, text) VALUES (?,?,?,?,?,?,?,?,?)",
            //         values: [apiData.book.abbrev.pt, apiData.book.abbrev.en, apiData.book.name, apiData.book.author, apiData.book.group, apiData.book.version, apiData.chapter, apiData.number, apiData.text],
            //     });
            // }

            res.status(200).json(apiData);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Método ${req.method} não permitido`);
    }
}
