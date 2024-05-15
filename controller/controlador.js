import { pool} from '../database/db.js';
import bcrypt from 'bcryptjs';

const usernameRegex = /^[a-zA-Z]{5,20}$/;
 const nombreRegex = /^[A-Za-zÁ-Úá-ú\s]+$/;
 const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;



export const login = async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;

    if (user && pass) {
        try {
            const [results] = await pool.query('SELECT * FROM users WHERE user = ?', [user]);

            if (results.length == 0 || !(await bcrypt.compare(pass, results[0].pass))) {
                console.log('Usuario y/o contraseña incorrectos');
                return res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Usuario y/o contraseña incorrectos",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            } else {

                    req.session.loggedin = true;
                    req.session.name = results[0].name;
                    req.session.rol = results[0].id_rol;
                    req.session.userId = results[0].id;

                    if (req.session.rol == 2) {
                        res.render('login', {
                            alert: true,
                            alertTitle: "Usuario normal:",
                            alertMessage: "Usuario",
                            alertIcon: 'success',
                            showConfirmButton: false,
                            timer: 3000,
                            ruta: ''
                        });
                    } else {
                        res.render('login', {
                            alert: true,
                            alertTitle: "Usuario",
                            alertMessage: "Administrador",
                            alertIcon: 'success',
                            showConfirmButton: false,
                            timer: 3000,
                            ruta: ''
                        });
                    }
            }
        } catch (error) {
            console.log('Error al ejecutar la consulta SQL:', error);
            return res.status(500).render('500');
        }
    } else {
        res.render('login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "Por favor ingrese un usuario y/o contraseña",
            alertIcon: 'warning',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });
        res.end();
    }
}




export const perfil = async (req, res) => {
  // Capturando el ID de sesión
          const userId = req.session.userId;

    if (req.session.rolid == '2') {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

        res.render('profile', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            usuarios: rows,
        });
    } else if (req.session.rolid == '1') {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

        res.render('profile', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            usuarios: rows,
        });
    }
};

export const password = async (req, res) => {
    const { pass, newpass } = req.body;

    const userId = req.user.id; 

    if (req.session.rolid === '2') {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

        if (!pass || !newpass) {
            return res.render('profile', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rol,
                usuarios: rows,
            });
        }
            // Obtener la contraseña actual del usuario desde la base de datos
            const storedPassword = rows[0].pass;

            // Comparar la contraseña actual con la que el usuario está proporcionando
            const passwordMatch = await bcrypt.compare(pass, storedPassword);

            if (!passwordMatch) {
                return res.render('profile', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Contraseña vieja error!",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: '/', 
                    login: true,
                    roluser: false,
                    name: req.session.name,
                    rol: req.session.rol,
                    usuarios: rows,
                });
            } else {
                // La contraseña actual es correcta, puedes proceder con el cambio de contraseña
                const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;
                if (!passwordRegex.test(newpass)) {
                    return res.render('profile', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "La contraseña debe tener al menos 8 caracteres y contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', 
                        login: true,
                        roluser: false,
                        name: req.session.name,
                        rol: req.session.rolid,
                        usuarios: rows,
                    });
                }
         const passwordHash = await bcrypt.hash(newpass, 8);

         await pool.query('UPDATE users SET pass = ? WHERE id = ?', [passwordHash, userId]);
         
               res.render('profile', {
                alert: true,
                alertTitle: "Contraseña",
                alertMessage: "Cambio Exitoso!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: false,
                name: req.session.name,
                rol: req.session.rolid,
                usuarios: rows,
            });

              
            }

        } catch (error) {
            console.error('Error al ejecutar la consulta SQL:', error);
            return res.status(500).render('500');
        
        }
        } else if (req.session.rol === '1') {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
 // Verificar si algún campo está vacío
        if (!pass || !newpass) {
            return res.render('profile', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios: rows,
            });
        }
            const storedPassword = rows[0].pass;

            const passwordMatch = await bcrypt.compare(pass, storedPassword);

            if (!passwordMatch) {
                return res.render('profile', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Contraseña vieja error!",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: '/', 
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    usuarios: rows,
                });
            } else {
                const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;
                if (!passwordRegex.test(newpass)) {
                    return res.render('profile', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "La contraseña debe tener al menos 8 caracteres y contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.",
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3500,
                        ruta: '/', 
                        login: true,
                        roluser: true,
                        name: req.session.name,
                        rol: req.session.rol,
                        usuarios: rows,
                    });
                }
         const passwordHash = await bcrypt.hash(newpass, 8);

         await pool.query('UPDATE users SET pass = ? WHERE id = ?', [passwordHash, userId]);
         
               res.render('profile', {
                alert: true,
                alertTitle: "Contraseña",
                alertMessage: "Cambio Exitoso!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios: rows,
            });

              
            }

        } catch (error) {
            console.error('Error al ejecutar la consulta SQL:', error);
            return res.status(500).render('500');

        }
    }
}


