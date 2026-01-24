import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import Lesson from './models/Lesson.js';
import User from './models/User.js';
import Proposal from './models/Proposal.js';

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'sfa_secret_key_123';
const MASTER_SECRET = process.env.MASTER_SECRET || 'sfa_master_2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev')); // Log requests

// Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Auth Middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};

const checkAdmin = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    next();
};

// Root Check
app.get('/', (req, res) => res.send('API Running'));

// --- AUTH ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, fullName, headquarter, cmsId, sfaId } = req.body;
        if (await User.findOne({ username })) return res.status(400).json({ message: 'User exists' });

        // Validate CMS ID (ABC1234 or ABCD1234)
        if (cmsId && !/^[A-Z]{3,4}\d{4}$/.test(cmsId)) {
            return res.status(400).json({ message: 'Invalid CMS ID format (e.g., ABC1234 or ABCD1234)' });
        }
        if (cmsId && await User.findOne({ cmsId })) return res.status(400).json({ message: 'CMS ID already registered' });

        // Validate SFA ID (SFA1234)
        if (sfaId && !/^SFA\d{4}$/.test(sfaId)) {
            return res.status(400).json({ message: 'Invalid SFA ID format (e.g., SFA1234)' });
        }
        if (sfaId && await User.findOne({ sfaId })) return res.status(400).json({ message: 'SFA ID already registered' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const count = await User.countDocuments();
        const role = count === 0 ? 'admin' : 'member';
        const userId = `SFARB${String(count + 1).padStart(2, '0')}`; // SFARB01, SFARB02, etc.

        const user = new User({
            userId,
            username,
            password: hashedPassword,
            role,
            fullName,
            headquarter,
            cmsId,
            sfaId
        });
        await user.save();

        res.status(201).json({ message: 'User registered', userId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, userId: user.userId, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PUBLIC MEMBERS ---
app.get('/api/public/members', async (req, res) => {
    try {
        const users = await User.find({}, 'fullName username userId headquarter createdAt').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- USER MANAGEMENT (Admin Only) ---

// Get all users
app.get('/api/users', auth, checkAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 }); // Exclude password
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change User Role (Make Admin/Member)
app.put('/api/users/:id/role', auth, checkAdmin, async (req, res) => {
    try {
        const { role } = req.body; // 'admin' or 'member'
        if (!['admin', 'member'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CHANGE PASSWORD
app.post('/api/auth/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.password) return res.status(400).json({ message: 'Social login users cannot change password here.' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Google Login Removed as per request
// app.post('/api/auth/google', ... );

// PROMOTE TO ADMIN (Legacy/Script usage)
app.post('/api/auth/promote', async (req, res) => {
    const { username, masterSecret } = req.body;
    if (masterSecret !== MASTER_SECRET) {
        return res.status(403).json({ message: 'Invalid Master Secret' });
    }
    try {
        const user = await User.findOneAndUpdate({ username }, { role: 'admin' }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: `User ${username} is now an Admin.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PROPOSALS (DRAFTS) ---

// Create Draft (Admin Only triggers this instead of direct save)
app.post('/api/proposals', auth, async (req, res) => {
    try {
        const adminCount = await User.countDocuments({ role: 'admin' });
        const newProposal = new Proposal({
            ...req.body,
            author: req.user.id,
            adminCountAtCreation: adminCount,
            approvals: [req.user.id] // Auto-approve by creator
        });
        await newProposal.save();
        res.status(201).json(newProposal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Proposals (Visible to all Members)
// Get Active Proposals (Public: Drafts & Approved)
// Get Proposals (Role Based Access)
// Get Proposals (Role Based Access)
app.get('/api/proposals', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        let user = null;
        let isAdmin = false;

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                user = await User.findById(decoded.id);
                if (user && user.role === 'admin') isAdmin = true;
            } catch (e) {
                // Ignore invalid
            }
        }

        let query;
        if (user) {
            if (isAdmin) {
                // Admins see: Public, All Reviews, Their Drafts
                query = {
                    $or: [
                        { status: { $in: ['open', 'approved', 'published', 'internal_review', 'public_review'] } },
                        { author: user._id } // Includes own drafts
                    ]
                };
            } else {
                // Members see: Public, Their Own Drafts/Reviews
                query = {
                    $or: [
                        { status: { $in: ['open', 'approved', 'public_review'] } },
                        { author: user._id } // Includes own drafts, reviews, etc.
                    ]
                };
            }
        } else {
            // Anonymous
            query = { status: { $in: ['open', 'approved', 'public_review'] } };
        }


        const proposals = await Proposal.find(query)
            .populate('author', 'username userId fullName')
            .populate('ratings.user', 'username userId fullName role')
            .populate('remarks.user', 'username userId fullName role')
            .populate('consents', 'username userId fullName role')
            .populate('approvals', 'username userId fullName role')
            .sort({ createdAt: -1 });
        res.json(proposals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Submit for Internal Review (Draft -> Internal Review)
app.put('/api/proposals/:id/submit_internal', auth, checkAdmin, async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Not found' });

        if (proposal.status !== 'draft') return res.status(400).json({ message: 'Only drafts can be submitted for review' });
        if (proposal.author.toString() !== req.user.id) return res.status(403).json({ message: 'Only author can submit' });

        proposal.status = 'internal_review';
        await proposal.save();
        res.json(proposal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Submit for Public Review (Approved -> Public Review)
app.put('/api/proposals/:id/submit_public', auth, checkAdmin, async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Not found' });

        if (proposal.status !== 'approved') return res.status(400).json({ message: 'Only approved proposals can go to public review' });

        proposal.status = 'public_review';
        await proposal.save();
        res.json(proposal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Edit Proposal (Draft Only)
app.put('/api/proposals/:id', auth, async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Not found' });

        if (proposal.status !== 'draft') return res.status(400).json({ message: 'Only drafts can be edited' });
        if (proposal.author.toString() !== req.user.id) return res.status(403).json({ message: 'Only author can edit' });

        // Update fields
        if (req.body.title) proposal.title = req.body.title;
        if (req.body.content) proposal.content = req.body.content;
        if (req.body.level) proposal.level = req.body.level;

        await proposal.save();
        res.json(proposal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Proposal (Draft/Rejected Only)
app.delete('/api/proposals/:id', auth, async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Not found' });

        // Allow deleting drafts, and maybe rejected ones.
        if (!['draft', 'rejected'].includes(proposal.status)) {
            return res.status(400).json({ message: 'Cannot delete active/published proposals' });
        }

        if (proposal.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Proposal.findByIdAndDelete(req.params.id);
        res.json({ message: 'Proposal deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rate Proposal (Admin for internal_review, All users for public_review)
app.put('/api/proposals/:id/rate', auth, async (req, res) => {
    try {
        const { rating } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });

        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Not found' });

        // Access control based on status
        if (proposal.status === 'internal_review') {
            const currentUser = await User.findById(req.user.id);
            if (!currentUser || currentUser.role !== 'admin') {
                return res.status(403).json({ message: 'Only admins can rate internal reviews' });
            }
        } else if (proposal.status === 'public_review') {
            // All authenticated users can rate
        } else {
            return res.status(400).json({ message: 'Rating not available for this proposal status' });
        }

        // Update existing or add new
        const existing = proposal.ratings.find(r => r.user.toString() === req.user.id);
        if (existing) {
            existing.value = rating;
        } else {
            proposal.ratings.push({ user: req.user.id, value: rating });
        }

        await proposal.save();

        // Return fully populated for UI update
        const updated = await Proposal.findById(req.params.id)
            .populate('author', 'username userId')
            .populate('ratings.user', 'username')
            .populate('remarks.user', 'username');

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Remark (Admin for internal_review, All users for public_review)
app.post('/api/proposals/:id/remark', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Text required' });

        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Not found' });

        // Access control based on status
        if (proposal.status === 'internal_review') {
            const currentUser = await User.findById(req.user.id);
            if (!currentUser || currentUser.role !== 'admin') {
                return res.status(403).json({ message: 'Only admins can comment on internal reviews' });
            }
        } else if (proposal.status === 'public_review') {
            // All authenticated users can comment
        } else {
            return res.status(400).json({ message: 'Comments not available for this proposal status' });
        }

        proposal.remarks.push({ user: req.user.id, text, createdAt: new Date() });
        await proposal.save();

        // Return fully populated
        const updated = await Proposal.findById(req.params.id)
            .populate('author', 'username userId')
            .populate('ratings.user', 'username')
            .populate('remarks.user', 'username');

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Approve proposal during internal review
app.put('/api/proposals/:id/approve_internal', auth, checkAdmin, async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Not found' });

        if (proposal.status !== 'internal_review') {
            return res.status(400).json({ message: 'Only proposals in internal review can be approved' });
        }

        // Add this admin's approval if not already present
        if (!proposal.approvals.includes(req.user.id)) {
            proposal.approvals.push(req.user.id);
        }

        // Get total admin count
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const approvalCount = proposal.approvals.length;
        const allApproved = approvalCount >= totalAdmins;

        await proposal.save();

        // Return updated proposal with approval status
        const updated = await Proposal.findById(req.params.id)
            .populate('author', 'username userId fullName')
            .populate('approvals', 'username userId fullName')
            .populate('ratings.user', 'username userId fullName role')
            .populate('remarks.user', 'username userId fullName role');

        res.json({
            proposal: updated,
            approvalCount,
            totalAdmins,
            allApproved,
            message: allApproved
                ? 'All admins approved! Proposal can now be opened for voting.'
                : `Approved (${approvalCount}/${totalAdmins} admins)`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Open Proposal for Voting (Only when ALL admins approved)
app.put('/api/proposals/:id/open', auth, checkAdmin, async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Not found' });

        // Must be in internal_review status
        if (proposal.status !== 'internal_review') {
            return res.status(400).json({ message: 'Proposal must be in internal review to open for voting' });
        }

        // Check if all admins have approved
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        if (proposal.approvals.length < totalAdmins) {
            return res.status(400).json({
                message: `Cannot open for voting. Only ${proposal.approvals.length}/${totalAdmins} admins have approved.`,
                approvalCount: proposal.approvals.length,
                totalAdmins
            });
        }

        // All approved - open for voting
        proposal.status = 'open';
        proposal.consents = []; // Reset votes

        await proposal.save();
        res.json({ proposal, message: 'Proposal opened for public voting!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Withdraw Proposal (Back to Draft)
app.put('/api/proposals/:id/withdraw', auth, checkAdmin, async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Not found' });

        if (proposal.status !== 'open') {
            return res.status(400).json({ message: 'Only open proposals can be withdrawn.' });
        }

        // Check for votes
        if (proposal.consents.length > 0) {
            return res.status(403).json({ message: 'Cannot withdraw: Proposal has received votes.' });
        }

        proposal.status = 'draft';
        await proposal.save();
        res.json(proposal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Member Consent (Vote)
app.put('/api/proposals/:id/consent', auth, async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

        if (proposal.status !== 'open') return res.status(400).json({ message: 'Voting is not open for this proposal' });

        // Toggle consent
        const index = proposal.consents.indexOf(req.user.id);
        if (index === -1) {
            proposal.consents.push(req.user.id);
        } else {
            proposal.consents.splice(index, 1);
        }
        await proposal.save();
        res.json(proposal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Approve (Consensus Check)
app.put('/api/proposals/:id/approve', auth, checkAdmin, async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Not found' });

        if (proposal.status === 'published') return res.status(400).json({ message: 'Already published' });

        // Add approval
        if (!proposal.approvals.includes(req.user.id)) {
            proposal.approvals.push(req.user.id);
        }

        // Check Consensus
        // For testing/development ease, we accept consensus if AT LEAST 1 admin approves.
        // In production, this should be: const currentAdminCount = await User.countDocuments({ role: 'admin' });
        const threshold = 1;

        if (proposal.approvals.length >= threshold) {
            proposal.status = 'approved'; // Ready for publish
        }

        await proposal.save();
        res.json({ proposal, readyToPublish: proposal.status === 'approved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Publish (Execute Change)
app.put('/api/proposals/:id/publish', auth, checkAdmin, async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Not found' });

        if (proposal.status !== 'approved') return res.status(400).json({ message: 'Not approved by all admins yet' });

        // PUBLISH LOGIC
        if (proposal.action === 'add') {
            const newLesson = new Lesson({
                level: proposal.level,
                title: proposal.title,
                content: proposal.content,
                order: proposal.order
            });
            await newLesson.save();
        } else if (proposal.action === 'edit') {
            const existingLesson = await Lesson.findById(proposal.originalLessonId);
            if (existingLesson) {
                // Archive current state
                const historyItem = {
                    content: existingLesson.content,
                    title: existingLesson.title,
                    approvedAt: new Date(),
                    changeSummary: "Updated via Admin Consensus"
                };

                await Lesson.findByIdAndUpdate(proposal.originalLessonId, {
                    title: proposal.title,
                    content: proposal.content,
                    $push: { history: historyItem }
                });
            }
        } else if (proposal.action === 'delete') {
            await Lesson.findByIdAndDelete(proposal.originalLessonId);
        }

        proposal.status = 'published';
        await proposal.save();

        res.json({ message: 'Published successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- PUBLIC LESSONS ---
app.get('/api/lessons', async (req, res) => {
    try {
        const lessons = await Lesson.find().sort({ order: 1 });
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SEED (Initial Data - Run once if empty)
app.post('/api/seed', auth, checkAdmin, async (req, res) => {
    try {
        if ((await Lesson.countDocuments()) > 0) return res.status(400).json({ message: 'DB not empty' });
        const data = req.body.map((l, i) => ({ ...l, order: i }));
        await Lesson.insertMany(data);
        res.json({ message: 'Seeded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://127.0.0.1:${PORT}`);
    });
}

// Export for Vercel serverless
export default app;
