const COOKIE_NAME = 'sessao';
const COOKIE_OPTIONS = [ 'Path=/', 'HttpOnly', 'SameSite=Lax'];

function definirCookie(res, token) {
    const secure = process.env.NODE_ENV === 'production';
    const options = [ ...COOKIE_OPTIONS, 'Max-Age=900', ...(secure ? ['Secure'] : [])];
    res.setHeader( 'Set-Cookie', `${COOKIE_NAME}=${token}; ${options.join('; ')}` );
}

function limparCookie(res) {
    const secure = process.env.NODE_ENV === 'production';
    const options = [...COOKIE_OPTIONS, 'Max-Age=0', ...(secure ? ['Secure'] : []) ];
    res.setHeader( 'Set-Cookie',`${COOKIE_NAME}=; ${options.join('; ')}` );
}

module.exports = {
    COOKIE_NAME,
    definirCookie,
    limparCookie
};
