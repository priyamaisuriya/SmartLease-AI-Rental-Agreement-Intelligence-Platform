require('dotenv').config();

const {
  generateAgreementSummary
} = require('./services/aiService');

const testAgreement = `
RENTAL AGREEMENT

Landlord: Rahul Patel
Tenant: Amit Shah

Property:
2BHK Apartment, Vesu, Surat

Monthly Rent:
?18,000

Security Deposit:
?50,000

Agreement Duration:
1 October 2026 to 30 September 2027

The tenant shall pay rent on or before the 5th day
of every month.

The tenant must maintain the property in good condition.

Either party must provide 2 months written notice
before termination.
`;

async function test() {
  try {
    console.log('Testing Gemini AI...');

    const result =
      await generateAgreementSummary(
        testAgreement
      );

    console.log('\n===== AI RESULT =====\n');
    console.log(result);
    console.log('\n=====================\n');

  } catch (error) {
    console.error(
      'AI test failed:',
      error.message
    );
  }
}

test();
