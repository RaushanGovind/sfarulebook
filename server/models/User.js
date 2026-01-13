const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // SFARB01, SFARB02, etc.
    username: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, default: 'member' } // 'admin' or 'member'
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
