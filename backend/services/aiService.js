
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


const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

const generateAIResponse = async (prompt) => {
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    if (typeof prompt !== 'string' || !prompt.trim()) {
        throw new Error('AI prompt is empty');
    }

    const MAX_CHARS = 500000;

    const safePrompt =
        prompt.length > MAX_CHARS
            ? prompt.substring(0, MAX_CHARS) +
            '\n...[TRUNCATED DUE TO LENGTH]...'
            : prompt;

    // Configure these model names in your backend .env.
    const primaryModel =
        process.env.GEMINI_MODEL || 'gemini-3.7-flash';

    const fallbackModel =
        process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash';

    const models = [
        ...new Set([primaryModel, fallbackModel])
    ];

    let lastError;

    for (const model of models) {
        // Retry each model up to 3 times for temporary failures.
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents: safePrompt,
                    config: {
                        temperature: 0.2,
                        maxOutputTokens: 4096
                    }
                });

                const generatedText = response.text;

                if (
                    typeof generatedText !== 'string' ||
                    !generatedText.trim()
                ) {
                    throw new Error('Gemini returned an empty response');
                }

                return generatedText.trim();

            } catch (error) {
                lastError = error;

                const status = Number(
                    error.status || error.code
                );

                console.error('Gemini request failed:', {
                    model,
                    attempt: attempt + 1,
                    status,
                    message: error.message
                });

                // Retry only temporary server errors.
                if (![408, 429, 500, 502, 503, 504].includes(status)) {
                    throw error;
                }

                // Stop retrying this model for persistent overload.
                if (status === 503) {
                    break;
                }

                if (attempt < 2) {
                    await sleep(1000 * (2 ** attempt));
                }
            }
        }

        console.warn(`Trying the next Gemini model after failure: ${model}`);
    }

    throw new Error(
        `All configured Gemini models failed. Last error: ${lastError?.message || 'Unknown AI provider error'
        }`
    );
};


// =====================================================
// AGREEMENT SUMMARY
// =====================================================

const generateAgreementSummary = async (agreementText) => {
    if (
        typeof agreementText !== 'string' ||
        !agreementText.trim()
    ) {
        throw new Error('Agreement text is empty');
    }

    const prompt = `
You are SmartLease AI, a rental agreement analysis assistant.

Analyze the provided rental agreement and summarize its
actual contents for the landlord and tenant.

STRICT RULES:
1. Use the agreement as the only source of facts.
2. Never invent clauses, amounts, dates, obligations, or penalties.
3. You may simplify wording without changing its meaning.
4. Clearly distinguish written facts from possible concerns.
5. If information is missing, write:
   "Not specified in the agreement."
6. Do not add generic legal advice or unsupported warnings.
7. Do not claim that a clause is illegal.

Include these sections exactly:

1. Summary
2. Rent and deposit
3. Financial obligations
4. Tenant and landlord responsibilities
5. Notice and termination clauses
6. Cancellation and penalty clauses
7. Important dates
8. Unusual or potentially unfavorable clauses
9. Points that may need clarification

Use simple, clear language.

Rental Agreement:
<agreement>
${agreementText}
</agreement>
`;

    return generateAIResponse(prompt);
};


// =====================================================
// CLAUSE EXPLANATION
// =====================================================

const explainClause = async (agreementText, clause) => {
    if (
        typeof agreementText !== 'string' ||
        !agreementText.trim()
    ) {
        throw new Error('Agreement text is empty');
    }

    if (
        typeof clause !== 'string' ||
        !clause.trim()
    ) {
        throw new Error('Clause is required');
    }

    const prompt = `
You are SmartLease AI.

Explain the selected rental agreement clause in simple language.

STRICT RULES:
1. Preserve the original meaning.
2. Do not invent obligations, rights, charges, or conditions.
3. Base the explanation on the selected clause and the agreement.
4. If something is unclear or absent, explicitly say so.
5. Do not provide definitive legal advice.

Use these sections:

1. What the clause says
2. Meaning for the tenant
3. Meaning for the landlord
4. Important details explicitly stated in the clause
5. Ambiguities, if any

Selected Clause:
<clause>
${clause}
</clause>

Full Agreement Context:
<agreement>
${agreementText}
</agreement>
`;

    return generateAIResponse(prompt);
};


// =====================================================
// RISK DETECTION
// =====================================================

