'use client';
import React, { useEffect, useState } from 'react';
import { isAgent, isAgentSync } from './isAgent';

export type AgentState =
  // Initial loading state
  | { loading: true; error: null; identity: null; isAgentClientHint: null }
  // Error state
  | { loading: false; error: Error; identity: null; isAgentClientHint: null }
  // Success state
  | { loading: false; error: null; identity: string | null; isAgentClientHint: boolean };

/**
 * React hook to check if the current client is likely a bot using Stytch.
 * @returns {Object} isAgentClientHint, identity, loading, error
 *
 * @example
 * ```tsx
 * const { useIsAgent, IsAgent, IsHuman } = createAgentContext('your-stytch-public-token');
 *
 * function MyComponent() {
 *   const { isAgentClientHint, identity, loading, error } = useIsAgent();
 *
 *   if (loading) return <div>Checking if you're a bot...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <p>Bot detected: {isAgentClientHint ? 'Yes' : 'No'}</p>
 *       {identity && <p>Bot identity: {identity}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export type useIsAgent = () => AgentState;

export type ErrorComponent = React.ReactNode | ((props: { error: Error }) => React.ReactNode);

export type IsAgentProps = React.PropsWithChildren<{
  loadingComponent?: React.ReactNode;
  errorComponent?: ErrorComponent;
}>;

/**
 * <IsAgent /> only renders children if isAgentClientHint is true.
 * @param loadingComponent - Renders when loading is true
 * @param errorComponent - Renders on error
 * @param children - Content to render if isAgentClientHint is true
 *
 * @example
 * ```tsx
 * const { IsAgent } = createAgentContext('your-stytch-public-token');
 *
 * // Basic usage
 * <IsAgent>
 *   <div>This content only shows to bots</div>
 * </IsAgent>
 *
 * // With loading and error handling
 * <IsAgent
 *   loadingComponent={<div>Checking...</div>}
 *   errorComponent={<div>Failed to check bot status</div>}
 * >
 *   <div>Bot-only content with custom loading state</div>
 * </IsAgent>
 *
 * // With error function component
 * <IsAgent
 *   errorComponent={({ error }) => (
 *     <div>Error occurred: {error.message}</div>
 *   )}
 * >
 *   <div>Bot-only content</div>
 * </IsAgent>
 * ```
 */
export type IsAgent = React.ComponentType<IsAgentProps>;

export type IsHumanProps = React.PropsWithChildren<{
  loadingComponent?: React.ReactNode;
  errorComponent?: ErrorComponent;
  children: React.ReactNode;
}>;

/**
 * <IsHuman /> only renders children if isAgentClientHint is false.
 * @param loadingComponent - Renders when loading is true
 * @param errorComponent - Renders on error
 * @param children - Content to render if isAgentClientHint is false
 *
 * @example
 * ```tsx
 * const { IsHuman } = createAgentContext('your-stytch-public-token');
 *
 * // Basic usage
 * <IsHuman>
 *   <div>This content only shows to humans</div>
 * </IsHuman>
 *
 * // With loading and error handling
 * <IsHuman
 *   loadingComponent={<Spinner />}
 *   errorComponent={<ErrorBanner />}
 * >
 *   <div>Human-only interactive form</div>
 *   <button>Submit</button>
 * </IsHuman>
 *
 * // Combined usage for different experiences
 * <div>
 *   <IsHuman>
 *     <InteractiveForm />
 *   </IsHuman>
 *   <IsAgent>
 *     <StaticContent />
 *   </IsAgent>
 * </div>
 * ```
 */
export type IsHuman = React.ComponentType<IsHumanProps>;

/**
 * createAgentContext initializes the IsAgent, IsHuman, and useIsAgent functions
 * @param publicToken - Your Stytch Public Token
 *
 * @example
 * ```tsx
 * import { createAgentContext } from '@stytch/is-agent';
 *
 * // Initialize the context with your Stytch public token
 * const { useIsAgent, IsAgent, IsHuman } = createAgentContext(
 *   'public-token-test-12345678-1234-1234-1234-123456789abc'
 * );
 *
 * // Use in your app
 * function App() {
 *   return (
 *     <div>
 *       <h1>My App</h1>
 *       <IsHuman>
 *         <p>Welcome, human user!</p>
 *         <button>Click me</button>
 *       </IsHuman>
 *       <IsAgent>
 *         <p>Bot detected - showing simplified view</p>
 *       </IsAgent>
 *     </div>
 *   );
 * }
 *
 * // Or use the hook directly
 * function CustomComponent() {
 *   const { isAgentClientHint, loading } = useIsAgent();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div className={isAgentClientHint ? 'bot-view' : 'human-view'}>
 *       Content styled based on user type
 *     </div>
 *   );
 * }
 * ```
 */
export function createAgentContext(publicToken: string): {
  useIsAgent: useIsAgent;
  IsAgent: IsAgent;
  IsHuman: IsHuman;
} {
  function useIsAgent() {
    const [state, setState] = useState<AgentState>(() => {
      // Read cached sync value - if present, we don't need to trigger another API call
      const state = isAgentSync();
      if (state) {
        return {
          loading: false,
          error: null,
          identity: state.identity,
          isAgentClientHint: state.is_agent_client_hint,
        };
      }
      return {
        loading: true,
        error: null,
        identity: null,
        isAgentClientHint: null,
      };
    });

    useEffect(() => {
      if (!state.loading) return;
      isAgent(publicToken)
        .then(({ is_agent_client_hint, identity }) => {
          setState({
            loading: false,
            error: null,
            identity: identity,
            isAgentClientHint: is_agent_client_hint,
          });
        })
        .catch((error) =>
          setState({
            loading: false,
            error,
            identity: null,
            isAgentClientHint: null,
          })
        );
    }, [state.loading]);

    return state;
  }

  const IsHuman: IsHuman = ({ loadingComponent, errorComponent, children }) => {
    const { isAgentClientHint, loading, error } = useIsAgent();

    if (loading) return <>{loadingComponent || null}</>;
    if (error)
      return (
        <>
          {typeof errorComponent === 'function'
            ? errorComponent({ error })
            : errorComponent || null}
        </>
      );
    if (!isAgentClientHint) return <>{children}</>;
    return null;
  };

  const IsAgent: IsAgent = ({ loadingComponent, errorComponent, children }) => {
    const { isAgentClientHint, loading, error } = useIsAgent();

    if (loading) return <>{loadingComponent || null}</>;
    if (error)
      return (
        <>
          {typeof errorComponent === 'function'
            ? errorComponent({ error })
            : errorComponent || null}
        </>
      );
    if (isAgentClientHint) return <>{children}</>;
    return null;
  };

  return {
    useIsAgent,
    IsAgent,
    IsHuman,
  };
}
