const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Property = require('../models/Property');
const Agreement = require('../models/Agreement');
const Rental = require('../models/Rental');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');


// ============================================================
// GET ALL USERS
// GET /api/users
// ADMIN ONLY
// ============================================================

const SENSITIVE_FIELDS = '-password -resetPasswordToken -resetPasswordExpires';

const getUsers = async (req, res) => {
    try {
        // Only counts are computed in the database; the documents themselves
        // (agreements carry their full extracted text) are never loaded.
        const users = await User.aggregate([
            {
                $lookup: {
                    from: 'properties',
                    let: { userId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$landlord', '$$userId'] } } },
                        { $count: 'n' }
                    ],
                    as: 'propertiesAgg'
                }
            },
            {
                $lookup: {
                    from: 'agreements',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$landlord', '$$userId'] },
                                        { $eq: ['$tenant', '$$userId'] }
                                    ]
                                }
                            }
                        },
                        { $count: 'n' }
                    ],
                    as: 'agreementsAgg'
                }
            },
            {
                $addFields: {
                    propertiesCount: { $ifNull: [{ $arrayElemAt: ['$propertiesAgg.n', 0] }, 0] },
                    agreementsCount: { $ifNull: [{ $arrayElemAt: ['$agreementsAgg.n', 0] }, 0] }
                }
            },
            {
                $project: {
                    password: 0,
                    resetPasswordToken: 0,
                    resetPasswordExpires: 0,
                    propertiesAgg: 0,
                    agreementsAgg: 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        return res.json(users);

    } catch (err) {
        console.error(
            'Get users error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server Error'
        });
    }
};


// ============================================================
// GET ONE USER (with real counts and recent activity)
// GET /api/users/:id
// ADMIN ONLY
// ============================================================

const getUserById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

        const user = await User.findById(req.params.id).select(SENSITIVE_FIELDS);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [
            propertiesCount,
            agreementsCount,
            rentalsCount,
            recentActivity
        ] = await Promise.all([
            Property.countDocuments({ landlord: user._id }),
            Agreement.countDocuments({ $or: [{ landlord: user._id }, { tenant: user._id }] }),
            Rental.countDocuments({ $or: [{ landlord: user._id }, { tenant: user._id }] }),
            ActivityLog.find({ user: user._id })
                .sort({ createdAt: -1 })
                .limit(8)
                .select('action module description status createdAt')
        ]);

        return res.json({
            ...user.toObject(),
            propertiesCount,
            agreementsCount,
            rentalsCount,
            recentActivity
        });

    } catch (err) {
        console.error('Get user error:', err.message);

        return res.status(500).json({
            message: 'Server Error'
        });
    }
};


// ============================================================
// CREATE USER
// POST /api/users
// ADMIN ONLY
// ============================================================

// Checked on the plain-text password: the model's minlength only ever sees
// the bcrypt hash, so it cannot enforce this.
const passwordProblem = (pw) => {
    if (typeof pw !== 'string' || pw.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (pw.length > 128) {
        return 'Password cannot exceed 128 characters';
    }
    return null;
};

const createUser = async (req, res) => {

    const {
        name,
        email,
        password,
        role,
        phone
    } = req.body;

    try {

        if (
            typeof name !== 'string' || !name.trim() ||
            typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password
        ) {
            return res.status(400).json({
                message:
                    'Name, email and password are required'
            });
        }

        const pwProblem = passwordProblem(password);

        if (pwProblem) {
            return res.status(400).json({ message: pwProblem });
        }


        const normalizedEmail =
            email.trim().toLowerCase();


        // Check existing user
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }


        /*
         * Admin user-management form can create:
         *
         * tenant
         * landlord
         *
         * Another admin is not created through this route.
         * (property_manager is not a role in the User schema.)
         */

        const allowedRoles = [
            'tenant',
            'landlord'
        ];

        const selectedRole =
            allowedRoles.includes(role)
                ? role
                : 'tenant';


        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: selectedRole,
            phone: typeof phone === 'string' ? phone.trim() : ''
        });


        // Hash password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(
            password,
            salt
        );


        await user.save();


        // Don't return password
        const userResponse = await User
            .findById(user._id)
            .select('-password');


        return res.status(201).json(
            userResponse
        );

    } catch (err) {

        console.error(
            'Create user error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server Error'
        });
    }
};


// ============================================================
// UPDATE USER
// PUT /api/users/:id
//
// ADMIN:
// Can edit another user.
//
// NORMAL USER:
// Can edit only their own profile.
// ============================================================

