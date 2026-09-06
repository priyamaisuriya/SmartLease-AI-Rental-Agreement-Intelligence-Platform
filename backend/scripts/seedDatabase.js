const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const RolePermissions = require('../models/RolePermissions');
const Property = require('../models/Property');
const Rental = require('../models/Rental');
const Agreement = require('../models/Agreement');
const AgreementAnalysis = require('../models/AgreementAnalysis');
const AIUsage = require('../models/AIUsage');
const RentReminder = require('../models/RentReminder');
const ActivityLog = require('../models/ActivityLog');


// ============================================================
// DATABASE CONNECTION
// ============================================================

const MONGO_URI =
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/smartlease';


// ============================================================
// FIXED IDS
// ============================================================

const IDS = {

    users: {
        admin: '68cbd0000000000000000001',
        landlord1: '68cbd0000000000000000002',
        landlord2: '68cbd0000000000000000003',
        tenant1: '68cbd0000000000000000004',
        tenant2: '68cbd0000000000000000005',
    },

    properties: {
        property1: '68cbd1000000000000000001',
        property2: '68cbd1000000000000000002',
        property3: '68cbd1000000000000000003',
        property4: '68cbd1000000000000000004',
        property5: '68cbd1000000000000000005',
    },

    rentals: {
        rental1: '68cbd2000000000000000001',
        rental2: '68cbd2000000000000000002',
        rental3: '68cbd2000000000000000003',
    },

    agreements: {
        agreement1: '68cbd3000000000000000001',
        agreement2: '68cbd3000000000000000002',
    }
};


// ============================================================
// HELPER
// ============================================================

const objectId = (id) => new mongoose.Types.ObjectId(id);


// ============================================================
// MAIN SEED FUNCTION
// ============================================================

