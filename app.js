'use strict'
require('dotenv').config();

var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var port = process.env.PORT || 4201; 
var server = require('http').createServer(app);
var io = require('socket.io')(server,{
    cors: {origin: '*'}
});

io.on('connection', function(socket){
    socket.on('delete-carrito', function(data){
        io.emit('new-carrito', data);
        console.log(data);
    });

    socket.on('add-carrito-add', function(data){
        io.emit('new-carrito-add', data);
        console.log(data);
    });
});

var cliente_route = require('./routes/cliente');
var admin_route = require('./routes/admin');
var cupon_route = require('./routes/cupon');
var vino_route = require('./routes/vino');

mongoose.set('strictQuery', false); // aquí se establece la opción strictQuery
mongoose.connect(process.env.BD_AQUELARRE, (err, res)=>{
    if(err){
        console.log(err);
    }
    else{
        server.listen(port, function(){
            console.log("Servidor corriendo en el puerto " + port);
        })
    }
});

app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json({limit: '50mb', extended: true}));

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*'); 
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods','GET, PUT, POST, DELETE, OPTIONS');
    res.header('Allow','GET, PUT, POST, DELETE, OPTIONS');
    next();
});

app.use('/api', cliente_route);
app.use('/api', admin_route);
app.use('/api', cupon_route);
app.use('/api', vino_route);

module.exports = app; 