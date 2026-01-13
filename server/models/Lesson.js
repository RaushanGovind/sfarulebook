const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
    level: { type: String, required: true },
    title: {
        en: { type: String, required: true },
        hi: { type: String, default: '' }
    },
    content: {
        en: { type: String, default: '' },
        hi: { type: String, default: '' }
    },
    order: { type: Number, default: 0 },
    history: [{
        content: {
            en: String,
            hi: String
        },
        title: {
            en: String,
            hi: String
        },
        approvedAt: { type: Date, default: Date.now },
        changeSummary: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Lesson', LessonSchema);
