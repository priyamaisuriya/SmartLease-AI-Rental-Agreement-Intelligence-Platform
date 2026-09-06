const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


// ============================================================
// HELPER: CREATE JWT
// ============================================================

const createToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            role: user.role
        }
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: '5h' }
    );
};


// ============================================================
// REGISTER
// POST /api/auth/register
// PUBLIC
// ============================================================

const register = async (req, res) => {

    const {
        name,
        email,
        password,
        role,
        phone
    } = req.body;

    try {

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required'
            });
        }

        // Check existing user
        let user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (user) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        /*
         * Public registration should NOT allow:
         *
         * - admin
         * - property_manager
         *
         * Public users can register as:
         * - tenant
         * - landlord
         *
         * Invalid/missing role defaults to tenant.
         */

        const publicRole =
            role === 'landlord'
                ? 'landlord'
                : 'tenant';


        // Create user
        user = new User({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role: publicRole,
            phone: phone ? phone.trim() : ''
        });


        // Hash password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(
            password,
            salt
        );


        // Save
        await user.save();


        // Create token
        const token = createToken(user);


        return res.status(201).json({
            token,
            role: user.role
        });

    } catch (err) {

        console.error(
            'Registration error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// LOGIN
// POST /api/auth/login
// PUBLIC
// ============================================================

const login = async (req, res) => {

    const {
        email,
        password
    } = req.body;

    try {

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }


        // Find user
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        }


        // Check account status
        if (!user.isActive) {
            return res.status(403).json({
                message:
                    'Your account has been deactivated. Please contact the administrator.'
            });
        }


        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        }


        // Update last login
        user.lastLogin = new Date();

        await user.save();


        // Create token
        const token = createToken(user);


        return res.json({
            token,
            role: user.role
        });

    } catch (err) {

        console.error(
            'Login error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET LOGGED-IN USER
// GET /api/auth/me
// PRIVATE
// ============================================================

const getMe = async (req, res) => {

    try {

        const user = await User
            .findById(req.user.id)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }


        // Optional additional safety check
        if (!user.isActive) {
            return res.status(403).json({
                message: 'Your account is inactive'
            });
        }


        return res.json(user);

    } catch (err) {

        console.error(
            'Auth/me error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server Error'
        });
    }
};


module.exports = {
    register,
    login,
    getMe
};