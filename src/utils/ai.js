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
    text = text.trim();
    if (!text) return {
        original: "",
        corrected: "",
        tone: "normal"
    };
    try {
        const prompt = `
You are a grammar and tone correction assistant.

Your job:
1. Detect the language of the input sentence.
2. If it is NOT English, translate it to natural English.
3. Fix grammar and spelling.
4. Apply the requested tone.
5. Keep the original meaning exactly the same.
6. If no corrections are needed, return the sentence unchanged (but still ensure it is English).

Tone rules:
- "normal" → neutral, natural English (default)
- "formal" → polite and refined
- "casual" → relaxed and conversational
- "professional" → clear, business-style tone
- "friendly" → warm and approachable

IMPORTANT:
- The final output MUST always be in English.
- Do not explain anything.
- Only return the structured function call.

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
