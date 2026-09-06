const Property = require('../models/Property');
const User = require('../models/User');

const {
    createActivityLog
} = require('../services/activityLogService');


// ============================================================
// CREATE PROPERTY
// POST /api/properties
// LANDLORD ONLY
// ============================================================

const createProperty = async (req, res) => {
    try {

        const user = await User.findById(req.user.id)
            .select('role isActive');

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

        if (user.role !== 'landlord') {
            return res.status(403).json({
                message: 'Only landlords can create properties'
            });
        }

        const {
            title,
            description,
            propertyType,
            address,
            city,
            state,
            pincode,
            bedrooms,
            bathrooms,
            area,
            furnishing,
            monthlyRent,
            securityDeposit
        } = req.body;

        if (
            !title ||
            !propertyType ||
            !address ||
            !city ||
            !state ||
            monthlyRent === undefined
        ) {
            return res.status(400).json({
                message:
                    'Title, property type, address, city, state and monthly rent are required'
            });
        }

        const property = await Property.create({
            landlord: req.user.id,
            title,
            description,
            propertyType,
            address,
            city,
            state,
            pincode,
            bedrooms,
            bathrooms,
            area,
            furnishing,
            monthlyRent,
            securityDeposit,
            status: 'available'
        });

        await createActivityLog({
            userId: req.user.id,
            action: 'PROPERTY_CREATED',
            module: 'PROPERTY',
            description:
                `Property "${property.title}" was created`,
            targetType: 'Property',
            targetId: property._id,
            metadata: {
                propertyType: property.propertyType,
                city: property.city,
                state: property.state,
                monthlyRent: property.monthlyRent
            },
            req,
            status: 'success'
        });

        return res.status(201).json({
            message: 'Property created successfully',
            property
        });

    } catch (err) {

        console.error(
            'Create property error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET MY PROPERTIES
// ============================================================

const getMyProperties = async (req, res) => {
    try {

        const properties = await Property.find({
            landlord: req.user.id
        })
            .sort({ createdAt: -1 })
            .populate('landlord', 'name email phone');

        return res.json({
            count: properties.length,
            properties
        });

    } catch (err) {

        console.error(
            'Get my properties error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET AVAILABLE PROPERTIES
// ============================================================

const getAvailableProperties = async (req, res) => {
    try {

        const {
            city,
            state,
            propertyType,
            furnishing,
            minRent,
            maxRent
        } = req.query;

        const filter = {
            status: 'available'
        };

        if (city) {
            filter.city = new RegExp(city, 'i');
        }

        if (state) {
            filter.state = new RegExp(state, 'i');
        }

        if (propertyType) {
            filter.propertyType = propertyType;
        }

        if (furnishing) {
            filter.furnishing = furnishing;
        }

        if (minRent || maxRent) {

            filter.monthlyRent = {};

            if (minRent) {
                filter.monthlyRent.$gte =
                    Number(minRent);
            }

            if (maxRent) {
                filter.monthlyRent.$lte =
                    Number(maxRent);
            }
        }

        const properties = await Property.find(filter)
            .sort({ createdAt: -1 })
            .populate('landlord', 'name phone');

        return res.json({
            count: properties.length,
            properties
        });

    } catch (err) {

        console.error(
            'Get available properties error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET PROPERTY BY ID
// ============================================================

const getPropertyById = async (req, res) => {
    try {

        const property = await Property.findById(req.params.id)
            .populate('landlord', 'name email phone');

        if (!property) {
            return res.status(404).json({
                message: 'Property not found'
            });
        }

        return res.json(property);

    } catch (err) {

        console.error(
            'Get property by ID error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// UPDATE PROPERTY
// ============================================================

const updateProperty = async (req, res) => {
    try {

        const property =
            await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                message: 'Property not found'
            });
        }

        if (
            property.landlord.toString() !==
            req.user.id
        ) {
            return res.status(403).json({
                message:
                    'You can only update your own property'
            });
        }

        const allowedFields = [
            'title',
            'description',
            'propertyType',
            'address',
            'city',
            'state',
            'pincode',
            'bedrooms',
            'bathrooms',
            'area',
            'furnishing',
            'monthlyRent',
            'securityDeposit'
        ];

        const changedFields = [];

        allowedFields.forEach((field) => {

            if (req.body[field] !== undefined) {

                property[field] =
                    req.body[field];

                changedFields.push(field);
            }
        });

        await property.save();

        await createActivityLog({
            userId: req.user.id,
            action: 'PROPERTY_UPDATED',
            module: 'PROPERTY',
            description:
                `Property "${property.title}" was updated`,
            targetType: 'Property',
            targetId: property._id,
            metadata: {
                changedFields
            },
            req,
            status: 'success'
        });

        return res.json({
            message: 'Property updated successfully',
            property
        });

    } catch (err) {

        console.error(
            'Update property error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// DELETE / DEACTIVATE PROPERTY
// ============================================================

const deleteProperty = async (req, res) => {
    try {

        const property =
            await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                message: 'Property not found'
            });
        }

        if (
            property.landlord.toString() !==
            req.user.id
        ) {
            return res.status(403).json({
                message:
                    'You can only remove your own property'
            });
        }

        if (property.status === 'rented') {
            return res.status(400).json({
                message:
                    'A rented property cannot be removed'
            });
        }

        property.status = 'inactive';

        await property.save();

        await createActivityLog({
            userId: req.user.id,
            action: 'PROPERTY_DEACTIVATED',
            module: 'PROPERTY',
            description:
                `Property "${property.title}" was deactivated`,
            targetType: 'Property',
            targetId: property._id,
            metadata: {
                previousStatus: 'available',
                newStatus: 'inactive'
            },
            req,
            status: 'success'
        });

        return res.json({
            message:
                'Property deactivated successfully',
            property
        });

    } catch (err) {

        console.error(
            'Delete property error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


module.exports = {
    createProperty,
    getMyProperties,
    getAvailableProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
};