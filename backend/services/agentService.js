const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { RunnableSequence } = require("@langchain/core/runnables");
const { StringOutputParser } = require("@langchain/core/output_parsers");
require("dotenv").config();

// 1. Initialize the "Brain" (Gemini)
// Make sure GEMINI_API_KEY is set in your .env file
const llm = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash", 
  maxOutputTokens: 2048,
});

// 2. Create the Agreement Analysis Prompt
const agreementPrompt = PromptTemplate.fromTemplate(`
You are an expert real estate lawyer and advisor.
Analyze the rental agreement text below and provide a structured JSON response with the following keys.
DO NOT use markdown backticks in the response. Just pure JSON.
Use the actual document as input. Do not invent missing clauses.
If a piece of information is missing, state "Not specified in the agreement".

Keys required:
- summary: A brief summary of the agreement.
- rentAndDeposit: Rent amount, security deposit, and payment terms.
- financialObligations: Any other charges, utilities, or financial responsibilities.
- responsibilities: Tenant and landlord responsibilities.
- noticeAndTermination: Notice periods and termination clauses.
- cancellationAndPenalty: Cancellation terms and penalties.
- importantDates: Lease start, end dates, and payment due dates.
- unusualClauses: Unusual, risky, or potentially unfavorable clauses.
- clarifications: Points that may need clarification.

Agreement Text:
{document_text}

JSON Output:
`);

const agreementAgent = RunnableSequence.from([
  agreementPrompt,
  llm,
  new StringOutputParser(),
]);

// 3. Create the Conditions Analysis Prompt
const conditionsPrompt = PromptTemplate.fromTemplate(`
You are an expert real estate advisor.
Analyze the landlord-defined property conditions below and provide a structured JSON response.
DO NOT use markdown backticks in the response. Just pure JSON.
Use the actual conditions as input. Do not invent missing clauses.
If a piece of information is missing, state "Not specified in the conditions".

Keys required:
- restrictions: Any restrictions (e.g., pets, smoking, occupancy).
- charges: Any additional charges or deposits mentioned.
- responsibilities: Maintenance and utility responsibilities.
- noticeAndCancellation: Notice periods and cancellation terms.
- warnings: Important warnings or strict rules.
- summary: A brief friendly summary of what the tenant needs to know.

Conditions Text:
{document_text}

JSON Output:
`);

const conditionsAgent = RunnableSequence.from([
  conditionsPrompt,
  llm,
  new StringOutputParser(),
]);

const cleanJsonResponse = (text) => {
    let clean = text.trim();
    if (clean.startsWith('\`\`\`json')) {
        clean = clean.replace(/^\`\`\`json\n?/, '');
        clean = clean.replace(/\n?\`\`\`$/, '');
    } else if (clean.startsWith('\`\`\`')) {
        clean = clean.replace(/^\`\`\`\n?/, '');
        clean = clean.replace(/\n?\`\`\`$/, '');
    }
    return JSON.parse(clean);
};

// 4. The Orchestrator (Main Function)
async function analyzeAgreement(documentText) {
  try {
    const response = await agreementAgent.invoke({ document_text: documentText });
    return cleanJsonResponse(response);
  } catch (error) {
    console.error("Agreement Analysis Failed:", error);
    throw error;
  }
}

async function analyzeConditions(conditionsText) {
  try {
    const response = await conditionsAgent.invoke({ document_text: conditionsText });
    return cleanJsonResponse(response);
  } catch (error) {
    console.error("Conditions Analysis Failed:", error);
    throw error;
  }
}

module.exports = { analyzeAgreement, analyzeConditions };
