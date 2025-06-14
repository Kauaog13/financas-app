const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const financeRoutes = require('./routes/financeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const exportRoutes = require('./routes/exportRoutes');
const reportRoutes = require('./routes/reportRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/budgets', budgetRoutes);

// Rota principal: redireciona para o login/registro se não houver token ou for a primeira vez
app.get('/', (req, res) => {
    // Em um cenário real, você verificaria aqui se o usuário está autenticado
    // Se sim, res.sendFile(path.join(__dirname, '../public/index.html'));
    // Se não, res.sendFile(path.join(__dirname, '../public/register-login.html'));
    // Por simplicidade, vamos sempre começar na tela de autenticação
    res.sendFile(path.join(__dirname, '../public/register-login.html'));
});

// Rotas de login e registro apontam para a nova página unificada
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register-login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register-login.html'));
});

// Outras páginas HTML
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}/register-login.html`);
});