const updateUser = async (req, res) => {

    const {
        name,
        email,
        role,
        phone,
        password
    } = req.body;

    try {

        const targetUser =
            await User.findById(req.params.id);


        if (!targetUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }


        const isAdmin =
            req.user.role === 'admin';


        const isOwnProfile =
            req.user.id.toString() ===
            req.params.id.toString();


        // Normal users can only update themselves
        if (!isAdmin && !isOwnProfile) {
            return res.status(403).json({
                message:
                    'You can only update your own profile'
            });
        }


        const userFields = {};


        // ========================================================
        // NORMAL USER
        // ========================================================

        if (!isAdmin) {

            if (typeof name === 'string') {
                userFields.name = name.trim();
            }


            if (typeof phone === 'string') {
                userFields.phone = phone.trim();
            }


            // Passwords are changed through PUT /api/auth/change-password,
            // which verifies the current password first.
            if (password !== undefined) {
                return res.status(400).json({
                    message:
                        'Use the change-password option to update your password'
                });
            }
        }


        // ========================================================
        // ADMIN
        // ========================================================

        if (isAdmin) {

            if (typeof name === 'string') {
                userFields.name = name.trim();
            }


            if (typeof phone === 'string') {
                userFields.phone = phone.trim();
            }


            // Admin can change email
            if (
                typeof email === 'string' &&
                email.trim().toLowerCase() !== targetUser.email
            ) {

                const normalizedEmail =
                    email.trim().toLowerCase();


                const existingUser =
                    await User.findOne({
                        email: normalizedEmail,
                        _id: {
                            $ne: targetUser._id
                        }
                    });


                if (existingUser) {
                    return res.status(400).json({
                        message:
                            'Email is already being used by another user'
                    });
                }


                userFields.email =
                    normalizedEmail;
            }


            // Admin can change another user's role
            if (
                role &&
                targetUser._id.toString() !==
                req.user.id.toString()
            ) {

                const allowedRoles = [
                    'tenant',
                    'landlord',
                    'admin'
                ];


                if (!allowedRoles.includes(role)) {
                    return res.status(400).json({
                        message: 'Invalid role'
                    });
                }


                userFields.role = role;
            }


            // Admin can reset another user's password
            if (password !== undefined) {

                const pwProblem = passwordProblem(password);

                if (pwProblem) {
                    return res.status(400).json({ message: pwProblem });
                }

                const salt =
                    await bcrypt.genSalt(10);

                userFields.password =
                    await bcrypt.hash(
                        password,
                        salt
                    );
            }
        }


        const updatedUser =
            await User.findByIdAndUpdate(
                req.params.id,
                {
                    $set: userFields
                },
                {
                    new: true,
                    runValidators: true
                }
            ).select('-password');


        return res.json(updatedUser);

    } catch (err) {

        console.error(
            'Update user error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server Error'
        });
    }
};


// ============================================================
// ACTIVATE / DEACTIVATE USER
// PUT /api/users/:id/status
// ADMIN ONLY
// ============================================================

const updateUserStatus = async (req, res) => {

    const {
        isActive
    } = req.body;

    try {

        const targetUser =
            await User.findById(req.params.id);


        if (!targetUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }


        // Admin cannot deactivate themselves
        if (
            targetUser._id.toString() ===
            req.user.id.toString()
        ) {

            return res.status(400).json({
                message:
                    'You cannot change your own account status'
            });
        }


        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                message:
                    'isActive must be true or false'
            });
        }


        // Prevent deactivating last admin
        if (
            targetUser.role === 'admin' &&
            isActive === false
        ) {

            const activeAdminCount =
                await User.countDocuments({
                    role: 'admin',
                    isActive: true
                });


            if (activeAdminCount <= 1) {
                return res.status(400).json({
                    message:
                        'Cannot deactivate the last active administrator'
                });
            }
        }


        targetUser.isActive =
            isActive;

        await targetUser.save();


        const responseUser =
            await User.findById(
                targetUser._id
            ).select('-password');


        return res.json({
            message: isActive
                ? 'User activated successfully'
                : 'User deactivated successfully',

            user: responseUser
        });

    } catch (err) {

        console.error(
            'Change user status error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server Error'
        });
    }
};


// ============================================================
// DELETE USER
// DISABLED
// ============================================================

const deleteUser = async (req, res) => {

    return res.status(405).json({
        message:
            'Permanent user deletion is disabled. Deactivate the user instead.'
    });
};

const uploadAvatar = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const targetUserId = req.params.id;

        // Normal user can only update own avatar
        if (
            req.user.role !== 'admin' &&
            req.user.id !== targetUserId
        ) {
            return res.status(403).json({
                message: 'You can only update your own profile image'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'Please upload an image'
            });
        }

        const user = await User.findById(targetUserId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Save image URL
        user.profileImage = `/uploads/profiles/${req.file.filename}`;

        await user.save();

        return res.json({
            message: 'Profile image uploaded successfully',
            profileImage: user.profileImage
        });

    } catch (err) {
        console.error('Upload avatar error:', err.message);

        return res.status(500).json({
            message: 'Server error'
        });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    uploadAvatar,
};