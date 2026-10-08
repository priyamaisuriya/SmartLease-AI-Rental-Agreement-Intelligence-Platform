const Property = require('../models/Property');
const Agreement = require('../models/Agreement');
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
            securityDeposit,
            amenities,
            availableFrom,
            landmark,
            customPropertyType,
            conditions
        } = req.body;


        // --------------------------------------------------------
        // REQUIRED FIELD VALIDATION
        // --------------------------------------------------------

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


        // --------------------------------------------------------
        // DRAFT AGREEMENT VALIDATION
        // --------------------------------------------------------

        // Draft agreement is optional, can rely on text conditions
        let hasDraftAgreement = false;
        if (
            req.files &&
            req.files.draftAgreement &&
            req.files.draftAgreement.length > 0
        ) {
            hasDraftAgreement = true;
        }


        // --------------------------------------------------------
        // PROPERTY DATA
        // --------------------------------------------------------

        const propertyData = {
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

            amenities: Array.isArray(amenities)
                ? amenities
                : (amenities ? [amenities] : []),

            availableFrom: availableFrom || null,
            landmark,
            customPropertyType,
            conditions: conditions || '',

            status: 'available'
        };


        // --------------------------------------------------------
        // PROPERTY IMAGES
        // --------------------------------------------------------

        if (req.files && req.files.images) {

            propertyData.images = req.files.images.map(
                file => `/uploads/properties/${file.filename}`
            );

        } else {

            propertyData.images = [];

        }


        // --------------------------------------------------------
        // CREATE PROPERTY
        // --------------------------------------------------------

        const property = await Property.create(propertyData);


        // --------------------------------------------------------
        // CREATE DRAFT AGREEMENT
        // --------------------------------------------------------

        if (hasDraftAgreement) {
            const draftFile = req.files.draftAgreement[0];

            let fileType = 'pdf';

            const originalName =
                draftFile.originalname.toLowerCase();

            if (originalName.endsWith('.doc')) {
                fileType = 'doc';
            }

            if (originalName.endsWith('.docx')) {
                fileType = 'docx';
            }


            const draftAgreement = await Agreement.create({

                property: property._id,

                landlord: req.user.id,

                title: `Draft Agreement - ${property.title}`,

                originalFileName:
                    draftFile.originalname,

                fileUrl:
                    `/uploads/properties/${draftFile.filename}`,

                fileType,

                status: 'draft'

            });


            // --------------------------------------------------------
            // LINK AGREEMENT TO PROPERTY
            // --------------------------------------------------------

            property.draftAgreement =
                draftAgreement._id;

            await property.save();
        }


        // --------------------------------------------------------
        // ACTIVITY LOG
        // --------------------------------------------------------

        await createActivityLog({

            userId: req.user.id,

            action: 'PROPERTY_CREATED',

            module: 'PROPERTY',

            description:
                `Property "${property.title}" was created`,

            targetType: 'Property',

            targetId: property._id,

            metadata: {

                propertyType:
                    property.propertyType,

                city:
                    property.city,

                state:
                    property.state,

                monthlyRent:
                    property.monthlyRent

            },

            req,

            status: 'success'

        });


        // --------------------------------------------------------
        // RESPONSE
        // --------------------------------------------------------

        return res.status(201).json({

            message:
                'Property created successfully',

            property

        });


    } catch (err) {

        console.error(
            'Create property error:',
            err
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET MY PROPERTIES
// GET /api/properties/my-properties
// ============================================================

const getMyProperties = async (req, res) => {

    try {

        const properties =
            await Property.find({
                landlord: req.user.id
            })
                .sort({
                    createdAt: -1
                })
                .populate(
                    'landlord',
                    'name email phone'
                )
                .populate(
                    'draftAgreement'
                );


        return res.json({

            count:
                properties.length,

            properties

        });


    } catch (err) {

        console.error(
            'Get my properties error:',
            err
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET AVAILABLE PROPERTIES
// GET /api/properties/available
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

            status: { $in: ['available', 'rented'] },

            $or: [

                {
                    availableFrom: null
                },

                {
                    availableFrom: {
                        $lte: new Date()
                    }
                }

            ]

        };


        // --------------------------------------------------------
        // CITY
        // --------------------------------------------------------

        if (city) {

            filter.city =
                new RegExp(city, 'i');

        }


        // --------------------------------------------------------
        // STATE
        // --------------------------------------------------------

        if (state) {

            filter.state =
                new RegExp(state, 'i');

        }


        // --------------------------------------------------------
        // PROPERTY TYPE
        // --------------------------------------------------------

        if (propertyType) {

            filter.propertyType =
                propertyType;

        }


        // --------------------------------------------------------
        // FURNISHING
        // --------------------------------------------------------

        if (furnishing) {

            filter.furnishing =
                furnishing;

        }


        // --------------------------------------------------------
        // RENT RANGE
        // --------------------------------------------------------

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


        const properties =
            await Property.find(filter)

                .sort({
                    createdAt: -1
                })

                .populate(
                    'landlord',
                    'name phone'
                )

                .populate(
                    'draftAgreement'
                );


        return res.json({

            count:
                properties.length,

            properties

        });


    } catch (err) {

        console.error(
            'Get available properties error:',
            err
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// GET PROPERTY BY ID
// GET /api/properties/:id
// ============================================================

const getPropertyById = async (req, res) => {

    try {

        const property =
            await Property.findById(
                req.params.id
            )

                .populate(
                    'landlord',
                    'name email phone'
                )

                .populate(
                    'draftAgreement'
                );


        if (!property) {

            return res.status(404).json({
                message: 'Property not found'
            });

        }


        return res.json(property);


    } catch (err) {

        console.error(
            'Get property by ID error:',
            err
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// UPDATE PROPERTY
// PUT /api/properties/:id
// ============================================================

const updateProperty = async (req, res) => {

    try {

        const property =
            await Property.findById(
                req.params.id
            );


        if (!property) {

            return res.status(404).json({
                message: 'Property not found'
            });

        }


        // --------------------------------------------------------
        // OWNERSHIP CHECK
        // --------------------------------------------------------

        if (
            property.landlord.toString() !==
            req.user.id
        ) {

            return res.status(403).json({
                message:
                    'You can only update your own property'
            });

        }


        // --------------------------------------------------------
        // ALLOWED FIELDS
        // --------------------------------------------------------

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
            'securityDeposit',
            'amenities',
            'availableFrom',
            'landmark',
            'customPropertyType',
            'conditions'

        ];


        const changedFields = [];


        // --------------------------------------------------------
        // UPDATE BASIC FIELDS
        // --------------------------------------------------------

        allowedFields.forEach(field => {

            if (req.body[field] !== undefined) {

                if (field === 'amenities') {

                    property[field] =
                        Array.isArray(req.body[field])
                            ? req.body[field]
                            : (
                                req.body[field]
                                    ? [req.body[field]]
                                    : []
                            );

                } else if (
                    field === 'availableFrom' &&
                    !req.body[field]
                ) {

                    property[field] = null;

                } else {

                    property[field] =
                        req.body[field];

                }


                changedFields.push(field);

            }

        });


        // --------------------------------------------------------
        // UPDATE IMAGES
        // --------------------------------------------------------

        let updatedImages =
            property.images || [];


        // Existing images sent by frontend
        if (req.body.images !== undefined) {

            if (
                Array.isArray(
                    req.body.images
                )
            ) {

                updatedImages =
                    req.body.images;

            } else if (
                typeof req.body.images === 'string'
            ) {

                try {

                    const parsedImages =
                        JSON.parse(
                            req.body.images
                        );

                    if (
                        Array.isArray(parsedImages)
                    ) {

                        updatedImages =
                            parsedImages;

                    } else {

                        updatedImages = [
                            req.body.images
                        ];

                    }

                } catch {

                    updatedImages = [
                        req.body.images
                    ];

                }

            }

        }


        // New uploaded images
        if (
            req.files &&
            req.files.images
        ) {

            const newImages =
                req.files.images.map(
                    file =>
                        `/uploads/properties/${file.filename}`
                );


            updatedImages = [
                ...updatedImages,
                ...newImages
            ];

        }


        if (
            req.body.images !== undefined ||
            (
                req.files &&
                req.files.images &&
                req.files.images.length > 0
            )
        ) {

            property.images =
                updatedImages;

            changedFields.push('images');

        }


        // --------------------------------------------------------
        // SAVE PROPERTY
        // --------------------------------------------------------

        await property.save();


        // --------------------------------------------------------
        // ACTIVITY LOG
        // --------------------------------------------------------

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

            message:
                'Property updated successfully',

            property

        });


    } catch (err) {

        console.error(
            'Update property error:',
            err
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// DELETE / DEACTIVATE PROPERTY
// DELETE /api/properties/:id
// ============================================================

const deleteProperty = async (req, res) => {

    try {

        const property =
            await Property.findById(
                req.params.id
            );


        if (!property) {

            return res.status(404).json({
                message: 'Property not found'
            });

        }


        // --------------------------------------------------------
        // OWNERSHIP CHECK
        // --------------------------------------------------------

        if (
            property.landlord.toString() !==
            req.user.id
        ) {

            return res.status(403).json({

                message:
                    'You can only remove your own property'

            });

        }


        // --------------------------------------------------------
        // RENTED PROPERTY CHECK
        // --------------------------------------------------------

        if (
            property.status === 'rented'
        ) {

            return res.status(400).json({

                message:
                    'A rented property cannot be removed'

            });

        }


        property.status =
            'inactive';


        await property.save();


        // --------------------------------------------------------
        // ACTIVITY LOG
        // --------------------------------------------------------

        await createActivityLog({

            userId: req.user.id,

            action:
                'PROPERTY_DEACTIVATED',

            module:
                'PROPERTY',

            description:
                `Property "${property.title}" was deactivated`,

            targetType:
                'Property',

            targetId:
                property._id,

            metadata: {

                previousStatus:
                    'available',

                newStatus:
                    'inactive'

            },

            req,

            status:
                'success'

        });


        return res.json({

            message:
                'Property deactivated successfully',

            property

        });


    } catch (err) {

        console.error(
            'Delete property error:',
            err
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// ============================================================
// UPDATE PROPERTY STATUS
// PATCH /api/properties/:id/status
// ============================================================

const updatePropertyStatus = async (req, res) => {

    try {

        const property =
            await Property.findById(
                req.params.id
            );


        if (!property) {

            return res.status(404).json({

                message:
                    'Property not found'

            });

        }


        // --------------------------------------------------------
        // OWNERSHIP CHECK
        // --------------------------------------------------------

        if (
            property.landlord.toString() !==
            req.user.id
        ) {

            return res.status(403).json({

                message:
                    'Unauthorized'

            });

        }


        // --------------------------------------------------------
        // RENTED PROPERTY CHECK
        // --------------------------------------------------------

        if (
            property.status === 'rented'
        ) {

            return res.status(400).json({

                message:
                    'Rented properties cannot be modified this way'

            });

        }


        const newStatus =
            req.body.status;


        // --------------------------------------------------------
        // VALID STATUS
        // --------------------------------------------------------

        const allowedStatuses = [
            'available',
            'inactive',
            'rented'
        ];


        if (
            !allowedStatuses.includes(
                newStatus
            )
        ) {

            return res.status(400).json({

                message:
                    'Invalid property status'

            });

        }


        const previousStatus =
            property.status;


        property.status =
            newStatus;


        await property.save();


        // --------------------------------------------------------
        // ACTIVITY LOG
        // --------------------------------------------------------

        await createActivityLog({

            userId: req.user.id,

            action:
                'PROPERTY_STATUS_UPDATED',

            module:
                'PROPERTY',

            description:
                `Property "${property.title}" status changed from ${previousStatus} to ${newStatus}`,

            targetType:
                'Property',

            targetId:
                property._id,

            metadata: {

                previousStatus,

                newStatus

            },

            req,

            status:
                'success'

        });


        return res.json({

            message:
                'Property status updated successfully',

            property

        });


    } catch (err) {

        console.error(
            'Update property status error:',
            err
        );

        return res.status(500).json({

            message:
                'Server error'

        });

    }

};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    createProperty,

    getMyProperties,

    getAvailableProperties,

    getPropertyById,

    updateProperty,

    deleteProperty,

    updatePropertyStatus

};