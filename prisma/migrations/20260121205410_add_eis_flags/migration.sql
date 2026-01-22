-- CreateTable
CREATE TABLE "EISFlag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "resolutionNotes" TEXT,
    CONSTRAINT "EISFlag_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("empId") ON DELETE RESTRICT ON UPDATE CASCADE
);
