const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profile_image: { type: String, default: '' },
    achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
    settings: { type: Map, of: String }
}, {
    collection: 'users'
});

UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', UserSchema);
