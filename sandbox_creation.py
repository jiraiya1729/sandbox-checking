from daytona import Daytona, DaytonaConfig, CreateSandboxFromImageParams, SessionExecuteRequest, Resources
import time
from webapp_code import web_app_code
import os
from dotenv import load_dotenv

load_dotenv()

def initialise_daytona():
    config = DaytonaConfig(
        api_key=os.getenv("DAYTONA_API_KEY"),
        api_url=os.getenv("DAYTONA_API_URL")
    )
    daytona = Daytona(config)
    return daytona



def sandbox_generation():
    print("[1/10] Initializing Daytona...")
    webapp_sandbox = initialise_daytona()
    
    # Define resources for both sandboxes
    resources = Resources(
        cpu=2,
        memory=4,
        disk=8
    )
    node_params = CreateSandboxFromImageParams(
        image="node:20",
        resources=resources,
        auto_stop_interval=0
    )
    frontend_path = "/root/web_app"
    print("[2/10] Creating sandbox...")
    frontend_sandbox = webapp_sandbox.create(node_params)
    frontend_sandbox.public = True
    print("[3/10] Creating directory...")
    frontend_sandbox.process.exec(f"mkdir -p {frontend_path}", cwd = "/root")
    print("[4/10] Installing Next.js (this may take a few minutes)...")
    init_cmd = "yes \"\" | npx -y create-next-app@latest . --typescript --tailwind --eslint --app --no-git --import-alias '@/*'"
    frontend_sandbox.process.exec(init_cmd, cwd=frontend_path, timeout = 300)
    
    print("[5/10] Installing shadcn...")
    shadcn_cmd = "npx --yes shadcn@latest init -d"
    frontend_sandbox.process.exec(shadcn_cmd, cwd=frontend_path, timeout=300)
    
    print("[6/10] Inserting CRUD app code into page.tsx...")
    # Insert the CRUD web app code into page.tsx using cat command
    page_tsx_path = f"{frontend_path}/app/page.tsx"
    cat_cmd = f"cat > {page_tsx_path} << 'WEBAPP_EOF'\n{web_app_code}\nWEBAPP_EOF"
    frontend_sandbox.process.exec(cat_cmd, cwd=frontend_path, timeout=60)
    
    print("[7/10] Creating session for dev server...")
    # time.sleep(10)
    session_id = "node dev"
    frontend_sandbox.process.create_session(session_id)
    print("[8/10] Starting dev server...")
    frontend_sandbox.process.execute_session_command(
        session_id,
        SessionExecuteRequest(
            command=f"cd {frontend_path} && npm run dev",
            var_async=True
        )
    )
    print("[9/10] Waiting for server to start...")
    time.sleep(10)
    
    print("[10/10] Getting preview link...")
    # Store the frontend URL for use in other parts of the application
    FRONTEND_SANDBOX_URL = frontend_sandbox.get_preview_link(3000)
    
    print("✓ Sandbox creation completed successfully!")
    return {
        "frontend_url": FRONTEND_SANDBOX_URL.url,
        "sandbox_id": frontend_sandbox.id,
        # "session_id": session_id,
        # "frontend_sandbox": frontend_sandbox
    }


