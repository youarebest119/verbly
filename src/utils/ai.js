import { GoogleGenAI, Type } from '@google/genai';

// Configure the client
const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_APP_GEMINI_API_KEY,
});

// Function declaration
const fixSentenceFunctionDeclaration = {
    name: 'fix_sentence',
    description: 'Fix grammar and spelling of a sentence and adjust the tone.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            original: {
                type: Type.STRING,
                description: 'The original input sentence.',
            },
            corrected: {
                type: Type.STRING,
                description: 'The corrected sentence with tone applied.',
            },
            tone: {
                type: Type.STRING,
                description:
                    'Tone used (normal, formal, casual, professional, friendly). Default is normal.',
            },
        },
        required: ['original', 'corrected', 'tone'],
    },
};

export const fixSentence = async (text, tone = "normal") => {
    try {
        const prompt = `
Fix the following sentence.

Rules:
- If tone is "normal", only fix grammar and spelling.
- Keep meaning the same.
- Apply requested tone.
- Don't change anything if not needed.

Sentence: "${text}"
Tone: "${tone}"
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [
                    {
                        functionDeclarations: [fixSentenceFunctionDeclaration],
                    },
                ],
                toolConfig: {
                    functionCallingConfig: {
                        mode: "ANY", // 🔥 forces function call
                    },
                },
            },
        });

        // ✅ Always get structured JSON here
        if (response.functionCalls && response.functionCalls.length > 0) {
            return response.functionCalls[0].args;
        }

        throw new Error("No function call returned");

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};
