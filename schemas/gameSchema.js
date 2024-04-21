const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: Number, required: true },
    wave: { type: Number, required: true },
    time_spent: { type: Number, required: true },
    monsters_killed: { type: Map, of: Number, required: true },  // Clave es el tipo de monstruo y valor es la cantidad
    total_gold: { type: Number, required: true },
    date: { type: Date, default: Date.now }
},
    {
        collection: 'games'
    });

module.exports = mongoose.model('Game', GameSchema);
