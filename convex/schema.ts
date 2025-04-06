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
    directive: v.optional(v.string()),
    embedding: v.optional(v.array(v.float64())),
    generatingTranscript: v.boolean(),
    generatingTitle: v.boolean(),
    generatingActionItems: v.boolean(),
    // Report type field
    reportType: v.optional(v.string()), // "daily_activity", "safety_incident", "quality_control", "progress", "initial_rfi", "change_order", or "general"
    
    // Construction report specific fields - original fields
    manpower: v.optional(v.string()),
    weather: v.optional(v.string()),
    delays: v.optional(v.string()),
    openIssues: v.optional(v.string()),
    equipment: v.optional(v.string()),
    isConstructionReport: v.optional(v.boolean()),
    
    // Daily Activity Report fields
    laborDetails: v.optional(v.string()),
    materialsUsed: v.optional(v.string()),
    
    // Safety Incident Report fields
    incidentType: v.optional(v.string()), // accident, near-miss, hazard
    incidentDescription: v.optional(v.string()),
    peopleInvolved: v.optional(v.string()),
    correctiveActions: v.optional(v.string()),
    
    // Quality Control Report fields
    inspectionResults: v.optional(v.string()),
    testResults: v.optional(v.string()),
    qualityIssues: v.optional(v.string()),
    
    // Progress Report fields
    milestonesAchieved: v.optional(v.string()),
    scheduledVsActual: v.optional(v.string()),
    budgetImpact: v.optional(v.string()),
    
    // Equipment Usage Log fields (keeping temporarily for data migration)
    equipmentHours: v.optional(v.string()),
    maintenanceNeeded: v.optional(v.string()),
    equipmentIssues: v.optional(v.string()),
    
    // Initial RFI Request fields
    rfiNumber: v.optional(v.string()),
    rfiQuestion: v.optional(v.string()),
    rfiContext: v.optional(v.string()),
    requiredResponseDate: v.optional(v.string()),
    
    // Change Order Report fields
    changeDescription: v.optional(v.string()),
    reasonForChange: v.optional(v.string()),
    costImpact: v.optional(v.string()),
    scheduleImpact: v.optional(v.string()),
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
