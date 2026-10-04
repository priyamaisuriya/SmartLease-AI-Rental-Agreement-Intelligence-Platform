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

// 2. Create the Extraction Agent
const extractionPrompt = PromptTemplate.fromTemplate(`
You are an expert real estate data extractor. 
Extract the following information from the rental agreement text below.
If a piece of information is missing, state "Not found".

Information to extract:
1. Rent Amount
2. Security Deposit
3. Lease Start and End Dates
4. Notice Period

Agreement Text:
{document_text}

Provide the output in a clear JSON format.
`);

const extractionAgent = RunnableSequence.from([
  extractionPrompt,
  llm,
  new StringOutputParser(),
]);

// 3. Create the Legal Compliance Agent
const legalPrompt = PromptTemplate.fromTemplate(`
You are a strict real estate lawyer.
Analyze the rental agreement text below and flag any missing standard clauses 
(e.g., subletting, maintenance responsibilities) or unusual/risky terms.

Agreement Text:
{document_text}

Provide a short, bulleted list of legal risks.
`);

const legalAgent = RunnableSequence.from([
  legalPrompt,
  llm,
  new StringOutputParser(),
]);

// 4. The Orchestrator (Main Function)
async function analyzeAgreement(documentText) {
  try {
    console.log("Starting Multi-Agent Analysis...");

    // Run both agents in parallel
    const [extractedData, legalRisks] = await Promise.all([
      extractionAgent.invoke({ document_text: documentText }),
      legalAgent.invoke({ document_text: documentText }),
    ]);

    // Combine the results
    const finalReport = {
      summary: "Agent Analysis Complete",
      extractedDetails: extractedData,
      legalAnalysis: legalRisks
    };

    return finalReport;
  } catch (error) {
    console.error("Agent Analysis Failed:", error);
    throw error;
  }
}

module.exports = { analyzeAgreement };
