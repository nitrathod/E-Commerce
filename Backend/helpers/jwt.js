const expressJwT = require('express-jwt');

function authJwT(){
    const secret = process.env.secret;
    return expressJwT({
        secret,
        algorithms: ['HS256']
    })
}

module.exports = authJwT;