const detectAgreementRisks = async (agreementText) => {
    if (
        typeof agreementText !== 'string' ||
        !agreementText.trim()
    ) {
        throw new Error('Agreement text is empty');
    }

    const prompt = `
You are SmartLease AI performing rental agreement risk analysis.

Identify actual clauses that may require attention from
the tenant or landlord.

You may check for:
- Unclear payment conditions
- Unclear security deposit rules
- Notice and termination conditions
- Automatic renewal
- Maintenance and repair responsibilities
- Deposit deductions
- Late payment penalties
- Lock-in periods
- Additional fees
- One-sided obligations
- Ambiguous clauses
- Missing important information

STRICT RULES:
1. Identify an existing risk only when supported by the agreement.
2. Never invent a clause, fee, penalty, or obligation.
3. Missing information must be labelled as missing information,
   not as an existing contractual violation.
4. Explain why a clause may need clarification.
5. Do not claim that any clause is legally illegal.
6. Do not exaggerate risks or provide definitive legal advice.

For each identified issue, provide:

Risk:
Severity: LOW, MEDIUM, or HIGH
Clause:
Why it matters:
Who should pay attention:
Suggested clarification:

If no specific risk can be established, say so clearly.
Do not manufacture risks merely to fill the response.

Agreement:
<agreement>
${agreementText}
</agreement>
`;

    return generateAIResponse(prompt);
};


// =====================================================
// AGREEMENT QUESTION & ANSWER
// =====================================================

const answerAgreementQuestion = async (
    agreementText,
    question,
    chatHistory = []
) => {
    if (
        typeof agreementText !== 'string' ||
        !agreementText.trim()
    ) {
        throw new Error('Agreement text is empty');
    }

    if (
        typeof question !== 'string' ||
        !question.trim()
    ) {
        throw new Error('Question is required');
    }

    let historyText = '';

    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        historyText =
            'Previous Conversation History:\n' +
            chatHistory
                .map((msg) => {
                    const role =
                        msg.role === 'user'
                            ? 'User'
                            : 'SmartLease AI';

                    return `${role}: ${msg.content}`;
                })
                .join('\n') +
            '\n\n';
    }

    const prompt = `
You are SmartLease AI.

Answer the user's question using the rental agreement
as the source of facts.

STRICT RULES:
1. Do not invent facts or contractual terms.
2. Use previous conversation history only for context.
3. If the agreement does not contain the answer, say:
   "The agreement does not specify this information."
4. Do not treat assumptions as facts.
5. Keep the answer clear and practical.

${historyText}

User Question:
${question}

Rental Agreement:
<agreement>
${agreementText}
</agreement>
`;

    return generateAIResponse(prompt);
};


// =====================================================
// PROPERTY CONDITIONS ANALYSIS
// =====================================================

const analyzePropertyConditions = async (conditionsText) => {
    if (
        typeof conditionsText !== 'string' ||
        !conditionsText.trim()
    ) {
        throw new Error('Conditions text is empty');
    }

    const prompt = `
You are SmartLease AI, a property rental conditions
analysis assistant for the SmartLease application.

Analyze ONLY the property conditions provided by the landlord.

Your task is to organize and explain the existing conditions
in clear, simple English for the tenant.

STRICT RULES — MUST FOLLOW:

1. Use the supplied conditions as the only source of facts.

2. Do not invent or assume any rules, restrictions,
   responsibilities, charges, penalties, rights, or obligations.

3. You may correct spelling mistakes and grammar and rewrite
   informal wording into clear English, but do not change
   the original meaning.

4. Do not interpret a short or incomplete phrase as proof
   of additional contractual terms.

5. Separate an explicitly stated condition from an ambiguity.
   Do not present an assumption as a confirmed fact.

6. If rent, deposit, utility charges, penalties, notice periods,
   or cancellation terms are not mentioned, write:
   "Not specified in the provided conditions."

7. Do not add generic legal advice, hypothetical risks,
   recommendations to sign a lease, or warnings unrelated
   to the supplied conditions.

8. Missing information may be identified, but do not imply
   that a missing term is automatically a violation or a risk.

9. Do not create extra responsibilities from a general rule.
   For example, "pets not allowed" means pets are prohibited.
   It does not establish a pet penalty, additional deposit,
   or eviction procedure.

10. Keep the analysis concise, factual, and easy to understand.

Use exactly these sections:

### 1. Restrictions
List only restrictions explicitly stated or clearly expressed
in the original conditions.

### 2. Responsibilities
List only responsibilities explicitly stated or clearly
expressed in the original conditions.

### 3. Charges
Report charges and penalties only if they are mentioned.
Otherwise write "Not specified in the provided conditions."

### 4. Notice Periods
Report notice periods only if they are mentioned.
Otherwise write "Not specified in the provided conditions."

### 5. Cancellation Terms
Report cancellation or termination terms only if they
are mentioned.
Otherwise write "Not specified in the provided conditions."

### 6. Important Notes
Mention only relevant ambiguities, incomplete wording,
or missing information. Do not add general advice or
invent new concerns.

Before responding, verify that every factual claim is
supported by the original conditions. Remove any claim
that cannot be supported by the supplied text.

Original Property Conditions:
<property_conditions>
${conditionsText}
</property_conditions>

Return only the analysis using the six sections above.
`;

    return generateAIResponse(prompt);
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    generateAgreementSummary,
    explainClause,
    detectAgreementRisks,
    answerAgreementQuestion,
    analyzePropertyConditions
};