-- AlterTable
ALTER TABLE "User" ADD COLUMN "customPermissions" TEXT;

-- CreateTable
CREATE TABLE "RoleTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roleName" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleTemplate_roleName_key" ON "RoleTemplate"("roleName");
