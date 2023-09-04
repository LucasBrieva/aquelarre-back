'use strict'

var Cliente = require('../models/cliente');
var Direccion = require('../models/direccion');
var bcrypt = require('bcrypt');
var jwt = require('../helpers/jwt');
var fsHelper = require('../helpers/fsHelper');

const registro_cliente = async function (req, res) {
    var data = req.body;
    var clientes_arr = [];

    clientes_arr = await Cliente.find({ email: data.email });
    if (clientes_arr.length == 0) {
        if (data.password) {
            bcrypt.hash(data.password, 10, async function (err, hash) {
                if (hash) {
                    data.password = hash;
                    var reg = await Cliente.create(data);
                    console.log(reg);
                    res.status(200).send({
                        data: reg,
                        token: jwt.createToken(reg)
                    });
                }
                else {
                    fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.registro_cliente");

                    res.status(403).send({ message: 'ErrorServer', data: undefined });
                }
            });
        } else {
            res.status(400).send({ message: 'No hay una contraseña', data: undefined });
        }
    }
    else {
        res.status(400).send({ message: 'El correo ya existe en la base de datos', data: undefined });
    }

}

const listar_clientes_filtro_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "Admin") {
            let data = req.body;
            let reg = await Cliente.find({ nombres: new RegExp(data.nombre, 'i'), email: new RegExp(data.correo, 'i'), apellidos: new RegExp(data.apellido, 'i'), dadoBaja: false });
            res.status(200).send({ data: reg });

        } else {
            fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.listar_clientes_filtro_admin");
            res.status(500).send({ message: 'NoAccess' })
        }
    } else {
        fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.listar_clientes_filtro_admin");
        res.status(500).send({ message: 'NoAccess' })
    }
}

const login_cliente = async function (req, res) {
    var data = req.body;
    var cliente_arr = [];

    cliente_arr = await Cliente.find({ email: data.email });
    if (cliente_arr.length == 0) {
        res.status(400).send({ message: "No se encontró el correo", data: undefined });

    } else {
        let user = cliente_arr[0];

        bcrypt.compare(data.password, user.password, async function (error, check) {
            if (check) {
                if (user.dadoBaja == "false") {
                    res.status(200).send({
                        data: user,
                        token: jwt.createToken(user)
                    });
                }
                else {
                    res.status(400).send({ message: "El usuario está dado de baja", data: undefined });
                }
            }
            else {
                res.status(400).send({ message: "La contraseña no coincide", data: undefined });
            }
        });

    }
}

const registro_cliente_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "Admin") {
            var data = req.body;

            bcrypt.hash('123456789', 10, async function (err, hash) {
                if (hash) {
                    data.password = hash;
                    let reg = await Cliente.create(data);
                    res.status(200).send({ data: reg });
                }
            })
        } else {
            fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.registro_cliente_admin");
            res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
        }
    }
    else {
        fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.registro_cliente_admin");
        res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
    }
}

const obtener_cliente_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "Admin") {
            var id = req.params['id'];
            try {
                var reg = await Cliente.findById({ _id: id });
                res.status(200).send({ data: reg });
            } catch (error) {
                fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.obtener_cliente_admin");
                res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
            }
        } else {
            fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.obtener_cliente_admin");
            res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
        }
    } else {
        fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.obtener_cliente_admin");

        res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
    }
}

const actualizar_cliente_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "Admin") {
            var id = req.params['id'];
            var data = req.body;
            var reg = await Cliente.findByIdAndUpdate({ _id: id }, {
                nombres: data.nombres,
                apellidos: data.apellidos,
                email: data.email,
                telefono: data.telefono,
                f_nacimiento: data.f_nacimiento,
                genero: data.genero,
                dni: data.dni,
            });
            res.status(200).send({ data: reg });
        } else {
            fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.actualizar_cliente_admin");
            res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
        }
    } else {
        fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.actualizar_cliente_admin");
        res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
    }
}

