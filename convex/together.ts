import OpenAI from 'openai';
import {
  internalAction,
  internalMutation,
  internalQuery,
} from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { api } from './_generated/api';
import { z } from 'zod';
import { actionWithUser } from './utils';
import Instructor from '@instructor-ai/instructor';
import { Doc } from './_generated/dataModel';

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
  reportType: z.enum(['SAFETY', 'QUALITY', 'EQUIPMENT', 'RFI', 'GENERAL'])
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
  imageUrls: z
    .array(z.string())
    .describe('URLs of images associated with this note')
    .optional(),
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
  generalDetails: z.object({
    observations: z.array(z.string()).optional(),
    progress: z.string().optional(),
    nextSteps: z.array(z.string()).optional(),
  }).optional(),
});

export const chat = internalAction({
  args: {
    id: v.id('notes'),
    transcript: v.string(),
    imageUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { transcript, imageUrls = [] } = args;

    // Mark note as processing to prevent premature display
    await ctx.runMutation(internal.together.markProcessing, {
      id: args.id,
    });

    try {
      // Build system prompt with image handling instructions if images are present
      let systemPrompt = `You are an AI specialized in construction report analysis. Your task is to accurately classify and structure voice notes into one of five report categories, extracting appropriate data fields based on the report type.`;
      
      if (imageUrls.length > 0) {
        systemPrompt += `\n\n# IMAGE ANALYSIS
        - The report includes ${imageUrls.length} image(s) related to the construction site or issue
        - Consider these images as visual evidence supporting the voice transcript
        - Reference relevant visual details in your summary and observations
        - For safety reports, note visible hazards or PPE compliance shown in images
        - For quality reports, reference visual evidence of workmanship or defects
        - For equipment reports, note the visual condition of equipment shown
        - Incorporate relevant image details throughout your analysis`;
      }
      
      systemPrompt += `\n\n# CLASSIFICATION RULES
              - Analyze the transcript carefully and BE AGGRESSIVE in categorizing into specialized report types
              - Prioritize classification into SAFETY, QUALITY, EQUIPMENT, or RFI whenever ANY specific indicators are present
              - Be very STRICT about using the GENERAL category - it should ONLY be used when there are NO clear indicators of other types
              - If the transcript contains MIXED content, choose based on the following priority: SAFETY > QUALITY > EQUIPMENT > RFI > GENERAL
              
              # REPORT TYPES AND KEY INDICATORS
              
              ## 1. SAFETY REPORTS - Classify as SAFETY if ANY of these appear:
              - Mentions of injuries, accidents, incidents, or near-misses
              - References to hazards, risks, dangers, unsafe conditions
              - Discussion of PPE (hardhats, vests, gloves, safety glasses, etc.)
              - Words like "safety", "dangerous", "risk", "protect", "OSHA"
              - Fall protection, confined spaces, trenching, scaffolding concerns
              - Emergency procedures, evacuation, first aid
              
              Required fields:
              - incidents: List all safety incidents mentioned (leave empty array if none mentioned)
              - hazards: List all safety hazards identified (leave empty array if none mentioned)
              - ppeCompliance: Document PPE compliance status as a detailed string
              
              ## 2. QUALITY REPORTS - Classify as QUALITY if ANY of these appear:
              - Inspection results, quality checks, or control points
              - References to specifications, standards, or code compliance
              - Discussion of workmanship, finish quality, tolerances
              - Non-conformance issues, defects, deficiencies, rework needed
              - Testing results, material quality, installation verification
              - Words like "quality", "spec", "standard", "approve", "reject"
              
              Required fields:
              - controlPoints: List specific quality control checkpoints mentioned
              - nonConformanceIssues: Document all quality problems or deficiencies
              - correctiveActions: List all recommended fixes or corrective measures
              
              ## 3. EQUIPMENT REPORTS - Classify as EQUIPMENT if ANY of these appear:
              - Specific equipment mentioned by name or type
              - Discussion of machinery status, operation, or performance
              - Maintenance needs, service requirements, repairs
              - Equipment breakdowns, malfunctions, or operational issues
              - Hours of operation, fuel usage, servicing schedules
              - Words like "equipment", "machine", "vehicle", "tool", "crane", "excavator"
              
              Required fields:
              - status: Current operational state of equipment as a detailed string
              - operatingHours: Running time or usage metrics as a string
              - mechanicalIssues: List all equipment problems or maintenance needs
              
              ## 4. RFI (REQUEST FOR INFORMATION) REPORTS - Classify as RFI if ANY of these appear:
              - Direct questions requiring answers from designers or engineers
              - Requests for clarification on plans, specs, or documents
              - References to drawings, details, or specifications that need explanation
              - Discussion of design conflicts, ambiguities, or missing information
              - Words like "clarify", "question", "need information", "unclear", "confirm"
              
              Required fields:
              - questions: List all explicit questions requiring answers
              - clarifications: List areas needing additional information
              - documentReferences: List references to plans, specs, or documents
              
              ## 5. GENERAL CONSTRUCTION REPORTS - ONLY classify as GENERAL when:
              - The note contains no clear indicators of the specialized types above
              - Content is purely about general progress, observations, or updates
              - The transcript is too vague to confidently assign a specialized category
              
              Required fields:
              - observations: List of general site observations or comments
              - progress: Overall project or task progress as a detailed string
              - nextSteps: List of recommended next steps or follow-up actions
              
              # OUTPUT QUALITY GUIDELINES
              - Be concise but complete in all field entries
              - Use proper construction terminology
              - Format lists consistently
              - Extract actionable information that would be useful for a construction team
              - Ensure all lists are properly formatted as arrays of strings
              - Make sure all fields appropriate to the report type are populated
              
              # RESPONSE FORMAT
              Return a JSON object with:
              - reportType: "SAFETY", "QUALITY", "EQUIPMENT", "RFI", or "GENERAL"
              - title: Short descriptive title relevant to the report type
              - summary: Brief summary of key points (max 500 chars)
              - actionItems: Array of clear, actionable tasks derived from the report
              - Plus ONLY the appropriate details object based on report type (safetyDetails, qualityDetails, equipmentDetails, rfiDetails, or generalDetails)`;

      const response = await togetherai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          { role: 'user', content: transcript },
        ],
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        max_tokens: 1000,
        temperature: 0.3,
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

      // Validate the response structure before saving
      const { 
        reportType = 'GENERAL', 
        title = 'Untitled Note', 
        summary = 'Summary failed to generate', 
        actionItems = [],
        safetyDetails,
        qualityDetails,
        equipmentDetails,
        rfiDetails,
        generalDetails
      } = parsedResponse;

      // Ensure we have the correct details object based on report type
      const validatedResponse = {
        id: args.id,
        reportType,
        title,
        summary,
        actionItems,
        imageUrls,
        safetyDetails: reportType === 'SAFETY' ? ensureSafetyDetails(safetyDetails) : undefined,
        qualityDetails: reportType === 'QUALITY' ? ensureQualityDetails(qualityDetails) : undefined,
        equipmentDetails: reportType === 'EQUIPMENT' ? ensureEquipmentDetails(equipmentDetails) : undefined,
        rfiDetails: reportType === 'RFI' ? ensureRfiDetails(rfiDetails) : undefined,
        generalDetails: reportType === 'GENERAL' ? ensureGeneralDetails(generalDetails) : undefined,
      };

      await ctx.runMutation(internal.together.saveSummary, validatedResponse);
    } catch (e) {
      console.error('Error extracting from voice message', e);
      await ctx.runMutation(internal.together.saveSummary, {
        id: args.id,
        reportType: 'GENERAL',
        summary: 'Summary failed to generate',
        actionItems: [],
        title: 'Processing Error',
        imageUrls: imageUrls,
      });
    }
  },
});

