'use client';
import React from 'react';
import styles from './page.module.css';
import { useIsAgent, IsAgent, IsHuman } from './isAgent';

export default function Home() {
  const { isAgentClientHint, loading } = useIsAgent();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.heading}>IsAgent example app</h1>
        <IsAgentInfoWidget />
        <ExampleCodeSnippet />
        <Tabs
          loading={loading}
          isAgentClientHint={isAgentClientHint}
          HumanContent={<HumanContent />}
          AgentContent={<AgentContent />}
        />
      </main>
    </div>
  );
}

function IsAgentInfoWidget() {
  return (
    <div className={styles.isAgentInfoWidget}>
      <IsAgent
        loadingComponent={<Spinner />}
        errorComponent={({ error }) => <ErrorMessage error={error} />}
      >
        <h2>
          isAgent: <span className={styles.isAgentValue}>true</span>
        </h2>
        <div className={styles.statusDesc}>You are likely an agent or robot.</div>
      </IsAgent>
      <IsHuman>
        <h2>isAgent: false</h2>
        <div className={styles.statusDesc}>You are likely a human.</div>
      </IsHuman>
    </div>
  );
}

function Tabs({
  loading,
  isAgentClientHint,
  HumanContent,
  AgentContent,
}: {
  loading: boolean;
  isAgentClientHint: boolean | null | undefined;
  HumanContent: React.ReactNode;
  AgentContent: React.ReactNode;
}) {
  const [tab, setTab] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (!loading) {
      setTab(isAgentClientHint ? 'hello-agent' : 'hello-human');
    }
  }, [isAgentClientHint, loading]);

  return (
    <div className={styles.tabsContainer} style={{ visibility: loading ? 'hidden' : 'unset' }}>
      <div className={styles.tabs}>
        <button
          onClick={() => setTab('hello-human')}
          className={
            tab === 'hello-human' ? `${styles.tabButton} ${styles.active}` : styles.tabButton
          }
        >
          hello-human
        </button>
        <button
          onClick={() => setTab('hello-agent')}
          className={
            tab === 'hello-agent' ? `${styles.tabButton} ${styles.active}` : styles.tabButton
          }
        >
          hello-agent
        </button>
      </div>
      <div className={styles.tabContent}>{tab === 'hello-human' ? HumanContent : AgentContent}</div>
    </div>
  );
}

function ExampleCodeSnippet() {
  const codeSnippet = `defaultTab = isAgent ? 'hello-agent' : 'hello-human'`;
  return (
    <div>
      <span className={styles.codeSnippet}>{codeSnippet}</span>
    </div>
  );
}

function HumanContent() {
  return (
    <div>
      <h2>Welcome, human! 👋</h2>
      <p>
        Humans expect <b>rich formatting</b> with <span style={{ color: '#0070f3' }}>colors</span>,{' '}
        <i>emphasis</i>, or{' '}
        <a href="https://stytch.com" target="_blank" rel="noopener noreferrer">
          links
        </a>
        .
      </p>
      <blockquote
        style={{
          borderLeft: '4px solid #0070f3',
          margin: '16px 0',
          padding: '8px 16px',
          background: '#f5f5f5',
        }}
      >
        &quot;This is a complex formatted blockquote for humans.&quot;
      </blockquote>
    </div>
  );
}

function AgentContent() {
  const agentMarkdown = `## Welcome, agent! 🤖\n\nAgents might prefer using Markdown to represent **rich formatting**,\n_emphasis_, and [links](https://stytch.com) in a friendlier way.\n\nIt's a good opportunity to point them to LLMs.txt or your MCP server as well!`;
  function Markdown({ children }: { children: string }) {
    // Minimal markdown renderer for demo purposes
    // Preserves double newlines as an empty line
    const lines = children.split('\n');
    const elements = [];
    let prevEmpty = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') {
        if (prevEmpty) {
          // Already added an empty line for previous empty, skip
          continue;
        }
        elements.push(<div key={i} className={styles.emptyLine} />);
        prevEmpty = true;
      } else {
        elements.push(<div key={i}>{line}</div>);
        prevEmpty = false;
      }
    }
    return <div className={styles.markdownBlock}>{elements}</div>;
  }
  return <Markdown>{agentMarkdown}</Markdown>;
}

function Spinner() {
  return (
    <div className={styles.spinner}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.spinnerIcon}>
        <circle cx="12" cy="12" r="10" stroke="#888" strokeWidth="4" opacity="0.2" />
        <path d="M22 12a10 10 0 0 1-10 10" stroke="#888" strokeWidth="4" strokeLinecap="round">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <span>Evaluating agent status...</span>
    </div>
  );
}

function ErrorMessage({ error }: { error: Error }) {
  return <div style={{ color: 'red' }}>Error: {String(error)}</div>;
}
