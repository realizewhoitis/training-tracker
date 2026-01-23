---
description: How to capture standardized screenshots for documentation
---

# Screenshot Capture Workflow

This workflow defines the standard process for capturing high-quality screenshots for the Orbit 911 documentation.

## Prerequisites

* The application must be running locally on `http://localhost:3000`.
* The database should be seeded with sample data (`npm run seed`).

## Capture List

Screenshots should be saved to `public/help-images/` with the following filenames:

1. **Main Dashboard**: `main_dashboard.png`
    * **URL**: `/`
    * **View**: Admin User
    * **Focus**: Show the "Pending Reports" and "Certifications" widgets.

2. **Inventory Dashboard**: `inventory_dashboard.png`
    * **URL**: `/inventory`
    * **Focus**: Category overview (Radios, Headsets).

3. **Asset History**: `asset_history.png`
    * **URL**: `/inventory/asset/[id]` (Pick a populated asset like a Radio)
    * **Focus**: Timeline of assignments.

4. **Analytics**: `dashboard_analytics.png`
    * **URL**: `/` (Scroll down) or `/admin/eis`
    * **Focus**: Charts and trend lines.

5. **Audit Log**: `admin_audit_log.png`
    * **URL**: `/admin/audit`
    * **Focus**: Table showing recent login/update events.

6. **Settings**: `admin_settings.png`
    * **URL**: `/admin/settings`
    * **Focus**: License key input and Branding uploads.

## Execution

You can run this automation by asking the agent:
> "Run the screenshot capture workflow."

The agent will use its browser tool to visit each page, set the viewport to a standard 1280x800, and save the files to the correct directory.

## Manual Fallback

If automation fails, manually take screenshots of the views above, crop them to just the content area (exclude browser UI), and save them to `public/help-images/`.
