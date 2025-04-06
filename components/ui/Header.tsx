import Link from 'next/link';
import { UserNav } from './UserNav';
import { currentUser } from '@clerk/nextjs';
import Image from 'next/image';

export default async function Header() {
  const user = await currentUser();
  
  // Clerk Account Portal URLs
  const signInUrl = "/sign-in";
  const signUpUrl = "/sign-up";
  
  return (
    <div className="relative border-b border-gray-200 px-3 py-3 sm:px-4 sm:py-4 md:px-10">
      <div className="mx-auto flex items-center justify-between">
        {/* logo */}
        <Link className="flex w-fit items-center gap-1 sm:gap-[2px]" href="/dashboard">
          <div className="relative h-5 w-5 md:h-8 md:w-8">
            <Image
              src="/logo.png"
              alt="logo"
              fill
              sizes="(max-width: 768px) 20px, 32px"
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-base font-medium text-[#25292F] sm:text-lg md:text-xl lg:text-2xl">
            Cowboy Talk
          </h1>
        </Link>
        {/* navigation */}
        <div className="flex w-fit items-center gap-3 sm:gap-[22px]">
          {user ? (
            <>
              <div className="hidden md:flex md:items-center md:gap-[22px]">
                <Link
                  href={'/dashboard'}
                  className="cursor-pointer text-sm text-gray-800 hover:text-gray-600 md:text-base lg:text-lg"
                >
                  Recordings
                </Link>
                <Link
                  href={'/record'}
                  className="cursor-pointer text-sm text-gray-800 hover:text-gray-600 md:text-base lg:text-lg"
                >
                  Record
                </Link>
                <Link
                  href={'/dashboard/action-items'}
                  className="cursor-pointer text-sm text-gray-800 hover:text-gray-600 md:text-base lg:text-lg"
                >
                  Action Items
                </Link>
              </div>
              <UserNav
                image={user.imageUrl}
                name={user.firstName + ' ' + user.lastName}
                email={
                  user.emailAddresses.find(
                    ({ id }) => id === user.primaryEmailAddressId,
                  )!.emailAddress
                }
              />
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <a href={signUpUrl}>
                <button className="rounded-lg border border-gray-800 px-3 py-1 text-xs text-gray-800 hover:bg-gray-100 sm:text-sm sm:px-4 md:px-6 md:py-2 md:text-base">
                  Sign up
                </button>
              </a>
              <a href={signInUrl}>
                <button className="rounded-lg bg-gray-800 px-3 py-1 text-xs text-white hover:bg-gray-700 sm:text-sm sm:px-4 md:px-6 md:py-2 md:text-base">
                  Sign in
                </button>
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile navigation */}
      {user && (
        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 md:hidden">
          <Link
            href={'/dashboard'}
            className="flex-1 text-center text-xs text-gray-800 hover:text-gray-600 sm:text-sm"
          >
            Recordings
          </Link>
          <Link
            href={'/record'}
            className="flex-1 text-center text-xs text-gray-800 hover:text-gray-600 sm:text-sm"
          >
            Record
          </Link>
          <Link
            href={'/dashboard/action-items'}
            className="flex-1 text-center text-xs text-gray-800 hover:text-gray-600 sm:text-sm"
          >
            Tasks
          </Link>
        </div>
      )}
    </div>
  );
}
