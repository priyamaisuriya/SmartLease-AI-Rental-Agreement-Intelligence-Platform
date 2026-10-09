const User = require('../models/User');
const Property = require('../models/Property');
const Rental = require('../models/Rental');
const Agreement = require('../models/Agreement');
const AIUsage = require('../models/AIUsage');
const RentReminder = require('../models/RentReminder');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      tenants,
      landlords,
      totalProperties,
      availableProperties,
      rentedProperties,
      inactiveProperties,
      totalRentals,
      activeRentals,
      pendingRentals,
      confirmedRentals,
      completedRentals,
      cancelledRentals,
      totalAgreements,
      activeAgreements,
      expiredAgreements,
      terminatedAgreements,
      totalAIUsage,
      successfulAIUsage,
      failedAIUsage,
      totalReminders,
      upcomingReminders,
      dueReminders,
      overdueReminders,
      paidReminders
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        isActive: true
      }),

      User.countDocuments({
        role: 'tenant'
      }),

      User.countDocuments({
        role: 'landlord'
      }),

      Property.countDocuments(),

      Property.countDocuments({
        status: 'available'
      }),

      Property.countDocuments({
        status: 'rented'
      }),

      Property.countDocuments({
        status: 'inactive'
      }),

      Rental.countDocuments(),

      Rental.countDocuments({
        status: 'active'
      }),

      Rental.countDocuments({
        status: { $in: ['pending', 'accepted', 'agreement_pending', 'agreement_accepted', 'payment_pending', 'payment_success'] }
      }),

      Rental.countDocuments({
        status: 'confirmed'
      }),

      Rental.countDocuments({
        status: 'completed'
      }),

      Rental.countDocuments({
        status: 'cancelled'
      }),

      Agreement.countDocuments(),

      Agreement.countDocuments({
        status: 'active'
      }),

      Agreement.countDocuments({
        status: 'expired'
      }),

      Agreement.countDocuments({
        status: 'terminated'
      }),

      AIUsage.countDocuments(),

      AIUsage.countDocuments({
        status: 'success'
      }),

      AIUsage.countDocuments({
        status: 'failed'
      }),

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
      })
    ]);

    return res.json({
      monthlyRevenue,
      recentActivity: recentActivity.map(a => ({
        id: a._id,
        user: a.user ? a.user.name : 'System',
        desc: a.description || a.action,
        time: a.createdAt
      })),
      platformAlerts: platformAlerts.map(a => ({
        id: a._id,
        type: a.title,
        message: a.message,
        severity: 'medium'
      })),
      users: {
        total: totalUsers,
        active: activeUsers,
        tenants,
        landlords
      },

      properties: {
        total: totalProperties,
        available: availableProperties,
        rented: rentedProperties,
        inactive: inactiveProperties
      },

      rentals: {
        total: totalRentals,
        active: activeRentals,
        pending: pendingRentals,
        confirmed: confirmedRentals,
        completed: completedRentals,
        cancelled: cancelledRentals
      },

      agreements: {
        total: totalAgreements,
        active: activeAgreements,
        expired: expiredAgreements,
        terminated: terminatedAgreements
      },

      aiUsage: {
        total: totalAIUsage,
        successful: successfulAIUsage,
        failed: failedAIUsage
      },

      rentReminders: {
        total: totalReminders,
        upcoming: upcomingReminders,
        due: dueReminders,
        overdue: overdueReminders,
        paid: paidReminders
      }
    });

  } catch (error) {
    console.error(
      'Admin dashboard error:',
      error.message
    );

    return res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  getAdminDashboard
};
