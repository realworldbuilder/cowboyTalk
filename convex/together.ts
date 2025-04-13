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
              `You are an AI specialized in construction report analysis. Analyze the transcript to:
              
              1. Determine the report type from: SAFETY, QUALITY, EQUIPMENT, or RFI
              2. Extract relevant information based on the report type
              
              For each report type, extract:
              - SAFETY: incidents, hazards, PPE compliance
              - QUALITY: quality control points, non-conformance issues, corrective actions
              - EQUIPMENT: equipment status, operating hours, mechanical issues
              - RFI: questions, technical clarifications, document references
              
              Return a JSON object with:
              - reportType: "SAFETY", "QUALITY", "EQUIPMENT", or "RFI"
              - title: Short descriptive title
              - summary: Brief summary (max 500 chars)
              - actionItems: Array of action items
              - Relevant details object based on report type (safetyDetails, qualityDetails, equipmentDetails, or rfiDetails)`,
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
      incidents: v.optional(v.array(v.string())),
      hazards: v.optional(v.array(v.string())),
      ppeCompliance: v.optional(v.string()),
    })),
    qualityDetails: v.optional(v.object({
      controlPoints: v.optional(v.array(v.string())),
      nonConformanceIssues: v.optional(v.array(v.string())),
      correctiveActions: v.optional(v.array(v.string())),
    })),
    equipmentDetails: v.optional(v.object({
      status: v.optional(v.string()),
      operatingHours: v.optional(v.string()),
      mechanicalIssues: v.optional(v.array(v.string())),
    })),
    rfiDetails: v.optional(v.object({
      questions: v.optional(v.array(v.string())),
      clarifications: v.optional(v.array(v.string())),
      documentReferences: v.optional(v.array(v.string())),
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
