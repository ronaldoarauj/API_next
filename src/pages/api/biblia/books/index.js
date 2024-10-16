import { query } from "@/lib/db"; // Assuming this interacts with your database
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            
            // Configurar o cabeçalho de Cache-Control
            res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

            let response;
            let apiData;

            try {
                response = await fetch('https://www.abibliadigital.com.br/api/books', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json', // This might not be needed for the external API
                    },
                });

                if (!response.ok) {
                    throw new Error(`Erro na outra API: ${await response.text()}`);
                }

                apiData = await response.json();
            } catch (apiError) {
                console.error(apiError.message);
                // Busca os dados do banco de dados em caso de erro na API
                const dbData = await query({
                    query: "SELECT * FROM grace_livros",
                });

                // Formata os dados do banco para o mesmo formato esperado da API
                apiData = dbData.map(book => {
                    return {
                        abbrev: { pt: book.abbrev_pt, en: book.abbrev_en },
                        author: book.author,
                        chapters: book.chapters,
                        group: book.group,
                        name: book.name,
                        testament: book.testament
                    };
                });
            }

            console.log(apiData);

            // Prepare the response data to include the API JSON
            const books = apiData.map(book => {
                return {
                    abbrev: book.abbrev,
                    author: book.author,
                    chapters: book.chapters,
                    group: book.group,
                    name: book.name,
                    testament: book.testament
                }
            });

            // for(const book of books){
            //     // Verifique se o livro já existe no banco de dados
            //     const getBook = await query({
            //         query: "SELECT * FROM grace_livros WHERE abbrev_pt = ? AND name = ?",
            //         values: [book.abbrev.pt, book.name],
            //     });  
            //     console.log(book.abbrev.pt);  
            //     // Se o livro não existir, insira no banco de dados
            //     if (getBook.length === 0) {
            //         await query({
            //             query: "INSERT INTO grace_livros (abbrev_pt, abbrev_en, author, chapters, `group`, name, testament) VALUES (?, ?, ?, ?, ?, ?, ?)",
            //             values: [book.abbrev.pt, book.abbrev.en, book.author, book.chapters, book.group, book.name, book.testament],
            //         });
            //     }          
            // }

            res.status(200).json(books);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Método ${req.method} não permitido`);
    }
}
