const Game = require('../schemas/gameSchema');
const User = require('../schemas/userSchema');
const Achievement = require('../schemas/achievementSchema');
const mongoose = require('mongoose');

exports.createGame = async (req, res) => {
	try {
		const newGame = new Game(req.body);
		const savedGame = await newGame.save();	
		await checkAndAddAchievements(savedGame.user_id, savedGame);
		res.status(201).send(savedGame);
	} catch (error) {
		res.status(400).send(error);
	}
};

async function checkAndAddAchievements(userId, gameData) {
	const user = await User.findById(userId);
	let newAchievements = [];

    // Verificar y otorgar logros relacionados con la partida
    const achievementsToCheck = [
        { name: "Rookie Adventurer", condition: true },
        { name: "Seasoned Fighter", condition: user.games_completed >= 10 },
        { name: "Master Explorer", condition: user.games_completed >= 25 },
        { name: "Speed Runner", condition: gameData.time_spent < 600 },
        { name: "Gold Digger", condition: user.gold_collected >= 1000 },
        { name: "Heartbreaker", condition: user.hearts_collected >= 50 },
        { name: "Fly Exterminator", condition: user.monsters_killed[0] >= 500 },
        { name: "Meat Grinder", condition: user.monsters_killed[1] >= 200 },
        { name: "Worm Slayer", condition: user.monsters_killed[2] >= 150 },
        { name: "Humanitarian Visionary", condition: user.monsters_killed[3] >= 100 },
        { name: "Legendary Survivor", condition: gameData.health_remaining < 10 },
        { name: "Monster Collector", condition: user.monsters_killed_total >= 1000 },
        { name: "Monster Hunter", condition: user.monsters_killed_total >= 5000 },
        { name: "Monster Slayer", condition: user.monsters_killed_total >= 10000 },
        { name: "Monster Conqueror", condition: user.monsters_killed_total >= 20000 }
    ];

    for (const achievementData of achievementsToCheck) {
        const achievement = await Achievement.findOne({ name: achievementData.name });
        if (achievement && achievementData.condition && !user.achievements.includes(achievement._id)) {
            newAchievements.push(achievement._id);
            achievement.obtenido += 1;
            user.points += achievement.points;
            await Promise.all([achievement.save(), user.save()]);
        }
    }


	/*achievements.forEach(achievement => {
	
		
		if (achievement.name == "Logro Para Probar" && gameData.level >= 1) {
			if (!user.achievements.includes(achievement.achievement)) {

				newAchievements.push(new mongoose.Types.ObjectId(achievement._id));
				
				achievement.obtenido += 1;
				user.points += achievement.points;
				achievement.save(); // Asegúrate de que el logro es un documento que puedes guardar
            	user.save();
			}
		}


	});*/
    console.log("Achievements to add:", newAchievements);

    if (newAchievements.length > 0) {
        const achievementsToAdd = newAchievements.map(id => ({ achievement: id }));
        
        await User.findByIdAndUpdate(userId, {
            $push: { achievements: { $each: achievementsToAdd } }
        });
    }
    
}

async function updateUserMonsterKills(userId, monsters) {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        // Asegurar que el array monsters_killed tiene la longitud correcta
        user.monsters_killed = user.monsters_killed.map((killCount, index) => killCount + (monsters[index] || 0));
        await user.save();
    } catch (error) {
        console.error("Error al actualizar los conteos de monstruos:", error);
    }
}

exports.createGameUser = async (req, res) => {
    const { user_id, level, wave, time_spent, monsters, total_gold,total_hearts, date } = req.body;

    try {
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).send({ message: "Usuario no encontrado." });
        }

        const newGame = new Game({
            user_id,
            level,
            wave,
            time_spent,
            monsters,
            total_gold,
			total_hearts,
            date
        });

		

        const savedGame = await newGame.save();
        await updateUserMonsterKills(user_id, monsters);
		await checkAndAddAchievements(savedGame.user_id, savedGame);
        return res.status(201).send({ message: "Partida creada con éxito.", gameId: savedGame._id });
    } catch (error) {
        console.error("Error al crear la partida:", error);
        return res.status(500).send({ message: "Error al procesar la solicitud de creación de partida.", error });
    }
};

