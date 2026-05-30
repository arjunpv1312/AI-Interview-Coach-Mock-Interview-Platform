import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/interact', async (req, res) => {
    try {
      const { company, role, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ text: "I'm sorry, but I cannot assist you right now. The Gemini API Key is missing from your server configuration. Please add it to continue the interview." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let chatPrompt = `You are a strict, highly technical interviewer at ${company} interviewing a candidate for the "${role}" position.
Your responses must be spoken-word conversational and concise (1-3 sentences maximum).

Crucial Instructions:
1. FOCUS ON DEPTH: Ask practical, highly technical questions, including coding logic, system design, data structures, or deeply specialized aspects of the ${role} at ${company}. Don't ask generic questions.
2. ADAPTIVE: If the candidate answers well, immediately pivot to a harder follow-up or a completely new complex technical topic.
3. CONVERSATIONAL: Do not use markdown, lists, or asterisks (like *smiles*). Pure spoken text only.
4. PROBE: If they give a superficial answer, ask them to explain the inner workings or edge cases. If they get stuck, give a tiny hint and push them to think.
5. NO LONG SPEECHES: The user must do the talking. Keep your prompts short.

Conversation so far:
`;

      if (history && history.length > 0) {
        history.forEach((msg: any) => {
           chatPrompt += `${msg.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${msg.text}\n`;
        });
      } else {
        chatPrompt += "(Start the interview by introducing yourself briefly as the AI interviewer and asking the first interview question regarding the role.)\n";
      }
      
      chatPrompt += `\nInterviewer:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: chatPrompt,
      });

      if (!response.text) {
        throw new Error("Empty response from AI");
      }

      res.json({ text: response.text });
    } catch (error) {
      console.error('Error getting interaction:', error);
      res.json({ text: "I'm having a technical issue processing that. Could you please answer the previous question again, or rephrase it?" });
    }
  });

  app.post('/api/evaluate', async (req, res) => {
    try {
      const { company, role, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          crackProbability: "Needs Work",
          overallScore: 0,
          overallSummary: "We couldn't fully evaluate your performance because the Gemini API Key is missing.",
          speakingSkills: "Not enough data.",
          technicalSkills: "Not enough data.",
          deepDive: "Your server is missing the Gemini API Key. Please add it to your configuration.",
          improvements: ["Add GEMINI_API_KEY to continue."]
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let chatPrompt = `Analyze this interview transcript for a ${role} at ${company}.
Evaluate the candidate thoroughly based on the conversation.
You MUST return ONLY a raw JSON object with the following fields: 
- crackProbability: string (Must be exactly one of: "Highly Likely", "Possible", "Needs Work")
- overallScore: number (A score from 0 to 100 representing their overall performance)
- overallSummary: string (A solid 2-3 sentence overview of their performance. Explicitly state whether they have a well-founded chance to clear the interview or crack the job/internship offer based on this evaluation.)
- speakingSkills: string (Evaluate their communication, tone, and clarity)
- technicalSkills: string (Evaluate the accuracy, depth, and problem-solving skills)
- deepDive: string (A very comprehensive, multi-paragraph deep-dive analysis summarizing specific topics discussed, strengths, weaknesses, and nuances from the candidate's answers)
- improvements: array of strings (List 3-5 specific, actionable areas they need to improve on)

Transcript:
`;

      history.forEach((msg: any) => {
         chatPrompt += `${msg.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${msg.text}\n`;
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: chatPrompt,
      });

      let responseText = response.text || "";
      
      let parsedResponse = {
        crackProbability: "Needs Work",
        overallScore: 0,
        overallSummary: "We couldn't fully evaluate your performance.",
        speakingSkills: "Not enough data.",
        technicalSkills: "Not enough data.",
        deepDive: "There was a technical issue analyzing the interview data. Please try taking another interview.",
        improvements: ["Practice more interviews."]
      };

      try {
        const jsonMatch = responseText.match(/```(?:json)?\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
        if (jsonMatch) {
            const jsonText = Array.isArray(jsonMatch) && jsonMatch[1] ? jsonMatch[1] : jsonMatch[0];
            parsedResponse = JSON.parse(jsonText);
        } else {
            parsedResponse = JSON.parse(responseText);
        }
      } catch (e) {
        console.error("Failed to parse Gemini evaluation as JSON:", responseText, e);
      }

      res.json(parsedResponse);
    } catch (error) {
      console.error('Error getting evaluation:', error);
      res.json({
        crackProbability: "Needs Work",
        overallScore: 0,
        overallSummary: "We couldn't fully evaluate your performance due to a server error.",
        speakingSkills: "Not enough data.",
        technicalSkills: "Not enough data.",
        deepDive: "There was an unexpected error connecting to the AI system. We apologize for the inconvenience and recommend trying your interview again.",
        improvements: ["Ensure stable network connection.", "Try another mock interview session."]
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
