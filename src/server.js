const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const financeRoutes = require('./routes/financeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const exportRoutes = require('./routes/exportRoutes'); // Importar novas rotas de exportação

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(express.json()); // Para parsear JSON no corpo das requisições
app.use(express.static(path.join(__dirname, '../public'))); // Para servir arquivos estáticos (HTML, CSS, JS do frontend)

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/export', exportRoutes); // Usar as novas rotas de exportação

// Rotas para servir as páginas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});