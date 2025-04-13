import Link from 'next/link';
import { UserNav } from './UserNav';
import { currentUser } from '@clerk/nextjs';

export default async function Header() {
  const user = await currentUser();
  return (
    <header className="w-full py-6 md:py-8">
      <div className="max-width flex items-center justify-between">
        {/* logo */}
        <Link className="flex items-center gap-2" href="/dashboard">
          <img
            src="/logo.png"
            width={40}
            height={40}
            alt="logo"
            className="h-6 w-6 md:h-8 md:w-8"
          />
          <h1 className="text-xl font-medium text-dark md:text-2xl">
            Cowboy Talk
          </h1>
        </Link>
        {/* navigation */}
        <div className="flex items-center gap-5 md:gap-8">
          {user ? (
            <>
              <nav className="hidden md:flex md:gap-6">
                <Link
                  href={'/dashboard'}
                  className="text-dark/80 hover:text-primary text-lg transition-colors"
                >
                  Recordings
                </Link>
                <Link
                  href={'/dashboard/action-items'}
                  className="text-dark/80 hover:text-primary text-lg transition-colors"
                >
                  Action Items
                </Link>
              </nav>
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
            <Link href="/dashboard">
              <button className="btn-primary">
                Sign in
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
