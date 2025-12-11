# Daytona Sandbox Creation Platform

A FastAPI backend with Next.js frontend for creating and managing Daytona sandboxes.

## Prerequisites

- Python 3.8+
- Node.js 20+
- Daytona API key

## Setup Steps

1. **Clone the repository and navigate to the project directory**

2. **Create and configure `.env` file**
   ```
   DAYTONA_API_KEY=your_api_key_here
   DAYTONA_API_URL=https://app.daytona.io/api
   BACKEND_PORT=8000
   FRONTEND_URL=http://localhost:3000
   ```

3. **Create Python virtual environment**
   ```bash
   python -m venv env
   ```

4. **Activate virtual environment**
   - Windows: `env\Scripts\activate`
   - Mac/Linux: `source env/bin/activate`

5. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

6. **Install additional required package**
   ```bash
   pip install python-dotenv
   ```

7. **Navigate to client directory**
   ```bash
   cd client
   ```

8. **Install Node.js dependencies**
   ```bash
   npm install
   ```

9. **Return to root directory**
   ```bash
   cd ..
   ```

10. **Start the backend server** (in one terminal)
    ```bash
    python backend.py
    ```

11. **Start the frontend** (in another terminal)
    ```bash
    cd client
    npm run dev
    ```

12. **Access the application**
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:8000
    - API Health Check: http://localhost:8000/health

## API Endpoints

- `POST /create-sandbox` - Create a new Daytona sandbox
- `GET /health` - Health check endpoint

## How It Works

1. Click "Create Sandbox" button on the frontend
2. Backend creates a Daytona sandbox with Node.js 20
3. Installs Next.js and shadcn in the sandbox
4. Deploys a CRUD application
5. Returns the preview URL and sandbox ID
