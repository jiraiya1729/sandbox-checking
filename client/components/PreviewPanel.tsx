'use client';
import { useState, useEffect, useMemo } from 'react';

interface PreviewProps {
  sandboxId?: string;  // Make optional for safety
  port?: number;
}

export default function PreviewPanel({ sandboxId, port = 3000 }: PreviewProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Compute proxy URL directly from props using useMemo
  const proxyUrl = useMemo(() => {
    if (sandboxId) {
      const url = `/api/proxy/preview/${sandboxId}/${port}`;
      console.log('Computed proxyUrl:', url);
      return url;
    }
    console.error('sandboxId is missing—cannot build proxy URL');
    return '';
  }, [sandboxId, port]);

  if (!proxyUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p>Loading preview... (sandboxId: {sandboxId || 'MISSING'})</p>
      </div>
    );
  }

  return (
    <iframe
      src={proxyUrl}
      className="w-full h-full"
      style={{ border: 'none' }}
      title="Generated Site Preview"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
      onLoad={() => console.log('Iframe loaded:', proxyUrl)}
      onError={(e) => console.error('Iframe error:', e, proxyUrl)}
    />
  );
}
