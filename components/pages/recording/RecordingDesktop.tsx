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
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center justify-center space-y-3 md:flex-row md:space-x-3 md:space-y-0">
            <Link
              className="rounded-[7px] bg-dark px-5 py-[15px] text-[17px] leading-[79%] tracking-[-0.75px] text-light md:text-xl lg:px-[37px]"
              style={{ boxShadow: ' 0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
              href="/dashboard/action-items"
            >
              View All Action Items
            </Link>
            <button
              className="rounded-[7px] bg-dark px-5 py-[15px] text-[17px] leading-[79%] tracking-[-0.75px] text-light md:text-xl lg:px-[37px]"
              style={{ boxShadow: ' 0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
              onClick={handleEmailGeneration}
              disabled={isGeneratingEmail}
            >
              {isGeneratingEmail ? 'Generating...' : 'Email Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
