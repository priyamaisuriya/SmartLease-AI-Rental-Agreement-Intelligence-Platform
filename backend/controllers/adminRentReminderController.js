const RentReminder = require('../models/RentReminder');

const getAllRentReminders = async (req, res) => {
  try {
    const {
      status,
      tenantId,
      landlordId,
      rentalId,
      propertyId,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (tenantId) {
      filter.tenant = tenantId;
    }

    if (landlordId) {
      filter.landlord = landlordId;
    }

    if (rentalId) {
      filter.rental = rentalId;
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
      reminders,
      total
    ] = await Promise.all([
      RentReminder.find(filter)
        .populate(
          'tenant',
          'name email phone'
        )
        .populate(
          'landlord',
          'name email phone'
        )
        .populate(
          'property',
          'title address city state monthlyRent status'
        )
        .populate(
          'rental',
          'bookingDate startDate endDate monthlyRent status'
        )
        .sort({
          dueDate: 1
        })
        .skip(skip)
        .limit(limitNumber),

      RentReminder.countDocuments(filter)
    ]);

    return res.json({
      reminders,
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
      'Admin get rent reminders error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getRentReminderDetails = async (req, res) => {
  try {
    const reminder =
      await RentReminder.findById(req.params.id)
        .populate(
          'tenant',
          'name email phone isActive'
        )
        .populate(
          'landlord',
          'name email phone isActive'
        )
        .populate(
          'property',
          'title description address city state pincode monthlyRent securityDeposit status'
        )
        .populate(
          'rental',
          'bookingDate startDate endDate monthlyRent securityDeposit status'
        );

    if (!reminder) {
      return res.status(404).json({
        message: 'Rent reminder not found'
      });
    }

    return res.json({
      reminder
    });

  } catch (error) {
    console.error(
      'Admin rent reminder details error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getRentReminderStats = async (req, res) => {
  try {
    const [
      total,
      upcoming,
      due,
      overdue,
      paid,
      cancelled
    ] = await Promise.all([
      RentReminder.countDocuments(),

      RentReminder.countDocuments({
        status: 'upcoming'
      }),

      RentReminder.countDocuments({
        status: 'due'
      }),

      RentReminder.countDocuments({
        status: 'overdue'
      }),

      RentReminder.countDocuments({
        status: 'paid'
      }),

      RentReminder.countDocuments({
        status: 'cancelled'
      })
    ]);

    const [
      amountResult,
      overdueAmountResult,
      paidAmountResult
    ] = await Promise.all([
      RentReminder.aggregate([
        {
          $match: {
            status: {
              $nin: ['cancelled']
            }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: '$amount'
            }
          }
        }
      ]),

      RentReminder.aggregate([
        {
          $match: {
            status: 'overdue'
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: '$amount'
            }
          }
        }
      ]),

      RentReminder.aggregate([
        {
          $match: {
            status: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: '$amount'
            }
          }
        }
      ])
    ]);

    return res.json({
      count: {
        total,
        upcoming,
        due,
        overdue,
        paid,
        cancelled
      },

      amount: {
        total:
          amountResult[0]?.totalAmount || 0,

        overdue:
          overdueAmountResult[0]?.totalAmount || 0,

        paid:
          paidAmountResult[0]?.totalAmount || 0
      }
    });

  } catch (error) {
    console.error(
      'Admin rent reminder stats error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllRentReminders,
  getRentReminderDetails,
  getRentReminderStats
};
