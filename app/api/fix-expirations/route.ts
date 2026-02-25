
import { NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Helper to read JSON
function readJson(filename: string) {
    const filePath = path.join(process.cwd(), 'data/utils', filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
}

// Helper to parse ASP.NET AJAX dates "/Date(1234567890)/"
function parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const match = dateStr.match(/\/Date\((\d+)\)\//);
    return match ? new Date(parseInt(match[1])) : null;
}

export async function GET() {
    try {
        const results = [];

        // 1. Load Legacy Data
        const certificatesData = readJson('Certificate.json');
        const expirationsData = readJson('Expiration.json');

        // 2. Build Certificate Map (LegacyID -> RealID)
        // We assume Certificates might have new IDs, so we map by Name.
        const dbCertificates = await (await getTenantPrisma()).certificate.findMany();
        const certMap = new Map<number, number>(); // LegacyID -> RealID

        for (const legCert of certificatesData) {
            const dbCert = dbCertificates.find(c => c.certificateName === legCert.certificateName);
            if (dbCert) {
                // Determine Legacy ID (it's in JSON)
                const legacyId = legCert.CertificateID;
                certMap.set(legacyId, dbCert.CertificateID);
            } else {
                results.push(`WARNING: Certificate '${legCert.certificateName}' not found in DB.`);
            }
        }

        // 3. Process Expirations
        let successCount = 0;
        let failCount = 0;

        for (const exp of expirationsData) {
            const realCertId = certMap.get(exp.CertificateID);

            if (!realCertId) {
                failCount++;
                continue; // Skip if certificate not found
            }

            // We trust EmployeeID is consistent because previous seed used upsert with ID
            // If EmployeeID is missing in DB, this will fail foreign key constraint

            try {
                // Check if already exists (approximate check since no unique ID)
                // Actually we can just create many, but let's try to be idempotent if possible
                // Expiration table has no unique constraint on [Cert, Emp], so duplicates possible. 
                // Let's check first.
                const exists = await (await getTenantPrisma()).expiration.findFirst({
                    where: {
                        CertificateID: realCertId,
                        EmployeeID: exp.EmployeeID
                    }
                });

                if (!exists) {
                    await (await getTenantPrisma()).expiration.create({
                        data: {
                            CertificateID: realCertId,
                            EmployeeID: exp.EmployeeID,
                            Expiration: parseDate(exp.Expiration),
                            documentPath: null // No document path in JSON
                        }
                    });
                    successCount++;
                }
            } catch (e) {
                console.error(`Failed to insert Expiration for Emp ${exp.EmployeeID}, Cert ${realCertId}:`, e);
                failCount++;
            }
        }

        results.push(`Processed ${expirationsData.length} expirations.`);
        results.push(`Successfully added: ${successCount}`);
        results.push(`Skipped/Failed: ${failCount}`);

        return NextResponse.json({
            success: true,
            message: "Expiration fix completed.",
            details: results
        });

    } catch (error) {
        console.error('Fix failed:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
