const User = require('../schemas/userSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')  // Asegúrate de que esta carpeta exista
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage }).single('profile_image');

exports.uploadProfileImage = (req, res) => {
    try {
        // Manejar la carga de archivos
        upload(req, res, function(err) {
            if (err instanceof multer.MulterError) {
                // Manejar errores de Multer
                return res.status(500).json(err);
            } else if (err) {
                // Manejar otros errores
                return res.status(500).json(err);
            }

            // Si la carga de archivos fue exitosa, responder con un mensaje de éxito
            return res.status(200).json({ message: 'File uploaded successfully', filePath: req.file.path });
        });
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.createUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
        });
        const user = await newUser.save();

        const token = jwt.sign({ _id: user._id }, 'tu_secreto_jwt_aqui', { expiresIn: '24h' });

        // Guardar el userID en la sesión
        req.session.userId = user._id;

        return res.status(200).send({ message: "Inicio de sesión exitoso.", userId: user._id });
    } catch (error) {
        if (error.code === 11000) { // Código de error para violaciones de campos únicos
            res.status(409).send({ message: "Email or username already exists." });
        } else {
            res.status(400).send(error);
        }
    }
};

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send({ message: "Usuario no encontrado." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: "Contraseña incorrecta." });
        }
	
	        // Crear token JWT
        const token = jwt.sign({ _id: user._id }, 'tu_secreto_jwt_aqui', { expiresIn: '24h' });

        // Guardar el userID en la sesión
        req.session.userId = user._id;

        return res.status(200).send({ message: "Inicio de sesión exitoso.", userId: user._id });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return res.status(500).send({ message: "Error al procesar la solicitud de inicio de sesión.", error });
    }
};


// sessionController.js
exports.verificarSesion = (req, res) => {
    if (req.session.userId) {
        res.send({ message: "Sesión activa", userId: req.session.userId });
    } else {
        res.status(401).send("No autenticado");
    }
};

exports.logoutUser = (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).send({ message: "Error al intentar cerrar la sesión." });
            } else {
                res.send({ message: "Sesión cerrada exitosamente." });
            }
        });
    } else {
        res.status(200).send({ message: "No se encontró una sesión activa." });
    }
};

exports.checkEmailExists = async (req, res) => {
    const { email } = req.body;
    try {
        const emailRegex = new RegExp(`^${email}$`, 'i');
        const user = await User.findOne({ email: emailRegex });
        if (user) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (err) {
        res.status(500).json({ message: "Error checking email", error: err });
    }
};

exports.checkUsernameExists = async (req, res) => {
    const { username } = req.body;
    try {
        const usernameRegex = new RegExp(`^${username}$`, 'i');
        const user = await User.findOne({ username: usernameRegex });
        if (user) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (err) {
        res.status(500).json({ message: "Error checking username", error: err });
    }
};

exports.findAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.findUserById = async (req, res) => {
    const userId = req.params.id;
    
    try {
        const user = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'achievements',
                    localField: 'achievements',
                    foreignField: '_id',
                    as: 'achievementsDetails'
                }
            },
            {
                $project: {
                    username: 1,
                    email: 1,
                    profile_image: 1,
                    achievements: {
                        $map: {
                            input: "$achievementsDetails",
                            as: "achievement",
                            in: "$$achievement.name"
                        }
                    },
                    birth_date: 1,
                    country: 1,
                    nickname: 1,
                    desc: 1
                }
            }
        ]);

        if (user.length === 0) {
            return res.status(404).send({ message: "User not found" + userId });
        } else {
            return res.status(200).send(user[0]); // Devuelve el primer elemento, que es el documento del usuario
        }
    } catch (error) {
        console.error("Error retrieving user:", error);
        return res.status(500).send({ message: "Error retrieving user", error: error });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            res.status(404).send('User not found');
        } else {
            res.status(200).send(user);
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).send('User not found');
        } else {
            res.status(204).send('User deleted successfully');
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { searchQuery } = req.query;
        const query = {
            $or: [
                { username: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ]
        };
        const users = await User.find(query).sort({ points: 1 });
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ message: "Error al buscar usuarios", error: error });
    }
};

exports.searchUsersMonster= async (req, res) => {
    const monsterIndex = req.query.monsterIndex;  // Obtener el índice del monstruo desde la consulta

    // Verificar que el índice del monstruo es un número válido y dentro del rango permitido
    if (!monsterIndex || isNaN(monsterIndex) || monsterIndex < 0 || monsterIndex >= 5) {
        return res.status(400).send({ message: "Índice de monstruo inválido. Debe ser entre 0 y 4." });
    }

    try {
        const users = await User.find({})
            .sort({ [`monsters_killed.${monsterIndex}`]: -1 }) // Ordenar por el conteo de monstruos del índice especificado
            .exec();

        res.status(200).json(users);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).send({ message: "Error al buscar usuarios", error });
    }
};