const baja_cliente_admin = async function (req, res) {
    if (req.user) {
        if (req.user.role == "Admin") {
            var id = req.params['id'];
            var reg = await Cliente.findByIdAndUpdate({ _id: id }, {
                dadoBaja: true
            });
            res.status(200).send({ data: reg });
        } else {
            fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.baja_cliente_admin");
            res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
        }
    } else {
        fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.baja_cliente_admin");
        res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
    }
}

const obtener_cliente_guest = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        try {
            var reg = await Cliente.findById({ _id: id });
            res.status(200).send({ data: reg });
        } catch (error) {
            fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.obtener_cliente_guest");
            res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
        }
    } else {
        fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.obtener_cliente_guest");
        res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
    }
}
const actualizar_perfil_cliente_guest = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var data = req.body;
        if (data.newPassword) {
            bcrypt.hash(data.newPassword, 10, async function (err, hash) {
                var reg = await Cliente.findByIdAndUpdate({ _id: id }, {
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    email: data.email,
                    telefono: data.telefono,
                    f_nacimiento: data.f_nacimiento,
                    dni: data.dni,
                    genero: data.genero,
                    pais: data.pais,
                    password: hash,
                });
                res.status(200).send({ data: reg });
            });
        } else {
            var reg = await Cliente.findByIdAndUpdate({ _id: id }, {
                nombres: data.nombres,
                apellidos: data.apellidos,
                email: data.email,
                telefono: data.telefono,
                f_nacimiento: data.f_nacimiento,
                dni: data.dni,
                genero: data.genero,
                pais: data.pais,
            });
            res.status(200).send({ data: reg });
        }
    } else {
        fsHelper.add_log("ClienteController.js", "Hubo un error en ClienteController.js-actualizar_perfil_cliente_guest");
        res.status(500).send({ message: 'Hubo un error en el servidor', data: undefined });
    }
}

/*-------------------------------------------------*/
/*------------------DIRECCIONES--------------------*/
/*-------------------------------------------------*/

const registro_direccion_cliente = async function (req, res) {
    if (req.user) {
        var data = req.body;
        if (data.principal) {
            let direcciones = await Direccion.find({ cliente: data.cliente })
            direcciones.forEach(async element => {
                if (element.principal) await Direccion.findByIdAndUpdate({ _id: element._id }, { principal: false });
            });
        }

        let reg = await Direccion.create(data);
        res.status(200).send({ data: reg });
    } else {
        res.status(500).send({ message: 'NoAccess' })
    }
}

const obtener_direccion_cliente = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        let direcciones = await Direccion.find({ cliente: id }).populate('cliente').sort({ createdAt: -1 })

        res.status(200).send({ data: direcciones });
    } else {
        res.status(500).send({ message: 'NoAccess' })
    }
}

const obtener_direccion_principal_cliente = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var direccion = undefined;
        direccion = await Direccion.findOne({ cliente: id, principal: true }).populate('cliente');
        if(direccion == undefined){
            res.status(200).send({ data: undefined });
        }
        else{
            res.status(200).send({ data: direccion });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' })
    }
}

const cambiar_direccion_principal_cliente = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var cliente = req.params['cliente'];

        let direcciones = await Direccion.find({ cliente: cliente })
        direcciones.forEach(async element => {
            if (element.principal) await Direccion.findByIdAndUpdate({ _id: element._id }, { principal: false });
        });

        await Direccion.findByIdAndUpdate({ _id: id }, { principal: true });

        res.status(200).send({ data: true });
    } else {
        res.status(500).send({ message: 'NoAccess' })
    }
}

module.exports = {
    registro_cliente,
    login_cliente,
    listar_clientes_filtro_admin,
    registro_cliente_admin,
    obtener_cliente_admin,
    actualizar_cliente_admin,
    baja_cliente_admin,
    obtener_cliente_guest,
    actualizar_perfil_cliente_guest,
    registro_direccion_cliente,
    obtener_direccion_cliente,
    cambiar_direccion_principal_cliente,
    obtener_direccion_principal_cliente
}
