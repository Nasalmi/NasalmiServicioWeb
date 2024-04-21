const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, default: '' }  // Opcional: URL a una imagen representativa
},
{collection: 'achievements'});

module.exports = mongoose.model('Achievement', AchievementSchema);
