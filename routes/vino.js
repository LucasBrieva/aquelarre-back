'use strict'

var express = require("express");
var vinoController = require("../controllers/VinoController");

var api = express.Router();
var auth = require("../middlewares/authenticate");
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir:'./uploads/vinos'});

api.post('/registro_vino_admin',  [auth.auth, path], vinoController.registro_vino_admin);
api.post('/listar_vinos_filtro_admin/', [auth.auth, path], vinoController.listar_vinos_filtro_admin);

api.get('/obtener_portada/:img', vinoController.obtener_portada);
api.get('/obtener_vino_admin/:id', auth.auth, vinoController.obtener_vino_admin);
api.put('/actualizar_vino_admin/:id', [auth.auth, path], vinoController.actualizar_vino_admin);
api.put('/baja_vino_admin/:id', auth.auth, vinoController.baja_vino_admin);

module.exports = api;
