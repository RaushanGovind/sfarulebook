const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // SFARB01, SFARB02, etc. (Internal System ID)
    username: { type: String, required: true, unique: true },
    password: { type: String },
    fullName: { type: String },
    headquarter: { type: String },
    cmsId: { type: String, unique: true, sparse: true }, // e.g., ABC1234
    sfaId: { type: String, unique: true, sparse: true }, // e.g., SFA1234
    role: { type: String, default: 'member' } // 'admin' or 'member'
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
