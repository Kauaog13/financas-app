// controllers/forgotPasswordController.js

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Assumindo que você tem um arquivo db.js para conexão com o banco
require('dotenv').config(); // Garante que as variáveis de ambiente sejam carregadas

const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'um_segredo_reset_muito_seguro_padrao_se_nao_definido'; // Segredo diferente para tokens de reset
const EMAIL_USER = process.env.EMAIL_USER; // Seu email para enviar
const EMAIL_PASS = process.env.EMAIL_PASS; // Sua senha de email
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'; // URL base do seu app

// Validação básica das variáveis de ambiente de email
if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("AVISO: Variáveis de ambiente EMAIL_USER ou EMAIL_PASS não definidas. O envio de e-mails não funcionará.");
    console.warn("Certifique-se de configurar EMAIL_USER e EMAIL_PASS no seu arquivo .env");
}

// Configuração do Nodemailer
// Para Gmail, você precisará de uma "Senha de aplicativo" (App Password)
// Vá em: Google Account -> Security -> 2-Step Verification -> App passwords
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Você pode usar outros serviços ou configurações SMTP diretas
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
    // Descomente e ajuste se estiver tendo problemas com SSL/TLS (nem sempre necessário)
    // tls: {
    //     rejectUnauthorized: false
    // }
});

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'E-mail é obrigatório.' });
    }

    try {
        // Busca o usuário. Não revele se o email existe ou não por segurança.
        const [users] = await db.execute('SELECT id, email FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            // Sempre responde com sucesso para evitar enumerar e-mails registrados
            return res.status(200).json({ message: 'Se o e-mail estiver registrado, um link de redefinição será enviado.' });
        }

        // Gerar um token de redefinição de senha com validade de 1 hora
        const resetToken = jwt.sign({ userId: user.id }, JWT_RESET_SECRET, { expiresIn: '1h' });

        // Armazenar o token no banco de dados para validação futura.
        // Se a tabela 'password_reset_tokens' ainda não existe, crie-a.
        // A cláusula ON DUPLICATE KEY UPDATE serve para caso o usuário solicite
        // um novo link de redefinição antes do anterior expirar.
        await db.execute(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR)) ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)',
            [user.id, resetToken]
        );

        // O link de redefinição que o usuário receberá.
        // Ele aponta para a página de login/registro com o token na URL.
        const resetUrl = `${BASE_URL}/login?token=${resetToken}`;

        const mailOptions = {
            from: EMAIL_USER,
            to: user.email,
            subject: 'Redefinição de Senha - Controle de Finanças',
            html: `
                <p>Você solicitou a redefinição de senha para sua conta no Controle de Finanças.</p>
                <p>Por favor, clique no link abaixo para redefinir sua senha:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>Este link expirará em 1 hora.</p>
                <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>
                <br>
                <p>Atenciosamente,</p>
                <p>Sua Equipe de Controle de Finanças</p>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar e-mail de redefinição:', error);
                // Ainda retorna sucesso para não revelar informações de registro de e-mail
                return res.status(200).json({ message: 'Se o e-mail estiver registrado, um link de redefinição será enviado.' });
            }
            console.log('E-mail de redefinição enviado:', info.response);
            res.status(200).json({ message: 'Se o e-mail estiver registrado, um link de redefinição será enviado.' });
        });

    } catch (error) {
        console.error('Erro no processo de esquecer senha:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
    }

    try {
        // Verificar e decodificar o token
        const decoded = jwt.verify(token, JWT_RESET_SECRET);
        const userId = decoded.userId;

        // Validar o token no banco de dados e verificar se não expirou
        const [tokens] = await db.execute('SELECT * FROM password_reset_tokens WHERE user_id = ? AND token = ? AND expires_at > NOW()', [userId, token]);
        const resetTokenEntry = tokens[0];

        if (!resetTokenEntry) {
            return res.status(400).json({ message: 'Token inválido ou expirado. Por favor, solicite um novo link de redefinição.' });
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Atualizar a senha do usuário
        // Certifique-se de que o `UserModel` ou uma função direta do `db` possa fazer isso
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        // Invalidar o token usado (muito importante para segurança: um token só pode ser usado uma vez)
        await db.execute('DELETE FROM password_reset_tokens WHERE id = ?', [resetTokenEntry.id]);

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Token expirado. Por favor, solicite um novo link de redefinição.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Token inválido.' });
        }
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao redefinir senha.' });
    }
};