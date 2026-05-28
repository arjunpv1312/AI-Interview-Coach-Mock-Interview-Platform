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
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let chatPrompt = `You are a professional technical interviewer for ${company} interviewing a candidate for a ${role} position. 
Keep your responses conversational, realistic, and concise (1-3 sentences maximum). 
If the user provides a good answer, acknowledge it briefly and ask the next question.
If the user's answer is lacking, they are stuck, or they ask for help, give them a small hint or suggest an improvement, then ask them to try again.
If they still cannot answer, simply move on to a different topic.
Do NOT output any markdown formatting, just pure conversational text to be read using Text-to-Speech.

Conversation so far:
`;

      if (history && history.length > 0) {
        history.forEach((msg: any) => {
           chatPrompt += `${msg.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${msg.text}\n`;
        });
      } else {
        chatPrompt += "(Start the interview by introducing yourself briefly as the AI interviewer and asking the first interview question.)\n";
      }
      
      chatPrompt += `\nInterviewer:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: chatPrompt,
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error('Error getting interaction:', error);
      res.status(500).json({ error: 'Failed to generate interviewer response' });
    }
  });

  app.post('/api/evaluate', async (req, res) => {
    try {
      const { company, role, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let chatPrompt = `Analyze this interview transcript for a ${role} at ${company}.
Evaluate the candidate thoroughly based on the conversation.
You MUST return ONLY a raw JSON object with the following fields: 
- crackProbability: string (Must be exactly one of: "Highly Likely", "Possible", "Needs Work")
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
        overallSummary: "We couldn't fully evaluate your performance.",
        speakingSkills: "Not enough data.",
        technicalSkills: "Not enough data.",
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
      res.status(500).json({ error: 'Failed to generate evaluation' });
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
