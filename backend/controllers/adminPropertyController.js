const Property = require('../models/Property');
const Rental = require('../models/Rental');

const getAllProperties = async (req, res) => {
  try {
    const {
      status,
      landlordId,
      city,
      state,
      propertyType,
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

    if (city) {
      filter.city = new RegExp(city, 'i');
    }

    if (state) {
      filter.state = new RegExp(state, 'i');
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

module.exports = {
  getAllProperties,
  getPropertyDetails,
  getPropertyStats
};
