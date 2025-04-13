"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignInButton, SignOutButton, useAuth } from "@clerk/nextjs";

export default function TestAuth() {
  const { isSignedIn } = useAuth();
  const noAuthTest = useQuery(api.testAuth.testNoAuth);
  const withAuthTest = useQuery(api.testAuth.testWithAuth);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Auth Status</h2>
        <p>User is {isSignedIn ? "signed in" : "NOT signed in"}</p>
        <div className="mt-2">
          {isSignedIn ? (
            <SignOutButton>
              <button className="bg-red-500 text-white px-4 py-2 rounded">Sign Out</button>
            </SignOutButton>
          ) : (
            <SignInButton>
              <button className="bg-blue-500 text-white px-4 py-2 rounded">Sign In</button>
            </SignInButton>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Public Endpoint Test</h2>
        <pre className="bg-gray-100 p-4 rounded mt-2">
          {noAuthTest ? JSON.stringify(noAuthTest, null, 2) : "Loading..."}
        </pre>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Protected Endpoint Test</h2>
        <pre className="bg-gray-100 p-4 rounded mt-2">
          {withAuthTest ? 
            JSON.stringify(withAuthTest, null, 2) : 
            (isSignedIn ? "Loading..." : "Sign in to test protected endpoint")}
        </pre>
      </div>
    </div>
  );
} 