import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { version, abbrev, chapter } = req.query;

        if (!version || !abbrev || !chapter) {
            res.status(400).json({ message: "Parâmetros 'version', 'abbrev' e 'chapter' são obrigatórios" });
            return;
        }

        try {
            const response = await fetch(`https://www.abibliadigital.com.br/api/verses/${version}/${abbrev}/${chapter}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Erro na outra API: ${errorText}`);
                res.status(response.status).json({ message: `Erro na outra API: ${errorText}` });
                return;
            }

            const apiData = await response.json();
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
