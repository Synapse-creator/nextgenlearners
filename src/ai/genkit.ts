import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY || 'AIzaSyDiAbNbaJeK8as0V4SNnjl-RARsdi89uh0';

export const ai = genkit({
  plugins: [googleAI({ apiKey })],
  model: googleAI.model('gemini-1.5-flash'),
});


