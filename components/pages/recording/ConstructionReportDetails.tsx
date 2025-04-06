import { Doc } from '@/convex/_generated/dataModel';

export default function ConstructionReportDetails({
  note,
}: {
  note: Doc<'notes'>;
}) {
  const { 
    reportType,
    // Original construction report fields
    manpower, weather, delays, openIssues, equipment, summary, directive,
    // Daily Activity Report fields
    laborDetails, materialsUsed,
    // Safety Incident Report fields
    incidentType, incidentDescription, peopleInvolved, correctiveActions,
    // Quality Control Report fields
    inspectionResults, testResults, qualityIssues,
    // Progress Report fields
    milestonesAchieved, scheduledVsActual, budgetImpact,
    // Initial RFI Request fields
    rfiNumber, rfiQuestion, rfiContext, requiredResponseDate,
    // Change Order Report fields
    changeDescription, reasonForChange, costImpact, scheduleImpact
  } = note;

  // Determine the report type for display
  const reportTypeDisplay = getReportTypeDisplay(reportType || 'general');

  // Helper function to check if a field has content
  const hasContent = (field?: string) => field && field !== "Not mentioned";
  
  // Check for content in each section
  // Original fields
  const hasManpower = hasContent(manpower);
  const hasWeather = hasContent(weather);
  const hasDelays = hasContent(delays);
  const hasOpenIssues = hasContent(openIssues);
  const hasEquipment = hasContent(equipment);
  
  // Daily Activity Report fields
  const hasLaborDetails = hasContent(laborDetails);
  const hasMaterialsUsed = hasContent(materialsUsed);
  
  // Safety Incident Report fields
  const hasIncidentType = hasContent(incidentType);
  const hasIncidentDescription = hasContent(incidentDescription);
  const hasPeopleInvolved = hasContent(peopleInvolved);
  const hasCorrectiveActions = hasContent(correctiveActions);
  
  // Quality Control Report fields
  const hasInspectionResults = hasContent(inspectionResults);
  const hasTestResults = hasContent(testResults);
  const hasQualityIssues = hasContent(qualityIssues);
  
  // Progress Report fields
  const hasMilestonesAchieved = hasContent(milestonesAchieved);
  const hasScheduledVsActual = hasContent(scheduledVsActual);
  const hasBudgetImpact = hasContent(budgetImpact);
  
  // Initial RFI Request fields
  const hasRfiNumber = hasContent(rfiNumber);
  const hasRfiQuestion = hasContent(rfiQuestion);
  const hasRfiContext = hasContent(rfiContext);
  const hasRequiredResponseDate = hasContent(requiredResponseDate);
  
  // Change Order Report fields
  const hasChangeDescription = hasContent(changeDescription);
  const hasReasonForChange = hasContent(reasonForChange);
  const hasCostImpact = hasContent(costImpact);
  const hasScheduleImpact = hasContent(scheduleImpact);

  return (
    <div className="relative mt-2 min-h-[70vh] w-full px-4 py-3 text-sm sm:text-base font-light">
      <div className="space-y-4">
        {/* Report Type Banner */}
        <div className="bg-gray-100 mb-4 p-2 rounded-lg text-center">
          <span className="font-medium">{reportTypeDisplay}</span>
        </div>
        
        {/* Summary section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Summary</h2>
          <div className="text-justify">
            {summary}
          </div>
        </div>
        
        {/* Directive section - only show if available */}
        {directive && directive.trim() && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Directive/Notification</h2>
            <div className="text-justify border-l-4 border-primary pl-3 py-1">
              {directive}
            </div>
          </div>
        )}
        
        {/* Original Construction report fields */}
        {(hasManpower || hasWeather || hasDelays || hasOpenIssues || hasEquipment) && (
          <h2 className="text-lg font-medium">Construction Report Details</h2>
        )}
        
        {hasManpower && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Manpower</h3>
            <p>{manpower}</p>
          </div>
        )}
        
        {hasWeather && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Weather</h3>
            <p>{weather}</p>
          </div>
        )}
        
        {hasDelays && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Delays</h3>
            <p>{delays}</p>
          </div>
        )}
        
        {hasOpenIssues && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Open Issues</h3>
            <p>{openIssues}</p>
          </div>
        )}
        
        {hasEquipment && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Equipment</h3>
            <p>{equipment}</p>
          </div>
        )}
        
        {/* Daily Activity Report fields */}
        {reportType === 'daily_activity' && (hasLaborDetails || hasMaterialsUsed) && (
          <h2 className="text-lg font-medium mt-6">Daily Activity Details</h2>
        )}
        
        {reportType === 'daily_activity' && hasLaborDetails && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Labor Details</h3>
            <p>{laborDetails}</p>
          </div>
        )}
        
        {reportType === 'daily_activity' && hasMaterialsUsed && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Materials Used</h3>
            <p>{materialsUsed}</p>
          </div>
        )}
        
        {/* Safety Incident Report fields */}
        {reportType === 'safety_incident' && (hasIncidentType || hasIncidentDescription || hasPeopleInvolved || hasCorrectiveActions) && (
          <h2 className="text-lg font-medium mt-6">Safety Incident Details</h2>
        )}
        
        {reportType === 'safety_incident' && hasIncidentType && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Incident Type</h3>
            <p>{incidentType}</p>
          </div>
        )}
        
        {reportType === 'safety_incident' && hasIncidentDescription && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Incident Description</h3>
            <p>{incidentDescription}</p>
          </div>
        )}
        
        {reportType === 'safety_incident' && hasPeopleInvolved && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">People Involved</h3>
            <p>{peopleInvolved}</p>
          </div>
        )}
        
        {reportType === 'safety_incident' && hasCorrectiveActions && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Corrective Actions</h3>
            <p>{correctiveActions}</p>
          </div>
        )}
        
        {/* Quality Control Report fields */}
        {reportType === 'quality_control' && (hasInspectionResults || hasTestResults || hasQualityIssues) && (
          <h2 className="text-lg font-medium mt-6">Quality Control Details</h2>
        )}
        
        {reportType === 'quality_control' && hasInspectionResults && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Inspection Results</h3>
            <p>{inspectionResults}</p>
          </div>
        )}
        
        {reportType === 'quality_control' && hasTestResults && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Test Results</h3>
            <p>{testResults}</p>
          </div>
        )}
        
        {reportType === 'quality_control' && hasQualityIssues && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Quality Issues</h3>
            <p>{qualityIssues}</p>
          </div>
        )}
        
        {/* Progress Report fields */}
        {reportType === 'progress' && (hasMilestonesAchieved || hasScheduledVsActual || hasBudgetImpact) && (
          <h2 className="text-lg font-medium mt-6">Progress Report Details</h2>
        )}
        
        {reportType === 'progress' && hasMilestonesAchieved && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Milestones Achieved</h3>
            <p>{milestonesAchieved}</p>
          </div>
        )}
        
        {reportType === 'progress' && hasScheduledVsActual && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Scheduled vs Actual Progress</h3>
            <p>{scheduledVsActual}</p>
          </div>
        )}
        
        {reportType === 'progress' && hasBudgetImpact && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Budget Impact</h3>
            <p>{budgetImpact}</p>
          </div>
        )}
        
        {/* Initial RFI Request fields */}
        {reportType === 'initial_rfi' && (hasRfiNumber || hasRfiQuestion || hasRfiContext || hasRequiredResponseDate) && (
          <h2 className="text-lg font-medium mt-6">Initial RFI Request Details</h2>
        )}
        
        {reportType === 'initial_rfi' && hasRfiNumber && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">RFI Number</h3>
            <p>{rfiNumber}</p>
          </div>
        )}
        
        {reportType === 'initial_rfi' && hasRfiQuestion && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">RFI Question</h3>
            <p>{rfiQuestion}</p>
          </div>
        )}
        
        {reportType === 'initial_rfi' && hasRfiContext && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">RFI Context</h3>
            <p>{rfiContext}</p>
          </div>
        )}
        
        {reportType === 'initial_rfi' && hasRequiredResponseDate && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Required Response Date</h3>
            <p>{requiredResponseDate}</p>
          </div>
        )}
        
        {/* Change Order Report fields */}
        {reportType === 'change_order' && (hasChangeDescription || hasReasonForChange || hasCostImpact || hasScheduleImpact) && (
          <h2 className="text-lg font-medium mt-6">Change Order Details</h2>
        )}
        
        {reportType === 'change_order' && hasChangeDescription && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Change Description</h3>
            <p>{changeDescription}</p>
          </div>
        )}
        
        {reportType === 'change_order' && hasReasonForChange && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Reason for Change</h3>
            <p>{reasonForChange}</p>
          </div>
        )}
        
        {reportType === 'change_order' && hasCostImpact && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Cost Impact</h3>
            <p>{costImpact}</p>
          </div>
        )}
        
        {reportType === 'change_order' && hasScheduleImpact && (
          <div className="rounded-lg border border-gray-200 p-3">
            <h3 className="mb-1 font-medium">Schedule Impact</h3>
            <p>{scheduleImpact}</p>
          </div>
        )}
        
        {/* Show message if no data is available at all */}
        {!hasManpower && !hasWeather && !hasDelays && !hasOpenIssues && !hasEquipment &&
         !hasLaborDetails && !hasMaterialsUsed &&
         !hasIncidentType && !hasIncidentDescription && !hasPeopleInvolved && !hasCorrectiveActions &&
         !hasInspectionResults && !hasTestResults && !hasQualityIssues &&
         !hasMilestonesAchieved && !hasScheduledVsActual && !hasBudgetImpact &&
         !hasRfiNumber && !hasRfiQuestion && !hasRfiContext && !hasRequiredResponseDate &&
         !hasChangeDescription && !hasReasonForChange && !hasCostImpact && !hasScheduleImpact && (
          <p className="text-gray-500">No construction report details available.</p>
        )}
      </div>
    </div>
  );
}

// Helper function to get display-friendly report type name
function getReportTypeDisplay(reportType: string): string {
  switch (reportType) {
    case 'daily_activity':
      return 'Daily Activity Report';
    case 'safety_incident':
      return 'Safety Incident Report';
    case 'quality_control':
      return 'Quality Control Report';
    case 'progress':
      return 'Progress Report';
    case 'initial_rfi':
      return 'Initial RFI Request';
    case 'change_order':
      return 'Change Order Report';
    case 'general':
    default:
      return 'General Report';
  }
} 