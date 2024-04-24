const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const gameController = require('./controllers/gameController');
const achievementController = require('./controllers/achievementController');

// Rutas para la colección de usuarios
router.post('/users', userController.createUser);
router.get('/users', userController.findAllUsers);
router.get('/users/search', userController.searchUsers);
router.get('/users/searchmonster', userController.searchUsersMonster);
router.get('/users/:id', userController.findUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

router.post('/validMail', userController.checkEmailExists);
router.post('/validName', userController.checkUsernameExists);

router.post('/upload', userController.uploadProfileImage);

router.post('/login', userController.loginUser);
router.get('/verificar-sesion', userController.verificarSesion);
router.get('/logout', userController.logoutUser);


// Rutas para las partidas
router.post('/games', gameController.createGame);
router.get('/games/user/:userId', gameController.findGamesByUser);
router.get('/games/recent', gameController.getRecentGames);
router.get('/games/stats', gameController.getGameStats);
router.get('/games/top15', gameController.getTop15);
router.post('/gameUser', gameController.createGameUser);
router.get('/games/:id', gameController.getGameDetails);
router.delete('/games/:id', gameController.deleteGame);


// Rutas para los logros
router.post('/achievements', achievementController.createAchievement);
router.get('/achievements', achievementController.getAllAchievements);
router.get('/achievements/missing/:userId', achievementController.getMissingAchievements);
router.get('/achievements/:id', achievementController.getAchievement);
router.put('/achievements/:id', achievementController.updateAchievement);
router.delete('/achievements/:id', achievementController.deleteAchievement);

module.exports = router;
