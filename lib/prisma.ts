import { PrismaClient } from '@prisma/client';
import { getTenant } from './tenant';

const prismaClientSingleton = () => {
    return new PrismaClient();
};

declare global {
    // eslint-disable-next-line no-var
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

export const getTenantPrisma = async () => {
    const agencyId = await getTenant();

    // If there is no agencyId in the session (e.g., unauthenticated call or cron job), 
    // we return the raw client. However, cron jobs/scripts should explicitly pass context if needed.
    if (!agencyId) return prisma;

    return prisma.$extends({
        query: {
            $allModels: {
                async $allOperations({ model, operation, args, query }) {
                    // Only inject agencyId into models that actually possess the column
                    const modelsWithAgencyId = [
                        'Employee',
                        'Shift',
                        'AssetCategory',
                        'Asset',
                        'User',
                        'Training',
                        'Certificate',
                        'Policy',
                        'FormTemplate',
                        'OrganizationSettings',
                        'AuditLog'
                    ];

                    if (!modelsWithAgencyId.includes(model)) {
                        return query(args);
                    }

                    const params = args as any;

                    // For read and delete operations: append where: { agencyId }
                    if (['findMany', 'findFirst', 'findUnique', 'count', 'updateMany', 'deleteMany', 'delete', 'update'].includes(operation)) {
                        params.where = { ...params.where, agencyId };
                    }

                    // For create operations: inject agencyId payload
                    if (['create', 'upsert'].includes(operation)) {
                        params.data = { ...params.data, agencyId };
                    }
                    if (['createMany'].includes(operation)) {
                        if (Array.isArray(params.data)) {
                            params.data = params.data.map((d: any) => ({ ...d, agencyId }));
                        } else {
                            params.data = { ...params.data, agencyId };
                        }
                    }

                    return query(params);
                }
            }
        }
    }) as PrismaClient; // Cast to bypass complex type inference issues on the extended client
};
