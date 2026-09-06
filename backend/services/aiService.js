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

    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
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

Include:

1. Parties involved
2. Property details
3. Rent amount
4. Security deposit
5. Agreement duration
6. Payment terms
7. Maintenance responsibilities
8. Important tenant responsibilities
9. Important landlord responsibilities
10. Termination conditions
11. Notice period
12. Important restrictions
13. Other important clauses

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


module.exports = {
    generateAgreementSummary,
    explainClause,
    detectAgreementRisks,
    answerAgreementQuestion
};