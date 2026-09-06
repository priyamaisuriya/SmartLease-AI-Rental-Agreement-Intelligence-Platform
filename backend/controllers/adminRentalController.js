const Rental = require('../models/Rental');

const getAllRentals = async (req, res) => {
  try {
    const {
      status,
      landlordId,
      tenantId,
      propertyId,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (landlordId) {
      filter.landlord = landlordId;
    }

    if (tenantId) {
      filter.tenant = tenantId;
    }

    if (propertyId) {
      filter.property = propertyId;
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
    const [
      total,
      pending,
      active,
      completed,
      cancelled
    ] = await Promise.all([
      Rental.countDocuments(),

      Rental.countDocuments({
        status: 'pending'
      }),

      Rental.countDocuments({
        status: 'active'
      }),

      Rental.countDocuments({
        status: 'completed'
      }),

      Rental.countDocuments({
        status: 'cancelled'
      })
    ]);

    return res.json({
      total,
      pending,
      active,
      completed,
      cancelled
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
