import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { setContext } from '@apollo/client/link/context';
import { registerSW } from 'virtual:pwa-register'
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react'

import './index.css'
import App from './App.tsx'

// Initialize PostHog
posthog.init('phc_KEY_PLACEHOLDER', { // Replace with actual key or env var
    api_host: 'https://app.posthog.com',
    autocapture: true,
});

// Register Service Worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
});

const PUBLISHABLE_KEY = "pk_test_bm9ibGUtbGlnZXItNjMuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// Create a component to wrap ApolloProvider so we can use Clerk hook
const ApolloProviderWithAuth = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();

  const httpLink = createHttpLink({
    uri: 'http://localhost:4000/',
  });

  const authLink = setContext(async (_, { headers }) => {
    const token = await getToken();
    return {
      headers: {
        ...headers,
        token: token || "",
      }
    }
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <ApolloProviderWithAuth>
          <App />
        </ApolloProviderWithAuth>
      </ClerkProvider>
    </PostHogProvider>
  </StrictMode>,
)
