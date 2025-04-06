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

// Updated schema to include construction report fields
const NoteSchema = z.object({
  title: z
    .string()
    .describe('Short descriptive title of what the voice message is about'),
  summary: z
    .string()
    .describe(
      'A short summary in the first person point of view of the person recording the voice message',
    )
    .max(500),
  directive: z
    .string()
    .describe(
      'A notification or directive to others who need to take action. Use clear, direct language that communicates what the recipient needs to know or do.',
    )
    .max(500),
  actionItems: z
    .array(z.string())
    .describe(
      'A list of action items from the voice note, short and to the point. Make sure all action item lists are fully resolved if they are nested',
    ),
  // Report type classification
  reportType: z
    .enum(['daily_activity', 'safety_incident', 'quality_control', 'progress', 'initial_rfi', 'change_order', 'general'])
    .describe('The category of report based on content'),
  
  // isConstructionReport field - we're changing the description to be more neutral
  isConstructionReport: z
    .boolean()
    .describe('True if this appears to be any type of construction-related report, false otherwise'),
  
  // Original Construction report fields
  manpower: z
    .string()
    .optional()
    .describe('Information about workers, staffing, or labor on the construction site'),
  weather: z
    .string()
    .optional()
    .describe('Information about weather conditions affecting the construction site'),
  delays: z
    .string()
    .optional()
    .describe('Information about delays, setbacks or schedule issues on the project'),
  openIssues: z
    .string()
    .optional()
    .describe('Information about unresolved problems, concerns or issues requiring attention'),
  equipment: z
    .string()
    .optional()
    .describe('Information about equipment used, equipment issues, or equipment needs'),
    
  // Daily Activity Report fields
  laborDetails: z
    .string()
    .optional()
    .describe('Detailed information about labor hours, productivity, and crew compositions'),
  materialsUsed: z
    .string()
    .optional()
    .describe('Materials used, quantities, and delivery information'),
    
  // Safety Incident Report fields
  incidentType: z
    .string()
    .optional()
    .describe('Type of safety incident: accident, near-miss, or hazard'),
  incidentDescription: z
    .string()
    .optional()
    .describe('Detailed description of the incident, including location and time'),
  peopleInvolved: z
    .string()
    .optional()
    .describe('People involved in or affected by the incident'),
  correctiveActions: z
    .string()
    .optional()
    .describe('Actions taken or needed to address the safety issue'),
    
  // Quality Control Report fields
  inspectionResults: z
    .string()
    .optional()
    .describe('Results of quality inspections performed'),
  testResults: z
    .string()
    .optional()
    .describe('Results of quality tests conducted (concrete, soil, etc.)'),
  qualityIssues: z
    .string()
    .optional()
    .describe('Quality issues identified and their resolution status'),
    
  // Progress Report fields
  milestonesAchieved: z
    .string()
    .optional()
    .describe('Project milestones achieved or progress towards them'),
  scheduledVsActual: z
    .string()
    .optional()
    .describe('Comparison of scheduled progress versus actual progress'),
  budgetImpact: z
    .string()
    .optional()
    .describe('Impact on project budget or cost considerations'),
    
  // Initial RFI Request fields
  rfiNumber: z
    .string()
    .optional()
    .describe('RFI number or identifier for tracking purposes. Only if report type is initial_rfi.'),
  rfiQuestion: z
    .string()
    .optional()
    .describe('The specific question or information being requested. Only if report type is initial_rfi.'),
  rfiContext: z
    .string()
    .optional()
    .describe('Background information or context for the RFI request. Only if report type is initial_rfi.'),
  requiredResponseDate: z
    .string()
    .optional()
    .describe('Date by which a response to the RFI is needed. Only if report type is initial_rfi.'),
});

