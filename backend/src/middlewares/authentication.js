
const jwt = require('jsonwebtoken');

module.exports = function autenticar(req, res) {
    const cookies = Object.fromEntries(
        (req.headers.cookie || '')
            .split('; ')
            .filter(Boolean)
            .map(cookie => cookie.split('='))
    );

    try {
        req.user = jwt.verify(
            cookies.sessao,
            process.env.JWT_SECRET
        );
        return true;
    } catch {
        return false;
    }
};

