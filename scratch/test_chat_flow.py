import subprocess
import time
import os
import re
from playwright.sync_api import sync_playwright

artifact_dir = "/home/afuhflynn/.gemini/antigravity-cli/brain/d3f8b9d1-874b-48e0-83e1-f5437c594484"
os.makedirs(artifact_dir, exist_ok=True)

def run_test():
    email = "test-coach-user-99@genesyz.ai"
    # Step 0: Clean up any previous test user/startup to ensure clean run
    print("0. Cleaning up old test data...")
    try:
        cleanup_output = subprocess.check_output(
            ["npx", "tsx", "scratch/cleanup_test_user.ts"],
            text=True
        ).strip()
        print(f"Cleanup result: {cleanup_output}")
    except Exception as e:
        print("Failed to run cleanup_test_user.ts:", e)

    with sync_playwright() as p:
        print("1. Launching headless Chromium browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        # Capture client-side browser logs
        page.on("console", lambda msg: print(f"[BROWSER CONSOLE] {msg.text}"))

        # Step 1: Go to sign up page
        print("2. Navigating to Sign Up Page...")
        page.goto("http://localhost:3000/sign-up")
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(artifact_dir, "01_signup_page.png"))

        # Step 2: Sign up a new user
        print("3. Creating new user...")
        page.fill("#name", "Test Strategic Coach")
        page.fill("#email", email)
        page.fill("#password", "Password123!")
        page.screenshot(path=os.path.join(artifact_dir, "signup_filled.png"))
        page.click("button[type='submit']")
        
        # Wait for redirect to verification page (increased timeout to 25s for dev compilation)
        print("4. Waiting for verification page...")
        page.wait_for_url("**/verify-email**", timeout=25000)
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(artifact_dir, "03_verify_email_page.png"))

        # Step 3: Get verification code from DB
        print("5. Fetching verification code from database...")
        try:
            output = subprocess.check_output(
                ["npx", "tsx", "scratch/get_code.ts", email],
                text=True
            ).strip()
            print(f"Raw output from get_code.ts:\n{output}")
            
            match = re.search(r"CODE:(\d{6})", output)
            if match:
                code = match.group(1)
                print(f"Retrieved code: {code}")
            else:
                print("Verification code pattern CODE:XXXXXX not found in output!")
                browser.close()
                return
        except Exception as e:
            print("Failed to run get_code.ts:", e)
            browser.close()
            return

        # Step 4: Type verification code
        print("6. Submitting verification code...")
        page.focus("input")
        page.keyboard.type(code)
        page.wait_for_timeout(1000)
        page.screenshot(path=os.path.join(artifact_dir, "verify_email_filled.png"))
        page.click("button[type='submit']")

        # Wait for redirect to sign in page
        print("7. Waiting for Sign In redirect...")
        page.wait_for_url("**/sign-in**", timeout=25000)
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(artifact_dir, "05_signin_page.png"))

        # Step 5: Log in
        print("8. Logging in...")
        page.fill("#email", email)
        page.fill("#password", "Password123!")
        page.screenshot(path=os.path.join(artifact_dir, "signin_filled.png"))
        page.click("button[type='submit']")

        # Wait for redirect to dashboard
        print("9. Waiting for dashboard...")
        page.wait_for_url("**/dashboard**", timeout=25000)
        page.wait_for_timeout(3000)
        page.screenshot(path=os.path.join(artifact_dir, "dashboard_desktop.png"))

        # Step 6: Handle onboarding modal by skipping
        print("10. Skipping onboarding modal...")
        skip_button = page.locator("button:has-text('Skip to Quick Entry')")
        if skip_button.is_visible():
            skip_button.click()
            print("Modal skipped!")
            page.wait_for_timeout(2000)
            page.screenshot(path=os.path.join(artifact_dir, "08_dashboard_no_modal.png"))
        else:
            print("Onboarding modal not visible, skipping click.")

        # Step 6.5: Pre-compile page and API routes to prevent HMR during streaming
        print("10.5. Pre-compiling page and API routes...")
        # Create test startup first so the mock conversation exists and page doesn't 404
        print("11. Pre-creating test startup...")
        try:
            startup_output = subprocess.check_output(
                ["npx", "tsx", "scratch/create_test_startup.ts", email],
                text=True
            ).strip()
            print(f"Startup creation result: {startup_output}")
        except Exception as e:
            print("Failed to run create_test_startup.ts:", e)
            browser.close()
            return

        # Navigate to mock conversation to compile page route
        print("11.1. Compiling page route...")
        page.goto("http://localhost:3000/startups/test-strategic-co/chat/mock-compilation-id")
        page.wait_for_timeout(5000)

        # Trigger dummy fetch to compile API route
        print("11.2. Compiling API route...")
        page.evaluate("""
            fetch('/api/startups/test-strategic-co/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: 'compile' }] })
            })
        """)
        page.wait_for_timeout(5000)

        # Trigger dummy fetch to compile single conversation API route
        print("11.3. Compiling single conversation API route...")
        page.evaluate("fetch('/api/startups/test-strategic-co/conversations/mock-compilation-id')")
        page.wait_for_timeout(5000)

        # Step 8: Go to the Startup VC Coach Chat
        print("12. Navigating to VC Coach Chat...")
        page.goto("http://localhost:3000/startups/test-strategic-co/chat")
        page.wait_for_timeout(15000) # Wait 15s for dev compilation to fully settle
        page.screenshot(path=os.path.join(artifact_dir, "chat_initial.png"))

        # Step 9: Click a suggested question
        print("13. Triggering chat by clicking suggested question...")
        suggested_btn = page.locator("button:has-text('Growth Strategy')")
        if suggested_btn.is_visible():
            suggested_btn.click()
            print("Suggested question clicked!")
        else:
            print("Suggested question button not found, typing in prompt instead...")
            page.fill("textarea", "What should be my top 3 growth priorities?")
            page.keyboard.press("Enter")
            
        # Wait for the chat streaming response to start
        print("14. Waiting for stream response to start...")
        started = False
        for _ in range(15):
            status = page.evaluate("window.__chatStatus")
            if status in ["submitted", "streaming", "ready"]:
                started = True
                print(f"Stream response started! Initial status: {status}")
                break
            page.wait_for_timeout(1000)
            
        page.screenshot(path=os.path.join(artifact_dir, "chat_streaming.png"))
        
        # Wait for stream to finish (up to 45 seconds)
        print("15. Waiting for stream completion...")
        for _ in range(45):
            status = page.evaluate("window.__chatStatus")
            if status == "ready":
                print("Stream completed successfully!")
                break
            page.wait_for_timeout(1000)
            
        # Get the updated conversation URL from browser
        current_url = page.url
        print(f"Current browser URL: {current_url}")
        
        # Perform a clean reload of the conversation URL to verify messages are persisted and display correctly
        print("15b. Reloading conversation page to verify persistence...")
        page.goto(current_url)
        page.wait_for_timeout(5000) # Let it load and render from DB
        page.screenshot(path=os.path.join(artifact_dir, "chat_completed.png"))
        
        # Step 10: Print final chat messages
        print("16. Final page messages:")
        messages = page.locator("p").all_text_contents()
        for i, msg in enumerate(messages):
            if len(msg.strip()) > 10:
                print(f"Block {i+1}: {msg.strip()[:100]}...")

        browser.close()

if __name__ == "__main__":
    run_test()