export const register=  async(req, res) => {
    try {
        if (req.session.rol == '1') {
        const { user, name, rol, pass } = req.body;
        
        if (!user || !name || !rol || !pass) {
            return res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
        const existingUser = await pool.query('SELECT * FROM users WHERE user = ?', user);
        // console.log(existingUser)
        if (existingUser[0].length > 0) {
            return res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El usuario ya existe. Por favor, elija otro nombre de usuario.",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            });
        }
  
        if(!usernameRegex.test(user)){
            return res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El usuario no debe llevar caracteres especiales o números",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            }); 
        }
        
        if(!nombreRegex.test(name)){
            return res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El nombre no debe llevar caracteres especiales.",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
            }); 
        }


     
         if (!passwordRegex.test(pass)) {
             return res.render('register', {
                 alert: true,
                 alertTitle: "Error",
                 alertMessage: "La contraseña debe tener al menos 8 caracteres y contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.",
                 alertIcon: 'error',
                 showConfirmButton: true,
                 timer: false,
                 ruta: '/', 
                 login: true,
                 roluser: true,
                 name: req.session.name,
                 rol: req.session.rol,
             });
         }

        const passwordHash = await bcrypt.hash(pass, 8);
        
        await pool.query('INSERT INTO users SET ?', { user, name, id_rol: rol, pass: passwordHash });
        const [rows] = await pool.query('SELECT * FROM rol');
        
        res.render('register', {
            alert: true,
            alertTitle: "Registro",
            alertMessage: "¡Registro Exitoso!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 1500,
            ruta: '/', 
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            roles: rows,
        });
    }else{
        res.render('register', {
            alert: true,
            alertTitle: "ERROR",
            alertMessage: "NO TIENES ACCESO!",
            alertIcon: 'error',
            showConfirmButton: false,
            timer: 1500,
            ruta: '/', 
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
            roles: rows,
        });
    }
    } catch (error) {
        console.error(error);
        return res.status(500).render('500');
    }
}


export const usuarios=  async(req, res) => {
    if (req.session.rol == '2') {
        res.render('denegado', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol
        });
    } else if (req.session.rol == '1') {
        const [rows] = await pool.query('SELECT *FROM users');
        res.render('usuarios', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            usuarios: rows
        });
    }
}
export const editarUsuario = async (req, res) => {
    const id = req.params.id;
    let usuariorolid;

    const [rows] = await pool.query('SELECT * FROM users WHERE id=?',[id]);
    const [rows2] = await pool.query('SELECT * FROM rol');
        rows.forEach(async usuario => {
            return usuariorolid =  usuario.id_rol;
            
             
        });    
         const [usuariorol] = await pool.query('SELECT * FROM rol WHERE id_rol = ?', [usuariorolid]);
try {
    if (req.session.rol == '1') {
        const { user, name, rol } = req.body;
        console.log(req.body)

        if (!user || !name || !rol) {
            return res.render('editar', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Debes rellenar todos los campos!",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios:rows,
                roles: rows2,
                usuariorol: usuariorol,
            });
        }

        
        const usuarioModificado = user !== rows[0].user;

        // Si el nombre de usuario ha sido modificado, verificar si ya existe en la base de datos
        if (usuarioModificado) {
            const existingUser = await pool.query('SELECT * FROM users WHERE user = ?', [user]);
            if (existingUser[0].length > 0) {
                return res.render('editar', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "El usuario ya existe. Por favor, elija otro nombre de usuario.",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: '/', 
                    login: true,
                    roluser: true,
                    name: req.session.name,
                    rol: req.session.rol,
                    usuarios:rows,
                    roles: rows2,
                    usuariorol: usuariorol,
                });
            }
        }
      
        if(!usernameRegex.test(user)){
            return res.render('editar', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El usuario no debe llevar caracteres especiales o números",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios:rows,
                roles: rows2,
                usuariorol: usuariorol,

            }); 
        }
        
        if(!nombreRegex.test(name)){
            return res.render('editar', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El nombre no debe llevar caracteres especiales",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios:rows,
                roles: rows2,
                usuariorol: usuariorol,

            }); 
        }

        // Si el usuario no ha sido modificado o no existe en la base de datos, continuar con la actualización
        const [result] = await pool.query('UPDATE users SET name = IFNULL (?, name), user = IFNULL (?, user), id_rol = IFNULL (?, id_rol) WHERE id = ?', [name, user, rol, id]);
      
        // Verificar si la actualización fue exitosa
        if (result && result.affectedRows > 0) {
            const [rows] = await pool.query('SELECT * FROM users');
            res.render('usuarios', {
                alert: true,
                alertTitle: "Actualización",
                alertMessage: "¡Actualización Exitosa!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios: rows,
                ruta: 'usuarios',
                roles: rows2,
                usuariorol: usuariorol,
            });
        } else {
            // Si no se actualizó ninguna fila, mostrar un mensaje de error
            res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "No se pudo actualizar el usuario.",
                alertIcon: 'error',
                showConfirmButton: false,
                timer: 1500,
                ruta: '/', 
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios:rows,
                roles: rows2,
                usuariorol: usuariorol,
            });
        }

    } else if (req.session.rol == '2') {
        res.render('denegado', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol,
        });
    }
}catch{
    return res.status(500).render('500');
    //console.error(error); catch(error) en caso de haber error poner

}
}

