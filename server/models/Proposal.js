import mongoose from 'mongoose';

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
    // draft: Private to admins, editable
    // open: Visible to all, voting enabled
    // approved: Consensus met, ready to publish
    // published: Live in the rules book
    status: { type: String, enum: ['draft', 'open', 'approved', 'rejected', 'published'], default: 'draft' },
    approvals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Admins who approved
    consents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Members who agreed (voting)

    adminCountAtCreation: { type: Number, default: 1 } // To calculate percentage if needed
}, { timestamps: true });

export default mongoose.model('Proposal', ProposalSchema);
