const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config()
const router = express.Router();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');


router.post('/travel-plan', async (req, res) => {
  try {
    const { origin, destination, preference } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ message: 'Origin and destination are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'AI service not configured. Please add GEMINI_API_KEY to .env file.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const preferenceText = preference === 'cost' ? 'most cost-efficient' :
      preference === 'time' ? 'fastest' : 'best overall balance of cost and time';

    const prompt = `You are an expert travel planner. A user wants to travel from "${origin}" to "${destination}".
    
Provide exactly 3 different travel route options optimized for: ${preferenceText}.

For each option, provide the following in a structured JSON format. Do NOT include markdown code fences, just raw JSON:

{
  "routes": [
    {
      "id": 1,
      "title": "Short descriptive title of this route option",
      "type": "flight/train/bus/mixed/drive",
      "totalDuration": "estimated total travel time (e.g. '2h 30m', '14h', '1d 6h')",
      "totalCost": "estimated cost range in USD (e.g. '$50-$80', '$200-$350')",
      "costRating": 1-5 (1=cheapest, 5=most expensive),
      "timeRating": 1-5 (1=fastest, 5=slowest),
      "comfortRating": 1-5 (1=least comfortable, 5=most comfortable),
      "recommended": true/false (mark the best option as true),
      "segments": [
        {
          "mode": "flight/train/bus/walk/taxi/metro/drive",
          "from": "departure point/station/airport",
          "to": "arrival point/station/airport",
          "duration": "estimated duration for this segment",
          "cost": "estimated cost for this segment",
          "details": "Flight number or route details, carrier name, etc.",
          "tips": "Any helpful tip for this segment"
        }
      ],
      "pros": ["advantage 1", "advantage 2"],
      "cons": ["disadvantage 1", "disadvantage 2"],
      "bestFor": "Who this option is best for (e.g. 'Budget travelers', 'Business travelers')"
    }
  ],
  "travelTips": [
    "General tip 1 about traveling this route",
    "General tip 2",
    "General tip 3"
  ],
  "bestTimeToTravel": "Best time/season to make this trip"
}

Important guidelines:
- Give realistic, practical routes that actually exist
- Include multi-modal options (e.g. flight + taxi, train + bus)
- Cost estimates should be realistic for the current year
- Always include at least one budget option
- Sort routes with the ${preferenceText} option first
- If the distance is short (under 100km), include walking/cycling options
- If traveling between countries, mention visa/passport requirements in tips`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response from AI
    let travelPlan;
    try {
      // Clean the response - remove markdown code fences if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();

      travelPlan = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('AI response parse error:', parseError);
      // Return the raw text if JSON parsing fails
      return res.json({
        routes: [],
        rawResponse: text,
        parseError: true,
        message: 'AI response received but could not be structured. Showing raw response.'
      });
    }

    res.json(travelPlan);
  } catch (error) {
    console.error('AI Travel Plan Error:', error.message);

    if (error.message?.includes('API_KEY')) {
      return res.status(500).json({ message: 'Invalid or missing Gemini API key. Check your .env file.' });
    }

    res.status(500).json({ message: 'Error generating travel plan. Please try again.' });
  }
});

// @desc    Get AI-powered quick comparison between two travel modes
// @route   POST /api/ai/compare
router.post('/compare', async (req, res) => {
  try {
    const { origin, destination, mode1, mode2 } = req.body;

    if (!origin || !destination || !mode1 || !mode2) {
      return res.status(400).json({ message: 'Origin, destination, and two modes are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'AI service not configured.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Compare traveling from "${origin}" to "${destination}" by ${mode1} vs ${mode2}.
    
Return a concise JSON comparison (no markdown code fences):
{
  "comparison": {
    "${mode1}": { "cost": "$XX-$XX", "time": "Xh", "comfort": "X/5", "carbonFootprint": "low/medium/high" },
    "${mode2}": { "cost": "$XX-$XX", "time": "Xh", "comfort": "X/5", "carbonFootprint": "low/medium/high" }
  },
  "recommendation": "Which is better and why (2 sentences max)",
  "winner": "${mode1}" or "${mode2}"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let comparison;
    try {
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
      else if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);
      comparison = JSON.parse(cleanedText.trim());
    } catch (parseError) {
      return res.json({ rawResponse: text, parseError: true });
    }

    res.json(comparison);
  } catch (error) {
    console.error('AI Compare Error:', error.message);
    res.status(500).json({ message: 'Error generating comparison.' });
  }
});

module.exports = router;
