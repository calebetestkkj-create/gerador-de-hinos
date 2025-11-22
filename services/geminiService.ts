
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { HymnData, WorshipPlan } from "../types";

// Ensure API Key is present
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });

// --- Audio Helpers ---

function pcmToWav(pcmData: Uint8Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Write PCM data
  new Uint8Array(buffer, 44).set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// --- API Functions ---

export const generateHymnLyrics = async (theme: string): Promise<HymnData> => {
  if (!apiKey) throw new Error("API Key missing");

  const model = "gemini-2.5-flash";
  
  const prompt = `
    Componha um hino novo para a Igreja Adventista do Sétimo Dia baseado no tema: "${theme}".
    
    Requisitos:
    1. Teologia biblicamente sólida (Sola Scriptura).
    2. Linguagem reverente, poética e inspiradora.
    3. Estrutura: Pelo menos 2 estrofes e um refrão.
    4. Inclua uma referência bíblica chave.
    5. Sugira tom, compasso e andamento musical (BPM numérico).
    
    Retorne APENAS um JSON válido seguindo este esquema.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "O título do hino" },
            keySignature: { type: Type.STRING, description: "Tonalidade (ex: Eb)" },
            timeSignature: { type: Type.STRING, description: "Fórmula de compasso (ex: 4/4)" },
            suggestedTempo: { type: Type.INTEGER, description: "BPM numérico (ex: 100)" },
            scriptureReference: { type: Type.STRING, description: "Referência bíblica principal" },
            chords: { type: Type.STRING, description: "Descrição da harmonia" },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "Tipo da seção" },
                  lyrics: { type: Type.STRING, description: "Letra" }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta do modelo.");
    
    const parsed = JSON.parse(text);
    return { ...parsed, id: crypto.randomUUID() } as HymnData;
  } catch (error) {
    console.error("Erro ao gerar hino:", error);
    throw error;
  }
};

export const generateWorshipPlan = async (theme: string, occasion: string): Promise<WorshipPlan> => {
  if (!apiKey) throw new Error("API Key missing");
  
  const model = "gemini-2.5-flash";
  const prompt = `
    Crie uma sugestão de repertório musical (hinos) para um culto Adventista do Sétimo Dia.
    Tema: "${theme}"
    Ocasião/Momento Específico: "${occasion}"
    
    Sugira 3 a 5 hinos que existam no Hinário Adventista (HA) ou sejam clássicos cristãos conhecidos.
    Para cada sugestão, indique o momento do culto (ex: Introito, Adoração, Ofertório, Apelo, Final).
    Explique brevemente a conexão teológica.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          theme: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                moment: { type: Type.STRING, description: "Parte do culto" },
                suggestion: { type: Type.STRING, description: "Nome do hino e número se possível" },
                reasoning: { type: Type.STRING, description: "Por que este hino encaixa" }
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Sem resposta do modelo.");
  return JSON.parse(text) as WorshipPlan;
}

export const generateHymnAudio = async (hymn: HymnData): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const model = "gemini-2.5-flash-preview-tts";
  
  // Clean lyrics for TTS
  const cleanLyrics = (text: string) => text.replace(/\[.*?\]/g, "");

  const script = `
    (Instructions: Recite the following hymn with a reverent, rhythmic, and melodic cadence suitable for worship. Pause clearly between sections.)

    Title: ${hymn.title}.
    Reference: ${hymn.scriptureReference}.
    
    ${hymn.sections.map(s => `${s.type}. ${cleanLyrics(s.lyrics)}`).join('\n\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: script,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Falha ao gerar áudio.");
    
    // Gemini 2.5 Flash TTS returns raw PCM data (24kHz, 1 channel, 16-bit)
    // We must wrap it in a WAV container for the browser to play it.
    const pcmBytes = decodeBase64(base64Audio);
    const wavBlob = pcmToWav(pcmBytes, 24000);
    
    return URL.createObjectURL(wavBlob);
  } catch (error) {
    console.error("Erro ao gerar áudio:", error);
    throw error;
  }
};
