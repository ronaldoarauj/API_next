import { NextApiRequest, NextApiResponse } from "next";
import { userController } from "./controllers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { method, query, headers, body } = req;

    // Verifica se o token Bearer está presente no cabeçalho da requisição
    const authorizationHeader = headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized - Bearer token missing' });
        return;
    }

    // Extrai o token Bearer da string
    const token = authorizationHeader.substring(7);

    // Verifica se o token é válido (neste exemplo, verifica se é 'AlterPass456')
    if (token !== 'Teste') {
        res.status(401).json({ error: 'Unauthorized - Invalid Bearer token' });
        return;
    }

    try {
        if (method === 'GET') {
            const response = await userController.findByID(query.id as string);
            return res.status(201).json({ message: 'ok', data: response })
        }
        const response = await userController.findAllUsers()
        return res.status(200).json({ message: 'ok', data: response })
    } catch (e: any) {
        return res.status(500).json({ message: e.message })
    }


}