// Helper functions to ensure proper structure for each report type
function ensureSafetyDetails(details: any = {}) {
  return {
    incidents: Array.isArray(details?.incidents) ? details.incidents : [],
    hazards: Array.isArray(details?.hazards) ? details.hazards : [],
    ppeCompliance: details?.ppeCompliance || 'Not specified',
  };
}

function ensureQualityDetails(details: any = {}) {
  return {
    controlPoints: Array.isArray(details?.controlPoints) ? details.controlPoints : [],
    nonConformanceIssues: Array.isArray(details?.nonConformanceIssues) ? details.nonConformanceIssues : [],
    correctiveActions: Array.isArray(details?.correctiveActions) ? details.correctiveActions : [],
  };
}

function ensureEquipmentDetails(details: any = {}) {
  return {
    status: details?.status || 'Not specified',
    operatingHours: details?.operatingHours || 'Not specified',
    mechanicalIssues: Array.isArray(details?.mechanicalIssues) ? details.mechanicalIssues : [],
  };
}

function ensureRfiDetails(details: any = {}) {
  return {
    questions: Array.isArray(details?.questions) ? details.questions : [],
    clarifications: Array.isArray(details?.clarifications) ? details.clarifications : [],
    documentReferences: Array.isArray(details?.documentReferences) ? details.documentReferences : [],
  };
}

function ensureGeneralDetails(details: any = {}) {
  return {
    observations: Array.isArray(details?.observations) ? details.observations : [],
    progress: details?.progress || 'Not specified',
    nextSteps: Array.isArray(details?.nextSteps) ? details.nextSteps : [],
  };
}

