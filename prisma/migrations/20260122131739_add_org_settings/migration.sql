-- CreateTable
CREATE TABLE "OrganizationSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orgName" TEXT NOT NULL DEFAULT 'Orbit 911 Center',
    "logoPath" TEXT,
    "updatedAt" DATETIME NOT NULL
);
