const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const {
    createActivityLog
} = require('../services/activityLogService');


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

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required'
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        /*
         * Public registration only allows:
         *
         * tenant
         * landlord
         *
         * Admin cannot be created publicly.
         */

        const publicRole =
            role === 'landlord'
                ? 'landlord'
                : 'tenant';

        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: publicRole,
            phone: phone ? phone.trim() : ''
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(
            password,
            salt
        );

        await user.save();

        await createActivityLog({
            userId: user._id,
            action: 'USER_REGISTERED',
            module: 'AUTH',
            description:
                `New ${user.role} account registered`,
            targetType: 'User',
            targetId: user._id,
            metadata: {
                role: user.role,
                email: user.email
            },
            req,
            status: 'success'
        });

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

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message:
                    'Your account has been deactivated. Please contact the administrator.'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        }

        user.lastLogin = new Date();

        await user.save();

        await createActivityLog({
            userId: user._id,
            action: 'USER_LOGIN',
            module: 'AUTH',
            description:
                `${user.role} logged into SmartLease`,
            targetType: 'User',
            targetId: user._id,
            metadata: {
                role: user.role
            },
            req,
            status: 'success'
        });

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