const seedDatabase = async () => {

    try {

        console.log('');
        console.log('==============================================');
        console.log('       SMARTLEASE DATABASE SEED');
        console.log('==============================================');
        console.log('');

        await mongoose.connect(MONGO_URI);

        console.log('MongoDB connected');
        console.log('');


        // ====================================================
        // CLEAR EXISTING DATA
        // ====================================================

        console.log('Clearing existing SmartLease data...');

        await Promise.all([
            User.deleteMany({}),
            RolePermissions.deleteMany({}),
            Property.deleteMany({}),
            Rental.deleteMany({}),
            Agreement.deleteMany({}),
            AgreementAnalysis.deleteMany({}),
            AIUsage.deleteMany({}),
            RentReminder.deleteMany({}),
            ActivityLog.deleteMany({})
        ]);

        console.log('Existing data cleared');
        console.log('');


        // ====================================================
        // PASSWORDS
        // ====================================================

        const adminPassword =
            await bcrypt.hash('Admin@12345', 10);

        const testPassword =
            await bcrypt.hash('Test@12345', 10);


        // ====================================================
        // USERS
        // ====================================================

        console.log('Creating users...');

        const admin = await User.create({
            _id: objectId(IDS.users.admin),
            name: 'System Admin',
            email: 'admin@test.com',
            password: adminPassword,
            role: 'admin',
            phone: '9999999999',
            isActive: true,
            emailVerified: true,
            lastLogin: new Date()
        });


        const landlord1 = await User.create({
            _id: objectId(IDS.users.landlord1),
            name: 'Rajesh Patel',
            email: 'landlord@test.com',
            password: testPassword,
            role: 'landlord',
            phone: '9876543210',
            isActive: true,
            emailVerified: true,
            lastLogin: new Date()
        });


        const landlord2 = await User.create({
            _id: objectId(IDS.users.landlord2),
            name: 'Amit Shah',
            email: 'landlord2@test.com',
            password: testPassword,
            role: 'landlord',
            phone: '9876543211',
            isActive: true,
            emailVerified: true,
            lastLogin: new Date()
        });


        const tenant1 = await User.create({
            _id: objectId(IDS.users.tenant1),
            name: 'Keham Tenant',
            email: 'tenant@test.com',
            password: testPassword,
            role: 'tenant',
            phone: '9876500001',
            isActive: true,
            emailVerified: true,
            lastLogin: new Date()
        });


        const tenant2 = await User.create({
            _id: objectId(IDS.users.tenant2),
            name: 'Rahul Mehta',
            email: 'tenant2@test.com',
            password: testPassword,
            role: 'tenant',
            phone: '9876500002',
            isActive: true,
            emailVerified: true,
            lastLogin: new Date()
        });


        console.log('Users created: 5');
        console.log('');


        // ====================================================
        // ROLE PERMISSIONS
        // ====================================================

        console.log('Creating role permissions...');

        const rolePermissions = {

            tenant: [
                'dashboard',
                'property-view',
                'property-search',
                'rental-view',
                'rental-book',
                'rental-cancel',
                'agreement-history',
                'agreement-view',
                'agreement-analysis',
                'agreement-summary',
                'clause-explanation',
                'risk-detection',
                'rent-reminders',
                'profile',
                'feedback'
            ],

            landlord: [
                'dashboard',
                'property-view',
                'property-create',
                'property-update',
                'property-delete',
                'rental-view',
                'rental-manage',
                'agreement-history',
                'agreement-view',
                'agreement-upload',
                'agreement-analysis',
                'agreement-summary',
                'clause-explanation',
                'risk-detection',
                'rent-reminders',
                'tenant-management',
                'reports',
                'feedback',
                'profile'
            ],

            admin: []
        };


        for (const [role, permissions] of Object.entries(rolePermissions)) {

            await RolePermissions.create({
                role,
                permissions
            });

        }

        console.log('Role permissions created: 3');
        console.log('');


        // ====================================================
        // PROPERTIES
        // ====================================================

        console.log('Creating properties...');


        const property1 = await Property.create({

            _id: objectId(IDS.properties.property1),

            landlord: landlord1._id,

            title: 'Modern 2BHK Apartment in Adajan',

            description:
                'Well-maintained 2BHK apartment with balcony, parking and modern amenities.',

            propertyType: 'apartment',

            address: 'Adajan Main Road',

            city: 'Surat',

            state: 'Gujarat',

            pincode: '395009',

            bedrooms: 2,

            bathrooms: 2,

            area: 1200,

            furnishing: 'semi_furnished',

            monthlyRent: 18000,

            securityDeposit: 50000,

            status: 'rented',

            images: []
        });


        const property2 = await Property.create({

            _id: objectId(IDS.properties.property2),

            landlord: landlord1._id,

            title: 'Furnished 1BHK Near Citylight',

            description:
                'Fully furnished 1BHK suitable for students and working professionals.',

            propertyType: 'apartment',

            address: 'Citylight Road',

            city: 'Surat',

            state: 'Gujarat',

            pincode: '395007',

            bedrooms: 1,

            bathrooms: 1,

            area: 750,

            furnishing: 'furnished',

            monthlyRent: 14000,

            securityDeposit: 40000,

            status: 'available',

            images: []
        });


        const property3 = await Property.create({

            _id: objectId(IDS.properties.property3),

            landlord: landlord2._id,

            title: 'Spacious 3BHK Family House',

            description:
                'Large independent house with parking and spacious rooms.',

            propertyType: 'house',

            address: 'Vesu Main Road',

            city: 'Surat',

            state: 'Gujarat',

            pincode: '395007',

            bedrooms: 3,

            bathrooms: 3,

            area: 2100,

            furnishing: 'semi_furnished',

            monthlyRent: 28000,

            securityDeposit: 80000,

            status: 'rented',

            images: []
        });


        const property4 = await Property.create({

            _id: objectId(IDS.properties.property4),

            landlord: landlord2._id,

            title: 'Premium 2BHK Villa',

            description:
                'Premium villa with modern interiors and dedicated parking.',

            propertyType: 'villa',

            address: 'Palanpur Canal Road',

            city: 'Surat',

            state: 'Gujarat',

            pincode: '395009',

            bedrooms: 2,

            bathrooms: 2,

            area: 1600,

            furnishing: 'furnished',

            monthlyRent: 25000,

            securityDeposit: 75000,

            status: 'available',

            images: []
        });


        const property5 = await Property.create({

            _id: objectId(IDS.properties.property5),

            landlord: landlord2._id,

            title: 'Small Office Space',

            description:
                'Commercial office space suitable for a startup or small business.',

            propertyType: 'office',

            address: 'Ring Road',

            city: 'Surat',

            state: 'Gujarat',

            pincode: '395002',

            bedrooms: 0,

            bathrooms: 1,

            area: 900,

            furnishing: 'unfurnished',

            monthlyRent: 22000,

            securityDeposit: 60000,

            status: 'inactive',

            images: []
        });


        console.log('Properties created: 5');
        console.log('');


        // ====================================================
        // RENTALS
        // ====================================================

        console.log('Creating rentals...');


        const rental1 = await Rental.create({

            _id: objectId(IDS.rentals.rental1),

            property: property1._id,

            landlord: landlord1._id,

            tenant: tenant1._id,

            bookingDate: new Date('2026-06-25'),

            startDate: new Date('2026-07-01'),

            endDate: new Date('2027-06-30'),

            monthlyRent: 18000,

            securityDeposit: 50000,

            status: 'active'
        });


        const rental2 = await Rental.create({

            _id: objectId(IDS.rentals.rental2),

            property: property3._id,

            landlord: landlord2._id,

            tenant: tenant2._id,

            bookingDate: new Date('2026-01-05'),

            startDate: new Date('2026-01-10'),

            endDate: new Date('2026-12-31'),

            monthlyRent: 28000,

            securityDeposit: 80000,

            status: 'active'
        });


        const rental3 = await Rental.create({

            _id: objectId(IDS.rentals.rental3),

            property: property4._id,

            landlord: landlord2._id,

            tenant: tenant1._id,

            bookingDate: new Date('2025-01-05'),

            startDate: new Date('2025-01-10'),

            endDate: new Date('2025-12-31'),

            monthlyRent: 25000,

            securityDeposit: 75000,

            status: 'completed'
        });


        console.log('Rentals created: 3');
        console.log('');


        // ====================================================
        // AGREEMENT TEXT
        // ====================================================

        const agreement1Text = `
RESIDENTIAL RENTAL AGREEMENT

This Rental Agreement is between Rajesh Patel, the Landlord,
and Keham Tenant, the Tenant.

PROPERTY:
Modern 2BHK Apartment in Adajan,
Adajan Main Road, Surat, Gujarat.

MONTHLY RENT:
The monthly rent is INR 18,000.

SECURITY DEPOSIT:
The Tenant shall pay a security deposit of INR 50,000.

RENT DUE DATE:
Monthly rent must be paid on or before the 5th day of every month.

TERMINATION:
Either party may terminate this agreement by providing 30 days
written notice.

SUBLETTING:
The Tenant shall not sublet or transfer the property without
written permission from the Landlord.

MAINTENANCE:
The Tenant is responsible for normal day-to-day maintenance.
Major structural repairs remain the responsibility of the Landlord.

NOTICE:
All notices under this agreement must be provided in writing.

AGREEMENT TERM:
The agreement begins on 1 July 2026 and ends on 30 June 2027.

DISPUTE:
Any dispute should first be resolved through mutual discussion
between the Landlord and Tenant.

SIGNATURES:
Landlord: Rajesh Patel
Tenant: Keham Tenant
`;


        const agreement2Text = `
RESIDENTIAL RENTAL AGREEMENT

This Rental Agreement is between Amit Shah, the Landlord,
and Rahul Mehta, the Tenant.

PROPERTY:
Spacious 3BHK Family House,
Vesu Main Road, Surat, Gujarat.

MONTHLY RENT:
The monthly rent is INR 28,000.

SECURITY DEPOSIT:
The Tenant shall pay a security deposit of INR 80,000.

RENT DUE DATE:
Monthly rent is due on the 10th day of every month.

LATE PAYMENT:
A late payment may result in additional charges as agreed
between the Landlord and Tenant.

TERMINATION:
Either party may terminate the agreement by giving 30 days
written notice.

SUBLETTING:
The Tenant must obtain written permission from the Landlord
before subletting the property.

MAINTENANCE:
The Tenant is responsible for minor maintenance and normal
wear-and-tear related responsibilities.

AGREEMENT TERM:
The agreement begins on 10 January 2026 and ends on
31 December 2026.

NOTICE:
Written notice must be provided for important contractual
communications.

DISPUTE:
The parties should attempt to resolve disputes through
mutual discussion before taking further action.

SIGNATURES:
Landlord: Amit Shah
Tenant: Rahul Mehta
`;


        // ====================================================
        // AGREEMENTS
        // ====================================================

        console.log('Creating agreements...');


        const agreement1 = await Agreement.create({

            _id: objectId(IDS.agreements.agreement1),

            property: property1._id,

            rental: rental1._id,

            landlord: landlord1._id,

            tenant: tenant1._id,

            title: 'Adajan 2BHK Rental Agreement',

            originalFileName:
                'adajan-2bhk-rental-agreement.pdf',

            fileUrl:
                '/uploads/agreements/adajan-2bhk-rental-agreement.pdf',

            fileType: 'pdf',

            status: 'active',

            uploadedAt: new Date('2026-06-28'),

            extractedText: agreement1Text
        });


        const agreement2 = await Agreement.create({

            _id: objectId(IDS.agreements.agreement2),

            property: property3._id,

            rental: rental2._id,

            landlord: landlord2._id,

            tenant: tenant2._id,

            title: 'Vesu 3BHK Rental Agreement',

            originalFileName:
                'vesu-3bhk-rental-agreement.docx',

            fileUrl:
                '/uploads/agreements/vesu-3bhk-rental-agreement.docx',

            fileType: 'docx',

            status: 'active',

            uploadedAt: new Date('2026-01-07'),

            extractedText: agreement2Text
        });


        console.log('Agreements created: 2');
        console.log('');


        // ====================================================
        // AGREEMENT ANALYSIS
        // ====================================================

        console.log('Creating agreement analysis records...');


        await AgreementAnalysis.create([

            {
                agreement: agreement1._id,
                user: tenant1._id,
                type: 'summary',
                input: '',
                result:
                    'This agreement covers a 2BHK residential property in Adajan, Surat. The monthly rent is INR 18,000 and the security deposit is INR 50,000. Either party can terminate the agreement with 30 days written notice. Subletting requires written permission from the landlord.'
            },

            {
                agreement: agreement1._id,
                user: tenant1._id,
                type: 'risk',
                input: '',
                result:
                    'Risk assessment: MEDIUM. The agreement contains a standard termination clause and a restriction on subletting. The tenant should confirm the exact maintenance responsibilities and any consequences of delayed rent payment before signing.'
            },

            {
                agreement: agreement1._id,
                user: landlord1._id,
                type: 'clause_explanation',
                input:
                    'Either party may terminate this agreement by providing 30 days written notice.',
                result:
                    'This means either the landlord or tenant can end the agreement, but they must give the other party written notice at least 30 days before termination.'
            },

            {
                agreement: agreement1._id,
                user: tenant1._id,
                type: 'question',
                input:
                    'When must I pay the monthly rent?',
                result:
                    'The agreement states that monthly rent must be paid on or before the 5th day of every month.'
            },

            {
                agreement: agreement2._id,
                user: tenant2._id,
                type: 'summary',
                input: '',
                result:
                    'This agreement covers a 3BHK family house in Vesu, Surat. The monthly rent is INR 28,000 and the security deposit is INR 80,000. Rent is due on the 10th of each month and either party can terminate the agreement with 30 days written notice.'
            }

        ]);


        console.log('Agreement analysis records created: 5');
        console.log('');


        // ====================================================
        // AI USAGE
        // ====================================================

        console.log('Creating AI usage records...');


        await AIUsage.create([

            {
                user: tenant1._id,
                agreement: agreement1._id,
                operation: 'summary',
                model: process.env.GEMINI_MODEL || 'gemini-3.7-flash',
                status: 'success',
                errorMessage: ''
            },

            {
                user: tenant1._id,
                agreement: agreement1._id,
                operation: 'risk_detection',
                model: process.env.GEMINI_MODEL || 'gemini-3.7-flash',
                status: 'success',
                errorMessage: ''
            },

            {
                user: landlord1._id,
                agreement: agreement1._id,
                operation: 'clause_explanation',
                model: process.env.GEMINI_MODEL || 'gemini-3.7-flash',
                status: 'success',
                errorMessage: ''
            },

            {
                user: tenant1._id,
                agreement: agreement1._id,
                operation: 'question',
                model: process.env.GEMINI_MODEL || 'gemini-3.7-flash',
                status: 'success',
                errorMessage: ''
            },

            {
                user: tenant2._id,
                agreement: agreement2._id,
                operation: 'summary',
                model: process.env.GEMINI_MODEL || 'gemini-3.7-flash',
                status: 'success',
                errorMessage: ''
            },

            {
                user: tenant2._id,
                agreement: agreement2._id,
                operation: 'question',
                model: process.env.GEMINI_MODEL || 'gemini-3.7-flash',
                status: 'failed',
                errorMessage: 'Example seeded failed AI request'
            }

        ]);


        console.log('AI usage records created: 6');
        console.log('');


        // ====================================================
        // RENT REMINDERS
        // ====================================================

        console.log('Creating rent reminders...');


        await RentReminder.create([

            {
                rental: rental1._id,

                property: property1._id,

                landlord: landlord1._id,

                tenant: tenant1._id,

                amount: 18000,

                dueDate: new Date('2026-09-05'),

                status: 'overdue',

                paidAt: null,

                reminderSent: true,

                notes: 'September 2026 rent'
            },

            {
                rental: rental1._id,

                property: property1._id,

                landlord: landlord1._id,

                tenant: tenant1._id,

                amount: 18000,

                dueDate: new Date('2026-10-05'),

                status: 'upcoming',

                paidAt: null,

                reminderSent: false,

                notes: 'October 2026 rent'
            },

            {
                rental: rental1._id,

                property: property1._id,

                landlord: landlord1._id,

                tenant: tenant1._id,

                amount: 18000,

                dueDate: new Date('2026-08-05'),

                status: 'paid',

                paidAt: new Date('2026-08-04'),

                reminderSent: true,

                notes: 'August 2026 rent paid'
            },

            {
                rental: rental2._id,

                property: property3._id,

                landlord: landlord2._id,

                tenant: tenant2._id,

                amount: 28000,

                dueDate: new Date('2026-09-10'),

                status: 'upcoming',

                paidAt: null,

                reminderSent: false,

                notes: 'September 2026 rent'
            },

            {
                rental: rental2._id,

                property: property3._id,

                landlord: landlord2._id,

                tenant: tenant2._id,

                amount: 28000,

                dueDate: new Date('2026-08-10'),

                status: 'paid',

                paidAt: new Date('2026-08-09'),

                reminderSent: true,

                notes: 'August 2026 rent paid'
            },

            {
                rental: rental2._id,

                property: property3._id,

                landlord: landlord2._id,

                tenant: tenant2._id,

                amount: 28000,

                dueDate: new Date('2026-10-10'),

                status: 'upcoming',

                paidAt: null,

                reminderSent: false,

                notes: 'October 2026 rent'
            }

        ]);


        console.log('Rent reminders created: 6');
        console.log('');


        // ====================================================
        // ACTIVITY LOGS
        // ====================================================

        console.log('Creating activity logs...');


        await ActivityLog.create([

            {
                user: landlord1._id,
                action: 'PROPERTY_CREATED',
                module: 'property',
                description:
                    'Landlord created a new rental property.',
                targetType: 'Property',
                targetId: property1._id,
                metadata: {
                    propertyTitle: property1.title
                },
                status: 'success'
            },

            {
                user: landlord1._id,
                action: 'PROPERTY_CREATED',
                module: 'property',
                description:
                    'Landlord created an available rental property.',
                targetType: 'Property',
                targetId: property2._id,
                metadata: {
                    propertyTitle: property2.title
                },
                status: 'success'
            },

            {
                user: tenant1._id,
                action: 'RENTAL_BOOKED',
                module: 'rental',
                description:
                    'Tenant booked a rental property.',
                targetType: 'Rental',
                targetId: rental1._id,
                metadata: {
                    propertyId: property1._id
                },
                status: 'success'
            },

            {
                user: landlord1._id,
                action: 'AGREEMENT_UPLOADED',
                module: 'agreement',
                description:
                    'Landlord uploaded a rental agreement.',
                targetType: 'Agreement',
                targetId: agreement1._id,
                metadata: {
                    fileType: 'pdf'
                },
                status: 'success'
            },

            {
                user: landlord2._id,
                action: 'AGREEMENT_UPLOADED',
                module: 'agreement',
                description:
                    'Landlord uploaded a rental agreement.',
                targetType: 'Agreement',
                targetId: agreement2._id,
                metadata: {
                    fileType: 'docx'
                },
                status: 'success'
            },

            {
                user: tenant1._id,
                action: 'AI_SUMMARY',
                module: 'ai',
                description:
                    'Tenant generated an agreement summary.',
                targetType: 'Agreement',
                targetId: agreement1._id,
                metadata: {
                    operation: 'summary'
                },
                status: 'success'
            },

            {
                user: tenant1._id,
                action: 'AI_RISK_DETECTION',
                module: 'ai',
                description:
                    'Tenant generated an AI risk analysis.',
                targetType: 'Agreement',
                targetId: agreement1._id,
                metadata: {
                    operation: 'risk_detection'
                },
                status: 'success'
            },

            {
                user: landlord1._id,
                action: 'AI_CLAUSE_EXPLANATION',
                module: 'ai',
                description:
                    'Landlord requested explanation of an agreement clause.',
                targetType: 'Agreement',
                targetId: agreement1._id,
                metadata: {
                    operation: 'clause_explanation'
                },
                status: 'success'
            },

            {
                user: tenant1._id,
                action: 'AI_QUESTION',
                module: 'ai',
                description:
                    'Tenant asked a question about the agreement.',
                targetType: 'Agreement',
                targetId: agreement1._id,
                metadata: {
                    operation: 'question'
                },
                status: 'success'
            },

            {
                user: tenant1._id,
                action: 'REMINDER_CREATED',
                module: 'rent-reminder',
                description:
                    'Rent reminder generated for tenant.',
                targetType: 'RentReminder',
                metadata: {
                    rentalId: rental1._id
                },
                status: 'success'
            },

            {
                user: tenant1._id,
                action: 'RENT_PAID',
                module: 'rent-reminder',
                description:
                    'Tenant marked rent as paid.',
                targetType: 'RentReminder',
                metadata: {
                    rentalId: rental1._id,
                    amount: 18000
                },
                status: 'success'
            },

            {
                user: admin._id,
                action: 'ADMIN_DASHBOARD_VIEW',
                module: 'admin',
                description:
                    'Administrator viewed the admin dashboard.',
                targetType: '',
                metadata: {},
                status: 'success'
            }

        ]);


        console.log('Activity logs created: 12');
        console.log('');


        // ====================================================
        // FINAL SUMMARY
        // ====================================================

        console.log('');
        console.log('==============================================');
        console.log('       DATABASE SEED COMPLETED');
        console.log('==============================================');
        console.log('');

        console.log('Users:          5');
        console.log('Role Permissions: 3');
        console.log('Properties:     5');
        console.log('Rentals:        3');
        console.log('Agreements:     2');
        console.log('AI Analyses:    5');
        console.log('AI Usage:       6');
        console.log('Rent Reminders: 6');
        console.log('Activity Logs:  12');

        console.log('');
        console.log('==============================================');
        console.log('LOGIN CREDENTIALS');
        console.log('==============================================');

        console.log('');
        console.log('ADMIN');
        console.log('Email:    admin@test.com');
        console.log('Password: Admin@12345');

        console.log('');
        console.log('LANDLORD 1');
        console.log('Email:    landlord@test.com');
        console.log('Password: Test@12345');

        console.log('');
        console.log('LANDLORD 2');
        console.log('Email:    landlord2@test.com');
        console.log('Password: Test@12345');

        console.log('');
        console.log('TENANT 1');
        console.log('Email:    tenant@test.com');
        console.log('Password: Test@12345');

        console.log('');
        console.log('TENANT 2');
        console.log('Email:    tenant2@test.com');
        console.log('Password: Test@12345');

        console.log('');
        console.log('==============================================');
        console.log('FIXED TEST IDS');
        console.log('==============================================');

        console.log('');
        console.log('Properties:');
        console.log('property1 =', IDS.properties.property1);
        console.log('property2 =', IDS.properties.property2);
        console.log('property3 =', IDS.properties.property3);
        console.log('property4 =', IDS.properties.property4);
        console.log('property5 =', IDS.properties.property5);

        console.log('');
        console.log('Rentals:');
        console.log('rental1 =', IDS.rentals.rental1);
        console.log('rental2 =', IDS.rentals.rental2);
        console.log('rental3 =', IDS.rentals.rental3);

        console.log('');
        console.log('Agreements:');
        console.log('agreement1 =', IDS.agreements.agreement1);
        console.log('agreement2 =', IDS.agreements.agreement2);

        console.log('');
        console.log('==============================================');
        console.log('IMPORTANT TEST STATE');
        console.log('==============================================');

        console.log('');
        console.log('Property 1: RENTED');
        console.log('Property 2: AVAILABLE');
        console.log('Property 3: RENTED');
        console.log('Property 4: AVAILABLE');
        console.log('Property 5: INACTIVE');

        console.log('');
        console.log('Property 2 is intentionally AVAILABLE');
        console.log('so the rental booking test can use it.');

        console.log('');
        console.log('==============================================');
        console.log('');

    } catch (error) {

        console.error('');
        console.error('==============================================');
        console.error('DATABASE SEED FAILED');
        console.error('==============================================');
        console.error('');

        console.error(error);

        console.error('');

    } finally {

        await mongoose.connection.close();

        console.log('MongoDB connection closed.');

    }
};


// ============================================================
// RUN
// ============================================================

seedDatabase();