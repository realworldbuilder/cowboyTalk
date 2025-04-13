import { api } from '@/convex/_generated/api';
import { useMutation, useAction } from 'convex/react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

const RecordedfileItemCard = ({
  title,
  count,
  _creationTime,
  _id,
}: {
  title?: string;
  count: number;
  _creationTime: number;
  _id: any;
}) => {
  const deleteNote = useMutation(api.notes.removeNote);
  const generateEmail = useAction(api.together.generateEmail);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  
  async function handleEmailGeneration(e: React.MouseEvent) {
    e.preventDefault(); // Don't follow the link
    
    if (isGeneratingEmail) return;
    
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
      toast.error('Error generating email');
    } finally {
      setIsGeneratingEmail(false);
    }
  }

  const formattedDate = new Date(_creationTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link
      href={`/recording/${_id}`}
      className="card my-2 flex flex-col justify-between overflow-hidden border-none transition hover:bg-accent/10 sm:flex-row sm:items-center sm:py-4 md:my-3"
    >
      <div className="flex items-center gap-3 p-4 sm:p-0 sm:pl-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <path 
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <h2 className="text-base font-medium text-dark md:text-lg">
            {title || "Untitled Recording"}
          </h2>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted md:text-sm">
            <span>{formattedDate}</span>
            <span>{count} {count === 1 ? 'task' : 'tasks'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end border-t border-dark/5 p-2 sm:border-0 sm:p-0 sm:pr-4">
        <button
          onClick={handleEmailGeneration}
          className="group rounded-full p-2 transition-colors hover:bg-primary/10"
          title={isGeneratingEmail ? "Generating..." : "Email Report"}
          disabled={isGeneratingEmail}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`text-muted transition-colors group-hover:text-primary ${isGeneratingEmail ? "opacity-50" : ""}`}
          >
            <path 
              d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            deleteNote({ id: _id });
          }}
          className="group rounded-full p-2 transition-colors hover:bg-primary/10"
          title="Delete recording"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-muted transition-colors group-hover:text-primary"
          >
            <path 
              d="M3 6H5H21" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </Link>
  );
};

export default RecordedfileItemCard;
