-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FormResponse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traineeId" INTEGER NOT NULL,
    "ftoId" INTEGER NOT NULL,
    "trainerId" INTEGER,
    "templateId" INTEGER NOT NULL,
    "responseData" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "traineeSignatureAt" DATETIME,
    CONSTRAINT "FormResponse_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "Employee" ("empId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormResponse_ftoId_fkey" FOREIGN KEY ("ftoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormResponse_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FormResponse_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FormResponse" ("date", "ftoId", "id", "responseData", "status", "templateId", "traineeId", "traineeSignatureAt") SELECT "date", "ftoId", "id", "responseData", "status", "templateId", "traineeId", "traineeSignatureAt" FROM "FormResponse";
DROP TABLE "FormResponse";
ALTER TABLE "new_FormResponse" RENAME TO "FormResponse";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
