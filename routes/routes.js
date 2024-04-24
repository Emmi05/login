import { Router } from 'express';
import { pool} from '../database/db.js'
import { auth,methods as authentication} from '../controller/controlador.js'
import { methods as clientes} from '../controller/clientes.js'
import { methods as terrenos} from '../controller/terrenos.js'
import {methods as ventas} from '../controller/ventas.js'
import { methods as abonos} from '../controller/abonos.js'
import {methods as pdf} from '../controller/pdf.js'

const router = Router();// Definición de la ruta '/'

router.get('/nosotros', (req, res) => {
    res.render('nosotros');
});

router.get('/contactanos', (req, res) => {
    res.render('contactanos');
});



router.get('/services', (req, res) => {
    res.render('terrenos_index');
});

router.get('/inicio_terrenos', (req, res) => {
    res.render('vista_terrenos');
});
// AUTENTIFICACION
router.use(authentication.auth);

router.get('/', (req, res) => {
    // Validación de sesión
    if (req.session.loggedin) {
        if (req.session.rol == 'usuario') {
            res.render('home', {
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol
            });
        } else if (req.session.rol == 'admin') {
            res.render('home', {
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol
            });
        }
        res.end();
    } else {
        res.render('terrenos_index', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
});

router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login', authentication.login)


// LOGOUT
router.get('/logout', function(req, res) {
    res.clearCookie('jwt')  
    req.session.destroy(() => {
        res.redirect('/');
    });
});


router.get('/registro_usuario', async(req, res) => {
    if (req.session.rol == 'usuario') {
        res.render('denegado', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol
        });
    } else if (req.session.rol == 'admin') {
        res.render('register', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
        });
    }    
});


router.post('/register',authentication.register);



 router.get('/usuarios', async(req, res) => {
        if (req.session.rol == 'usuario') {
            res.render('denegado', {
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,

            });
        } else if (req.session.rol == 'admin') {
            const [rows] = await pool.query('SELECT *FROM users');
            res.render('usuarios', {
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios: rows
            });
        }
});

router.get('/editar_usuario/:id', async(req, res) => {
    const id = req.params.id;
     if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT * FROM users WHERE id=?',[id]);
        res.render('editar', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            usuarios: rows,
        });
    }else{
        res.render('denegado', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
        });
    }
});
router.post('/update/:id',authentication.editarUsuario);

router.get('/delete/:id', authentication.eliminarUsuario);

// PROFILE
router.get('/profile', authentication.auth, authentication.perfil);

router.post('/profile', authentication.auth, authentication.password);
    

// ruta clientes

router.get('/cliente', async(req, res) => {
    if (req.session.rol == 'usuario') {
        res.render('registro', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol
        });
    } else if (req.session.rol == 'admin') {
        
        res.render('registro', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
    
        });
    }
});

router.post('/cliente', clientes.crearCliente)


//ver clientesss
router.get('/clientes', async(req, res) => {
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT c.*, p.name_conyuge FROM customers c LEFT JOIN parentesco p ON c.id = p.customer_id');

        res.render('clientes', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows,
           
        });
    } else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT c.*, p.name_conyuge FROM customers c LEFT JOIN parentesco p ON c.id = p.customer_id');

        res.render('clientes', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows,
       
        });
    }
});



// editar cambiar ruta se pone la misma / en el boton y cambiar rows debo darle permiso a mi usuario y cambiar el rol a false en usuario
router.get('/editar_cliente/:id', async(req, res) => {

    const id = req.params.id;
    if (req.session.rol == 'usuario') {
        const [rows] =await pool.query('SELECT c.*, p.name_conyuge, p.a_paterno_conyuge, p.a_materno_conyuge, p.cel_conyuge FROM customers c LEFT JOIN parentesco p ON c.id = p.customer_id WHERE c.id = ?', [id]);

        res.render('clienteEdit', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows,
        });
    }
    else if (req.session.rol == 'admin') {
        const [rows] =await pool.query('SELECT c.*, p.name_conyuge, p.a_paterno_conyuge, p.a_materno_conyuge, p.cel_conyuge FROM customers c LEFT JOIN parentesco p ON c.id = p.customer_id WHERE c.id = ?', [id]);
        res.render('clienteEdit', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows,
        });
    }
});
router.post('/updatecliente/:id',clientes.editarClientes);

router.get('/deletecliente/:id', clientes.eliminarCliente);




// terreno
router.get('/terreno', async(req, res) => {
    if (req.session.rol == 'usuario') {
        res.render('terrenoAlta', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol
        });
    } else if (req.session.rol == 'admin') {
        
        res.render('terrenoAlta', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
        });
    }
});