export const markProcessing = internalMutation({
  args: {
    id: v.id('notes'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      generatingTitle: true,
      generatingActionItems: true,
      reportType: undefined,
      summary: undefined,
      title: undefined,
      imageUrls: undefined,
      safetyDetails: undefined,
      qualityDetails: undefined,
      equipmentDetails: undefined,
      rfiDetails: undefined,
      generalDetails: undefined,
    });
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
    imageUrls: v.optional(v.array(v.string())),
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
    generalDetails: v.optional(v.object({
      observations: v.optional(v.array(v.string())),
      progress: v.optional(v.string()),
      nextSteps: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const { 
      id, 
      reportType, 
      summary, 
      actionItems, 
      title,
      imageUrls,
      safetyDetails,
      qualityDetails,
      equipmentDetails,
      rfiDetails,
      generalDetails
    } = args;
    
    await ctx.db.patch(id, {
      reportType,
      summary,
      title,
      generatingTitle: false,
      imageUrls: imageUrls,
      safetyDetails,
      qualityDetails,
      equipmentDetails,
      rfiDetails,
      generalDetails
    });

    let note = await ctx.db.get(id);

    if (!note) {
      console.error(`Couldn't find note ${id}`);
      return;
    }
    
    // Delete any existing action items for this note before adding new ones
    const existingActionItems = await ctx.db
      .query("actionItems")
      .withIndex("by_noteId", (q) => q.eq("noteId", id))
      .collect();
      
    for (const item of existingActionItems) {
      await ctx.db.delete(item._id);
    }
    
    // Add new action items
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

// Generate an email based on a report
export const generateEmail = actionWithUser({
  args: {
    noteId: v.id('notes'),
    recipientName: v.string(),
    recipientEmail: v.string(),
    senderName: v.string(),
    includeAttachments: v.boolean(),
  },
  handler: async (ctx, args): Promise<string> => {
    const { noteId, recipientName, recipientEmail, senderName, includeAttachments } = args;
    
    // Use the structured API to get note information
    const note = await ctx.runQuery(api.notes.getNote, { id: noteId });
    
    if (!note || !note.note) {
      throw new Error('Note not found');
    }
    
    // We already checked authorization in getNote query
    const noteData = note.note;
    const actionItems = note.actionItems || [];
    const hasImages = noteData.imageUrls && noteData.imageUrls.length > 0;
    
    // Prepare the context data - use default values if not provided
    const emailContext = {
      note: noteData,
      actionItems,
      recipient: {
        name: recipientName || "Team Member",
        email: recipientEmail || "",
      },
      sender: {
        name: senderName || "Site Manager",
      },
      includeAttachments,
      hasImages,
      imageCount: noteData.imageUrls?.length || 0
    };
    
    // Generate email content
    const response = await togetherai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an AI specialized in writing professional but direct construction emails based on the voice note summary.
          Your task is to compose an email that clearly communicates issues to a subcontractor with a professional tone.

          # EMAIL STRUCTURE GUIDELINES
          - Start the email body with "Howdy,"
          - Use a firm but respectful tone throughout
          - Be clear about expectations
          - Format the body with clear sections and bullet points where appropriate
          - Include key action items from the report
          - Close with a professional sign-off followed by the sender's name
          
          # TONE AND STYLE
          - Use appropriate construction terminology
          - Be direct but professional - this is a communication, not a confrontation
          - Clearly communicate responsibility for addressing the issues when applicable
          - Keep the email concise and to the point
          
          # FOR DIFFERENT REPORT TYPES
          - SAFETY: Emphasize importance of safety requirements and compliance
          - QUALITY: Reference contract specifications and quality standards
          - EQUIPMENT: Note operational impacts and timeline considerations
          - RFI: Communicate need for timely information
          - GENERAL: Focus on schedule and project progress
          
          # ACCOUNTABILITY LANGUAGE
          - Only include accountability statements when directly relevant to the issue
          - For serious safety or quality issues, include appropriate language about responsibility
          - For general updates or RFIs, focus on collaborative problem-solving instead
          - Avoid excessive formality or threatening language
          
          # FORMATTING RULES
          - Format the email for clarity with appropriate spacing
          - Action items should be listed as bullet points with clear deadlines when possible
          - Keep paragraphs short and scannable
          
          # IMAGE HANDLING
          - If the report includes images, mention this fact in the email
          - Refer to images as "attached photos" if includeAttachments is true
          - Indicate the number of images if there are multiple
          - Briefly reference what the images show if relevant to the report type
          
          # RESPONSE FORMAT
          Provide the complete email as plain text with:
          - Begin the email body directly with the "Howdy," greeting
          - Include appropriate line breaks for readability
          - End with a professional signature followed by the sender's name (from the context provided)
          - IMPORTANT: Always include the sender's name at the end of the email`
        },
        {
          role: 'user',
          content: JSON.stringify(emailContext)
        }
      ],
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      max_tokens: 1500,
      temperature: 0.7
    });
    
    return response.choices[0]?.message?.content || 'Failed to generate email content';
  }
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
