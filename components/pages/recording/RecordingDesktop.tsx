import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { formatTimestamp } from '@/lib/utils';
import { useMutation, useAction } from 'convex/react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Id } from '@/convex/_generated/dataModel';

// Helper function to render list items that can be strings or objects with description/type
const renderListItem = (item: any, idx: number) => {
  if (typeof item === 'string') {
    return <li key={idx}>{item}</li>;
  } else if (item.description) {
    return (
      <li key={idx}>
        {item.type && <strong>{item.type}: </strong>}
        {item.description}
      </li>
    );
  }
  return null;
};

// Helper components for displaying report-specific details
export const SafetyReport = ({ details }: { details: any }) => {
  if (!details) return null;
  
  // Helper to render PPE compliance, which could be string or object
  const renderPPECompliance = () => {
    if (!details.ppeCompliance) return null;
    
    if (typeof details.ppeCompliance === 'string') {
      return <p>{details.ppeCompliance}</p>;
    } else {
      return (
        <div>
          {details.ppeCompliance.compliant && details.ppeCompliance.compliant.length > 0 && (
            <div className="mb-2">
              <h5 className="font-medium text-green-600">Compliant:</h5>
              <ul className="ml-5 list-disc">
                {details.ppeCompliance.compliant.map((item: string, idx: number) => (
                  <li key={idx} className="text-green-600">{item}</li>
                ))}
              </ul>
            </div>
          )}
          {details.ppeCompliance.nonCompliant && details.ppeCompliance.nonCompliant.length > 0 && (
            <div>
              <h5 className="font-medium text-red-600">Non-Compliant:</h5>
              <ul className="ml-5 list-disc">
                {details.ppeCompliance.nonCompliant.map((item: string, idx: number) => (
                  <li key={idx} className="text-red-600">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
  };
  
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h3 className="mb-2 text-lg font-semibold">Safety Details</h3>
      {details.incidents && details.incidents.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium">Incidents:</h4>
          <ul className="ml-5 list-disc">
            {details.incidents.map((item: any, idx: number) => renderListItem(item, idx))}
          </ul>
        </div>
      )}
      {details.hazards && details.hazards.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium">Hazards:</h4>
          <ul className="ml-5 list-disc">
            {details.hazards.map((item: any, idx: number) => renderListItem(item, idx))}
          </ul>
        </div>
      )}
      {details.ppeCompliance && (
        <div className="mb-3">
          <h4 className="font-medium">PPE Compliance:</h4>
          {renderPPECompliance()}
        </div>
      )}
    </div>
  );
};

export const QualityReport = ({ details }: { details: any }) => {
  if (!details) return null;
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h3 className="mb-2 text-lg font-semibold">Quality Inspection Details</h3>
      {details.controlPoints && details.controlPoints.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium">Control Points:</h4>
          <ul className="ml-5 list-disc">
            {details.controlPoints.map((item: any, idx: number) => renderListItem(item, idx))}
          </ul>
        </div>
      )}
      {details.nonConformanceIssues && details.nonConformanceIssues.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium">Non-Conformance Issues:</h4>
          <ul className="ml-5 list-disc">
            {details.nonConformanceIssues.map((item: any, idx: number) => renderListItem(item, idx))}
          </ul>
        </div>
      )}
      {details.correctiveActions && details.correctiveActions.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium">Corrective Actions:</h4>
          <ul className="ml-5 list-disc">
            {details.correctiveActions.map((item: any, idx: number) => renderListItem(item, idx))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const EquipmentReport = ({ details }: { details: any }) => {
  if (!details) return null;
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h3 className="mb-2 text-lg font-semibold">Equipment Details</h3>
      {details.status && (
        <div className="mb-3">
          <h4 className="font-medium">Status:</h4>
          <p>{details.status}</p>
        </div>
      )}
      {details.operatingHours && (
        <div className="mb-3">
          <h4 className="font-medium">Operating Hours:</h4>
          <p>{details.operatingHours}</p>
        </div>
      )}
      {details.mechanicalIssues && details.mechanicalIssues.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium">Mechanical Issues:</h4>
          <ul className="ml-5 list-disc">
            {details.mechanicalIssues.map((item: any, idx: number) => renderListItem(item, idx))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const RFIReport = ({ details }: { details: any }) => {
  if (!details) return null;
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h3 className="mb-2 text-lg font-semibold">RFI Details</h3>
      {details.questions && details.questions.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium">Questions:</h4>
          <ul className="ml-5 list-disc">
            {details.questions.map((item: any, idx: number) => renderListItem(item, idx))}
          </ul>
        </div>
      )}
      {details.clarifications && details.clarifications.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium">Clarifications:</h4>
          <ul className="ml-5 list-disc">
            {details.clarifications.map((item: any, idx: number) => renderListItem(item, idx))}
          </ul>
        </div>
      )}
      {details.documentReferences && details.documentReferences.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium">Document References:</h4>
          <ul className="ml-5 list-disc">
            {details.documentReferences.map((item: any, idx: number) => renderListItem(item, idx))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Main component
export default function RecordingDesktop({
  note,
  actionItems,
}: any) {
  const {
    title,
    summary,
    transcription,
    _id,
    _creationTime,
    generatingTitle,
    generatingActionItems,
    reportType,
    safetyDetails,
    qualityDetails,
    equipmentDetails,
    rfiDetails
  } = note;
  const [originalIsOpen, setOriginalIsOpen] = useState(true);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  
  const generateEmail = useAction(api.together.generateEmail);
  const mutateActionItems = useMutation(api.notes.removeActionItem);

  function removeActionItem(actionId: Id<'actionItems'>) {
    mutateActionItems({ id: actionId });
  }
  
  async function handleEmailGeneration() {
    setIsGeneratingEmail(true);
    try {
      const emailContent = await generateEmail({
        noteId: _id,
        recipientName: "",
        recipientEmail: "",
        senderName: "",
        includeAttachments: false
      });
      
      // Extract subject line (first line)
      const lines = emailContent.split('\n');
      let subject = title || "Construction Report";
      let body = emailContent;
      
      // If we have a proper format with Subject line first
      if (lines.length > 1 && lines[0].toLowerCase().startsWith('subject:')) {
        subject = lines[0].substring(8).trim();
        body = lines.slice(1).join('\n').trim();
      }
      
      // Create mailto link
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, '_blank');
    } catch (error) {
      console.error('Error generating email:', error);
      toast.error('Error generating email. Please try again.');
    } finally {
      setIsGeneratingEmail(false);
    }
  }

  // Component to render the appropriate report details based on type
  const ReportDetails = () => {
    switch (reportType) {
      case 'SAFETY':
        return <SafetyReport details={safetyDetails} />;
      case 'QUALITY':
        return <QualityReport details={qualityDetails} />;
      case 'EQUIPMENT':
        return <EquipmentReport details={equipmentDetails} />;
      case 'RFI':
        return <RFIReport details={rfiDetails} />;
      default:
        return null;
    }
  };

  return (
    <div className="hidden md:block">
      <div className="max-width mt-5 flex items-center justify-between">
        <div />
        <div className="text-center">
          <h1
            className={`leading text-center text-xl font-medium leading-[114.3%] tracking-[-0.75px] text-dark md:text-[35px] lg:text-[43px] ${
              generatingTitle && 'animate-pulse'
            }`}
          >
            {generatingTitle ? 'Generating Title...' : title ?? 'Untitled Note'}
          </h1>
          {reportType && !generatingTitle && (
            <div className="mt-2 flex justify-center">
              <span className="rounded-full bg-dark px-3 py-1 text-sm text-light">
                {reportType} REPORT
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center">
          <p className="text-lg opacity-80">
            {formatTimestamp(Number(_creationTime))}
          </p>
        </div>
      </div>
      <div className="mt-[18px] grid h-fit w-full grid-cols-2 px-[30px] py-[19px] lg:px-[45px]">
        <div className="flex w-full items-center justify-center gap-[50px] border-r  lg:gap-[70px]">
          <div className="flex items-center gap-4">
            <button
              className={`text-xl leading-[114.3%] tracking-[-0.6px] text-dark lg:text-2xl ${
                originalIsOpen ? 'opacity-100' : 'opacity-40'
              } transition-all duration-300`}
            >
              Transcript
            </button>
            <div
              onClick={() => setOriginalIsOpen(!originalIsOpen)}
              className="flex h-[20px] w-[36px] cursor-pointer items-center rounded-full bg-dark px-[1px]"
            >
              <div
                className={`h-[18px] w-4 rounded-[50%] bg-light ${
                  originalIsOpen ? 'translate-x-0' : 'translate-x-[18px]'
                } transition-all duration-300`}
              />
            </div>
            <button
              className={`text-xl leading-[114.3%] tracking-[-0.6px] text-dark lg:text-2xl ${
                !originalIsOpen ? 'opacity-100' : 'opacity-40'
              } transition-all duration-300`}
            >
              Summary
            </button>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-xl leading-[114.3%] tracking-[-0.75px] text-dark lg:text-2xl xl:text-[30px]">
            Action Items
          </h1>
        </div>
      </div>
      <div className="grid h-full w-full grid-cols-2 px-[30px] lg:px-[45px]">
        <div className="relative min-h-[70vh] w-full border-r px-5 py-3 text-justify text-xl font-[300] leading-[114.3%] tracking-[-0.6px] lg:text-2xl">
          {transcription ? (
            <div className="">
              {originalIsOpen ? transcription : (
                <>
                  <div>{summary}</div>
                  <ReportDetails />
                </>
              )}
            </div>
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
          {note?.generatingActionItems
            ? [0, 1, 3].map((item: any, idx: number) => (
                <div
                  className="animate-pulse border-[#00000033] py-1 md:border-t-[1px] md:py-2"
                  key={idx}
                >
                  <div className="mt-2 h-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ))
            : actionItems?.map((item: any, idx: number) => (
                <div
                  className="border-[#00000033] py-1 md:border-t-[1px] md:py-2"
                  key={idx}
                >
                  <div className="flex items-center justify-between" key={idx}>
                    <p className=" text-[16px] font-[300] leading-[114.3%] tracking-[-0.4px] text-dark md:text-xl lg:text-2xl">
                      {item.task}
                    </p>
                    <button
                      onClick={() => {
                        removeActionItem(item._id);
                      }}
                      className="rounded-[4px] bg-dark px-4 py-[6px] text-sm text-light"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center justify-center space-y-3 md:flex-row md:space-x-4 md:space-y-0">
            <Link
              href="/dashboard/action-items"
              className="flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-base font-medium text-dark shadow-sm transition-all hover:bg-gray-50 md:px-5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>All Action Items</span>
            </Link>
            <button
              onClick={handleEmailGeneration}
              disabled={isGeneratingEmail}
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-primary/90 md:px-5"
            >
              {isGeneratingEmail ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Generating...</span>
                </span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Email Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
