import { query } from './_generated/server';

// A public test function that doesn't require auth
export const testNoAuth = query({
  args: {},
  handler: async (ctx) => {
    return { message: 'Public endpoint working' };
  },
});

// A function that requires authentication
export const testWithAuth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error('Not authenticated');
    }
    
    return { 
      message: 'Auth working properly',
      user: identity.tokenIdentifier 
    };
  },
}); 