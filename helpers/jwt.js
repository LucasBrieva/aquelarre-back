'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'lucasbrieva';

exports.createToken = function(user){
    var payload = {
        sub:user._id,
        email: user.email,
        role: user.rol,
        iat: moment().unix(),
        exp: moment().add(7,'hours').unix()
    };

    return jwt.encode(payload, secret);
}