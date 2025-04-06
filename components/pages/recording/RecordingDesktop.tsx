import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { formatTimestamp } from '@/lib/utils';
import { useMutation } from 'convex/react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ConstructionReportDetails from './ConstructionReportDetails';
import { XCircle, Mail } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function RecordingDesktop({
  note,
  actionItems,
}: {
  note: Doc<'notes'>;
  actionItems: Doc<'actionItems'>[];
}) {
  const {
    generatingActionItems,
    generatingTitle,
    transcription,
    title,
    _creationTime,
    summary,
    directive,
    isConstructionReport,
    manpower,
    weather,
    delays,
    openIssues,
    equipment
  } = note;
  const [showTranscript, setShowTranscript] = useState<boolean>(true);
  const { user } = useUser();

  const mutateActionItems = useMutation(api.notes.removeActionItem);

  function removeActionItem(actionId: any) {
    // Trigger a mutation to remove the item from the list
    mutateActionItems({ id: actionId });
  }

  function shareViaEmail() {
    // Format user name
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Your Name';
    
    // Format the action items as a list
    const actionItemsText = actionItems.map(item => `• ${item.task}`).join('\n');
    
    // Get report type display name for email subject
    let reportTypeDisplay = '';
    switch (note.reportType) {
      case 'daily_activity':
        reportTypeDisplay = 'Daily Activity Report';
        break;
      case 'safety_incident':
        reportTypeDisplay = 'Safety Incident Report';
        break;
      case 'quality_control':
        reportTypeDisplay = 'Quality Control Report';
        break;
      case 'progress':
        reportTypeDisplay = 'Progress Report';
        break;
      case 'change_order':
        reportTypeDisplay = 'Change Order Report';
        break;
      case 'initial_rfi':
        reportTypeDisplay = 'Initial RFI Request';
        break;
      default:
        reportTypeDisplay = 'General Report';
    }
    
    // Current date formatted nicely
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    
    // Build the professional email body
    let emailBody = `Howdy,\n\n`;
    
    // Add directive if available (this is the main communication to recipient)
    if (directive && directive.trim()) {
      // Use the directive directly without assuming a middleman
      emailBody += `${directive}\n\n`;
      
      // Add a note about the email being a direct instruction
      emailBody += `This notice requires your immediate attention and direct action.\n\n`;
    }
    
    // Highlight action items next if available
    if (actionItems.length > 0) {
      emailBody += `Required Actions:\n${actionItemsText}\n\n`;
    }
    
    // Add report type specific details if available
    const reportType = note.reportType || 'general';
    
    // Add more intelligent cost impact notifications based on specific report type and content
    if (reportType === 'progress') {
      emailBody += `NOTICE: These schedule delays will result in additional costs. You will be held accountable for costs associated with these delays and any recovery measures needed.\n\n`;
    } else if (reportType === 'quality_control') {
      emailBody += `NOTICE: These quality issues will result in rework costs and schedule impacts. You will be held accountable for all remediation costs.\n\n`;
    } else if (reportType === 'safety_incident') {
      emailBody += `NOTICE: This safety incident requires immediate corrective action. All costs related to investigation, work stoppage, and compliance measures will be your responsibility.\n\n`;
    }
    
    // Add a professional closing
    emailBody += `Please let me know if you have any questions or need additional information.\n\nBest regards,\n${userName}`;
    
    // Create mailto link with subject and body
    const mailtoLink = `mailto:?subject=${encodeURIComponent(reportTypeDisplay + ': ' + (title || 'Update'))} - ${currentDate.split(',')[0]}&body=${encodeURIComponent(emailBody)}`;
    
    // Open the email client
    window.open(mailtoLink, '_blank');
  }

  return (
    <div className="hidden md:block">
      <div className="max-width mt-5 flex items-center justify-between">
        <div />
        <h1
          className={`leading text-center text-xl font-medium leading-[114.3%] tracking-[-0.75px] text-dark md:text-2xl lg:text-3xl ${
            generatingTitle && 'animate-pulse'
          }`}
        >
          {generatingTitle ? 'Generating Title...' : title ?? 'Untitled Note'}
        </h1>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={shareViaEmail}
            className="flex items-center justify-center rounded-full bg-primary p-2 text-white"
            aria-label="Share via email"
          >
            <Mail className="h-5 w-5" />
          </button>
          <p className="text-sm md:text-base lg:text-lg opacity-80">
            {formatTimestamp(Number(_creationTime))}
          </p>
        </div>
      </div>
      <div className="mt-[18px] grid h-fit w-full grid-cols-2 px-4 py-4 md:px-6 lg:px-8">
        <div className="flex w-full items-center justify-center gap-[50px] border-r lg:gap-[70px]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowTranscript(true)}
              className={`text-base md:text-lg leading-[114.3%] tracking-[-0.6px] text-dark ${
                showTranscript ? 'opacity-100' : 'opacity-40'
              } transition-all duration-300`}
            >
              Transcript
            </button>
            <div
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex h-[20px] w-[36px] cursor-pointer items-center rounded-full bg-dark px-[1px]"
            >
              <div
                className={`h-[18px] w-4 rounded-[50%] bg-light ${
                  showTranscript ? 'translate-x-0' : 'translate-x-[18px]'
                } transition-all duration-300`}
              />
            </div>
            <button
              onClick={() => setShowTranscript(false)}
              className={`text-base md:text-lg leading-[114.3%] tracking-[-0.6px] text-dark ${
                !showTranscript ? 'opacity-100' : 'opacity-40'
              } transition-all duration-300`}
            >
              Report
            </button>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-base md:text-lg lg:text-xl leading-[114.3%] tracking-[-0.75px] text-dark">
            Action Items
          </h1>
        </div>
      </div>
      <div className="grid h-full w-full grid-cols-2 px-4 md:px-6 lg:px-8">
        <div className="relative min-h-[70vh] w-full border-r px-4 py-3 text-justify text-sm md:text-base lg:text-lg font-[300] leading-[114.3%] tracking-[-0.6px]">
          {transcription ? (
            showTranscript ? (
              <div className="">{transcription}</div>
            ) : (
              <ConstructionReportDetails note={note} />
            )
          ) : (
            // Loading state for transcript
            <ul className="animate-pulse space-y-3">
              <li className="h-6 w-full rounded-full bg-gray-200 dark:bg-gray-700"></li>
              <li className="h-6 w-full rounded-full bg-gray-200 dark:bg-gray-700"></li>
              <li className="h-6 w-full rounded-full bg-gray-200 dark:bg-gray-700"></li>
              <li className="h-6 w-full rounded-full bg-gray-200 dark:bg-gray-700"></li>
              <li className="h-6 w-full rounded-full bg-gray-200 dark:bg-gray-700"></li>
            </ul>
          )}
        </div>
        <div className="relative mx-auto mt-[27px] w-full max-w-[900px] px-5 md:mt-[45px]">
          {generatingActionItems
            ? [0, 1, 3].map((item: any, idx: number) => (
                <div
                  className="animate-pulse border-[#00000033] py-1 md:border-t-[1px] md:py-2"
                  key={idx}
                >
                  <div className="flex w-full justify-center">
                    <div className="group w-full items-center rounded p-2 text-base md:text-lg font-[300] text-dark transition-colors duration-300 checked:text-gray-300 hover:bg-gray-100">
                      <div className="flex items-center">
                        <div
                          className="mr-3 h-5 w-5 rounded-full border-2 border-primary-300 bg-gray-200"
                        />
                        <label className="h-5 w-full rounded-full bg-gray-200" />
                      </div>
                      <div className="flex justify-between md:mt-1">
                        <p className="ml-8 text-xs md:text-sm lg:text-base font-[300] leading-[200%] tracking-[-0.6px] text-dark opacity-60">
                          {new Date(Number(_creationTime)).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : actionItems?.map((item: any, idx: number) => (
                <div
                  className="border-[#00000033] py-1 md:border-t-[1px] md:py-2"
                  key={idx}
                >
                  <div className="flex w-full justify-center">
                    <div className="group w-full items-center rounded p-2 text-base md:text-lg font-[300] text-dark transition-colors duration-300 hover:bg-gray-100">
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            removeActionItem(item._id);
                            toast.success('1 task completed.');
                          }}
                          className="mr-3 h-5 w-5 flex items-center justify-center rounded-full border-2 border-primary-400 text-primary-400 hover:bg-primary hover:text-white transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                        <label className="">{item?.task}</label>
                      </div>
                      <div className="flex justify-between md:mt-1">
                        <p className="ml-8 text-xs md:text-sm lg:text-base font-[300] leading-[200%] tracking-[-0.6px] text-dark opacity-60">
                          {new Date(Number(_creationTime)).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center justify-center">
            <Link
              className="rounded-[7px] bg-primary px-5 py-3 text-base md:text-lg leading-[79%] tracking-[-0.75px] text-white lg:px-[37px]"
              style={{ boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.15)' }}
              href="/dashboard/action-items"
            >
              View All Action Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
