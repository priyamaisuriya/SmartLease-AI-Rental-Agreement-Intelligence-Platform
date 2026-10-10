const mongoose = require('mongoose');

const Rental = require('../models/Rental');
const User = require('../models/User');
const Property = require('../models/Property');
const { escapeRegex } = require('../utils/dates');

const RENTAL_STATUSES = Object.keys(Rental.VALID_TRANSITIONS);
const isId = (v) => typeof v === 'string' && mongoose.Types.ObjectId.isValid(v);

const getAllRentals = async (req, res) => {
  try {
    const {
      status,
      landlordId,
      tenantId,
      propertyId,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    if (status) {
      if (!RENTAL_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      filter.status = status;
    }

    for (const [key, value, field] of [
      ['landlordId', landlordId, 'landlord'],
      ['tenantId', tenantId, 'tenant'],
      ['propertyId', propertyId, 'property']
    ]) {
      if (value) {
        if (!isId(value)) {
          return res.status(400).json({ message: `Invalid ${key}` });
        }
        filter[field] = value;
      }
    }

    // Free-text search across tenant / landlord / property.
    if (typeof search === 'string' && search.trim()) {
      const re = new RegExp(escapeRegex(search.trim().slice(0, 100)), 'i');

      const [users, properties] = await Promise.all([
        User.find({ $or: [{ name: re }, { email: re }] }).select('_id').limit(200),
        Property.find({ $or: [{ title: re }, { city: re }, { address: re }] }).select('_id').limit(200)
      ]);

      const userIds = users.map((u) => u._id);

      filter.$or = [
        { tenant: { $in: userIds } },
        { landlord: { $in: userIds } },
        { property: { $in: properties.map((p) => p._id) } }
      ];
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
      rentals,
      total
    ] = await Promise.all([
      Rental.find(filter)
        .populate(
          'property',
          'title address city state monthlyRent status'
        )
        .populate(
          'landlord',
          'name email phone'
        )
        .populate(
          'tenant',
          'name email phone'
        )
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(limitNumber),

      Rental.countDocuments(filter)
    ]);

    return res.json({
      rentals,
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
      'Admin get rentals error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getRentalDetails = async (req, res) => {
  try {
    const rental =
      await Rental.findById(req.params.id)
        .populate(
          'property',
          'title description address city state pincode monthlyRent securityDeposit status'
        )
        .populate(
          'landlord',
          'name email phone isActive'
        )
        .populate(
          'tenant',
          'name email phone isActive'
        );

    if (!rental) {
      return res.status(404).json({
        message: 'Rental not found'
      });
    }

    return res.json({
      rental
    });

  } catch (error) {
    console.error(
      'Admin rental details error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getRentalStats = async (req, res) => {
  try {
    const grouped = await Rental.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const byStatus = Object.fromEntries(
      RENTAL_STATUSES.map((st) => [st, 0])
    );

    grouped.forEach((g) => {
      byStatus[g._id] = g.count;
    });

    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

    // Top-level keys kept for the existing admin UI.
    return res.json({
      total,
      pending: byStatus.pending,
      active: byStatus.active,
      completed: byStatus.completed,
      cancelled: byStatus.cancelled,
      confirmed: byStatus.confirmed,
      conflict: byStatus.conflict,
      byStatus
    });

  } catch (error) {
    console.error(
      'Admin rental stats error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllRentals,
  getRentalDetails,
  getRentalStats
};
