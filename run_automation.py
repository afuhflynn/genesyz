import asyncio
import os
import random
from playwright.async_api import async_playwright

async def run_automation():
    output_dir = "/home/afuhflynn/.gemini/antigravity-cli/brain/d3f8b9d1-874b-48e0-83e1-f5437c594484"
    os.makedirs(output_dir, exist_ok=True)
    
    async with async_playwright() as p:
        print("Launching browser...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()
        
        # 1. Navigate to landing page
        print("Navigating to http://localhost:3000...")
        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(3000)
        
        # 2. Capture landing page screenshot
        landing_screenshot_path = os.path.join(output_dir, "landing_page.png")
        await page.screenshot(path=landing_screenshot_path)
        print(f"Landing page screenshot saved to {landing_screenshot_path}")
        
        # 3. Go to Sign Up page
        print("Navigating to sign-up page...")
        await page.goto("http://localhost:3000/sign-up")
        await page.wait_for_timeout(2000)
        
        # 4. Fill signup form
        random_num = random.randint(10000, 99999)
        email = f"testfounder_{random_num}@genesyz.ai"
        password = "Password123!"
        print(f"Signing up with email: {email}")
        
        await page.fill("#name", "Test Founder")
        await page.fill("#email", email)
        await page.fill("#password", password)
        
        # Click create account
        await page.click('button[type="submit"]')
        
        # Wait for redirect to dashboard
        print("Waiting for redirect to dashboard...")
        await page.wait_for_url("**/dashboard", timeout=30000)
        await page.wait_for_timeout(3000)
        
        # Check if onboarding modal is visible and dismiss/skip it
        skip_button = page.locator('button:has-text("Skip to Quick Entry")')
        if await skip_button.count() > 0:
            print("Onboarding modal found. Clicking 'Skip to Quick Entry'...")
            await skip_button.click()
            await page.wait_for_url("**/ideas/new", timeout=15000)
            await page.wait_for_timeout(2000)
        else:
            print("Onboarding modal not visible. Navigating to /ideas/new manually...")
            await page.goto("http://localhost:3000/ideas/new")
            await page.wait_for_timeout(2000)
            
        # 5. Submit a new startup idea
        idea_text = 'An AI-powered recipe planner that minimizes food waste by scanning fridge receipts'
        print(f"Submitting new idea: '{idea_text}'")
        await page.fill('textarea[placeholder*="Describe your startup idea"]', idea_text)
        
        # Select Global location
        print("Selecting target location: Global...")
        await page.click("#location-selector")
        await page.wait_for_timeout(1000)
        await page.click('button:has-text("Global")')
        await page.wait_for_timeout(1000)
        
        # Submit
        print("Clicking 'Generate Research'...")
        await page.click('button:has-text("Generate Research")')
        
        # Wait for the research pipeline success screen
        print("Waiting for pipeline progress to load...")
        await page.wait_for_selector('h2:has-text("Analyzing Your Idea")', timeout=15000)
        
        # Wait for the pipeline to finish (View Results button appears)
        print("Waiting for pipeline to finish. This might take up to 2-3 minutes...")
        view_results_btn = page.locator('a:has-text("View Results")')
        await view_results_btn.wait_for(state="visible", timeout=180000)
        print("Pipeline finished! Clicking 'View Results'...")
        await view_results_btn.click()
        
        # Navigated to idea details page `/ideas/[id]`
        print("Navigated to idea details page. Waiting for page load...")
        await page.wait_for_timeout(3000)
        
        # 6. Convert the validated idea to a startup profile
        create_startup_btn = page.locator('a:has-text("Create Startup Profile")')
        await create_startup_btn.wait_for(state="visible", timeout=15000)
        print("Clicking 'Create Startup Profile'...")
        await create_startup_btn.click()
        
        # Wait for the startup form page
        await page.wait_for_url("**/startups/new**", timeout=15000)
        await page.wait_for_timeout(2000)
        
        # Select location Global
        print("Selecting startup location: Global...")
        await page.click("#startup-location-selector")
        await page.wait_for_timeout(1000)
        await page.click('button:has-text("Global")')
        await page.wait_for_timeout(1000)
        
        # Submit the startup creation form
        print("Submitting Startup Profile Form...")
        await page.click('button[type="submit"]')
        
        # Wait for redirect to startup profile
        print("Waiting for redirect to startup profile...")
        await page.wait_for_url("**/startups/*", timeout=30000)
        await page.wait_for_timeout(3000)
        
        # 7. Navigate to the startup dashboard, capture a screenshot.
        startup_desktop_path = os.path.join(output_dir, "startup_dashboard_desktop.png")
        await page.screenshot(path=startup_desktop_path)
        print(f"Startup dashboard desktop screenshot saved to {startup_desktop_path}")
        
        # 8. Resize the viewport to mobile and check if layout is broken.
        print("Resizing viewport to mobile size (375x812)...")
        await page.set_viewport_size({"width": 375, "height": 812})
        await page.wait_for_timeout(2000)
        
        startup_mobile_path = os.path.join(output_dir, "startup_dashboard_mobile.png")
        await page.screenshot(path=startup_mobile_path)
        print(f"Startup dashboard mobile screenshot saved to {startup_mobile_path}")
        
        # Restore viewport back to desktop
        print("Restoring viewport back to desktop...")
        await page.set_viewport_size({"width": 1280, "height": 800})
        await page.wait_for_timeout(1000)
        
        # 9. Go to the VC Coach chat, capture a screenshot.
        current_url = page.url
        print(f"Current URL: {current_url}")
        parts = current_url.split("/")
        slug = parts[-1].split("?")[0]
        chat_url = f"http://localhost:3000/startups/{slug}/chat"
        print(f"Navigating to VC Coach chat URL: {chat_url}")
        await page.goto(chat_url)
        await page.wait_for_timeout(5000)
        
        vc_coach_path = os.path.join(output_dir, "vc_coach_chat.png")
        await page.screenshot(path=vc_coach_path)
        print(f"VC Coach chat screenshot saved to {vc_coach_path}")
        
        await context.close()
        await browser.close()
        print("SUCCESS")

if __name__ == "__main__":
    asyncio.run(run_automation())
