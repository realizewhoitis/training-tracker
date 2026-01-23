# Orbit 911 - Deployment & Installation Guide

## Prerequisites

* **Node.js**: Version 18 or higher.
* **Database**: PostgreSQL (recommended) or SQLite (for local testing/dev).
* **Git**: For version control.

## Installation

1. **Clone the Repository**

    ```bash
    git clone <repository-url>
    cd static-cluster
    ```

2. **Run with Docker (Recommended)**
    This is the simplest way to run the application for production or testing.

    ```bash
    # Build the image
    docker build -t orbit911 .

    # Run the container (Mapping port 3000 to local port 3000)
    docker run -p 3000:3000 orbit911
    ```

    *See `.env.example` to pass credentials via `-e` flags if needed.*

3. **Manual Installation (Dev/Legacy)**

    ```bash
    npm install
    ```

## Configuration

1. **Environment Variables**
    Create a `.env` file in the root directory. You can use `.env.example` as a reference if available.

    Required variables:

    ```env
    # Database Connection
    DATABASE_URL="file:./dev.db"  # Or your PostgreSQL connection string
    
    # NextAuth.js (Authentication)
    AUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32
    AUTH_URL="http://localhost:3000" # URL of your deployment
    ```

    *Note: An initial License Key can be set in the Admin Settings UI after first login.*

## Database Setup

1. **Run Migrations**
    This creates the database tables based on the Prisma schema.

    ```bash
    npx prisma migrate deploy
    ```

2. **Seed Initial Data**
    We have several seed scripts to populate the database with required templates and initial data.

    * **Core Database (Employees, Trainings, etc.):**

        ```bash
        npx tsx scripts/seed-database.ts
        ```

    * **Asset Categories (Inventory):**

        ```bash
        npx tsx scripts/seed-assets.ts
        ```

    * **DOR Templates (Metro 911 Standard):**

        ```bash
        npx tsx scripts/seed-dor-template.ts
        ```

    * **Admin User:**
        Creates default admin (Email: `admin@orbit911.com`, Pass: `orbit123`)

        ```bash
        npx tsx scripts/seed-admin-verify.ts
        ```

## Building for Production

1. **Build the Application**

    ```bash
    npm run build
    ```

2. **Start the Server**

    ```bash
    npm start
    ```

    The application will be available at `http://localhost:3000` (or the port defined by your environment).

## Maintenance Scripts

* **Rename Legacy Terminology**: If you imported old data with "Officer" names:

    ```bash
    npx tsx scripts/rename-officers.ts
    ```

* **Verify DB Content**:

    ```bash
    npx prisma studio
    ```

## Directory Structure

* **/app**: Next.js App Router pages and API routes.
* **/components**: Reusable React components.
* **/prisma**: Database schema (`schema.prisma`) and migrations.
* **/scripts**: Utility scripts for seeding and maintenance.
* **/public**: Static assets (images, files).
