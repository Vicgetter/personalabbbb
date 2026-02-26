import { GoogleGenerativeAI } from "@google/generative-ai";

// Cache for avatars to avoid re-generating the same image type constantly
const AVATAR_API = 'https://api.dicebear.com/7.x/bottts/svg?seed=';

// Helper to find a valid model dynamically based on the user's API key
const getValidModelName = async (apiKey) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            throw new Error("Invalid API key or network issue when fetching models.");
        }
        const data = await response.json();
        const availableModels = data.models.filter(m =>
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
        );

        if (availableModels.length === 0) {
            throw new Error("No text generation models found for this API key.");
        }

        // Prefer 1.5 flash, then any flash, then any pro, then fallback to first available
        const flash15 = availableModels.find(m => m.name.includes("gemini-1.5-flash"));
        if (flash15) return flash15.name.replace('models/', '');

        const flash = availableModels.find(m => m.name.includes("flash"));
        if (flash) return flash.name.replace('models/', '');

        const pro = availableModels.find(m => m.name.includes("pro"));
        if (pro) return pro.name.replace('models/', '');

        return availableModels[0].name.replace('models/', '');
    } catch (error) {
        console.error("Model fetch error:", error);
        // Fallback to a safe guess if the fetch fails completely
        return "gemini-1.5-flash";
    }
};

export const generatePersona = async (config, apiKey) => {
    try {
        const modelName = await getValidModelName(apiKey);
        console.log("Using model:", modelName);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
      You are generating an AI persona for an educational interview simulation game called PersonaLab.
      The user (a student researcher) has defined the following characteristics for the interviewee:
      - Age: ${config.age}
      - Gender: ${config.gender}
      - Occupation: ${config.occupation}
      - Personality Traits: ${config.traits.join(', ')}
      - Background: ${config.background || "No specific background provided."}
      - Topic of Interview: ${config.topic || "General interview."}

      Your task is to generate a detailed back-story and persona profile. 
      Respond ONLY in valid JSON format with the following schema:
      {
        "name": "Full Name of the persona",
        "backstory": "A short 2-3 sentence backstory.",
        "personalityDescription": "A 1-2 sentence description of their personality.",
        "interviewBehavior": "How they will act during the interview (e.g. 'Answers briefly, seems annoyed', 'Very chatty and tangental').",
        "avatarSeed": "A one or two-word unique string describing their overall look",
        "avatarHair": "Pick ONE exactly from this list (or leave empty): fonze, mrT, mrClean, dougFunny, dannyPhantom, full, pixie, dallas",
        "avatarMouth": "Pick ONE exactly from this list (or leave empty): surprised, laugh, nervous, smile, smirk, pucker, frown"
      }
    `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        console.log("Raw Gemini Persona Response:", responseText);

        // Strip out markdown formatting if the model included it
        responseText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();

        const personaData = JSON.parse(responseText);

        // Construct a more accurate avatar URL using Dicebear style options
        let avatarQuery = `seed=${encodeURIComponent(personaData.avatarSeed || config.occupation || config.name)}`;

        // Micah style supports basic attributes we can map to the persona
        if (personaData.avatarHair) {
            avatarQuery += `&hair[]=${personaData.avatarHair.toLowerCase()}`;
        }
        if (personaData.avatarMouth) {
            avatarQuery += `&mouth[]=${personaData.avatarMouth.toLowerCase()}`;
        }

        return {
            ...personaData,
            avatarUrl: `https://api.dicebear.com/9.x/micah/svg?${avatarQuery}`
        };

    } catch (error) {
        console.error("Error generating persona:", error);
        if (error.message && error.message.includes('429')) {
            throw new Error("API rate limit exceeded. Please wait a few seconds and try again.");
        }
        throw new Error("Failed to generate persona: " + (error.message || "Unknown error"));
    }
};

export const generateChatResponse = async (history, userInput, persona, config, apiKey) => {
    try {
        const modelName = await getValidModelName(apiKey);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Build the system instructions
        const systemPrompt = `
      You are roleplaying as an interviewee in an educational game called PersonaLab.
      Your name is ${persona.name}.
      Your backstory: ${persona.backstory}.
      Your personality: ${persona.personalityDescription}.
      Your behavior style: "${persona.interviewBehavior}".
      The topic of the interview might be about: ${config.topic || "General"}.
      
      RULES:
      1. Stay completely in character at all times. Never break character.
      2. Respond realistically based on your personality and backstory. If you are shy, answer briefly. If you are talkative, elaborate.
      3. Provide natural, conversational responses. Use natural phrasing, occasional filler words if appropriate for your persona.
      4. DO NOT mention you are an AI or an language model. You are a human participant in a research study.
      5. Keep your responses concise enough for a chat interface (max 2-4 sentences unless prompted to elaborate deeply).
    `;

        // Convert our internal history format to Gemini's format
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // If history is empty, initialize the chat with our system prompt context
        const chatSession = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt + " \\n\\nAre you ready?" }] },
                { role: 'model', parts: [{ text: "Yes, I'm ready. I'll stay completely in character." }] },
                ...formattedHistory
            ]
        });

        const result = await chatSession.sendMessage(userInput);
        return result.response.text();

    } catch (error) {
        console.error("Error generating chat response:", error);
        if (error.message && error.message.includes('429')) {
            throw new Error("API rate limit exceeded. Please wait a few seconds and try again.");
        }
        throw new Error("Failed to get response: " + (error.message || "Unknown error"));
    }
};

export const generateInterviewFeedback = async (transcript, apiKey) => {
    try {
        const modelName = await getValidModelName(apiKey);
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Format transcript for the prompt
        const formattedTranscript = transcript.map(msg =>
            `${msg.role === 'model' ? 'Interviewee' : 'Student'}: ${msg.text}`
        ).join('\\n');

        const prompt = `
      You are an expert qualitative research instructor evaluating a student's interview with an AI persona.
      Here is the transcript of the interview:
      ---
      ${formattedTranscript}
      ---
      
      Please evaluate the student's performance based on:
      1. Open-ended vs Closed questions: Did they ask questions that allowed the interviewee to elaborate?
      2. Follow-ups: Did they listen to answers and ask relevant follow-up questions?
      3. Interview Depth: Did they uncover interesting themes or just ask surface-level questions?

      Respond ONLY in valid JSON format with the following schema:
      {
        "themes": ["theme 1", "theme 2", "theme 3"],
        "quotes": [
          {"text": "A key quote by the interviewee", "context": "What student asked to get this"}
        ],
        "feedback": {
          "openEndedScore": 8, // 1-10
          "followUpScore": 7, // 1-10
          "depthScore": 8, // 1-10
          "strengths": "What the student did well.",
          "areasForImprovement": "What they could do better next time."
        }
      }
    `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        console.log("Raw Gemini Feedback Response:", responseText);

        // Strip out markdown formatting
        responseText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();

        return JSON.parse(responseText);

    } catch (error) {
        console.error("Error generating feedback:", error);
        if (error.message && error.message.includes('429')) {
            throw new Error("API rate limit exceeded. Since Gemini's free tier has a limit of 15 requests per minute, please wait about 1 minute before trying to generate feedback or playing again.");
        }
        throw new Error("Failed to generate interview feedback: " + (error.message || "Unknown error"));
    }
};
