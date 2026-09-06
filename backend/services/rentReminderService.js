const Rental = require('../models/Rental');
const RentReminder = require('../models/RentReminder');

const getMonthStart = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(1);
  return result;
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const createMonthlyDueDate = (year, month, preferredDay) => {
  const daysInMonth = getDaysInMonth(year, month);

  const day = Math.min(
    Math.max(preferredDay, 1),
    daysInMonth
  );

  const dueDate = new Date(
    year,
    month,
    day
  );

  dueDate.setHours(0, 0, 0, 0);

  return dueDate;
};

const getPreferredDueDay = (rental) => {
  const baseDate =
    rental.startDate ||
    rental.bookingDate ||
    new Date();

  return new Date(baseDate).getDate();
};

const getNextDueDate = (rental, latestDueDate = null) => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const preferredDay = getPreferredDueDay(rental);

  let year;
  let month;

  if (latestDueDate) {
    const latest = new Date(latestDueDate);

    year = latest.getFullYear();
    month = latest.getMonth() + 1;
  } else {
    year = today.getFullYear();
    month = today.getMonth();

    let candidate = createMonthlyDueDate(
      year,
      month,
      preferredDay
    );

    if (candidate < today) {
      month += 1;

      if (month > 11) {
        month = 0;
        year += 1;
      }
    }
  }

  const dueDate = createMonthlyDueDate(
    year,
    month,
    preferredDay
  );

  return dueDate;
};

const isRentalActiveForDate = (rental, dueDate) => {
  if (
    rental.status !== 'active' &&
    rental.status !== 'pending'
  ) {
    return false;
  }

  const date = new Date(dueDate);

  date.setHours(0, 0, 0, 0);

  if (rental.startDate) {
    const startDate = new Date(rental.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (date < startDate) {
      return false;
    }
  }

  if (rental.endDate) {
    const endDate = new Date(rental.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (date > endDate) {
      return false;
    }
  }

  return true;
};

const updateReminderStatuses = async () => {
  const now = new Date();

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await RentReminder.updateMany(
    {
      status: {
        $nin: ['paid', 'cancelled']
      },
      dueDate: {
        $lt: today
      }
    },
    {
      $set: {
        status: 'overdue'
      }
    }
  );

  await RentReminder.updateMany(
    {
      status: {
        $nin: ['paid', 'cancelled']
      },
      dueDate: {
        $gte: today,
        $lt: tomorrow
      }
    },
    {
      $set: {
        status: 'due'
      }
    }
  );

  await RentReminder.updateMany(
    {
      status: {
        $nin: ['paid', 'cancelled']
      },
      dueDate: {
        $gte: tomorrow
      }
    },
    {
      $set: {
        status: 'upcoming'
      }
    }
  );
};

const generateMonthlyReminders = async () => {
  const rentals = await Rental.find({
    status: 'active'
  });

  let createdCount = 0;

  for (const rental of rentals) {
    try {
      const latestReminder =
        await RentReminder.findOne({
          rental: rental._id,
          status: {
            $ne: 'cancelled'
          }
        }).sort({
          dueDate: -1
        });

      const dueDate = getNextDueDate(
        rental,
        latestReminder
          ? latestReminder.dueDate
          : null
      );

      if (
        !isRentalActiveForDate(
          rental,
          dueDate
        )
      ) {
        continue;
      }

      const existingReminder =
        await RentReminder.findOne({
          rental: rental._id,
          dueDate
        });

      if (existingReminder) {
        continue;
      }

      await RentReminder.create({
        rental: rental._id,
        property: rental.property,
        landlord: rental.landlord,
        tenant: rental.tenant,
        amount: rental.monthlyRent,
        dueDate,
        status: 'upcoming',
        reminderSent: false
      });

      createdCount += 1;

    } catch (error) {
      if (error.code === 11000) {
        continue;
      }

      console.error(
        `Failed to create reminder for rental ${rental._id}:`,
        error.message
      );
    }
  }

  return createdCount;
};

const runRentReminderAutomation = async () => {
  try {
    console.log(
      'Running rent reminder automation...'
    );

    await updateReminderStatuses();

    const createdCount =
      await generateMonthlyReminders();

    console.log(
      `Rent reminder automation completed. Created ${createdCount} new reminder(s).`
    );

    return {
      createdCount
    };

  } catch (error) {
    console.error(
      'Rent reminder automation error:',
      error.message
    );

    return {
      createdCount: 0,
      error: error.message
    };
  }
};

module.exports = {
  runRentReminderAutomation,
  updateReminderStatuses,
  generateMonthlyReminders
};
