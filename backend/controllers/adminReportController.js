const User = require('../models/User');
const Property = require('../models/Property');
const Rental = require('../models/Rental');
const Agreement = require('../models/Agreement');
const AIUsage = require('../models/AIUsage');
const RentReminder = require('../models/RentReminder');
const ActivityLog = require('../models/ActivityLog');


// =====================================================
// OVERALL REPORT
// GET /api/admin/reports/overview
// =====================================================

const getOverviewReport = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            tenants,
            landlords,
            admins,

            totalProperties,
            availableProperties,
            rentedProperties,
            inactiveProperties,

            totalRentals,
            activeRentals,
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
            paidReminders,
            cancelledReminders,

            totalActivities
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.countDocuments({ role: 'tenant' }),
            User.countDocuments({ role: 'landlord' }),
            User.countDocuments({ role: 'admin' }),

            Property.countDocuments(),
            Property.countDocuments({ status: 'available' }),
            Property.countDocuments({ status: 'rented' }),
            Property.countDocuments({ status: 'inactive' }),

            Rental.countDocuments(),
            Rental.countDocuments({ status: 'active' }),
            Rental.countDocuments({ status: 'completed' }),
            Rental.countDocuments({ status: 'cancelled' }),

            Agreement.countDocuments(),
            Agreement.countDocuments({ status: 'active' }),
            Agreement.countDocuments({ status: 'expired' }),
            Agreement.countDocuments({ status: 'terminated' }),

            AIUsage.countDocuments(),
            AIUsage.countDocuments({ status: 'success' }),
            AIUsage.countDocuments({ status: 'failed' }),

            RentReminder.countDocuments(),
            RentReminder.countDocuments({ status: 'upcoming' }),
            RentReminder.countDocuments({ status: 'due' }),
            RentReminder.countDocuments({ status: 'overdue' }),
            RentReminder.countDocuments({ status: 'paid' }),
            RentReminder.countDocuments({ status: 'cancelled' }),

            ActivityLog.countDocuments()
        ]);

        return res.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: totalUsers - activeUsers,
                tenants,
                landlords,
                admins
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

            reminders: {
                total: totalReminders,
                upcoming: upcomingReminders,
                due: dueReminders,
                overdue: overdueReminders,
                paid: paidReminders,
                cancelled: cancelledReminders
            },

            activityLogs: {
                total: totalActivities
            }
        });

    } catch (err) {
        console.error(
            'Overview report error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// USER REPORT
// GET /api/admin/reports/users
// =====================================================

const getUserReport = async (req, res) => {
    try {
        const [
            total,
            active,
            inactive,
            tenants,
            landlords,
            admins
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({
                isActive: true
            }),
            User.countDocuments({
                isActive: false
            }),
            User.countDocuments({
                role: 'tenant'
            }),
            User.countDocuments({
                role: 'landlord'
            }),
            User.countDocuments({
                role: 'admin'
            })
        ]);

        const registrationTrend =
            await User.aggregate([
                {
                    $group: {
                        _id: {
                            year: {
                                $year: '$createdAt'
                            },
                            month: {
                                $month: '$createdAt'
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id.year': 1,
                        '_id.month': 1
                    }
                }
            ]);

        return res.json({
            summary: {
                total,
                active,
                inactive,
                tenants,
                landlords,
                admins
            },

            registrationTrend
        });

    } catch (err) {
        console.error(
            'User report error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// PROPERTY REPORT
// GET /api/admin/reports/properties
// =====================================================

const getPropertyReport = async (req, res) => {
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

        const typeStats =
            await Property.aggregate([
                {
                    $group: {
                        _id: '$propertyType',
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                }
            ]);

        const cityStats =
            await Property.aggregate([
                {
                    $group: {
                        _id: '$city',
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                },
                {
                    $limit: 20
                }
            ]);

        const rentStats =
            await Property.aggregate([
                {
                    $group: {
                        _id: null,
                        averageRent: {
                            $avg: '$monthlyRent'
                        },
                        minimumRent: {
                            $min: '$monthlyRent'
                        },
                        maximumRent: {
                            $max: '$monthlyRent'
                        }
                    }
                }
            ]);

        return res.json({
            summary: {
                total,
                available,
                rented,
                inactive
            },

            propertyTypes:
                typeStats.map(item => ({
                    propertyType: item._id,
                    count: item.count
                })),

            cities:
                cityStats.map(item => ({
                    city: item._id,
                    count: item.count
                })),

            rent: rentStats[0] || {
                averageRent: 0,
                minimumRent: 0,
                maximumRent: 0
            }
        });

    } catch (err) {
        console.error(
            'Property report error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// RENTAL REPORT
// GET /api/admin/reports/rentals
// =====================================================

const getRentalReport = async (req, res) => {
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

        const rentStats =
            await Rental.aggregate([
                {
                    $group: {
                        _id: null,
                        totalMonthlyRent: {
                            $sum: '$monthlyRent'
                        },
                        averageMonthlyRent: {
                            $avg: '$monthlyRent'
                        },
                        totalSecurityDeposit: {
                            $sum: '$securityDeposit'
                        }
                    }
                }
            ]);

        return res.json({
            summary: {
                total,
                pending,
                active,
                completed,
                cancelled
            },

            financials:
                rentStats[0] || {
                    totalMonthlyRent: 0,
                    averageMonthlyRent: 0,
                    totalSecurityDeposit: 0
                }
        });

    } catch (err) {
        console.error(
            'Rental report error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// AGREEMENT REPORT
// GET /api/admin/reports/agreements
// =====================================================

const getAgreementReport = async (req, res) => {
    try {
        const [
            total,
            active,
            expired,
            terminated
        ] = await Promise.all([
            Agreement.countDocuments(),
            Agreement.countDocuments({
                status: 'active'
            }),
            Agreement.countDocuments({
                status: 'expired'
            }),
            Agreement.countDocuments({
                status: 'terminated'
            })
        ]);

        const fileTypeStats =
            await Agreement.aggregate([
                {
                    $group: {
                        _id: '$fileType',
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                }
            ]);

        return res.json({
            summary: {
                total,
                active,
                expired,
                terminated
            },

            fileTypes:
                fileTypeStats.map(item => ({
                    fileType: item._id,
                    count: item.count
                }))
        });

    } catch (err) {
        console.error(
            'Agreement report error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// AI REPORT
// GET /api/admin/reports/ai
// =====================================================

const getAIReport = async (req, res) => {
    try {
        const [
            total,
            successful,
            failed
        ] = await Promise.all([
            AIUsage.countDocuments(),
            AIUsage.countDocuments({
                status: 'success'
            }),
            AIUsage.countDocuments({
                status: 'failed'
            })
        ]);

        const operationStats =
            await AIUsage.aggregate([
                {
                    $group: {
                        _id: '$operation',
                        total: {
                            $sum: 1
                        },
                        successful: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            '$status',
                                            'success'
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        failed: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            '$status',
                                            'failed'
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $sort: {
                        total: -1
                    }
                }
            ]);

        const modelStats =
            await AIUsage.aggregate([
                {
                    $group: {
                        _id: '$model',
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                }
            ]);

        return res.json({
            summary: {
                total,
                successful,
                failed
            },

            operations:
                operationStats.map(item => ({
                    operation: item._id,
                    total: item.total,
                    successful: item.successful,
                    failed: item.failed
                })),

            models:
                modelStats.map(item => ({
                    model: item._id || 'Unknown',
                    count: item.count
                }))
        });

    } catch (err) {
        console.error(
            'AI report error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// RENT REMINDER REPORT
// GET /api/admin/reports/reminders
// =====================================================

const getReminderReport = async (req, res) => {
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

        const amountStats =
            await RentReminder.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAmount: {
                            $sum: '$amount'
                        },
                        paidAmount: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            '$status',
                                            'paid'
                                        ]
                                    },
                                    '$amount',
                                    0
                                ]
                            }
                        },
                        overdueAmount: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            '$status',
                                            'overdue'
                                        ]
                                    },
                                    '$amount',
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

        return res.json({
            summary: {
                total,
                upcoming,
                due,
                overdue,
                paid,
                cancelled
            },

            amounts:
                amountStats[0] || {
                    totalAmount: 0,
                    paidAmount: 0,
                    overdueAmount: 0
                }
        });

    } catch (err) {
        console.error(
            'Reminder report error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


// =====================================================
// MONTHLY PLATFORM ACTIVITY
// GET /api/admin/reports/monthly
// =====================================================

const getMonthlyReport = async (req, res) => {
    try {
        const [
            users,
            properties,
            rentals,
            agreements,
            aiUsage,
            reminders,
            activities
        ] = await Promise.all([
            User.aggregate([
                {
                    $group: {
                        _id: {
                            year: {
                                $year: '$createdAt'
                            },
                            month: {
                                $month: '$createdAt'
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id.year': 1,
                        '_id.month': 1
                    }
                }
            ]),

            Property.aggregate([
                {
                    $group: {
                        _id: {
                            year: {
                                $year: '$createdAt'
                            },
                            month: {
                                $month: '$createdAt'
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id.year': 1,
                        '_id.month': 1
                    }
                }
            ]),

            Rental.aggregate([
                {
                    $group: {
                        _id: {
                            year: {
                                $year: '$createdAt'
                            },
                            month: {
                                $month: '$createdAt'
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id.year': 1,
                        '_id.month': 1
                    }
                }
            ]),

            Agreement.aggregate([
                {
                    $group: {
                        _id: {
                            year: {
                                $year: '$createdAt'
                            },
                            month: {
                                $month: '$createdAt'
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id.year': 1,
                        '_id.month': 1
                    }
                }
            ]),

            AIUsage.aggregate([
                {
                    $group: {
                        _id: {
                            year: {
                                $year: '$createdAt'
                            },
                            month: {
                                $month: '$createdAt'
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id.year': 1,
                        '_id.month': 1
                    }
                }
            ]),

            RentReminder.aggregate([
                {
                    $group: {
                        _id: {
                            year: {
                                $year: '$createdAt'
                            },
                            month: {
                                $month: '$createdAt'
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id.year': 1,
                        '_id.month': 1
                    }
                }
            ]),

            ActivityLog.aggregate([
                {
                    $group: {
                        _id: {
                            year: {
                                $year: '$createdAt'
                            },
                            month: {
                                $month: '$createdAt'
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        '_id.year': 1,
                        '_id.month': 1
                    }
                }
            ])
        ]);

        return res.json({
            users,
            properties,
            rentals,
            agreements,
            aiUsage,
            reminders,
            activities
        });

    } catch (err) {
        console.error(
            'Monthly report error:',
            err.message
        );

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


module.exports = {
    getOverviewReport,
    getUserReport,
    getPropertyReport,
    getRentalReport,
    getAgreementReport,
    getAIReport,
    getReminderReport,
    getMonthlyReport
};
