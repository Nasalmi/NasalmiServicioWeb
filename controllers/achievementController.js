const Achievement = require('../schemas/achievementSchema');
const User = require('../schemas/userSchema');

exports.createAchievement = async (req, res) => {
    try {
        const newAchievement = new Achievement(req.body);
        await newAchievement.save();
        res.status(201).send(newAchievement);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.getAllAchievements = async (req, res) => {
    const sortIndex = parseInt(req.query.sortIndex); 

    let sortKey = 'name';
    switch(sortIndex) {
        case 1:
            sortKey = 'points';
            break;
        case 2:
            sortKey = 'obtenido';
            break;
        case 3:
            sortKey = 'name';
            break;
        default:
            sortKey = 'name';
            break;
    }

    try {
        const achievements = await Achievement.find({}).sort({ [sortKey]: 1 });
        res.status(200).json(achievements);
    } catch (error) {
        console.error("Error al obtener logros ordenados:", error);
        res.status(500).send({ message: "Error al procesar la solicitud", error });
    }
};

exports.getAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
        if (!achievement) {
            res.status(404).send("Achievement not found");
        } else {
            res.status(200).send(achievement);
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.updateAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!achievement) {
            res.status(404).send("Achievement not found");
        } else {
            res.status(200).send(achievement);
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.deleteAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndDelete(req.params.id);
        if (!achievement) {
            res.status(404).send("Achievement not found");
        } else {
            res.status(204).send();
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getMissingAchievements = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const achievements = await Achievement.find();
        const achievedIds = new Set(user.achievements.map(ach => ach.toString()));  // Asumiendo que `achievements` es un array de ObjectIds en el User
        const missingAchievements = achievements.filter(ach => !achievedIds.has(ach._id.toString()));

        res.status(200).send(missingAchievements);
    } catch (error) {
        res.status(500).send({ message: "Error retrieving missing achievements", error: error });
    }
};