exports.findGamesByUser = async (req, res) => {
    try {
        const games = await Game.find({ user_id: req.params.userId }).sort({ date: -1 });
        res.status(200).send(games);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getGameDetails = async (req, res) => {
	try {
		const game = await Game.findById(req.params.id);
		if (!game) {
			res.status(404).send('Game not found');
		} else {
			res.status(200).send(game);
		}
	} catch (error) {
		res.status(500).send(error);
	}
};

exports.deleteGame = async (req, res) => {
	try {
		const game = await Game.findByIdAndDelete(req.params.id);
		if (!game) {
			res.status(404).send('Game not found');
		} else {
			res.status(204).send('Game deleted successfully');
		}
	} catch (error) {
		res.status(500).send(error);
	}
};

exports.getRecentGames = async (req, res) => {
    try {
        const recentGames = await Game.aggregate([
            {
                $lookup: {
                    from: 'users',  
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'  
            },
            {
                $sort: { 'date': -1 }  
            },
            {
                $limit: 4 
            },
            {
                $project: {  
                    _id: 1,
                    level: 1,
                    wave: 1,
                    time_spent: 1,
                    total_gold: 1,
                    total_hearts: 1,
                    date: 1,
                    username: '$userDetails.username' 
                }
            }
        ]);
        res.status(200).send(recentGames);
    } catch (error) {
        console.error("Error retrieving recent games:", error);
        res.status(500).send({ message: "Error retrieving recent games", error });
    }
};


exports.getTop15 = async (req, res) => {
	const sortIndex = parseInt(req.query.sortIndex); 
    let sort = {};
    switch (sortIndex) {
        case 1:
            sort = { 'level': -1, 'wave': -1 }; 
            break;
        case 2:
            sort = { 'total_gold': -1 }; 
            break;
        case 3:
            sort = { 'total_hearts': -1 }; 
            break;
        case 4:
            sort = { 'time_spent': 1 }; 
            break;
        default:
            sort = { 'level': -1, 'wave': -1 }; 
            break;
    }
	try {
	
		const topScores = await Game.aggregate([
            {
                $lookup: {
                    from: 'users',  
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $sort: sort
            },
            {
                $limit: 15  
            },
            {
                $project: {
                    _id: 0,
                    username: '$userDetails.username', 
                    level: 1,
                    wave: 1,
                    time_spent: 1,
                    total_gold: 1,
					total_hearts: 1,
		    		profile_image: '$userDetails.profile_image'
                }
            }
        ]);
	res.status(200).json(topScores);
	} catch (error) {
		res.status(500).send({ message: "Error retrieving top 15 games", error: error });
	}
};

exports.getGameStats = async (req, res) => {
	try {
		const games = await Game.find();

		let totalMonstersKilled = [0, 0, 0, 0, 0];

		games.forEach(game => {
			game.monsters.forEach((count, i) => {
				totalMonstersKilled[i] += count; // Suma directamente en la posición correspondiente
			});
		});

		const stats = await Game.aggregate([
			{
				$addFields: {
					adjustedWave: { $add: ["$wave", { $multiply: ["$level", 10] }] }
				}
			},
			{
				$group: {
					_id: null,
					totalGamesPlayed: { $sum: 1 },
					averageLevel: { $avg: "$level" },
					averageWave: { $avg: "$adjustedWave" },
					averageTimeSpent: { $avg: "$time_spent" },
					maxTimeSpent: { $max: "$time_spent" },
					minTimeSpent: { $min: "$time_spent" }
				}
			},
		]);

		const statsFinales = {
			...stats[0],
			totalMonstersKilled: totalMonstersKilled
		  };

		res.status(200).send(statsFinales);
	} catch (error) {
		res.status(500).send({ message: "Error retrieving game statistics", error: error });
	}
};

