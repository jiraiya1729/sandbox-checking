// app/api/proxy/preview/[...path]/route.ts
// Updated with extensive console logs for debugging 404/path issues.
// Logs will appear in your terminal (where `npm run dev` runs)—check there, not browser console.

import { NextRequest, NextResponse } from 'next/server';
import { Configuration, SandboxApi } from '@daytonaio/api-client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const DAYTONA_API_KEY = process.env.DAYTONA_API_KEY;
const DAYTONA_API_URL = process.env.DAYTONA_API_URL;

if (!DAYTONA_API_KEY || !DAYTONA_API_URL) {
  throw new Error('Missing Daytona env vars');
}

const sandboxApi = new SandboxApi(
  new Configuration({
    basePath: DAYTONA_API_URL,
    baseOptions: {
      headers: { Authorization: `Bearer ${DAYTONA_API_KEY}` },
    },
  })
);

// Helper to extract sandboxId/port from dynamic path
function getSandboxIdAndPortFromPath(fullPath: string[]): { sandboxId: string; port: number } {
  console.log('=== PATH DEBUG === Full path segments:', fullPath);  // Log 1: See exact segments
  if (fullPath.length < 5) {
    console.error('=== PATH ERROR === Invalid path length:', fullPath.length, 'Expected >=5');
    throw new Error('Invalid path: Need sandboxId and port');
  }
  const sandboxId = fullPath[3];  // Index 3: sandboxId (after ['api', 'proxy', 'preview'])
  const portStr = fullPath[4];    // Index 4: port
  console.log('=== PATH DEBUG === Extracted sandboxId:', sandboxId, 'portStr:', portStr);  // Log 2: Confirm extraction
  const port = parseInt(portStr, 10);
  if (isNaN(port)) {
    console.error('=== PATH ERROR === Invalid port (NaN):', portStr);
    throw new Error('Invalid port');
  }
  console.log('=== PATH DEBUG === Valid port:', port);  // Log 3: Success
  return { sandboxId, port };
}

// Error HTML
const errorHtml = `
<!DOCTYPE html>
<html>
<head><title>Proxy Error</title></head>
<body><h1>Preview Error</h1><p>Failed to load sandbox. Check console.</p></body>
</html>
`;

// Main handler
export async function GET(req: NextRequest) {
  console.log('=== ROUTE HIT === GET /api/proxy/preview/...');  // Log 4: Confirm route is matched
  return handleProxy(req);
}

export async function POST(req: NextRequest) {
  console.log('=== ROUTE HIT === POST /api/proxy/preview/...');  // Log 5: For non-GET methods
  return handleProxy(req);
}

export async function PUT(req: NextRequest) {
  console.log('=== ROUTE HIT === PUT /api/proxy/preview/...');
  return handleProxy(req);
}

export async function DELETE(req: NextRequest) {
  console.log('=== ROUTE HIT === DELETE /api/proxy/preview/...');
  return handleProxy(req);
}

export async function PATCH(req: NextRequest) {
  console.log('=== ROUTE HIT === PATCH /api/proxy/preview/...');
  return handleProxy(req);
}

