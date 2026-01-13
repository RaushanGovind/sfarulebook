const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
    originalLessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null }, // Null if new lesson
    action: { type: String, enum: ['add', 'edit', 'delete'], required: true },

    // Data for the lesson (if add/edit)
    level: { type: String },
    title: {
        en: { type: String },
        hi: { type: String }
    },
    content: {
        en: { type: String },
        hi: { type: String }
    },
    order: { type: Number },

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Workflow
    status: { type: String, enum: ['draft', 'approved', 'rejected'], default: 'draft' },
    approvals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Admins who approved
    consents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Members who agreed (voting)

    adminCountAtCreation: { type: Number, default: 1 } // To calculate percentage if needed
}, { timestamps: true });

module.exports = mongoose.model('Proposal', ProposalSchema);
