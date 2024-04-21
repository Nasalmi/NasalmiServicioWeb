const Game = require('../schemas/gameSchema');
const User = require('../schemas/userSchema');
const Achievement = require('../schemas/achievementSchema');

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
	const achievements = await Achievement.find();
	let newAchievements = [];

	achievements.forEach(achievement => {
		if (achievement.name == "Cazador de Zombies" && gameData.monsters_killed['zombies'] >= 50) {
			if (!user.achievements.includes(achievement._id)) {
				newAchievements.push(achievement._id);
			}
		}
		
		if (achievement.name == "Primerizo" && gameData.level >= 1) {
			if (!user.achievements.includes(achievement._id)) {
				newAchievements.push(achievement._id);
			}
		}

		if (achievement.nam == "Maestro del Juego" && gameData.level >= 10) {
			if (!user.achievements.includes(achievement._id)) {
				newAchievements.push(achievement._id);
			}
		}

		if (achievement.name == "Acaparador de Oro" && gameData.total_gold >= 1000) {
			if (!user.achievements.includes(achievement._id)) {
				newAchievements.push(achievement._id);
			}
		}

		if (achievement.name == "Destructor de Fantasmas" && gameData.monsters_killed['ghosts'] >= 30) {
			if (!user.achievements.includes(achievement._id)) {
				newAchievements.push(achievement._id);
			}
		}
	});

	if (newAchievements.length > 0) {
		await User.findByIdAndUpdate(userId, {
			$push: { achievements: { $each: newAchievements } }
		});
	}
}

exports.findGamesByUser = async (req, res) => {
	try {
		const games = await Game.find({ user_id: req.params.userId });
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
		const recentGames = await Game.find({}).sort({ date: -1 }).limit(4);
		res.status(200).send(recentGames);
	} catch (error) {
		res.status(500).send({ message: "Error retrieving recent games", error: error });
	}
};

exports.getGameStats = async (req, res) => {
	try {
		const games = await Game.find();

		let totalMonstersKilled = {};

		games.forEach(game => {
			game.monsters_killed.forEach((count, type) => {  // Usamos forEach para iterar sobre el Map
				if (totalMonstersKilled[type]) {
					totalMonstersKilled[type] += count;
				} else {
					totalMonstersKilled[type] = count;
				}
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

