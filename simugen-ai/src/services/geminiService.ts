import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SimulationControl {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface SimulationFormula {
  label: string;
  formula: string;
}

export interface SimulationData {
  name: string;
  description: string;
  explanation: string;
  formulas: SimulationFormula[];
  controls: SimulationControl[];
  logic: {
    init: string;
    update: string;
    draw: string;
  };
}

export async function generateSimulation(topic: string): Promise<SimulationData> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          explanation: { type: Type.STRING },
          formulas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                formula: { type: Type.STRING },
              },
              required: ["label", "formula"],
            },
          },
          controls: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                min: { type: Type.NUMBER },
                max: { type: Type.NUMBER },
                step: { type: Type.NUMBER },
                defaultValue: { type: Type.NUMBER },
              },
              required: ["id", "label", "min", "max", "step", "defaultValue"],
            },
          },
          logic: {
            type: Type.OBJECT,
            properties: {
              init: { type: Type.STRING, description: "JS code to initialize state object. Example: 'state.x = 0; state.y = 0;'" },
              update: { type: Type.STRING, description: "JS code to update state. Available variables: state, dt (seconds), controls (object with slider values). Example: 'state.x += controls.speed * dt;'" },
              draw: { type: Type.STRING, description: "JS code to draw. Available variables: ctx, state, width, height, controls. Example: 'ctx.beginPath(); ctx.arc(state.x, state.y, 10, 0, Math.PI*2); ctx.fill();'" },
            },
            required: ["init", "update", "draw"],
          },
        },
        required: ["name", "description", "explanation", "formulas", "controls", "logic"],
      },
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Generate a high-quality, interactive physics/math simulation for the topic: "${topic}".
            The simulation should be visually engaging and scientifically accurate.
            
            Guidelines for logic:
            - 'init' should setup all necessary state variables (e.g., position, velocity, acceleration, time).
            - 'update' should handle physics calculations using 'dt' (delta time in seconds) and 'controls' values.
            - 'draw' should use the HTML5 Canvas API to render the simulation. Use colors, gradients, and clear labels.
            - Ensure the simulation is responsive to the 'width' and 'height' provided.
            - If the topic is complex, simplify it to its core interactive components.
            - For 'Solar System', focus on basic orbits.
            - For 'Electric Circuit', show current flow visually.
            `
          }
        ]
      }
    ],
  });

  if (!response.text) {
    throw new Error("Failed to generate simulation data");
  }

  return JSON.parse(response.text) as SimulationData;
}
