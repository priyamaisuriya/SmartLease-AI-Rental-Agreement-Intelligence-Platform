const cron = require('node-cron');

const {
  runRentReminderAutomation
} = require('./rentReminderService');

const startRentReminderScheduler = () => {
  console.log(
    'Rent reminder scheduler started.'
  );

  // Run once when the server starts.
  runRentReminderAutomation();

  // Run once every day.
  cron.schedule(
    '0 0 * * *',
    async () => {
      await runRentReminderAutomation();
    }
  );
};

module.exports = {
  startRentReminderScheduler
};
