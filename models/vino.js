'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VinoSchema = Schema({
    nombre: { type: String, required: true },
    codigo: { type: String, required: true },
    descripcion: { type: String, required: false },
    contenido: { type: String, required: false },
    regionOrigen: { type: String, required: false },
    portada: { type: String, required: true },
    portadaNombre: { type: String, required: true },
});

module.exports = mongoose.model('vino', VinoSchema);