'use client';

import { api } from '@/convex/_generated/api';
import { usePreloadedQueryWithAuth } from '@/lib/hooks';
import { Preloaded, useMutation } from 'convex/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Pagination from '@/components/ui/Pagination';
import { useState } from 'react';

export default function ActionItemsPage({
  preloadedItems,
}: {
  preloadedItems: Preloaded<typeof api.notes.getActionItems>;
}) {
  const actionItems = usePreloadedQueryWithAuth(preloadedItems);
  const mutateActionItems = useMutation(api.notes.removeActionItem);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  function removeActionItem(actionId: any) {
    // Trigger a mutation to remove the item from the list
    mutateActionItems({ id: actionId });
  }

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = actionItems?.slice(indexOfFirstItem, indexOfLastItem) || [];
  
  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of list when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-[100vh] bg-light">
      <div className="pt-4 pb-2 max-width">
        <h1 className="text-xl font-medium text-primary md:text-2xl text-center">
          Action Items
        </h1>
        <p className="text-sm text-muted text-center mt-1">
          {actionItems?.length ? actionItems?.length : 0} tasks
        </p>
      </div>
      <div className="mx-auto mt-4 w-full max-w-[800px] px-4 md:mt-6">
        {currentItems.map((item, idx) => (
          <div
            className="border-t border-[#00000015] py-2"
            key={idx}
          >
            <div className="w-full rounded p-1 transition-colors duration-300 hover:subtle-gradient">
              <div className="flex items-center">
                <input
                  onChange={(e) => {
                    if (e.target.checked) {
                      removeActionItem(item._id);
                      toast.success('1 task completed.');
                    }
                  }}
                  type="checkbox"
                  checked={false}
                  className="mr-3 h-4 w-4 cursor-pointer rounded-sm border border-muted"
                />
                <label className="text-sm font-normal text-dark md:text-base">{item?.task}</label>
              </div>
              <div className="flex justify-between gap-2 mt-1 ml-7">
                <p className="text-xs font-light text-muted md:text-sm">
                  {new Date(item?._creationTime).toLocaleDateString()}
                </p>
                <p className="truncate text-xs font-light text-muted md:text-sm">
                  From: {item?.title}
                </p>
              </div>
            </div>
          </div>
        ))}
        {actionItems?.length === 0 && (
          <div className="flex flex-col items-center justify-center">
            <div className="flex h-[40vh] w-full flex-col items-center justify-center gap-5">
              <p className="text-center text-base text-muted md:text-lg">
                You currently have no action items.
              </p>
              <Link
                className="btn-primary text-sm md:text-base"
                href="/record"
              >
                Record your first voice note
              </Link>
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {actionItems && actionItems.length > 0 && (
          <Pagination
            totalItems={actionItems.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
