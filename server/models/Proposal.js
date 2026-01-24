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
    // draft: Personal workspace (Author only)
    // internal_review: Proposed for Admin Approval (Visible to all Admins, Remarks/Ratings enabled)
    // open: Visible to all, voting enabled
    // approved: Consensus met, ready to publish
    // published: Live in the rules book
    status: { type: String, enum: ['draft', 'internal_review', 'open', 'approved', 'rejected', 'published', 'public_review'], default: 'draft' },

    approvals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Admins who approved
    consents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Members who agreed (voting)

    // Admin Collaboration (Internal Review)
    ratings: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        value: { type: Number, min: 1, max: 5 }
    }],
    remarks: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],

    adminCountAtCreation: { type: Number, default: 1 } // To calculate percentage if needed
}, { timestamps: true });

export default mongoose.model('Proposal', ProposalSchema);
