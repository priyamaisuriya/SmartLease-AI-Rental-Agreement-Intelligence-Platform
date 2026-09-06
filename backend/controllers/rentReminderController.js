const RentReminder =
  require('../models/RentReminder');

const Rental =
  require('../models/Rental');

const Property =
  require('../models/Property');

const {
  createActivityLog
} = require('../services/activityLogService');


// =====================================================
// CREATE RENT REMINDER
// POST /api/rent-reminders
// Landlord only
// =====================================================

const createRentReminder = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message:
          'Authentication required'
      });
    }

    if (
      req.user.role !== 'landlord'
    ) {
      return res.status(403).json({
        message:
          'Only landlords can create rent reminders'
      });
    }

    const {
      rentalId,
      dueDate,
      amount,
      notes
    } = req.body;

    if (!rentalId) {
      return res.status(400).json({
        message:
          'rentalId is required'
      });
    }

    if (!dueDate) {
      return res.status(400).json({
        message:
          'dueDate is required'
      });
    }

    const rental =
      await Rental.findById(
        rentalId
      );

    if (!rental) {
      return res.status(404).json({
        message:
          'Rental not found'
      });
    }

    if (
      rental.landlord.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          'You can only create reminders for your own rentals'
      });
    }

    if (
      rental.status === 'cancelled' ||
      rental.status === 'completed'
    ) {
      return res.status(400).json({
        message:
          'Cannot create a reminder for an inactive rental'
      });
    }

    const parsedDueDate =
      new Date(dueDate);

    if (
      Number.isNaN(
        parsedDueDate.getTime()
      )
    ) {
      return res.status(400).json({
        message:
          'Invalid dueDate'
      });
    }

    const reminderAmount =
      amount !== undefined
        ? Number(amount)
        : rental.monthlyRent;

    if (
      Number.isNaN(
        reminderAmount
      ) ||
      reminderAmount < 0
    ) {
      return res.status(400).json({
        message:
          'Invalid rent amount'
      });
    }

    const property =
      await Property.findById(
        rental.property
      );

    if (!property) {
      return res.status(404).json({
        message:
          'Related property not found'
      });
    }

    const existingReminder =
      await RentReminder.findOne({
        rental: rental._id,
        dueDate: parsedDueDate
      });

    if (existingReminder) {
      return res.status(409).json({
        message:
          'A rent reminder already exists for this due date'
      });
    }

    let status = 'upcoming';

    const now = new Date();

    if (
      parsedDueDate <= now
    ) {
      status = 'due';
    }

    const reminder =
      await RentReminder.create({
        rental: rental._id,
        property: rental.property,
        landlord: rental.landlord,
        tenant: rental.tenant,
        amount:
          reminderAmount,
        dueDate:
          parsedDueDate,
        status,
        notes:
          notes || ''
      });

    await createActivityLog({
      userId: req.user.id,
      action:
        'REMINDER_CREATED',
      module:
        'rent-reminder',
      description:
        'Rent reminder created',
      targetType:
        'RentReminder',
      targetId:
        reminder._id,
      metadata: {
        rentalId:
          rental._id,
        propertyId:
          rental.property,
        landlordId:
          rental.landlord,
        tenantId:
          rental.tenant,
        amount:
          reminderAmount,
        dueDate:
          parsedDueDate,
        status
      },
      req,
      status: 'success'
    });

    const populatedReminder =
      await RentReminder.findById(
        reminder._id
      )
        .populate(
          'property',
          'title address city state monthlyRent'
        )
        .populate(
          'landlord',
          'name email phone'
        )
        .populate(
          'tenant',
          'name email phone'
        )
        .populate(
          'rental',
          'monthlyRent startDate endDate status'
        );

    return res.status(201).json({
      message:
        'Rent reminder created successfully',
      reminder:
        populatedReminder
    });

  } catch (err) {
    console.error(
      'Create rent reminder error:',
      err.message
    );

    return res.status(500).json({
      message:
        'Server error'
    });
  }
};


// =====================================================
// GET TENANT REMINDERS
// =====================================================

const getMyReminders = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message:
          'Authentication required'
      });
    }

    const reminders =
      await RentReminder.find({
        tenant:
          req.user.id
      })
        .populate(
          'property',
          'title address city state'
        )
        .populate(
          'landlord',
          'name email phone'
        )
        .populate(
          'rental',
          'monthlyRent startDate endDate status'
        )
        .sort({
          dueDate: 1
        });

    return res.json({
      count:
        reminders.length,
      reminders
    });

  } catch (err) {
    console.error(
      'Get tenant reminders error:',
      err.message
    );

    return res.status(500).json({
      message:
        'Server error'
    });
  }
};


// =====================================================
// GET LANDLORD REMINDERS
// =====================================================

const getLandlordReminders =
  async (req, res) => {
    try {
      if (
        !req.user ||
        !req.user.id
      ) {
        return res.status(401).json({
          message:
            'Authentication required'
        });
      }

      const reminders =
        await RentReminder.find({
          landlord:
            req.user.id
        })
          .populate(
            'property',
            'title address city state'
          )
          .populate(
            'tenant',
            'name email phone'
          )
          .populate(
            'rental',
            'monthlyRent startDate endDate status'
          )
          .sort({
            dueDate: 1
          });

      return res.json({
        count:
          reminders.length,
        reminders
      });

    } catch (err) {
      console.error(
        'Get landlord reminders error:',
        err.message
      );

      return res.status(500).json({
        message:
          'Server error'
      });
    }
  };


// =====================================================
// GET ONE REMINDER
// =====================================================

