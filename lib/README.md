# @stytch/is-agent

React components and utilities to detect AI agents and bots, powered by Stytch.

## Installation

```bash
npm install @stytch/is-agent
```

## Quick Start

```tsx
import React from 'react';
import { createAgentContext } from '@stytch/is-agent';

// Initialize with your Stytch public token
const { useIsAgent, IsAgent, IsHuman } = createAgentContext('your-stytch-public-token');

function App() {
  return (
    <div>
      <IsHuman>
        <p>This content is only shown to humans</p>
      </IsHuman>

      <IsAgent>
        <p>This content is only shown to bots</p>
      </IsAgent>
    </div>
  );
}
```

## API Reference

### `createAgentContext(publicToken: string)`

Creates a React context with bot detection capabilities using your Stytch public token.

**Parameters:**

- `publicToken` - Your Stytch public token

**Returns:**

- `useIsAgent` - React hook for bot detection
- `IsAgent` - Component that renders children only for bots
- `IsHuman` - Component that renders children only for humans

### `useIsAgent()` Hook

A React hook that provides bot detection state and results.

**Returns an object with:**

- `isAgentClientHint: boolean | null` - Whether the client is likely an agent
- `identity: string | null` - Identity of the detected agent (if available)
- `loading: boolean` - Whether the detection is in progress
- `error: Error | null` - Any error that occurred during detection

```tsx
function MyComponent() {
  const { isAgentClientHint, identity, loading, error } = useIsAgent();

  if (loading) return <div>Checking if you're a bot...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Bot detected: {isAgentClientHint ? 'Yes' : 'No'}</p>
      {identity && <p>Bot identity: {identity}</p>}
    </div>
  );
}
```

### `<IsAgent>` Component

Conditionally renders children only when the client is detected as a bot.

**Props:**

- `loadingComponent?: React.ReactNode` - Component to show while loading
- `errorComponent?: React.ReactNode | ((props: { error: Error }) => React.ReactNode)` - Component to show on error
- `children` - Content to render for bots

```tsx
<IsAgent loadingComponent={<div>Loading...</div>} errorComponent={<div>Error occurred</div>}>
  <p>Hello, bot!</p>
</IsAgent>
```

### `<IsHuman>` Component

Conditionally renders children only when the client is detected as human.

**Props:**

- `loadingComponent?: React.ReactNode` - Component to show while loading
- `errorComponent?: React.ReactNode | ((props: { error: Error }) => React.ReactNode)` - Component to show on error
- `children` - Content to render for humans

```tsx
<IsHuman loadingComponent={<div>Loading...</div>} errorComponent={<div>Error occurred</div>}>
  <p>Hello, human!</p>
</IsHuman>
```

### `isAgent(publicToken: string)`

Low-level function to check if the current client is a bot. This is used internally by the React components but can be used directly if needed.

**Parameters:**

- `publicToken` - Your Stytch public token

**Returns:**

- `Promise<{ is_agent_client_hint: boolean; identity: string | null }>`

## Requirements

- React 17.0.0 or higher
- A valid Stytch public token

## Getting a Stytch Public Token

1. Sign up for a [Stytch account](https://stytch.com)
2. Create a new project
3. Copy your public token from the project dashboard

## Support

For issues and contributions, please visit our [GitHub repository](https://github.com/stytch/is-agent) and for help, please email [isagent@stytch.com](mailto:isagent@stytch.com).
