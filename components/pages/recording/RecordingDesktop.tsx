import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { formatTimestamp } from '@/lib/utils';
import { useMutation, useAction } from 'convex/react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Id } from '@/convex/_generated/dataModel';
import ImageUploader from '@/app/components/ImageUploader';
import ImageViewer from '@/app/components/ImageViewer';

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
    rfiDetails,
    imageUrls
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
        includeAttachments: true
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
      
      // Add image URLs to email if images exist
      if (imageUrls && imageUrls.length > 0) {
        body += "\n\n--------------------\nATTACHMENT REFERENCES:\n";
        body += `\nThe following ${imageUrls.length} image${imageUrls.length > 1 ? 's are' : ' is'} referenced in this report:\n`;
        imageUrls.forEach((url: string, index: number) => {
          const imageNumber = index + 1;
          body += `\n• [SITE PHOTO ${imageNumber}] - View image: ${url}`;
        });
        body += "\n\nNote: Click on the links above to view the referenced site photos.";
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
      <div className="mx-auto max-w-6xl px-6 pt-8">
        {/* Header Section */}
        <header className="mb-6 flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back to Dashboard</span>
          </Link>
          <div className="text-sm text-muted">
            {formatTimestamp(Number(_creationTime))}
          </div>
        </header>

        {/* Title Section */}
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center">
            {reportType && !generatingTitle && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {reportType} REPORT
              </span>
            )}
          </div>
          <h1
            className={`text-2xl font-medium leading-tight text-dark md:text-3xl ${
              generatingTitle && 'animate-pulse'
            }`}
          >
            {generatingTitle ? 'Generating Title...' : title ?? 'Untitled Note'}
          </h1>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Transcript/Summary */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setOriginalIsOpen(true)}
                  className={`text-sm font-medium ${
                    originalIsOpen ? 'text-primary' : 'text-muted hover:text-dark'
                  } transition-colors`}
                >
                  Transcript
                </button>
                <button
                  onClick={() => setOriginalIsOpen(false)}
                  className={`text-sm font-medium ${
                    !originalIsOpen ? 'text-primary' : 'text-muted hover:text-dark'
                  } transition-colors`}
                >
                  Summary
                </button>
              </div>
            </div>
            <div className="rounded-lg bg-white p-5 shadow-minimal">
              {transcription ? (
                <div className="text-base leading-relaxed text-dark/80">
                  {originalIsOpen ? (
                    transcription
                  ) : (
                    <>
                      <div className="mb-6">{summary}</div>
                      <ReportDetails />
                    </>
                  )}
                </div>
              ) : (
                // Loading state for transcript
                <ul className="animate-pulse space-y-3">
                  <li className="h-4 w-full rounded-full bg-gray-200"></li>
                  <li className="h-4 w-full rounded-full bg-gray-200"></li>
                  <li className="h-4 w-11/12 rounded-full bg-gray-200"></li>
                  <li className="h-4 w-full rounded-full bg-gray-200"></li>
                  <li className="h-4 w-4/5 rounded-full bg-gray-200"></li>
                </ul>
              )}
            </div>
            
            {/* Photos Section - New component */}
            {imageUrls && imageUrls.length > 0 && (
              <div className="mt-6">
                <div className="mb-4 border-b border-gray-200 pb-2">
                  <h2 className="text-lg font-medium text-dark">Photos</h2>
                </div>
                <div className="rounded-lg bg-white p-5 shadow-minimal">
                  <ImageViewer imageUrls={imageUrls} />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Action Items */}
          <div>
            <div className="mb-4 border-b border-gray-200 pb-2">
              <h2 className="text-lg font-medium text-dark">Action Items</h2>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-minimal">
              {note?.generatingActionItems ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="animate-pulse rounded-md bg-gray-100 p-3">
                      <div className="h-4 w-11/12 rounded-full bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              ) : actionItems && actionItems.length > 0 ? (
                <div className="space-y-3">
                  {actionItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3"
                    >
                      <p className="flex-1 text-sm text-dark">
                        {item.task}
                      </p>
                      <button
                        onClick={() => removeActionItem(item._id)}
                        className="ml-3 flex h-6 w-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-center text-sm text-muted">No action items found</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3">
                <ImageUploader 
                  noteId={_id}
                  existingImages={imageUrls || []}
                />
                <Link
                  href="/dashboard/action-items"
                  className="flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-dark shadow-sm transition-all hover:bg-gray-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>All Action Items</span>
                </Link>
                <button
                  onClick={handleEmailGeneration}
                  disabled={isGeneratingEmail}
                  className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90"
                >
                  {isGeneratingEmail ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </div>
    </div>
  );
}
