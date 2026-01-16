-- CreateTable
CREATE TABLE "Employee" (
    "empId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "empName" TEXT,
    "departed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Training" (
    "TrainingID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "TrainingName" TEXT
);

-- CreateTable
CREATE TABLE "Attendance" (
    "attendanceID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "attendanceDate" DATETIME,
    "attendanceHealth" BOOLEAN,
    "attendanceHours" REAL,
    "attendanceNote" TEXT,
    "employeeID" INTEGER NOT NULL,
    "trainingID" INTEGER NOT NULL,
    CONSTRAINT "Attendance_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "Employee" ("empId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_trainingID_fkey" FOREIGN KEY ("trainingID") REFERENCES "Training" ("TrainingID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certificate" (
    "CertificateID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "certificateName" TEXT,
    "neededHours" REAL,
    "yearsValid" REAL
);

-- CreateTable
CREATE TABLE "CertificateTrainingExclusion" (
    "exclusionID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "certificateID" INTEGER NOT NULL,
    "trainingID" INTEGER NOT NULL,
    CONSTRAINT "CertificateTrainingExclusion_certificateID_fkey" FOREIGN KEY ("certificateID") REFERENCES "Certificate" ("CertificateID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CertificateTrainingExclusion_trainingID_fkey" FOREIGN KEY ("trainingID") REFERENCES "Training" ("TrainingID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expiration" (
    "expirationID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "CertificateID" INTEGER NOT NULL,
    "EmployeeID" INTEGER NOT NULL,
    "Expiration" DATETIME,
    CONSTRAINT "Expiration_CertificateID_fkey" FOREIGN KEY ("CertificateID") REFERENCES "Certificate" ("CertificateID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expiration_EmployeeID_fkey" FOREIGN KEY ("EmployeeID") REFERENCES "Employee" ("empId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CertificateTrainingExclusion_certificateID_trainingID_key" ON "CertificateTrainingExclusion"("certificateID", "trainingID");
