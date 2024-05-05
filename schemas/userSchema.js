const { decodeBase64 } = require('bcryptjs');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profile_image: { type: String, default: 'public/uploads/missing-profile.png' }, // Valor predeterminado agregado aquí
    achievements: [{
        achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
        obtainedAt: { type: Date, default: Date.now }
    }],
    birth_date: { type: Date },
    country: { type: String },
    nickname: { type: String },
    desc: { type: String },
    points: { type: Number, default: 0 },
    monsters_killed: {
        type: [Number],
        default: [0, 0, 0, 0, 0]
    }
}, {
    collection: 'users'
});

UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', UserSchema);
