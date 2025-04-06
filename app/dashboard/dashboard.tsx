'use client';

import RecordedfileItemCard from '@/components/pages/dashboard/RecordedfileItemCard';
import Pagination from '@/components/ui/Pagination';
import { api } from '@/convex/_generated/api';
import { usePreloadedQueryWithAuth } from '@/lib/hooks';
import { Preloaded, useAction } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon } from 'lucide-react';

export default function DashboardHomePage({
  preloadedNotes,
}: {
  preloadedNotes: Preloaded<typeof api.notes.getNotes>;
}) {
  const allNotes = usePreloadedQueryWithAuth(preloadedNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [relevantNotes, setRelevantNotes] =
    useState<FunctionReturnType<typeof api.notes.getNotes>>();
    
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const performMyAction = useAction(api.together.similarNotes);

  // Reset to page 1 when search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [relevantNotes]);

  const handleSearch = async (e: any) => {
    e.preventDefault();

    console.log({ searchQuery });
    if (searchQuery === '') {
      setRelevantNotes(undefined);
    } else {
      const scores = await performMyAction({ searchQuery: searchQuery });
      const scoreMap: Map<string, number> = new Map();
      for (const s of scores) {
        scoreMap.set(s.id, s.score);
      }
      const filteredResults = allNotes.filter(
        (note) => (scoreMap.get(note._id) ?? 0) > 0.6,
      );
      setRelevantNotes(filteredResults);
    }
  };

  const allFilteredNotes = relevantNotes ?? allNotes;
  const totalItems = allFilteredNotes?.length || 0;
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allFilteredNotes?.slice(indexOfFirstItem, indexOfLastItem) || [];

  // Page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Items per page change handler
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div suppressHydrationWarning={true} className="min-h-screen w-full bg-white px-3 py-3 sm:px-5 sm:py-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="text-lg font-semibold text-gray-800 sm:text-xl md:text-2xl lg:text-3xl">Welcome back!</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 md:text-base">Here's a list of all your notes!</p>
        </div>
        
        {/* search bar */}
        <div className="mx-auto mb-4 sm:mb-6 flex rounded-md border border-gray-300 bg-white px-2 py-1.5 sm:px-3 sm:py-2">
          <SearchIcon
            className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
            stroke="currentColor"
            fill="none"
          />
          <form onSubmit={handleSearch} className="w-full">
            <input
              type="text"
              placeholder="Search notes..."
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              className="w-full bg-transparent text-xs sm:text-sm md:text-base text-gray-700 outline-none"
            />
          </form>
        </div>
        
        {/* table header */}
        <div className="mb-2 flex border-b border-gray-200 py-1.5 sm:py-2 text-2xs sm:text-xs md:text-sm font-medium text-gray-500">
          <div className="flex-1 px-2 sm:px-4">Title</div>
          <div className="w-20 px-2 text-right sm:w-32 sm:px-4 md:w-48">Date</div>
        </div>
        
        {/* notes list */}
        <div className="rounded-md border border-gray-200">
          {currentItems && currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <RecordedfileItemCard {...item} key={index} />
            ))
          ) : (
            <div className="flex h-24 sm:h-32 items-center justify-center text-xs sm:text-sm md:text-base text-gray-500">
              <p>You currently have no recordings.</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <Pagination 
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleItemsPerPageChange}
        />
        
        {/* Record button - fixed on mobile, normal on desktop */}
        <div className="mt-4 sm:mt-6 flex justify-end">
          <Link
            className="w-full sm:w-auto text-center rounded-md bg-gray-800 px-3 py-1.5 text-xs sm:text-sm md:text-base font-medium text-white hover:bg-gray-700 sm:px-4 sm:py-2"
            href="/record"
          >
            Record a New Note
          </Link>
        </div>

        {/* Fixed bottom button for mobile */}
        <div className="fixed bottom-4 right-4 sm:hidden">
          <Link
            className="flex items-center justify-center rounded-full bg-primary p-3 shadow-lg"
            href="/record"
            aria-label="Record a new note"
          >
            <PlusIcon className="h-6 w-6 text-white" stroke="currentColor" fill="none" />
          </Link>
        </div>
      </div>
    </div>
  );
}