router.post('/terreno', terrenos.crearTerreno);

//VER CLIENTES
router.get('/terrenos', async(req, res) => {
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT *FROM land');
        res.render('terrenos', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            terrenos: rows
        });
    } else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT *FROM land');
        res.render('terrenos', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            terrenos: rows
        });
    }
});

router.get('/editar_terreno/:id', async(req, res) => {

    const id = req.params.id;
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT * FROM land WHERE id=?',[id]);
        res.render('terrenosEdit', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            terrenos: rows,
        });
    }
    else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT * FROM land WHERE id=?',[id]);
        res.render('terrenosEdit', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            terrenos: rows,
        });
    }
});

 router.post('/updateterreno/:id',terrenos.editarTerrenos);


//  ELIMINAR TERRENO
router.get('/deleteterreno/:id', terrenos.eliminarTerreno);


// venta
router.get('/ventas', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM customers');
    const [rows2] = await pool.query('SELECT * FROM land');
    // const [rows2] = await pool.query('SELECT * FROM land WHERE lote = ? AND manzana = ?');

    if (req.session.rol == 'usuario') {
        res.render('ventas', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows, //clientes
            terrenos: rows2, // terrenos
        });
    } else if (req.session.rol == 'admin') {
        res.render('ventas', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            clientes: rows, // Cambié 'ventas' por 'clientes'
            terrenos:rows2,
        });
    }
});


router.get('/terreno/:id', async (req, res) => {
    const terrenoId = req.params.id;
    const [rows] = await pool.query('SELECT * FROM land WHERE id = ?', [terrenoId]);

    if (rows.length > 0) {
        res.json(rows[0]); // Enviar datos del terreno al cliente
    } else {
        res.status(404).json({ error: 'Terreno no encontrado' });
    }
});

router.post('/venta', ventas.crearVenta)

//VER VENTAS

router.get('/view_venta', async(req, res) => {
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.lote, l.manzana, l.precio, s.fecha_venta, s.n_cuentas, s.ncuotas_pagadas, s.id, s.tipo_venta FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id;');
        res.render('venta', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            ventas: rows
        });
    } else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.lote, l.manzana, l.precio, s.fecha_venta, s.n_cuentas, s.ncuotas_pagadas, s.id, s.tipo_venta FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id;');
        res.render('venta', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            ventas: rows
        });
    }
});

//Editar
router.get('/venta/:id', async(req, res) => {

    const id = req.params.id;
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.lote, l.manzana, l.precio, l.id_interno, s.fecha_venta, s.n_cuentas, s.inicial, s.tipo_venta, s.cuotas, s.id FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id WHERE s.id = ?', [id]);

        res.render('ventaEdit', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            ventas: rows,
        });
    }
    else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.lote, l.manzana, l.precio, l.id_interno, s.fecha_venta, s.n_cuentas, s.inicial, s.tipo_venta, s.cuotas, s.id FROM sale s JOIN customers c ON s.id_customer = c.id JOIN land l ON s.id_land = l.id WHERE s.id = ?', [id]);
        res.render('ventaEdit', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            ventas: rows,
        });
    }
});


router.post('/updateventa/:id',ventas.editarVenta);


//  ELIMINAR TERRENO
router.get('/deleteventa/:id', ventas.eliminarVenta);


// tambien va usuario?? 
router.get('/credits', async(req, res) => {
 if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT *FROM users');
        res.render('usuarios', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            usuarios: rows
        });
    }
});


