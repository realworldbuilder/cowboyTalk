import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import toast, { Toaster } from 'react-hot-toast';
import { Doc, Id } from '@/convex/_generated/dataModel';

// Import the report components from RecordingDesktop
import { 
  SafetyReport, 
  QualityReport, 
  EquipmentReport, 
  RFIReport 
} from './RecordingDesktop';

export default function RecordingMobile({
  note,
  actionItems,
}: {
  note: Doc<'notes'>;
  actionItems: Doc<'actionItems'>[];
}) {
  const { 
    title, 
    transcription, 
    summary,
    reportType,
    safetyDetails,
    qualityDetails,
    equipmentDetails,
    rfiDetails,
    _id
  } = note;
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [actionItemOpen, setActionItemOpen] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  const mutateActionItems = useMutation(api.notes.removeActionItem);
  const generateEmail = useAction(api.together.generateEmail);

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
    <div className="md:hidden">
      <div className="max-width my-5 flex flex-col items-center justify-center">
        <h1 className="leading text-center text-xl font-medium leading-[114.3%] tracking-[-0.75px] text-dark md:text-[35px] lg:text-[43px]">
          {title ?? 'Untitled Note'}
        </h1>
        {reportType && (
          <div className="mt-2 flex justify-center">
            <span className="rounded-full bg-dark px-3 py-1 text-sm text-light">
              {reportType} REPORT
            </span>
          </div>
        )}
      </div>
      <div className="grid w-full grid-cols-3 ">
        <button
          onClick={() => (
            setTranscriptOpen(!transcriptOpen),
            setActionItemOpen(false),
            setSummaryOpen(false)
          )}
          className={`py-[12px] text-[17px] leading-[114.3%] tracking-[-0.425px] ${
            transcriptOpen ? 'action-btn-active' : 'action-btn'
          }`}
        >
          Transcript
        </button>
        <button
          onClick={() => (
            setTranscriptOpen(false),
            setActionItemOpen(false),
            setSummaryOpen(!summaryOpen)
          )}
          className={`py-[12px] text-[17px] leading-[114.3%] tracking-[-0.425px] ${
            summaryOpen ? 'action-btn-active' : 'action-btn'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => (
            setTranscriptOpen(false),
            setActionItemOpen(!actionItemOpen),
            setSummaryOpen(false)
          )}
          className={`py-[12px] text-[17px] leading-[114.3%] tracking-[-0.425px] ${
            actionItemOpen ? 'action-btn-active' : 'action-btn'
          }`}
        >
          Action Items
        </button>
      </div>
      <div className="w-full">
        {transcriptOpen && (
          <div className="relative mt-2 min-h-[70vh] w-full px-4 py-3 text-justify font-light">
            <div className="">{transcription}</div>
          </div>
        )}
        {summaryOpen && (
          <div className="relative mt-2 min-h-[70vh] w-full px-4 py-3 text-justify font-light">
            <div>{summary}</div>
            <ReportDetails />
          </div>
        )}
        {actionItemOpen && (
          <div className="relative min-h-[70vh] w-full px-4 py-3">
            {' '}
            <div className="relative mx-auto mt-[27px] w-full max-w-[900px] px-5 md:mt-[45px]">
              {actionItems?.map((item: any, idx: number) => (
                <div
                  className="border-[#00000033] py-1 md:border-t-[1px] md:py-2"
                  key={idx}
                >
                  <div className="flex items-center justify-between">
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
              <div className="mt-10 flex flex-col items-center justify-center space-y-3">
                <Link
                  className="rounded-[7px] bg-dark px-5 py-[15px] text-[17px] leading-[79%] tracking-[-0.75px] text-light md:text-xl lg:px-[37px]"
                  style={{
                    boxShadow: ' 0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                  }}
                  href="/dashboard/action-items"
                >
                  View All Action Items
                </Link>
                <button
                  className="rounded-[7px] bg-blue-600 px-5 py-[15px] text-[17px] leading-[79%] tracking-[-0.75px] text-light md:text-xl lg:px-[37px]"
                  style={{ boxShadow: ' 0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
                  onClick={handleEmailGeneration}
                  disabled={isGeneratingEmail}
                >
                  {isGeneratingEmail ? 'Generating Email...' : 'Email Report'}
                </button>
              </div>
            </div>{' '}
          </div>
        )}
        <Toaster position="bottom-left" reverseOrder={false} />
      </div>
    </div>
  );
}
