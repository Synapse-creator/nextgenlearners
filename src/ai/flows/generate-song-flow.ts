'use server';
/**
 * @fileOverview Generates a custom song (lyrics and audio) for a child.
 *
 * - generateSong - A function that generates the song.
 * - GenerateSongInput - The input type for the function.
 * - GenerateSongOutput - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import wav from 'wav';

const GenerateSongInputSchema = z.object({
  name: z.string().describe("The child's name to include in the song."),
  theme: z.enum(["Adventure", "Bedtime", "Silly Fun"]).describe("The theme of the song."),
});
export type GenerateSongInput = z.infer<typeof GenerateSongInputSchema>;

const GenerateSongOutputSchema = z.object({
  lyrics: z.string().describe('The generated lyrics of the song, formatted with line breaks.'),
  audioDataUri: z.string().describe("The generated audio as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type GenerateSongOutput = z.infer<typeof GenerateSongOutputSchema>;

export async function generateSong(input: GenerateSongInput): Promise<GenerateSongOutput> {
  return generateSongFlow(input);
}

const lyricsPrompt = ai.definePrompt({
  name: 'generateSongLyricsPrompt',
  input: {schema: GenerateSongInputSchema},
  output: {schema: z.object({ lyrics: z.string() })},
  prompt: `You are a cheerful and creative songwriter for young children. Your task is to write a short, simple, and happy song for a child named {{{name}}}.

  Theme: {{{theme}}}
  Child's Name: {{{name}}}

  Instructions:
  1.  Write a short song with 2-3 simple verses.
  2.  The lyrics must be easy for a 3-8 year old to understand and sing.
  3.  The tone should match the selected theme: '{{{theme}}}'.
  4.  Make sure to include the name "{{{name}}}" in the lyrics at least twice.
  5.  The song should be positive, imaginative, and fun.
  6.  Format the output with line breaks for each line of the song.
  `,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateSongFlow = ai.defineFlow(
  {
    name: 'generateSongFlow',
    inputSchema: GenerateSongInputSchema,
    outputSchema: GenerateSongOutputSchema,
  },
  async (input) => {
    // Step 1: Generate lyrics
    const lyricsResponse = await lyricsPrompt(input);
    const lyrics = lyricsResponse.output!.lyrics;

    // Step 2: Generate audio from lyrics
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A friendly voice
          },
        },
      },
      prompt: lyrics,
    });

    if (!media) {
      throw new Error('Audio generation failed.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);
    
    return {
      lyrics,
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
