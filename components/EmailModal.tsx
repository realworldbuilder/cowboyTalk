import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useAction } from 'convex/react';
import React, { useState } from 'react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: Id<'notes'>;
}

export default function EmailModal({ isOpen, onClose, noteId }: EmailModalProps) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const generateEmail = useAction(api.together.generateEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsGenerating(true);
    setShowEmail(false);
    
    try {
      const content = await generateEmail({
        noteId,
        recipientName,
        recipientEmail,
        senderName,
        includeAttachments
      });
      
      setEmailContent(content);
      setShowEmail(true);
    } catch (error) {
      console.error('Error generating email:', error);
      setEmailContent('Failed to generate email. Please try again.');
      setShowEmail(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(emailContent);
    alert('Email copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-[90%] max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Generate Email</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!showEmail ? (
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-4">
              <label className="mb-1 block font-medium" htmlFor="recipientName">
                Recipient Name
              </label>
              <input
                id="recipientName"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full rounded border border-gray-300 p-2"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="mb-1 block font-medium" htmlFor="recipientEmail">
                Recipient Email
              </label>
              <input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full rounded border border-gray-300 p-2"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="mb-1 block font-medium" htmlFor="senderName">
                Your Name
              </label>
              <input
                id="senderName"
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full rounded border border-gray-300 p-2"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeAttachments}
                  onChange={(e) => setIncludeAttachments(e.target.checked)}
                  className="mr-2"
                />
                <span>Include reference to attachments</span>
              </label>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 rounded bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="rounded bg-dark px-4 py-2 font-medium text-white hover:bg-opacity-90"
              >
                {isGenerating ? 'Generating...' : 'Generate Email'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4">
            <div className="mb-4 overflow-auto rounded border border-gray-300 bg-gray-50 p-4 text-sm">
              <pre className="whitespace-pre-wrap font-sans">{emailContent}</pre>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowEmail(false)}
                className="mr-2 rounded bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="rounded bg-dark px-4 py-2 font-medium text-white hover:bg-opacity-90"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 