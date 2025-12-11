# Sandbox Preview Client

This is a standalone Next.js application that replicates the sandbox preview functionality from the main Aigis platform.

## Features

- **Live Sandbox Preview**: Display running Daytona sandboxes in an iframe
- **Dynamic Port Configuration**: Preview any port from your sandbox
- **Proxy Integration**: Seamlessly proxy requests through Daytona API

## Setup

1. **Install Dependencies**
   ```bash
   cd sandbox-checking/client
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env.local` file in the root of this project:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Daytona credentials:
   ```
   DAYTONA_API_KEY=your-actual-api-key
   DAYTONA_API_URL=https://api.daytona.io
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter your **Sandbox ID** in the right panel
2. Specify the **Port** (default: 3000)
3. Click **Load Preview** to view the sandbox

The preview will appear in the left panel with full interactivity.

## Architecture

### Components

- **`components/PreviewPanel.tsx`**: React component that renders the sandbox preview iframe
- **`app/page.tsx`**: Main page with split-panel layout (preview left, controls right)
- **`app/api/proxy/preview/[...path]/route.ts`**: API route that proxies requests to Daytona sandboxes

### How It Works

1. User enters sandbox ID and port
2. `PreviewPanel` component constructs proxy URL: `/api/proxy/preview/{sandboxId}/{port}`
3. Next.js API route intercepts the request
4. Route calls Daytona API to get preview URL and token
5. Route fetches content from sandbox and rewrites asset paths
6. Content is served to the iframe with proper CORS headers

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DAYTONA_API_KEY` | Your Daytona API authentication key | Yes |
| `DAYTONA_API_URL` | Daytona API base URL | Yes |

## Troubleshooting

- **Preview not loading**: Check browser console and terminal logs for detailed debugging info
- **CORS errors**: Ensure the proxy route is properly configured with CORS headers
- **404 errors**: Verify the sandbox ID is correct and the sandbox is running
- **Token errors**: Check that your `DAYTONA_API_KEY` is valid

## Development

This application uses:
- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Daytona API Client** (`@daytonaio/api-client`)

