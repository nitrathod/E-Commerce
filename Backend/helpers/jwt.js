const expressJwT = require('express-jwt');

function authJwT(){
    const secret = process.env.secret;
    return expressJwT({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            //excluding products, login and register from jwt, /\/api\/v1\.. is regular string
            {url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
            `/api/v1/users/login`,
            `/api/v1/users/register`
        ]
    })
}

async function isRevoked(req, payload, done) {
    //if user is not admin and authorized API called then token will be rejected
    if(!payload.isAdmin) {
        done(null, true);
    }
    //if user is admin the accept the token.
    done();
}

module.exports = authJwT;