import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FileIcon, Trash2, Mail } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const RecordedfileItemCard = ({
  title,
  count,
  _creationTime,
  _id,
  reportType,
}: {
  title?: string;
  count: number;
  _creationTime: number;
  _id: any;
  reportType?: string;
}) => {
  const deleteNote = useMutation(api.notes.removeNote);
  const [isMobile, setIsMobile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format for mobile display (shorter)
  const formatMobileDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle email sharing
  function shareViaEmail(e: React.MouseEvent) {
    // Prevent navigation to the recording page
    e.preventDefault();
    e.stopPropagation();
    
    // Format user name
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Your Name';
    
    // Current date formatted nicely
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    
    // Get report type display name for email subject
    let reportTypeDisplay = '';
    switch (reportType) {
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
    
    // Simple email body for the dashboard version - they can view details in the full page
    let emailBody = `Howdy,\n\n`;
    emailBody += `I've shared a ${reportTypeDisplay} with you that requires your attention.\n\n`;
    emailBody += `Please view the full recording here: ${window.location.origin}/recording/${_id}\n\n`;
    emailBody += `This notice requires your immediate attention and direct action.\n\n`;
    emailBody += `Please let me know if you have any questions or need additional information.\n\nBest regards,\n${userName}`;
    
    // Create mailto link with subject and body
    const mailtoLink = `mailto:?subject=${encodeURIComponent(reportTypeDisplay + ': ' + (title || 'Update'))} - ${currentDate.split(',')[0]}&body=${encodeURIComponent(emailBody)}`;
    
    // Open the email client
    window.open(mailtoLink, '_blank');
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  }

  function confirmDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    deleteNote({ id: _id });
    setShowDeleteConfirm(false);
  }

  function cancelDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  }

  return (
    <Link
      href={`/recording/${_id}`}
      className="flex items-center justify-between border-b border-gray-200 px-2 py-2 sm:px-4 sm:py-3 hover:bg-gray-50"
    >
      <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-100">
          <FileIcon 
            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" 
            stroke="currentColor"
            fill="none"
          />
        </div>
        <div className="overflow-hidden max-w-[180px] sm:max-w-none">
          <h3 className="truncate text-xs sm:text-sm md:text-base font-medium text-gray-800">
            {title || "Untitled Note"}
          </h3>
        </div>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4">
        <span className="text-2xs sm:text-xs md:text-sm text-gray-500">
          {isMobile ? formatMobileDate(_creationTime) : formatDate(_creationTime)}
        </span>
        <button
          onClick={(e) => shareViaEmail(e)}
          className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-gray-400 hover:bg-primary hover:text-white"
          aria-label="Share via email"
        >
          <Mail 
            className="h-4 w-4 sm:h-5 sm:w-5" 
            stroke="currentColor"
            fill="none"
          />
        </button>
        <button
          onClick={handleDelete}
          className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600"
          aria-label="Delete note"
        >
          <Trash2 
            className="h-4 w-4 sm:h-5 sm:w-5" 
            stroke="currentColor"
            fill="none"
          />
        </button>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={cancelDelete}
        >
          <div 
            className="bg-white p-4 rounded-lg shadow-lg max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this recording? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDelete}
                className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};

export default RecordedfileItemCard;