export const datosUsuarioid = async (req, res) =>{
    const id = req.params.id;
    let usuariorolid;
    let usuariosrolid;

        const [usuarios] = await pool.query('SELECT * FROM users '); //all users data 
        const [rows] = await pool.query('SELECT * FROM users WHERE id=?',[id]);//especific user data
        const [rows2] = await pool.query('SELECT * FROM rol');//all rol data
        rows.forEach(async usuario => {
            return usuariorolid =  usuario.id_rol;    //export data rol     
        });
        
        
         const [usuariorol] = await pool.query('SELECT * FROM rol WHERE id_rol = ?', [usuariorolid]);
       
       
        res.render('editar', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            usuarios: rows,
            roles: rows2,
            usuariorol: usuariorol,
        });
}

export const datosUsuario = async (req, res) =>{
    let usuariorol;

        const [usuarios] = await pool.query('SELECT * FROM users '); //all users data 
        const [rows2] = await pool.query('SELECT * FROM rol');//all rol data
        usuarios.forEach(async usuario => {
        const usuariorolid =  usuario.id_rol; 
        return usuariorol = await pool.query('SELECT * FROM rol WHERE id_rol = ?', [usuariorolid]);
        });
        
         const [usuariosroles] = usuariorol;
       
        res.render('usuarios', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol,
            usuarios: usuarios,
            roles: rows2,
            usuariosroles: usuariorol,
        });
}

export const eliminarUsuario = async (req, res) => {
    try {
        if (req.session.rol == '1') {
            const { id } = req.params;
            const [result]=await pool.query('DELETE FROM users WHERE id=?',[id])
            //otro if de si es mayor a 0?
            if (result && result.affectedRows > 0) {
                const [rows]=await pool.query('SELECT * FROM users');
            res.render('usuarios', {
                alert: true,
                alertTitle: "Eliminado",
                alertMessage: "¡Eliminado Exitoso",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                login: true,
                roluser: true,
                name: req.session.name,
                rol: req.session.rol,
                usuarios:rows,
                ruta:'usuarios'
            });
        }else{

        }
    } else if (req.session.rol == '2'){
        res.render('denegado', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol
        });
    }
    
    } catch (error) {
        return res.status(500).render('500');

    }
    
        }


export const home =async (req, res) =>{
     // Validación de sesión
     if (req.session.loggedin) {
        
        if (req.session.rol == '2') {
          res.render('home', {
            login: true,
            roluser: false,
            name: req.session.name,
            rol: req.session.rol
          });
        } else if (req.session.rol == '1') {
       
          res.render('home', {
            login: true,
            roluser: true,
            name: req.session.name,
            rol: req.session.rol
          });
        }
      } else {
        res.render('terrenos_index', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    
      }
}


export const methods = {
    register,
    login,
    usuarios,
    editarUsuario,
    datosUsuario,
    datosUsuarioid,
    eliminarUsuario,
    perfil,
    password,
    home,
  }



