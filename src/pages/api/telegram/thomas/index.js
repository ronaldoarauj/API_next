// pages/api/telegram.js

export default async function handler(req, res) {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const { offset } = req.query;
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}`;

    try {
        const response = await fetch(TELEGRAM_API_URL);

        if (!response.ok) {
            console.error('Error fetching data:', response.statusText);
            return res.status(response.status).json({ error: response.statusText });
        }

        const data = await response.json();

        if (data.ok) {
            console.log('Data fetched successfully:', data.result);

            // Filtrar os dados para retornar apenas o remetente, ID da mensagem e texto, se houver
            const filteredData = data.result
                .filter(update => update.message) // Filtra apenas as atualizações que possuem 'message'
                .map(update => {
                    const { message } = update;
                    return {
                        update_id: update.update_id,
                        message_id: message.message_id,
                        text: message.text || '', // Inclui o texto, se existir
                        from: {
                            //id: message.from.id,
                            username: message.from.username,
                            first_name: message.from.first_name,
                            //last_name: message.from.last_name,
                        },
                    };
                })
                .sort((a, b) => b.message_id - a.message_id); // Ordena em ordem decrescente pelo message_id

            res.status(200).json(filteredData);
        } else {
            console.error('Telegram API error:', data.description);
            res.status(response.status).json({ error: data.description });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
