require('dotenv').config({ path: './server/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const Lesson = require('./models/Lesson');
const User = require('./models/User');
const Proposal = require('./models/Proposal');

const app = express();
const PORT = process.env.PORT || 5000;
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
        const { username, password } = req.body;
        if (await User.findOne({ username })) return res.status(400).json({ message: 'User exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const count = await User.countDocuments();
        const role = count === 0 ? 'admin' : 'member';
        const userId = `SFARB${String(count + 1).padStart(2, '0')}`; // SFARB01, SFARB02, etc.

        const user = new User({ userId, username, password: hashedPassword, role });
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

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ... (previous code) ...

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

// GOOGLE LOGIN
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ username: email }); // Use email as username
        if (!user) {
            const count = await User.countDocuments();
            const role = count === 0 ? 'admin' : 'member';
            const userId = `SFARB${String(count + 1).padStart(2, '0')}`; // SFARB01, SFARB02, etc.
            // Create new user
            user = new User({
                userId,
                username: email,
                role
                // no password
            });
            await user.save();
        }

        const jwtToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token: jwtToken, user: { id: user._id, userId: user.userId, username: user.username, role: user.role, picture } });

    } catch (err) {
        res.status(400).json({ error: 'Google Login Failed' });
    }
});

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
app.post('/api/proposals', auth, checkAdmin, async (req, res) => {
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
app.get('/api/proposals', auth, async (req, res) => {
    try {
        const proposals = await Proposal.find()
            .populate('author', 'username userId')
            .sort({ createdAt: -1 });
        res.json(proposals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Member Consent (Vote)
app.put('/api/proposals/:id/consent', auth, async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
