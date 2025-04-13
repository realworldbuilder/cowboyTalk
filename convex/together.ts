import OpenAI from 'openai';
import {
  internalAction,
  internalMutation,
  internalQuery,
} from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { z } from 'zod';
import { actionWithUser } from './utils';
import Instructor from '@instructor-ai/instructor';

const togetherApiKey = process.env.TOGETHER_API_KEY ?? 'undefined';

// Together client for LLM extraction
const togetherai = new OpenAI({
  apiKey: togetherApiKey,
  baseURL: 'https://api.together.xyz/v1',
});

// Instructor for returning structured JSON
const client = Instructor({
  client: togetherai,
  mode: 'JSON_SCHEMA',
});

const NoteSchema = z.object({
  reportType: z.enum(['SAFETY', 'QUALITY', 'EQUIPMENT', 'RFI'])
    .describe('The type of report detected from the transcript'),
  title: z
    .string()
    .describe('Short descriptive title of what the voice message is about'),
  summary: z
    .string()
    .describe(
      'A short summary in the first person point of view of the person recording the voice message',
    )
    .max(500),
  actionItems: z
    .array(z.string())
    .describe(
      'A list of action items from the voice note, short and to the point. Make sure all action item lists are fully resolved if they are nested',
    ),
  // Fields specific to each report type
  safetyDetails: z.object({
    incidents: z.array(z.string()).optional(),
    hazards: z.array(z.string()).optional(),
    ppeCompliance: z.string().optional(),
  }).optional(),
  qualityDetails: z.object({
    controlPoints: z.array(z.string()).optional(),
    nonConformanceIssues: z.array(z.string()).optional(),
    correctiveActions: z.array(z.string()).optional(),
  }).optional(),
  equipmentDetails: z.object({
    status: z.string().optional(),
    operatingHours: z.string().optional(),
    mechanicalIssues: z.array(z.string()).optional(),
  }).optional(),
  rfiDetails: z.object({
    questions: z.array(z.string()).optional(),
    clarifications: z.array(z.string()).optional(),
    documentReferences: z.array(z.string()).optional(),
  }).optional(),
});

export const chat = internalAction({
  args: {
    id: v.id('notes'),
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const { transcript } = args;

    try {
      const response = await togetherai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              `You are an AI specialized in construction report analysis. Your first task is to accurately classify voice notes into one of four report categories, and then extract the appropriate data fields based on the report type.

              # CLASSIFICATION
              Analyze the transcript carefully to determine which report type it represents:
              
              1. SAFETY: Focuses on incidents, hazards, and compliance with safety protocols
              2. QUALITY: Focuses on inspections, deficiencies, and quality control measures
              3. EQUIPMENT: Focuses on machinery usage, status, maintenance and breakdowns
              4. RFI (Request For Information): Focuses on questions, information needs, and clarifications
              
              # FIELD EXTRACTION FOR EACH REPORT TYPE
              
              ## SAFETY REPORTS
              - incidents: Extract described safety incidents/accidents. These can be specific events that occurred.
              - hazards: Identify potential safety risks or hazardous conditions mentioned.
              - ppeCompliance: Document Personal Protective Equipment compliance status.
              
              ## QUALITY INSPECTIONS
              - controlPoints: Extract quality control checkpoints or areas inspected.
              - nonConformanceIssues: Document problems, deficiencies or areas falling below standards.
              - correctiveActions: Extract recommended fixes or actions to address quality issues.
              
              ## EQUIPMENT REPORTS
              - status: Current operational state of equipment (working, damaged, etc.)
              - operatingHours: Running time, usage metrics, or timeframes mentioned for equipment.
              - mechanicalIssues: Extract specific problems, breakdowns, or maintenance needs for equipment.
              
              ## RFI REQUESTS
              - questions: Extract specific questions requiring answers.
              - clarifications: Areas where additional information or explanation is needed.
              - documentReferences: References to plans, specifications, or documents mentioned.
              
              # DATA FORMATTING
              For list items (incidents, hazards, etc.), you can return either:
              - Simple strings, or
              - Objects with 'type' and 'description' fields for more detailed categorization
              
              Example for quality issues:
              nonConformanceIssues: [
                "Drywall seams visible in area B", // simple string format
                { // OR structured object format
                  "type": "Finishing Issue",
                  "description": "Visible drywall seams in guest bathroom area B"
                }
              ]
              
              For PPE compliance in SAFETY reports, you can return either:
              - A simple string: "All workers wearing required PPE" 
              - OR an object with compliant and non-compliant items:
                ppeCompliance: {
                  "compliant": ["hard hats", "safety vests"],
                  "nonCompliant": ["safety goggles"]
                }
              
              # RESPONSE FORMAT
              Return a JSON object with:
              - reportType: "SAFETY", "QUALITY", "EQUIPMENT", or "RFI"
              - title: Short descriptive title relevant to the report type
              - summary: Brief summary of key points (max 500 chars)
              - actionItems: Array of action items that should be taken based on the report
              - Plus the appropriate details object based on report type (safetyDetails, qualityDetails, equipmentDetails, or rfiDetails)`,
          },
          { role: 'user', content: transcript },
        ],
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        max_tokens: 1000,
        temperature: 0.6,
        response_format: { type: "json_object" }
      });

      // Parse the JSON response
      const content = response.choices[0]?.message?.content || '{}';
      let parsedResponse;
      
      try {
        parsedResponse = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse JSON response', parseError);
        throw new Error('Invalid JSON response from model');
      }

      const { 
        reportType = 'RFI', 
        title = 'Untitled Note', 
        summary = 'Summary failed to generate', 
        actionItems = [],
        safetyDetails,
        qualityDetails,
        equipmentDetails,
        rfiDetails
      } = parsedResponse;

      await ctx.runMutation(internal.together.saveSummary, {
        id: args.id,
        reportType,
        summary,
        actionItems,
        title,
        safetyDetails,
        qualityDetails,
        equipmentDetails,
        rfiDetails
      });
    } catch (e) {
      console.error('Error extracting from voice message', e);
      await ctx.runMutation(internal.together.saveSummary, {
        id: args.id,
        reportType: 'RFI',
        summary: 'Summary failed to generate',
        actionItems: [],
        title: 'Title',
      });
    }
  },
});

