const expressJwt = require('express-jwt')
require('dotenv').config()

/*
exports.authJwt = (req, res, next) => {
    return expressJwt({
        secret: process.env.JWT_SECRET,
        algorithms: ['HS256'],
        // isRevoked: isRevoked
    }).unless({
        path:[
            { url: /\/public\/uploads(.*)/, methods:['GET', 'OPTIONS']},
            { url: /\/api\/v1\/products(.*)/, methods:['GET', 'OPTIONS']},
            { url: /\/api\/v1\/categories(.*)/, methods:['GET', 'OPTIONS']},
            '/api/v1/users/login',
            '/api/v1/users/register',
        ]
    })
}
*/

/*
async function isRevoked(req, payload, done){
    if(!payload.isAdmin){
        done(null, true)
    }

    done()
}
*/

exports.errorHandler = (err, req, res, next) => {
    if(err) return res.status(500).json({ Success: false, Message: err.message })
    next()
}