export const chat = internalAction({
  args: {
    id: v.id('notes'),
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const { transcript } = args;
    
    // Clean and format the transcript to prevent validation errors
    const cleanedTranscript = transcript
      .replace(/[\r\n]+/g, ' ') // Replace multiple newlines with space
      .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
      .trim();                 // Trim extra whitespace
    
    console.log('Processing transcript with length:', cleanedTranscript.length);
    
    // If transcript is too long, truncate it
    const maxLength = 16000;  // Maximum context length for most models
    const finalTranscript = cleanedTranscript.length > maxLength 
      ? cleanedTranscript.substring(0, maxLength) + "..." 
      : cleanedTranscript;

    try {
      // Try using the regular OpenAI approach without Instructor
      console.log('Attempting to generate summary with standard approach');
      
      try {
        const response = await togetherai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `The following is a transcript of a voice message that needs to be processed to extract information.

The response must be formatted in **valid JSON** using this exact structure:
{
  "title": "Short descriptive title of what the voice message is about",
  "summary": "A short summary in the first person point of view of the person recording the voice message (maximum 500 characters)",
  "directive": "A notification or directive to others who need to take action. Use clear, direct language that communicates what the recipient needs to know or do. (maximum 500 characters)",
  "actionItems": ["Action item 1", "Action item 2", ...],
  "reportType": "daily_activity", "safety_incident", "quality_control", "progress", "initial_rfi", "change_order", or "general",
  "isConstructionReport": boolean (true/false),
  
  // Original construction report fields (for backward compatibility)
  "manpower": "Information about workers, staffing, trades, or labor hours. Use 'Not mentioned' if not provided.",
  "weather": "Weather conditions that may affect work. Use 'Not mentioned' if not provided.",
  "delays": "Delays or schedule disruptions. Use 'Not mentioned' if not provided.",
  "openIssues": "Unresolved problems or issues. Use 'Not mentioned' if not provided.",
  "equipment": "Information about major equipment used. Use 'Not mentioned' if not provided.",
  
  // Fields for specific report types - only include relevant ones based on report type
  // Daily Activity Report fields
  "laborDetails": "Detailed information about labor hours, productivity, and crew compositions. Only if report type is daily_activity.",
  "materialsUsed": "Materials used, quantities, and delivery information. Only if report type is daily_activity.",
  
  // Safety Incident Report fields
  "incidentType": "Type of safety incident: accident, near-miss, or hazard. Only if report type is safety_incident.",
  "incidentDescription": "Detailed description of the incident, including location and time. Only if report type is safety_incident.",
  "peopleInvolved": "People involved in or affected by the incident. Only if report type is safety_incident.",
  "correctiveActions": "Actions taken or needed to address the safety issue. Only if report type is safety_incident.",
  
  // Quality Control Report fields
  "inspectionResults": "Results of quality inspections performed. Only if report type is quality_control.",
  "testResults": "Results of quality tests conducted (concrete, soil, etc.). Only if report type is quality_control.",
  "qualityIssues": "Quality issues identified and their resolution status. Only if report type is quality_control.",
  
  // Progress Report fields
  "milestonesAchieved": "Project milestones achieved or progress towards them. Only if report type is progress.",
  "scheduledVsActual": "Comparison of scheduled progress versus actual progress. Only if report type is progress.",
  "budgetImpact": "Impact on project budget or cost considerations. Only if report type is progress.",
  
  // Initial RFI Request fields
  "rfiNumber": "RFI number or identifier for tracking purposes. Only if report type is initial_rfi.",
  "rfiQuestion": "The specific question or information being requested. Only if report type is initial_rfi.",
  "rfiContext": "Background information or context for the RFI request. Only if report type is initial_rfi.",
  "requiredResponseDate": "Date by which a response to the RFI is needed. Only if report type is initial_rfi.",
  
  // Change Order Report fields
  "changeDescription": "Description of the change from original plans. Only if report type is change_order.",
  "reasonForChange": "Reason or justification for the change. Only if report type is change_order.",
  "costImpact": "Impact on project costs due to the change. Only if report type is change_order.",
  "scheduleImpact": "Impact on project schedule due to the change. Only if report type is change_order."
}

**Guidelines:**
- Write the summary as a factual overview in the first person point of view, as if the speaker is summarizing what they said
- For the directive, write it as a message to others who need to take action, using direct language focused on what they need to know or do
- For the directive, frame it from the perspective of the sender communicating to the recipient(s)
- Analyze the content objectively to determine the most accurate report type
- Categorize the report as one of these types based solely on the content:
  - daily_activity: Reports tracking progress, labor, equipment, and materials used
  - safety_incident: Reports documenting accidents, near-misses, or hazards
  - quality_control: Reports ensuring work meets standards (e.g., concrete tests, inspections)
  - progress: Reports updating project milestones and delays
  - initial_rfi: Reports requesting information or clarification on project details
  - change_order: Reports recording deviations from the original plan
  - general: Any other report that doesn't fit these categories
- Set isConstructionReport to true only if the content is clearly related to construction activities
- Treat all report types equally without prioritizing daily construction reports
- Use "Not mentioned" (exact string) for any fields that aren't relevant to the report type or aren't mentioned.
- Do not include markdown, headings, or explanations. Only return valid JSON.

The goal is to create both a factual summary and an actionable directive while accurately classifying the report type based solely on the content.`
            },
            { role: 'user', content: finalTranscript }
          ],
          model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
          temperature: 0.3,
          max_tokens: 1000,
        });
        
        // Parse the JSON response
        const responseContent = response.choices[0]?.message.content?.trim() || '';
        let extractedData;
        
        try {
          // Find JSON portion in the response
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : responseContent;
          extractedData = JSON.parse(jsonStr);
          
          // Validate the required fields
          if (!extractedData.title || !extractedData.summary || !Array.isArray(extractedData.actionItems)) {
            throw new Error('Missing required fields in response');
          }
          
          // Save the extracted data
          await ctx.runMutation(internal.together.saveSummary, {
            id: args.id,
            summary: extractedData.summary,
            directive: extractedData.directive || "",
            actionItems: extractedData.actionItems,
            title: extractedData.title,
            reportType: extractedData.reportType || "general",
            isConstructionReport: extractedData.isConstructionReport || false,
            // Original construction report fields
            manpower: extractedData.manpower || "Not mentioned",
            weather: extractedData.weather || "Not mentioned",
            delays: extractedData.delays || "Not mentioned",
            openIssues: extractedData.openIssues || "Not mentioned",
            equipment: extractedData.equipment || "Not mentioned",
            // Daily Activity Report fields
            laborDetails: extractedData.laborDetails || "Not mentioned",
            materialsUsed: extractedData.materialsUsed || "Not mentioned",
            // Safety Incident Report fields
            incidentType: extractedData.incidentType || "Not mentioned",
            incidentDescription: extractedData.incidentDescription || "Not mentioned",
            peopleInvolved: extractedData.peopleInvolved || "Not mentioned",
            correctiveActions: extractedData.correctiveActions || "Not mentioned",
            // Quality Control Report fields
            inspectionResults: extractedData.inspectionResults || "Not mentioned",
            testResults: extractedData.testResults || "Not mentioned",
            qualityIssues: extractedData.qualityIssues || "Not mentioned",
            // Progress Report fields
            milestonesAchieved: extractedData.milestonesAchieved || "Not mentioned",
            scheduledVsActual: extractedData.scheduledVsActual || "Not mentioned",
            budgetImpact: extractedData.budgetImpact || "Not mentioned",
            // Initial RFI Request fields
            rfiNumber: extractedData.rfiNumber || "Not mentioned",
            rfiQuestion: extractedData.rfiQuestion || "Not mentioned",
            rfiContext: extractedData.rfiContext || "Not mentioned",
            requiredResponseDate: extractedData.requiredResponseDate || "Not mentioned",
            // Change Order Report fields
            changeDescription: extractedData.changeDescription || "Not mentioned",
            reasonForChange: extractedData.reasonForChange || "Not mentioned",
            costImpact: extractedData.costImpact || "Not mentioned",
            scheduleImpact: extractedData.scheduleImpact || "Not mentioned",
          });
          
          return; // Exit if successful
        } catch (jsonError) {
          console.error('Error parsing response as JSON:', jsonError, 'Response:', responseContent);
          throw jsonError;
        }
      } catch (err) {
        console.error('Error with standard approach:', err);
        
        // Try with GPT-3.5-Turbo as fallback (known to work well with JSON responses)
        console.log('Falling back to GPT-3.5-Turbo model');
        const response = await togetherai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `The following is a transcript of a voice message that needs to be processed to extract information.

The response must be formatted in **valid JSON** using this exact structure:
{
  "title": "Short descriptive title of what the voice message is about",
  "summary": "A short summary in the first person point of view of the person recording the voice message (maximum 500 characters)",
  "directive": "A notification or directive to others who need to take action. Use clear, direct language that communicates what the recipient needs to know or do. (maximum 500 characters)",
  "actionItems": ["Action item 1", "Action item 2", ...],
  "reportType": "daily_activity", "safety_incident", "quality_control", "progress", "initial_rfi", "change_order", or "general",
  "isConstructionReport": boolean (true/false),
  
  // Original construction report fields (for backward compatibility)
  "manpower": "Information about workers, staffing, trades, or labor hours. Use 'Not mentioned' if not provided.",
  "weather": "Weather conditions that may affect work. Use 'Not mentioned' if not provided.",
  "delays": "Delays or schedule disruptions. Use 'Not mentioned' if not provided.",
  "openIssues": "Unresolved problems or issues. Use 'Not mentioned' if not provided.",
  "equipment": "Information about major equipment used. Use 'Not mentioned' if not provided.",
  
  // Fields for specific report types - only include relevant ones based on report type
  // Daily Activity Report fields
  "laborDetails": "Detailed information about labor hours, productivity, and crew compositions. Only if report type is daily_activity.",
  "materialsUsed": "Materials used, quantities, and delivery information. Only if report type is daily_activity.",
  
  // Safety Incident Report fields
  "incidentType": "Type of safety incident: accident, near-miss, or hazard. Only if report type is safety_incident.",
  "incidentDescription": "Detailed description of the incident, including location and time. Only if report type is safety_incident.",
  "peopleInvolved": "People involved in or affected by the incident. Only if report type is safety_incident.",
  "correctiveActions": "Actions taken or needed to address the safety issue. Only if report type is safety_incident.",
  
  // Quality Control Report fields
  "inspectionResults": "Results of quality inspections performed. Only if report type is quality_control.",
  "testResults": "Results of quality tests conducted (concrete, soil, etc.). Only if report type is quality_control.",
  "qualityIssues": "Quality issues identified and their resolution status. Only if report type is quality_control.",
  
  // Progress Report fields
  "milestonesAchieved": "Project milestones achieved or progress towards them. Only if report type is progress.",
  "scheduledVsActual": "Comparison of scheduled progress versus actual progress. Only if report type is progress.",
  "budgetImpact": "Impact on project budget or cost considerations. Only if report type is progress.",
  
  // Initial RFI Request fields
  "rfiNumber": "RFI number or identifier for tracking purposes. Only if report type is initial_rfi.",
  "rfiQuestion": "The specific question or information being requested. Only if report type is initial_rfi.",
  "rfiContext": "Background information or context for the RFI request. Only if report type is initial_rfi.",
  "requiredResponseDate": "Date by which a response to the RFI is needed. Only if report type is initial_rfi.",
  
  // Change Order Report fields
  "changeDescription": "Description of the change from original plans. Only if report type is change_order.",
  "reasonForChange": "Reason or justification for the change. Only if report type is change_order.",
  "costImpact": "Impact on project costs due to the change. Only if report type is change_order.",
  "scheduleImpact": "Impact on project schedule due to the change. Only if report type is change_order."
}

**Guidelines:**
- Write the summary as a factual overview in the first person point of view, as if the speaker is summarizing what they said
- For the directive, write it as a message to others who need to take action, using direct language focused on what they need to know or do
- For the directive, frame it from the perspective of the sender communicating to the recipient(s)
- Analyze the content objectively to determine the most accurate report type
- Categorize the report as one of these types based solely on the content:
  - daily_activity: Reports tracking progress, labor, equipment, and materials used
  - safety_incident: Reports documenting accidents, near-misses, or hazards
  - quality_control: Reports ensuring work meets standards (e.g., concrete tests, inspections)
  - progress: Reports updating project milestones and delays
  - initial_rfi: Reports requesting information or clarification on project details
  - change_order: Reports recording deviations from the original plan
  - general: Any other report that doesn't fit these categories
- Set isConstructionReport to true only if the content is clearly related to construction activities
- Treat all report types equally without prioritizing daily construction reports
- Use "Not mentioned" (exact string) for any fields that aren't relevant to the report type or aren't mentioned.
- Do not include markdown, headings, or explanations. Only return valid JSON.

The goal is to create both a factual summary and an actionable directive while accurately classifying the report type based solely on the content.`
            },
            { role: 'user', content: finalTranscript }
          ],
          model: 'gpt-3.5-turbo',
          temperature: 0.3,
          max_tokens: 1000,
        });
        
        // Parse the JSON response
        const responseContent = response.choices[0]?.message.content?.trim() || '';
        let extractedData;
        
        try {
          // Find JSON portion in the response
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : responseContent;
          extractedData = JSON.parse(jsonStr);
          
          // Validate the required fields
          if (!extractedData.title || !extractedData.summary || !Array.isArray(extractedData.actionItems)) {
            throw new Error('Missing required fields in response');
          }
        } catch (jsonError) {
          console.error('Error parsing GPT response as JSON:', jsonError, 'Response:', responseContent);
          throw jsonError;
        }
        
        await ctx.runMutation(internal.together.saveSummary, {
          id: args.id,
          summary: extractedData.summary,
          directive: extractedData.directive || "",
          actionItems: extractedData.actionItems,
          title: extractedData.title,
          reportType: extractedData.reportType || "general",
          isConstructionReport: extractedData.isConstructionReport || false,
          // Original construction report fields
          manpower: extractedData.manpower || "Not mentioned",
          weather: extractedData.weather || "Not mentioned",
          delays: extractedData.delays || "Not mentioned",
          openIssues: extractedData.openIssues || "Not mentioned",
          equipment: extractedData.equipment || "Not mentioned",
          // Daily Activity Report fields
          laborDetails: extractedData.laborDetails || "Not mentioned",
          materialsUsed: extractedData.materialsUsed || "Not mentioned",
          // Safety Incident Report fields
          incidentType: extractedData.incidentType || "Not mentioned",
          incidentDescription: extractedData.incidentDescription || "Not mentioned",
          peopleInvolved: extractedData.peopleInvolved || "Not mentioned",
          correctiveActions: extractedData.correctiveActions || "Not mentioned",
          // Quality Control Report fields
          inspectionResults: extractedData.inspectionResults || "Not mentioned",
          testResults: extractedData.testResults || "Not mentioned",
          qualityIssues: extractedData.qualityIssues || "Not mentioned",
          // Progress Report fields
          milestonesAchieved: extractedData.milestonesAchieved || "Not mentioned",
          scheduledVsActual: extractedData.scheduledVsActual || "Not mentioned",
          budgetImpact: extractedData.budgetImpact || "Not mentioned",
          // Initial RFI Request fields
          rfiNumber: extractedData.rfiNumber || "Not mentioned",
          rfiQuestion: extractedData.rfiQuestion || "Not mentioned",
          rfiContext: extractedData.rfiContext || "Not mentioned",
          requiredResponseDate: extractedData.requiredResponseDate || "Not mentioned",
          // Change Order Report fields
          changeDescription: extractedData.changeDescription || "Not mentioned",
          reasonForChange: extractedData.reasonForChange || "Not mentioned",
          costImpact: extractedData.costImpact || "Not mentioned",
          scheduleImpact: extractedData.scheduleImpact || "Not mentioned",
        });
      }
    } catch (e: any) {
      console.error('All approaches failed:', e);
      await ctx.runMutation(internal.together.saveSummary, {
        id: args.id,
        summary: 'Summary failed to generate. Please try again or contact support if this persists.',
        directive: '',
        actionItems: [],
        title: 'Voice Note ' + new Date().toLocaleDateString(),
        reportType: "general",
        isConstructionReport: false,
        // Original construction report fields
        manpower: "Not mentioned",
        weather: "Not mentioned",
        delays: "Not mentioned",
        openIssues: "Not mentioned",
        equipment: "Not mentioned",
        // Default values for all specialized report fields
        laborDetails: "Not mentioned",
        materialsUsed: "Not mentioned",
        incidentType: "Not mentioned",
        incidentDescription: "Not mentioned",
        peopleInvolved: "Not mentioned",
        correctiveActions: "Not mentioned",
        inspectionResults: "Not mentioned",
        testResults: "Not mentioned",
        qualityIssues: "Not mentioned",
        milestonesAchieved: "Not mentioned",
        scheduledVsActual: "Not mentioned",
        budgetImpact: "Not mentioned",
        rfiNumber: "Not mentioned",
        rfiQuestion: "Not mentioned",
        rfiContext: "Not mentioned",
        requiredResponseDate: "Not mentioned",
        changeDescription: "Not mentioned",
        reasonForChange: "Not mentioned",
        costImpact: "Not mentioned",
        scheduleImpact: "Not mentioned",
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
    summary: v.string(),
    directive: v.string(),
    title: v.string(),
    actionItems: v.array(v.string()),
    reportType: v.string(),
    isConstructionReport: v.boolean(),
    // Original construction report fields
    manpower: v.string(),
    weather: v.string(),
    delays: v.string(),
    openIssues: v.string(),
    equipment: v.string(),
    // Daily Activity Report fields
    laborDetails: v.optional(v.string()),
    materialsUsed: v.optional(v.string()),
    // Safety Incident Report fields
    incidentType: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const { 
      id, summary, directive, actionItems, title, reportType, isConstructionReport, 
      manpower, weather, delays, openIssues, equipment,
      laborDetails, materialsUsed,
      incidentType, incidentDescription, peopleInvolved, correctiveActions,
      inspectionResults, testResults, qualityIssues,
      milestonesAchieved, scheduledVsActual, budgetImpact,
      rfiNumber, rfiQuestion, rfiContext, requiredResponseDate,
      changeDescription, reasonForChange, costImpact, scheduleImpact
    } = args;
    
    await ctx.db.patch(id, {
      summary: summary,
      directive: directive,
      title: title,
      generatingTitle: false,
      reportType: reportType,
      isConstructionReport: isConstructionReport,
      // Original construction report fields
      manpower: manpower,
      weather: weather,
      delays: delays,
      openIssues: openIssues,
      equipment: equipment,
      // Daily Activity Report fields
      laborDetails: laborDetails,
      materialsUsed: materialsUsed,
      // Safety Incident Report fields
      incidentType: incidentType,
      incidentDescription: incidentDescription,
      peopleInvolved: peopleInvolved,
      correctiveActions: correctiveActions,
      // Quality Control Report fields
      inspectionResults: inspectionResults,
      testResults: testResults,
      qualityIssues: qualityIssues,
      // Progress Report fields
      milestonesAchieved: milestonesAchieved,
      scheduledVsActual: scheduledVsActual,
      budgetImpact: budgetImpact,
      // Initial RFI Request fields
      rfiNumber: rfiNumber,
      rfiQuestion: rfiQuestion,
      rfiContext: rfiContext,
      requiredResponseDate: requiredResponseDate,
      // Change Order Report fields
      changeDescription: changeDescription,
      reasonForChange: reasonForChange,
      costImpact: costImpact,
      scheduleImpact: scheduleImpact,
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