export const getTranscript = internalQuery({
  args: {
    id: v.id('notes'),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    const note = await ctx.db.get(id);
    return note?.transcription;
  },
});

export const saveSummary = internalMutation({
  args: {
    id: v.id('notes'),
    reportType: v.string(),
    summary: v.string(),
    title: v.string(),
    actionItems: v.array(v.string()),
    safetyDetails: v.optional(v.object({
      incidents: v.optional(v.array(
        v.union(
          v.string(),
          v.object({
            description: v.string(),
            type: v.string()
          })
        )
      )),
      hazards: v.optional(v.array(
        v.union(
          v.string(),
          v.object({
            description: v.string(),
            type: v.string()
          })
        )
      )),
      ppeCompliance: v.optional(v.union(
        v.string(),
        v.object({
          compliant: v.optional(v.array(v.string())),
          nonCompliant: v.optional(v.array(v.string()))
        })
      )),
    })),
    qualityDetails: v.optional(v.object({
      controlPoints: v.optional(v.array(
        v.union(
          v.string(),
          v.object({
            description: v.string(),
            type: v.string()
          })
        )
      )),
      nonConformanceIssues: v.optional(v.array(
        v.union(
          v.string(),
          v.object({
            description: v.string(),
            type: v.string()
          })
        )
      )),
      correctiveActions: v.optional(v.array(
        v.union(
          v.string(),
          v.object({
            description: v.string(),
            type: v.string()
          })
        )
      )),
    })),
    equipmentDetails: v.optional(v.object({
      status: v.optional(v.string()),
      operatingHours: v.optional(v.string()),
      mechanicalIssues: v.optional(v.array(
        v.union(
          v.string(),
          v.object({
            description: v.string(),
            type: v.string()
          })
        )
      )),
    })),
    rfiDetails: v.optional(v.object({
      questions: v.optional(v.array(
        v.union(
          v.string(),
          v.object({
            description: v.string(),
            type: v.string()
          })
        )
      )),
      clarifications: v.optional(v.array(
        v.union(
          v.string(),
          v.object({
            description: v.string(),
            type: v.string()
          })
        )
      )),
      documentReferences: v.optional(v.array(
        v.union(
          v.string(),
          v.object({
            description: v.string(),
            type: v.string()
          })
        )
      )),
    })),
  },
  handler: async (ctx, args) => {
    const { 
      id, 
      reportType, 
      summary, 
      actionItems, 
      title,
      safetyDetails,
      qualityDetails,
      equipmentDetails,
      rfiDetails
    } = args;
    
    await ctx.db.patch(id, {
      reportType,
      summary,
      title,
      generatingTitle: false,
      safetyDetails,
      qualityDetails,
      equipmentDetails,
      rfiDetails
    });

    let note = await ctx.db.get(id);

    if (!note) {
      console.error(`Couldn't find note ${id}`);
      return;
    }
    for (let actionItem of actionItems) {
      await ctx.db.insert('actionItems', {
        task: actionItem,
        noteId: id,
        userId: note.userId,
      });
    }

    await ctx.db.patch(id, {
      generatingActionItems: false,
    });
  },
});

export type SearchResult = {
  id: string;
  score: number;
};

export const similarNotes = actionWithUser({
  args: {
    searchQuery: v.string(),
  },
  handler: async (ctx, args): Promise<SearchResult[]> => {
    const getEmbedding = await togetherai.embeddings.create({
      input: [args.searchQuery.replace('/n', ' ')],
      model: 'togethercomputer/m2-bert-80M-32k-retrieval',
    });
    const embedding = getEmbedding.data[0].embedding;

    // 2. Then search for similar notes
    const results = await ctx.vectorSearch('notes', 'by_embedding', {
      vector: embedding,
      limit: 16,
      filter: (q) => q.eq('userId', ctx.userId), // Only search my notes.
    });

    console.log({ results });

    return results.map((r) => ({
      id: r._id,
      score: r._score,
    }));
  },
});

export const embed = internalAction({
  args: {
    id: v.id('notes'),
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const getEmbedding = await togetherai.embeddings.create({
      input: [args.transcript.replace('/n', ' ')],
      model: 'togethercomputer/m2-bert-80M-32k-retrieval',
    });
    const embedding = getEmbedding.data[0].embedding;

    await ctx.runMutation(internal.together.saveEmbedding, {
      id: args.id,
      embedding,
    });
  },
});

export const saveEmbedding = internalMutation({
  args: {
    id: v.id('notes'),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const { id, embedding } = args;
    await ctx.db.patch(id, {
      embedding: embedding,
    });
  },
});