async function handleProxy(req: NextRequest): Promise<NextResponse> {
  console.log('=== PROXY START === Method:', req.method, 'URL:', req.url);
  try {
    const { pathname } = req.nextUrl;
    console.log('=== PROXY DEBUG === Raw pathname:', pathname);
    const pathSegments = pathname.split('/').filter(Boolean);
    console.log('=== PROXY DEBUG === Cleaned pathSegments:', pathSegments);

    const { sandboxId, port } = getSandboxIdAndPortFromPath(pathSegments);

    console.log('=== SDK CALL === Fetching preview for sandboxId:', sandboxId, 'port:', port);
    const response = await sandboxApi.getPortPreviewUrl(sandboxId, port);
    let previewUrl = response.data.url;
    const previewToken = response.data.token;
    
    // URL fix (regex handles https:/foo -> https://foo)
    previewUrl = previewUrl.replace(/^https:\/([^/])/, 'https://$1');
    if (!previewUrl.startsWith('http')) {
      previewUrl = 'https://' + previewUrl;
    }
    console.log('=== URL FIX === Corrected previewUrl to:', previewUrl);
    
    console.log('=== SDK SUCCESS === Preview URL:', previewUrl, 'Token (first 10 chars):', previewToken?.substring(0, 10) + '...');

    const subPath = pathSegments.slice(5).join('/');
    console.log('=== PROXY DEBUG === Subpath:', subPath);
    const fullTargetUrl = `${previewUrl.replace(/\/$/, '')}/${subPath}`.replace(/\/+/g, '/');
    console.log('=== PROXY DEBUG === Full target URL:', fullTargetUrl);  // Add JSON.stringify if mangled

    const headers = new Headers(req.headers);
    headers.set('X-Daytona-Preview-Token', previewToken || '');
    headers.set('X-Daytona-Skip-Preview-Warning', 'true');
    headers.delete('host');
    headers.delete('origin');
    if (req.headers.has('content-length')) {
      headers.set('content-length', req.headers.get('content-length')!);
    }
    console.log('=== HEADERS DEBUG === Injected token (first 10):', previewToken?.substring(0, 10) + '...');

    const init: RequestInit = {
      method: req.method,
      headers,
      body: req.body,
    };
    console.log('=== FETCH DEBUG === Fetching upstream with method:', req.method, 'body type:', req.body ? 'stream' : 'none');

    const upstreamResp = await fetch(fullTargetUrl, init);
    console.log('=== FETCH RESULT === Upstream status:', upstreamResp.status, 'OK:', upstreamResp.ok, 'Content-Type:', upstreamResp.headers.get('content-type'));
    if (!upstreamResp.ok) {
      const errorText = await upstreamResp.text();
      console.error('=== FETCH ERROR === Upstream body (first 200):', errorText.substring(0, 200));
      return new NextResponse(errorHtml, { status: 500 });
    }

    const contentType = upstreamResp.headers.get('content-type') || '';
    const isBufferable = contentType.includes('text/html') || contentType.includes('text/css');  // Add CSS

    // Peek body via clone (debug only)
    let bodyPreview = '';
    const clonedResp = upstreamResp.clone();
    if (contentType.startsWith('text/') || contentType.includes('javascript')) {
      bodyPreview = await clonedResp.text();
      console.log('=== BODY PREVIEW === Full body length:', bodyPreview.length, 'First 500 chars:', bodyPreview.substring(0, 500));
      
      if (bodyPreview.includes('Preview Warning') || bodyPreview.includes('daytona')) {
        console.warn('=== BODY WARNING === Detected Daytona warning page');
      } else if (bodyPreview.includes('__next') || bodyPreview.includes('<div id="__next"')) {
        console.log('=== BODY SUCCESS === Detected Next.js app content');
      } else if (bodyPreview.trim() === '') {
        console.warn('=== BODY EMPTY === Blank response—check sandbox server');
      } else {
        console.log('=== BODY UNKNOWN === No markers');
      }
    } else {
      // Binary peek
      const reader = clonedResp.body?.getReader();
      if (reader) {
        const { value } = await reader.read();
        bodyPreview = new TextDecoder().decode(value?.slice(0, 100) || new Uint8Array());
        console.log('=== BODY PREVIEW === Binary first 100 bytes (decoded):', bodyPreview);
      }
      console.log('=== BODY DEBUG === Skipping full read for non-text (type:', contentType, ')');
    }

    // Clean headers
    const cleanHeaders = new Headers(upstreamResp.headers);
    ['x-frame-options', 'X-Frame-Options', 'content-security-policy', 'Content-Security-Policy', 'referrer-policy'].forEach(h => cleanHeaders.delete(h));
    cleanHeaders.set('access-control-allow-origin', '*');
    cleanHeaders.set('cache-control', 'no-cache');
    console.log('=== HEADERS CLEAN === Cleaned headers keys:', Array.from(cleanHeaders.keys()));

    // BUFFER & REWRITE if HTML/CSS
    if (isBufferable && bodyPreview) {
      const proxyPrefix = `/api/proxy/preview/${sandboxId}/${port}`;
      
      let rewrittenBody = bodyPreview;
      
      if (contentType.includes('text/html')) {
  rewrittenBody = rewrittenBody
    // Existing fixes...
    .replace(/src\s*=\s*["']\/_next\//g, `src="${proxyPrefix}/_next/`)
    .replace(/href\s*=\s*["']\/_next\//g, `href="${proxyPrefix}/_next/`)

    // Add this: <link rel="preload" href="/_next/static/media/...">
    .replace(/href\s*=\s*["']\/_next\/static\/media\//g, `href="${proxyPrefix}/_next/static/media/`)

    // Critical: Font face src in <style> tags
    .replace(/src:\s*url\([^)]*\/_next\/static\/media\//g, `src: url(${proxyPrefix}/_next/static/media/`);
} else if (contentType.includes('text/css')) {
  console.log('=== REWRITE CSS === Starting CSS asset path rewrite');

  rewrittenBody = rewrittenBody
    // Case 1: url(/ _next/static/...)
    .replace(/url\s*\(\s*["']?\/_next\//g, `url(${proxyPrefix}/_next/`)

    // Case 2: url(/_next/static/...) ← THIS IS WHAT NEXT.JS USES
    .replace(/url\s*\(\s*["']?\/_next\/static\//g, `url(${proxyPrefix}/_next/static/`)

    // Case 3: url(/static/...) – public folder
    .replace(/url\s*\(\s*["']?\/static\//g, `url(${proxyPrefix}/static/`)

    // Case 4: url(/fonts/...), url(/images/...), url(/media/...)
    .replace(/url\s*\(\s*["']?\/(fonts|images|media|img)\/[^)]+/g, (match) => {
      const path = match.match(/url\s*\(\s*["']?(\/[^"')]+)["']?\s*\)/)?.[1];
      return path ? `url(${proxyPrefix}${path})` : match;
    })

    // Case 5: Fallback – any url(/...) that starts with /_next or /static
    .replace(/url\s*\(\s*["']?(\/_next\/[^"')]+)["']?\s*\)/g, `url(${proxyPrefix}$1)`)
    .replace(/url\s*\(\s*["']?(\/static\/[^"')]+)["']?\s*\)/g, `url(${proxyPrefix}$1)`);

  console.log('=== REWRITE CSS DONE === Fixed Next.js static/media font URLs');
}
      
      // FIXED: Strip content-encoding for buffered (uncompressed) responses
      cleanHeaders.delete('content-encoding');
      cleanHeaders.set('content-length', rewrittenBody.length.toString());  // Accurate length post-rewrite
      
      return new NextResponse(rewrittenBody, {
        status: upstreamResp.status,
        headers: cleanHeaders,
      });
    }

    // Non-bufferable: Stream original (keep encoding for binary/JS)
    console.log('=== RESPONSE DEBUG === Streaming original body (non-buffered, with encoding)');
    return new NextResponse(upstreamResp.body, {
      status: upstreamResp.status,
      headers: cleanHeaders,
    });

  } catch (error) {
    console.error('=== PROXY ERROR === Full error:', error);
    return new NextResponse(errorHtml, { status: 500 });
  }
}