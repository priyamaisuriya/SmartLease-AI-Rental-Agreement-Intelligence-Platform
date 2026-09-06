const bcrypt = require('bcryptjs');
const User = require('../models/User');


// ============================================================
// GET ALL USERS
// GET /api/users
// ADMIN ONLY
// ============================================================

const getUsers = async (req, res) => {

    try {

        const users = await User
            .find()
            .select('-password')
            .sort({ createdAt: -1 });

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
// CREATE USER
// POST /api/users
// ADMIN ONLY
// ============================================================

const createUser = async (req, res) => {

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
                message:
                    'Name, email and password are required'
            });
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
         * property_manager
         *
         * Another admin is not created through this route.
         */

        const allowedRoles = [
            'tenant',
            'landlord',
            'property_manager'
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
            phone: phone ? phone.trim() : ''
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


            // Normal user can change own password
            if (password) {

                const salt =
                    await bcrypt.genSalt(10);

                userFields.password =
                    await bcrypt.hash(
                        password,
                        salt
                    );
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
                email.trim() !== targetUser.email
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
                    'property_manager',
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
            if (password) {

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
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    uploadAvatar,
};