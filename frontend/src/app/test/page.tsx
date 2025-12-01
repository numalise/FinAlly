'use client';

export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Test</h1>
      <pre>
        {JSON.stringify({
          API_URL: process.env.NEXT_PUBLIC_API_URL,
          COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
          COGNITO_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
          COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
        }, null, 2)}
      </pre>
    </div>
  );
}
