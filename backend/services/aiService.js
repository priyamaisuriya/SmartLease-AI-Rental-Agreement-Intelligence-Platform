const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn(
        'WARNING: GEMINI_API_KEY is not configured in .env'
    );
}

const ai = new GoogleGenAI({
    apiKey
});

const modelName =
    process.env.GEMINI_MODEL || 'gemini-3.7-flash';


// =====================================================
// COMMON GEMINI REQUEST
// =====================================================

const generateAIResponse = async (prompt) => {
    if (!apiKey) {
        throw new Error(
            'GEMINI_API_KEY is not configured'
        );
    }

    // Handle token/context limits by truncating extremely long inputs
    // 500,000 characters is a safe limit for typical context windows
    const MAX_CHARS = 500000;
    const safePrompt = prompt.length > MAX_CHARS 
        ? prompt.substring(0, MAX_CHARS) + "\n...[TRUNCATED DUE TO LENGTH]..." 
        : prompt;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: safePrompt,
            config: {
                temperature: 0.2,
                maxOutputTokens: 4096
            }
        });

        const text = response.text;

        if (!text) {
            throw new Error(
                'Gemini returned an empty response'
            );
        }

        return text.trim();
    } catch (error) {
        console.error("AI Generation failed:", error);
        throw new Error("AI provider failed to generate analysis. " + error.message);
    }
};


// =====================================================
// AGREEMENT SUMMARY
// =====================================================

const generateAgreementSummary = async (
    agreementText
) => {
    if (!agreementText || !agreementText.trim()) {
        throw new Error(
            'Agreement text is empty'
        );
    }

    const prompt = `
You are SmartLease AI, an intelligent rental agreement
assistant.

Analyze the following rental agreement and create a
clear summary for both the landlord and tenant.

Do not invent information that is not present in the
agreement.

Include the following sections exactly:

1. Summary
2. Rent and deposit
3. Financial obligations
4. Tenant and landlord responsibilities
5. Notice and termination clauses
6. Cancellation and penalty clauses
7. Important dates
8. Unusual or potentially unfavorable clauses
9. Points that may need clarification

Use simple language.

If a particular piece of information is not present,
write "Not specified in the agreement".

Rental Agreement:

${agreementText}
`;

    return generateAIResponse(prompt);
};


// =====================================================
// CLAUSE EXPLANATION
// =====================================================

const explainClause = async (
    agreementText,
    clause
) => {
    if (!agreementText || !agreementText.trim()) {
        throw new Error(
            'Agreement text is empty'
        );
    }

    if (!clause || !clause.trim()) {
        throw new Error(
            'Clause is required'
        );
    }

    const prompt = `
You are SmartLease AI.

Explain the selected rental agreement clause in simple,
easy-to-understand language.

Do not change the meaning of the clause.

Explain:

1. What the clause says
2. What it means for the tenant
3. What it means for the landlord
4. Important things to be aware of
5. Any potential concern, if applicable

Do not provide definitive legal advice.

Selected Clause:

${clause}

Full Agreement Context:

${agreementText}
`;

    return generateAIResponse(prompt);
};


// =====================================================
// RISK DETECTION
// =====================================================

const detectAgreementRisks = async (
    agreementText
) => {
    if (!agreementText || !agreementText.trim()) {
        throw new Error(
            'Agreement text is empty'
        );
    }

    const prompt = `
You are SmartLease AI performing rental agreement
risk analysis.

Analyze the following agreement and identify clauses
that may require attention from a tenant or landlord.

Look specifically for:

- Unusually high penalties
- Unclear payment conditions
- Unclear security deposit rules
- Unreasonable notice periods
- Difficult termination conditions
- Automatic renewal
- Excessive restrictions
- Maintenance ambiguity
- Repair responsibility ambiguity
- Deposit deduction conditions
- Late payment penalties
- Lock-in periods
- Hidden fees
- One-sided obligations
- Ambiguous clauses
- Missing important information

For every potential issue provide:

Risk:
Severity:
Clause:
Why it matters:
Who should pay attention:
Suggested action:

Severity must be one of:

LOW
MEDIUM
HIGH

Do not claim that a clause is legally illegal.
This is an AI-based document analysis and not legal advice.

Agreement:

${agreementText}
`;

    return generateAIResponse(prompt);
};


// =====================================================
// AGREEMENT QUESTION & ANSWER
// =====================================================

const answerAgreementQuestion = async (
    agreementText,
    question
) => {
    if (!agreementText || !agreementText.trim()) {
        throw new Error(
            'Agreement text is empty'
        );
    }

    if (!question || !question.trim()) {
        throw new Error(
            'Question is required'
        );
    }

    const prompt = `
You are SmartLease AI.

Answer the user's question using ONLY the information
contained in the rental agreement below.

If the answer cannot be found in the agreement, clearly
say:

"The agreement does not specify this information."

Do not invent facts.

Keep the answer clear and practical.

User Question:

${question}

Rental Agreement:

${agreementText}
`;

    return generateAIResponse(prompt);
};

// =====================================================
// PROPERTY CONDITIONS ANALYSIS
// =====================================================

const analyzePropertyConditions = async (
    conditionsText
) => {
    if (!conditionsText || !conditionsText.trim()) {
        throw new Error(
            'Conditions text is empty'
        );
    }

    const prompt = `
You are SmartLease AI.

Analyze the following property rental conditions provided by the landlord.
Help the tenant understand the following specific points clearly:
- Restrictions
- Charges
- Responsibilities
- Notice periods
- Cancellation terms
- Important warnings

Do not provide legal advice. Make the analysis clear and concise.

Property Conditions:

${conditionsText}
`;

    return generateAIResponse(prompt);
};

module.exports = {
    generateAgreementSummary,
    explainClause,
    detectAgreementRisks,
    answerAgreementQuestion,
    analyzePropertyConditions
};