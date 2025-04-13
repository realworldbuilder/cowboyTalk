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
  
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'actions'>('transcript');
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
      <div className="max-width pt-6">
        <div className="mb-6">
          <h1 className="text-center text-xl font-medium text-dark md:text-2xl">
            {title ?? 'Untitled Note'}
          </h1>
          {reportType && !note.generatingTitle && (
            <div className="mt-2 flex justify-center">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {reportType} REPORT
              </span>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="mb-4 flex rounded-lg bg-light p-1 shadow-minimal">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex-1 rounded-md py-2 text-sm transition-colors ${
              activeTab === 'transcript' 
                ? 'bg-white text-primary shadow-button' 
                : 'text-dark/60 hover:text-primary'
            }`}
          >
            Transcript
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 rounded-md py-2 text-sm transition-colors ${
              activeTab === 'summary' 
                ? 'bg-white text-primary shadow-button' 
                : 'text-dark/60 hover:text-primary'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 rounded-md py-2 text-sm transition-colors ${
              activeTab === 'actions' 
                ? 'bg-white text-primary shadow-button' 
                : 'text-dark/60 hover:text-primary'
            }`}
          >
            Actions
          </button>
        </div>
        
        {/* Tab content */}
        <div className="mb-8 min-h-[50vh] rounded-lg bg-white p-4 shadow-minimal">
          {activeTab === 'transcript' && (
            <div className="text-sm leading-relaxed text-dark/80">
              {transcription}
            </div>
          )}
          
          {activeTab === 'summary' && (
            <div className="text-sm leading-relaxed text-dark/80">
              <p className="mb-4">{summary}</p>
              <ReportDetails />
            </div>
          )}
          
          {activeTab === 'actions' && (
            <div>
              {actionItems && actionItems.length > 0 ? (
                <div className="space-y-2">
                  {actionItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md border border-dark/10 p-3"
                    >
                      <p className="flex-1 text-sm text-dark/90">
                        {item.task}
                      </p>
                      <button
                        onClick={() => removeActionItem(item._id)}
                        className="ml-3 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-primary/10 hover:text-primary"
                      >
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M18 6L6 18" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                          <path 
                            d="M6 6L18 18" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[30vh] flex-col items-center justify-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-primary">
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-center text-sm text-muted">No action items found</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="mb-8 flex flex-col gap-3">
          <Link
            href="/dashboard/action-items"
            className="btn-secondary flex w-full items-center justify-center gap-2 py-3 text-sm"
          >
            <span>View All Action Items</span>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M9 11L12 14L22 4" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <button
            onClick={handleEmailGeneration}
            disabled={isGeneratingEmail}
            className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-sm"
          >
            <span>{isGeneratingEmail ? 'Generating...' : 'Email Report'}</span>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M22 6L12 13L2 6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
