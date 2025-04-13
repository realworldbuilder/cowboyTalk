import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  notes: defineTable({
    userId: v.string(),
    audioFileId: v.id('_storage'),
    audioFileUrl: v.string(),
    title: v.optional(v.string()),
    transcription: v.optional(v.string()),
    summary: v.optional(v.string()),
    embedding: v.optional(v.array(v.float64())),
    reportType: v.optional(v.string()),
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
    generatingTranscript: v.boolean(),
    generatingTitle: v.boolean(),
    generatingActionItems: v.boolean(),
  })
    .index('by_userId', ['userId'])
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: 768,
      filterFields: ['userId'],
    }),
  actionItems: defineTable({
    noteId: v.id('notes'),
    userId: v.string(),
    task: v.string(),
  })
    .index('by_noteId', ['noteId'])
    .index('by_userId', ['userId']),
});
