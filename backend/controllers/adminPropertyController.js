const mongoose = require('mongoose');

const { escapeRegex } = require('../utils/dates');
const Property = require('../models/Property');
const Rental = require('../models/Rental');
const { createNotification } = require('../services/notificationService');
const { createActivityLog } = require('../services/activityLogService');

const PROPERTY_STATUSES = ['available', 'rented', 'inactive'];

const getAllProperties = async (req, res) => {
  try {
    const {
      status,
      landlordId,
      city,
      state,
      propertyType,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    if (status) {
      if (!PROPERTY_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      filter.status = status;
    }

    if (landlordId) {
      if (!mongoose.Types.ObjectId.isValid(String(landlordId))) {
        return res.status(400).json({ message: 'Invalid landlordId' });
      }
      filter.landlord = landlordId;
    }

    if (typeof search === 'string' && search.trim()) {
      const re = new RegExp(escapeRegex(search.trim().slice(0, 100)), 'i');
      filter.$or = [{ title: re }, { city: re }, { state: re }, { address: re }];
    }

    if (city) {
      filter.city = new RegExp(escapeRegex(String(city).slice(0, 100)), 'i');
    }

    if (state) {
      filter.state = new RegExp(escapeRegex(String(state).slice(0, 100)), 'i');
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    const pageNumber = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const [
      properties,
      total
    ] = await Promise.all([
      Property.find(filter)
        .populate(
          'landlord',
          'name email phone isActive'
        )
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limitNumber),

      Property.countDocuments(filter)
    ]);

    return res.json({
      properties,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(
          total / limitNumber
        )
      }
    });

  } catch (error) {
    console.error(
      'Admin get properties error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getPropertyDetails = async (req, res) => {
  try {
    const property =
      await Property.findById(req.params.id)
        .populate(
          'landlord',
          'name email phone isActive'
        );

    if (!property) {
      return res.status(404).json({
        message: 'Property not found'
      });
    }

    const rentalCount =
      await Rental.countDocuments({
        property: property._id
      });

    const activeRental =
      await Rental.findOne({
        property: property._id,
        status: 'active'
      })
        .populate(
          'tenant',
          'name email phone'
        )
        .populate(
          'landlord',
          'name email phone'
        );

    return res.json({
      property,
      rentalCount,
      activeRental
    });

  } catch (error) {
    console.error(
      'Admin property details error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getPropertyStats = async (req, res) => {
  try {
    const [
      total,
      available,
      rented,
      inactive
    ] = await Promise.all([
      Property.countDocuments(),

      Property.countDocuments({
        status: 'available'
      }),

      Property.countDocuments({
        status: 'rented'
      }),

      Property.countDocuments({
        status: 'inactive'
      })
    ]);

    return res.json({
      total,
      available,
      rented,
      inactive
    });

  } catch (error) {
    console.error(
      'Admin property stats error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

// =====================================================
// ADMIN MODERATION: DEACTIVATE / REACTIVATE A LISTING
// PATCH /api/admin/properties/:id/status
// =====================================================

const updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    // 'rented' is derived from active rentals, never set by hand.
    if (!['available', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "available" or "inactive"' });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status === 'rented') {
      return res.status(400).json({
        message: 'A property with an active rental cannot be changed. Complete or cancel the rental first.'
      });
    }

    if (property.status === status) {
      return res.status(400).json({ message: `Property is already ${status}` });
    }

    if (status === 'inactive') {
      const booked = await Rental.exists({
        property: property._id,
        status: { $in: ['confirmed', 'active'] },
        endDate: { $gt: new Date() }
      });

      if (booked) {
        return res.status(400).json({
          message: 'This property has a confirmed or active booking and cannot be deactivated.'
        });
      }
    }

    const previous = property.status;
    property.status = status;
    await property.save();

    const note = typeof reason === 'string' ? reason.trim().slice(0, 300) : '';

    await createNotification({
      user: property.landlord,
      title: status === 'inactive'
        ? `Listing deactivated: ${property.title}`
        : `Listing reactivated: ${property.title}`,
      message: status === 'inactive'
        ? `An administrator deactivated your listing.${note ? ` Reason: ${note}` : ''}`
        : 'An administrator reactivated your listing. It is visible to tenants again.',
      type: 'system',
      relatedEntityModel: 'Property',
      relatedEntityId: property._id
    });

    try {
      await createActivityLog({
        userId: req.user.id,
        action: status === 'inactive' ? 'ADMIN_PROPERTY_DEACTIVATED' : 'ADMIN_PROPERTY_REACTIVATED',
        module: 'PROPERTY',
        description: `Admin changed "${property.title}" from ${previous} to ${status}`,
        targetType: 'Property',
        targetId: property._id,
        metadata: { previous, status, reason: note },
        req,
        status: 'success'
      });
    } catch (e) {
      console.error('Activity log failed:', e.message);
    }

    return res.json({ message: 'Property status updated', property });

  } catch (error) {
    console.error('Admin update property status error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  updatePropertyStatus,
  getAllProperties,
  getPropertyDetails,
  getPropertyStats
};
