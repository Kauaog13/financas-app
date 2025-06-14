const TransactionModel = require('../models/transactionModel');
const { AsyncParser } = require('@json2csv/node');

exports.exportTransactionsToCsv = async (req, res) => {
    const userId = req.user.id;

    try {
        const transactions = await TransactionModel.getTransactionsByUserId(userId);

        if (transactions.length === 0) {
            // Se não houver transações, envia uma resposta com status 200 e mensagem JSON.
            // O frontend vai ler essa mensagem e mostrar o alerta apropriado.
            return res.status(200).json({ message: 'Nenhuma transação encontrada para exportar.' });
        }

        const fields = [
            { label: 'ID Transacao', value: 'id' },
            { label: 'Descricao', value: 'description' },
            { label: 'Valor', value: 'amount' },
            { label: 'Tipo', value: 'type' },
            { label: 'Data', value: 'date',
              // Formata a data para 'YYYY-MM-DD', garantindo legibilidade no CSV
              // e melhor compatibilidade com softwares de planilha.
              stringify: (value) => value ? new Date(value).toISOString().split('T')[0] : ''
            },
            { label: 'Categoria', value: 'category_name' }
        ];

        const parser = new AsyncParser({ fields });
        const csv = await parser.parse(transactions).promise();

        // **CABECALHOS HTTP ESSENCIAIS PARA O DOWNLOAD**
        // Desativa o cache para garantir que o navegador sempre solicite o conteúdo novo
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('ETag', 'false'); // Desativa ETag para esta resposta

        // Define o tipo de conteúdo como CSV
        res.header('Content-Type', 'text/csv; charset=utf-8'); // Adicionado charset=utf-8 para melhor compatibilidade com caracteres especiais
        // Força o navegador a baixar o arquivo e sugere um nome
        res.header('Content-Disposition', 'attachment; filename="transacoes.csv"');
        
        // Envia o conteúdo CSV como resposta
        res.send(csv);

    } catch (error) {
        console.error('Erro interno ao exportar transações para CSV:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao exportar transações.' });
    }
};