const expressJwT = require('express-jwt');

function authJwT(){
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwT({
        secret,
        algorithms: ['HS256']
    }).unless({
        path: [
            //excluding products, login and register from jwt, /\/api\/v1\.. is regular string
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
            `${api}/v1/users/login`,
            `${api}/v1/users/register`
        ]
    })
}

module.exports = authJwT;