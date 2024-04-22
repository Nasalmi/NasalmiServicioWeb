const User = require('../schemas/userSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.createUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            profile_image: req.body.profile_image,
            achievements: req.body.achievements,
            settings: req.body.settings
        });
        await newUser.save();
        res.status(201).send({ message: "User created successfully!", userId: newUser._id });
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

        return res.status(200).send({ message: "Inicio de sesión exitoso.", userId: user._id });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return res.status(500).send({ message: "Error al procesar la solicitud de inicio de sesión.", error });
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
    console.log("UserID:", userId); // Para depuración
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
                    settings: 1
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
        const users = await User.find(query);
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ message: "Error al buscar usuarios", error: error });
    }
};

