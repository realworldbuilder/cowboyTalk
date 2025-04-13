'use client';

import { LogOut, Paintbrush2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function UserNav({
  image,
  name,
  email,
}: {
  image: string;
  name: string;
  email: string;
}) {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    // Use full-page navigation to avoid SPA-related cache issues
    window.location.href = '/';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-dark/10 p-0 hover:bg-light md:h-10 md:w-10">
          <Avatar className="h-full w-full">
            <Image src={image} fill alt="profile picture" sizes="10rem" />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-light shadow-minimal" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-dark">
              {name}
            </p>
            <p className="text-xs leading-none text-muted">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-dark/10" />
        <Link href="/dashboard">
          <DropdownMenuItem className="text-dark focus:bg-accent/30 focus:text-primary">
            <Paintbrush2 className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-dark focus:bg-accent/30 focus:text-primary"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
