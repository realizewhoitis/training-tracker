import { getTenantPrisma } from '@/lib/prisma';
import BulkTrainingManager from './BulkTrainingManager';

export default async function BulkLogPage() {
    const employees = await (await getTenantPrisma()).employee.findMany({
        where: { departed: false },
        orderBy: { empName: 'asc' },
        select: {
            empId: true,
            empName: true,
            shift: {
                select: { name: true }
            }
        }
    });

    const trainings = await (await getTenantPrisma()).training.findMany({
        orderBy: { TrainingName: 'asc' },
        select: {
            TrainingID: true,
            TrainingName: true
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Bulk Training Entry</h1>
                    <p className="text-slate-500">Log training for multiple employees at once</p>
                </div>
            </div>

            <BulkTrainingManager employees={employees} trainings={trainings as any} />
        </div>
    );
}
