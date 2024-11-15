import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {

        // Configurar o cabeçalho de Cache-Control
        res.charset = 'utf-8',
            res.setHeader('Content-Type', 'charset=utf-8', 'Cache-Control', 's-maxage=10, stale-while-revalidate');

        // Verifica se o token Bearer está presente no cabeçalho da requisição
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            res.status(401).json({ resposta: 'Unauthorized - Bearer token missing' });
            return;
        }

        // Extrai o token Bearer da string
        const token = authorizationHeader.substring(7);

        if (token !== process.env.TOKEN_USER) {
            res.status(401).json({ error: 'Unauthorized - Invalid Bearer token' });
            return;
        }

    if (req.method === 'POST') {
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        const formattedDate = oneYearAgo.toISOString().slice(0, 10);
        const oneYearAgoDelete = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate()); 
        const formattedDateDelete = oneYearAgoDelete.toISOString().slice(0, 10);

        const userWithMessages = await query({
            query: `
            SELECT u.id, u.name, u.email
            FROM grace_user u
            INNER JOIN grace_post p ON u.id = p.id_user WHERE p.data > ?
            GROUP BY u.id
            HAVING COUNT(p.id) > 0
            ORDER BY u.id ASC
            `,
            values: [formattedDate],
        });

        const deleteUserWithMessages = await query({
            query: `
            DELETE FROM grace_post WHERE id_user = 1 AND data < ?
            `,
            values: [formattedDateDelete],
        });

        //console.log(formattedDateDelete);

        if (userWithMessages.length === 0) {
            res.status(200).json({ message: 'Nenhum usuário com mensagens cadastradas' });
            return; // Exit if no users have messages
        }

        let allMessages = []; // Empty array to store all messages

        for (const user of userWithMessages) {
            const userId = user.id;
            const userName = user.name;
            const userEmail = user.email; // Get the user's email from the current user object

            const userMessages = await query({
                query: "SELECT post, data FROM grace_post WHERE id_user = ? ORDER BY id DESC",
                values: [userId],
            });

            allMessages = allMessages.concat(userMessages);

            // Format the email body with user's email
            const emailBody = `
            <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                    <!-- Logo -->
                    <img src="https://play-lh.googleusercontent.com/lTshDJuCTNADb7PqkkKT8Cp-bCz-HBTt7ko1DDoOGkbpv7_087ceyCT-SnpqVmpKIqXr=w240-h480-rw" alt="Logo da Empresa" style="max-width: 50%; height: auto;"/>
                </td>
            </tr>            
            <tr>
                <td style='text-align: left;'>
                <h1 style="color: #007bff; font-family: Arial, sans-serif; margin: 0;">Olá ${userName},</h1>
                <p style="font-size: 16px; line-height: 1.6; font-family: Arial, sans-serif; color: #333333;">
                    Neste Dia de Ação de Graças, queremos expressar nossa gratidão a você. Agradecemos por fazer parte do nosso App.
                </p>            
                <p style="font-size: 16px; line-height: 1.6; font-family: Arial, sans-serif; color: #333333;">Seus registros de gratidão:</p>
                <ul style="padding-left: 20px; font-family: Arial, sans-serif; color: #333333;">
                ${userMessages.map(message => `<li>${formatDate(message.data)} - ${message.post}</li>`).join('')}
                </ul>
                </td>
            </tr>
            <tr>
                <td style='padding-top: 20px; text-align: center; font-family: Arial, sans-serif; color: #999999; font-size: 12px;'>
                    © 2024 App Dai Graças. Todos os direitos reservados.
                </td>
            </tr>
            `;
            //console.log(emailBody);
            const response = await fetch('http://sinforme.com.br/grace_API/usuarios/enviarAcaoGraca', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Adapte o corpo da requisição de acordo com a documentação da API
                    email: userEmail,
                    mensagem: emailBody,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text(); // obter a mensagem de erro da resposta
                res.status(response.status).json({ message: `Erro na outra API: ${errorText}` });
                return; // garantir que não continuaremos após enviar a resposta
            }

            // Configure the email transport (replace with your credentials)
            //   const transporter = nodemailer.createTransport({
            //     host: 'smtp.gmail.com',
            //     port: 587,
            //     secure: false,
            //     auth: {
            //       user: 'seu_email@gmail.com',
            //       pass: 'sua_senha'
            //     }
            //   });

            // Send the email
            //   await transporter.sendMail({
            //     from: 'seu_email@gmail.com',
            //     to: userEmail, // Use the user's email
            //     subject: 'Mensagens de Gratidão',
            //     html: emailBody,
            //   })
            //   .then(info => console.log('Email enviado para', userEmail, ': ', info.messageId))
            //   .catch(error => console.error('Erro ao enviar email para', userEmail, error));
            //console.log(userEmail);
            //const result = await response.json();

            // Retornar a resposta da outra API
            //res.status(200).json({ id_inserido: userEmail });
        }

        //res.status(200).json({ allMessages });
        res.status(200).json({ message: 'Emails enviados com sucesso' });
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);

        // Extrair o dia, mês e ano
        const day = String(date.getDate()).padStart(2, '0'); // Adiciona zero à esquerda se necessário
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
        const year = date.getFullYear();

        // Retornar a data formatada
        return `${day}/${month}/${year}`;
    }

    // // Exemplo de uso
    // const dateStr = "Tue Jun 13 2023 00:00:00 GMT-0300 (Horário Padrão de Brasília)";
    // const formattedDate = formatDate(dateStr);
    // console.log(formattedDate); // Saída: "13/06/2023"
}