router.get('/abono',  async(req, res) => {
    
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT  c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.precio, l.estado, l.id_interno, s.n_cuentas,  s.deuda_restante,  s.id, s.tipo_venta, s.inicial, s.cuotas, MAX(a.cuotas_pagadas) as cuotas_pagadas,  (SELECT a2.cuotas_restantes FROM abonos a2 WHERE a2.id_sale = s.id AND a2.cuotas_pagadas = MAX(a.cuotas_pagadas)) as cuotas_restantes FROM   sale s  JOIN customers c ON s.id_customer = c.id  JOIN  abonos a ON a.id_sale = s.id JOIN   land l ON s.id_land = l.id  WHERE  s.tipo_venta = "credito" && l.estado = "proceso" GROUP BY  s.id ORDER BY  a.cuotas_pagadas DESC; ');
    
        res.render('abonos_vista', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            abonos: rows,
        });
    } else if (req.session.rol == 'admin') {
        // const [rows] = await pool.query('SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.precio, l.estado, l.id_interno, s.n_cuentas, s.deuda_restante, s.id, s.tipo_venta, s.inicial, s.cuotas, a.cuotas_pagadas, a.cuotas_restantes FROM sale s JOIN customers c ON s.id_customer = c.id JOIN  abonos a ON a.id_sale = s.id JOIN land l ON s.id_land = l.id  WHERE s.tipo_venta = "credito" && l.estado = "proceso"  ORDER BY a.cuotas_pagadas DESC LIMIT 1')
        const [rows] = await pool.query('SELECT  c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.precio, l.estado, l.id_interno, s.n_cuentas,  s.deuda_restante,  s.id, s.tipo_venta, s.inicial, s.cuotas, MAX(a.cuotas_pagadas) as cuotas_pagadas,  (SELECT a2.cuotas_restantes FROM abonos a2 WHERE a2.id_sale = s.id AND a2.cuotas_pagadas = MAX(a.cuotas_pagadas)) as cuotas_restantes FROM   sale s  JOIN customers c ON s.id_customer = c.id  JOIN  abonos a ON a.id_sale = s.id JOIN   land l ON s.id_land = l.id  WHERE  s.tipo_venta = "credito" && l.estado = "proceso" GROUP BY  s.id ORDER BY  a.cuotas_pagadas DESC; ');


        res.render('abonos_vista', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            abonos: rows,
        });
    }
});

router.get('/terrenos_pagados',  async(req, res) => {
    
    if (req.session.rol == 'usuario') {
        const [rows] = await pool.query('SELECT s.id AS sale_id, s.*, c.*, l.* FROM sale s JOIN land l ON s.id_land = l.id JOIN customers c ON s.id_customer = c.id WHERE l.estado = "pagado"');
    
        res.render('terrenos_pagados', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            pagados: rows,
        });
    } else if (req.session.rol == 'admin') {
        const [rows] = await pool.query('SELECT s.id AS sale_id, s.*, c.*, l.* FROM sale s JOIN land l ON s.id_land = l.id JOIN customers c ON s.id_customer = c.id WHERE l.estado = "pagado"');
        res.render('terrenos_pagados', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            pagados: rows,
        });
    }
});


// ABONOS VISTA FORMULARIO

router.get('/abonos/:id', async (req, res) => {

    const id = req.params.id;

    if (req.session.rol == 'usuario') {

        const [rows]=await pool.query(`
        SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.precio, l.id_interno, s.n_cuentas, s.id, s.tipo_venta, s.inicial, 
        s.deuda_restante, s.cuotas, a.cuotas_pagadas, a.cuotas_restantes 
        FROM sale s 
        JOIN customers c ON s.id_customer = c.id 
        JOIN abonos a ON a.id_sale = s.id 
        JOIN land l ON s.id_land = l.id 
        WHERE s.tipo_venta = "credito" && s.id=${id} ORDER BY cuotas_restantes ASC LIMIT 1`);        
        res.render('abonos_formulario', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            abonos: rows,
     
  
        });
    } else if (req.session.rol == 'admin') {
        // const [rows] = await pool.query('SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.precio, l.id_interno, s.n_cuentas, s.id, s.tipo_venta, s.inicial, s.deuda_restante, s.cuotas, a.cuotas_pagadas, a.cuotas_restantes FROM sale s JOIN customers c ON s.id_customer = c.id JOIN abonos a ON a.id_sale = s.id JOIN land l ON s.id_land = l.id WHERE s.tipo_venta = "credito" && s.id=?;', [id]);
       const [rows]=await pool.query(`
       SELECT c.name as customer_name, c.a_paterno as customer_paterno, c.a_materno as customer_materno, l.precio, l.id_interno, s.n_cuentas, s.id, s.tipo_venta, s.inicial, 
       s.deuda_restante, s.cuotas, a.cuotas_pagadas, a.cuotas_restantes 
       FROM sale s 
       JOIN customers c ON s.id_customer = c.id 
       JOIN abonos a ON a.id_sale = s.id 
       JOIN land l ON s.id_land = l.id 
       WHERE s.tipo_venta = "credito" && s.id=${id} ORDER BY cuotas_restantes ASC LIMIT 1`);

       res.render('abonos_formulario', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            abonos: rows,
       
        });
    }
});


// crear abono

router.post('/crear_abonos/:id',abonos.crearAbonos);

router.get('/reporte/:id',pdf.crearPdf);

router.get('/contado/',pdf.contado);

router.get('/pagados/',pdf.pagados);


router.get('/proceso/',pdf.proceso);

router.get('/disponibles/',pdf.disponibles);
router.get('/finalizacion/:id',pdf.finiquito);




// REPORTE GENERAL






  


export default router;