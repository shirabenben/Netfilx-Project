// Authentication middleware for protecting routes

const User = require('../models/User');
const Profile = require('../models/Profile');

// Middleware to check if user is authenticated
const requireAuth = async (req, res, next) => {
    try {
        // Check if user session exists
        const userId = req.session?.userId;
        
        if (!userId) {
            return res.redirect('/login.html');
        }

        // Get user from database
        const user = await User.findById(userId).populate('profiles');
        
        if (!user) {
            req.session.destroy();
            return res.redirect('/login.html');
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.redirect('/login.html');
    }
};

// Middleware to check if profile is selected and valid
const requireProfile = async (req, res, next) => {
    try {
        const profileId = req.query.profile || req.session?.profileId;
        
        if (!profileId) {
            return res.redirect('/profiles');
        }

        // Verify profile belongs to authenticated user
        const profile = await Profile.findOne({
            _id: profileId,
            user: req.user._id
        });

        if (!profile) {
            return res.redirect('/profiles');
        }

        // Attach profile to request and store in session
        req.profile = profile;
        req.session.profileId = profileId;
        next();
    } catch (error) {
        console.error('Profile validation error:', error);
        return res.redirect('/profiles');
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Login function to create session
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username or email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        }).populate('profiles');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create session
        req.session.userId = user._id;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user,
                hasProfiles: user.profiles.length > 0
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login error',
            error: error.message
        });
    }
};

// Logout function to destroy session
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                success: false,
                message: 'Logout failed'
            });
        }
        res.redirect('/login.html');
    });
};

module.exports = {
    requireAuth,
    requireProfile,
    requireAdmin,
    login,
    logout
};