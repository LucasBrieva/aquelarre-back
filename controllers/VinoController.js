'use strict'

var Vino = require('../models/vino');
var fs = require('fs');
var path = require('path');
var fsHelper = require('../helpers/fsHelper');

const registro_vino_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "Admin") {
            const data = req.body;
            const vinos_arr = await Vino.find({ nombre: data.nombre });
            if (vinos_arr.length == 0) {

                var img_path = req.files.portada.path;
                var img_name = img_path.split("\\");
                var portada_name = img_name[2];
                data.slug = data.nombre.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
                data.portada = portada_name;
                const reg = await Vino.create(data);

                res.status(200).send({ data: reg });
            }
            else {
                res.status(400).send({ message: 'El nombre ya existe', data: undefined });
            }
        } else {
            fsHelper.add_log("VinoController.js", "Hubo un error en VinoController.registro_vino_admin, no tiene permiso por rol");
            res.status(500).send({ message: 'NoAccess' })
        }
    } else {
        fsHelper.add_log("VinoController.js", "Hubo un error en VinoController.registro_vino_admin, no llego el usuario");
        res.status(500).send({ message: 'NoAccess' })
    }
}

const listar_vinos_filtro_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "Admin") {
            const data = req.body;
            const reg = await Vino.find();
            res.status(200).send({ data: reg });

        } else {
            fsHelper.add_log("VinoController.js", "Hubo un error en VinoController.listar_vinos_filtro_admin, no tiene permiso por rol");
            res.status(500).send({ message: 'NoAccess' })
        }
    } else {
        fsHelper.add_log("VinoController.js", "Hubo un error en VinoController.listar_vinos_filtro_admin, no llego el usuario");
        res.status(500).send({ message: 'NoAccess' })
    }
}

const obtener_portada = async function (req, res) {
    const img = req.params['img'];
    fs.stat('./uploads/vinos/' + img, function (error) {
        if (!error) {
            const path_img = './uploads/vinos/' + img;
            res.status(200).sendFile(path.resolve(path_img));
        } else {
            const path_img = './uploads/vino-default.png';
            res.status(200).sendFile(path.resolve(path_img));
        }
    });
}

const obtener_vino_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "Admin") {
            const id = req.params['id'];
            try {
                const reg = await Vino.findById({ _id: id });
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(200).send({ data: undefined });
            }
        } else {
            fsHelper.add_log("VinoController.js", "Hubo un error en VinoController.obtener_vino_admin, no tiene permiso por rol");
            res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
        }
    } else {
        fsHelper.add_log("VinoController.js", "Hubo un error en VinoController.obtener_vino_admin, no llego el usuario");
        res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
    }
}

const actualizar_vino_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "Admin") {
            const id = req.params['id'];
            const data = req.body;

            if (req.files) {
                //SI HAY IMAGEN
                let img_path = req.files.portada.path;
                let img_name = img_path.split("\\");
                let portadaName = img_name[2];

                let reg = await Vino.findByIdAndUpdate({ _id: id }, {
                    ...data,
                    portada: portadaName
                });
                //BORRO LA IMG PARA QUE NO ME ACUMULE INFO BASURA EN LA BD
                fs.stat('./uploads/vinos/' + reg.portada, function (error) {
                    if (!error) {
                        fs.unlink('./uploads/vinos/' + reg.portada, (err) => {
                            if (err) throw err;
                        });
                    }
                });
                res.status(200).send({ data: reg });

            } else {
                //NO HAY IMAGEN
                let reg = await Vino.findByIdAndUpdate({ _id: id }, {
                    ...data
                });
                res.status(200).send({ data: reg });
            }
        } else {
            fsHelper.add_log("VinoController.js", "Hubo un error en VinoController.actualizar_vino_admin, no tiene permiso por rol");
            res.status(500).send({ message: 'NoAccess' })
        }
    } else {
        fsHelper.add_log("VinoController.js", "Hubo un error en VinoController.actualizar_vino_admin, no llego el usuario");
        res.status(500).send({ message: 'NoAccess' })
    }
}

const baja_vino_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "Admin") {
            const id = req.params['id'];
            const reg = await Vino.findByIdAndUpdate({ _id: id }, {
                dadoBaja: true
            });
            res.status(200).send({ data: reg });
        } else {
            fsHelper.add_log("VinoController.js", "Hubo un error en VinoController.baja_vino_admin, no tiene permiso por rol");
            res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
        }
    } else {
        fsHelper.add_log("VinoController.js", "Hubo un error en VinoController.baja_vino_admin, no llego el usuario");
        res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
    }
}

module.exports = {
    registro_vino_admin,
    listar_vinos_filtro_admin,
    obtener_portada,
    obtener_vino_admin,
    actualizar_vino_admin,
    baja_vino_admin,
}