const getReminderById = async (
  req,
  res
) => {
  try {
    if (
      !req.user ||
      !req.user.id
    ) {
      return res.status(401).json({
        message:
          'Authentication required'
      });
    }

    const reminder =
      await RentReminder.findById(
        req.params.id
      )
        .populate(
          'property',
          'title description address city state'
        )
        .populate(
          'landlord',
          'name email phone'
        )
        .populate(
          'tenant',
          'name email phone'
        )
        .populate(
          'rental',
          'monthlyRent securityDeposit startDate endDate status'
        );

    if (!reminder) {
      return res.status(404).json({
        message:
          'Rent reminder not found'
      });
    }

    const isAdmin =
      req.user.role === 'admin';

    const isLandlord =
      reminder.landlord._id.toString() ===
      req.user.id;

    const isTenant =
      reminder.tenant._id.toString() ===
      req.user.id;

    if (
      !isAdmin &&
      !isLandlord &&
      !isTenant
    ) {
      return res.status(403).json({
        message:
          'You are not authorized to view this reminder'
      });
    }

    return res.json({
      reminder
    });

  } catch (err) {
    console.error(
      'Get reminder error:',
      err.message
    );

    return res.status(500).json({
      message:
        'Server error'
    });
  }
};


// =====================================================
// MARK RENT AS PAID
// PUT /api/rent-reminders/:id/pay
// Tenant or landlord
// =====================================================

const markRentPaid = async (
  req,
  res
) => {
  try {
    if (
      !req.user ||
      !req.user.id
    ) {
      return res.status(401).json({
        message:
          'Authentication required'
      });
    }

    const reminder =
      await RentReminder.findById(
        req.params.id
      );

    if (!reminder) {
      return res.status(404).json({
        message:
          'Rent reminder not found'
      });
    }

    const isAdmin =
      req.user.role === 'admin';

    const isLandlord =
      reminder.landlord.toString() ===
      req.user.id;

    const isTenant =
      reminder.tenant.toString() ===
      req.user.id;

    if (
      !isAdmin &&
      !isLandlord &&
      !isTenant
    ) {
      return res.status(403).json({
        message:
          'You are not authorized to update this reminder'
      });
    }

    if (
      reminder.status === 'paid'
    ) {
      return res.status(400).json({
        message:
          'Rent is already marked as paid'
      });
    }

    if (
      reminder.status ===
      'cancelled'
    ) {
      return res.status(400).json({
        message:
          'Cancelled reminders cannot be marked as paid'
      });
    }

    const previousStatus =
      reminder.status;

    reminder.status =
      'paid';

    reminder.paidAt =
      new Date();

    await reminder.save();

    await createActivityLog({
      userId: req.user.id,
      action:
        'RENT_PAID',
      module:
        'rent-reminder',
      description:
        'Rent reminder marked as paid',
      targetType:
        'RentReminder',
      targetId:
        reminder._id,
      metadata: {
        rentalId:
          reminder.rental,
        propertyId:
          reminder.property,
        tenantId:
          reminder.tenant,
        landlordId:
          reminder.landlord,
        amount:
          reminder.amount,
        previousStatus,
        newStatus:
          'paid',
        paidByRole:
          req.user.role,
        paidAt:
          reminder.paidAt
      },
      req,
      status: 'success'
    });

    return res.json({
      message:
        'Rent marked as paid successfully',
      reminder
    });

  } catch (err) {
    console.error(
      'Mark rent paid error:',
      err.message
    );

    return res.status(500).json({
      message:
        'Server error'
    });
  }
};


// =====================================================
// CANCEL REMINDER
// PUT /api/rent-reminders/:id/cancel
// Landlord only
// =====================================================

const cancelReminder = async (
  req,
  res
) => {
  try {
    if (
      !req.user ||
      !req.user.id
    ) {
      return res.status(401).json({
        message:
          'Authentication required'
      });
    }

    if (
      req.user.role !== 'landlord'
    ) {
      return res.status(403).json({
        message:
          'Only landlords can cancel reminders'
      });
    }

    const reminder =
      await RentReminder.findById(
        req.params.id
      );

    if (!reminder) {
      return res.status(404).json({
        message:
          'Rent reminder not found'
      });
    }

    if (
      reminder.landlord.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          'You can only cancel your own reminders'
      });
    }

    if (
      reminder.status === 'paid'
    ) {
      return res.status(400).json({
        message:
          'Paid reminders cannot be cancelled'
      });
    }

    const previousStatus =
      reminder.status;

    reminder.status =
      'cancelled';

    await reminder.save();

    await createActivityLog({
      userId: req.user.id,
      action:
        'REMINDER_CANCELLED',
      module:
        'rent-reminder',
      description:
        'Rent reminder cancelled',
      targetType:
        'RentReminder',
      targetId:
        reminder._id,
      metadata: {
        rentalId:
          reminder.rental,
        propertyId:
          reminder.property,
        tenantId:
          reminder.tenant,
        landlordId:
          reminder.landlord,
        amount:
          reminder.amount,
        previousStatus,
        newStatus:
          'cancelled'
      },
      req,
      status: 'success'
    });

    return res.json({
      message:
        'Rent reminder cancelled successfully',
      reminder
    });

  } catch (err) {
    console.error(
      'Cancel reminder error:',
      err.message
    );

    return res.status(500).json({
      message:
        'Server error'
    });
  }
};


module.exports = {
  createRentReminder,
  getMyReminders,
  getLandlordReminders,
  getReminderById,
  markRentPaid,
  cancelReminder
};