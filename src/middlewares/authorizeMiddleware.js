const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Acesso negado. Usuário sem papel definido.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para esta ação.' });
        }
        next();
    };
};

module.exports = authorizeRoles;