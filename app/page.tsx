/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma';
import { Users, AlertTriangle, CheckCircle, Clock, FileSignature } from 'lucide-react';
import { auth } from '@/auth';
import Link from 'next/link';

export default async function Home() {
  const totalEmployees = await prisma.employee.count({
    where: { departed: false }
  });

  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  const upcomingExpirations = await prisma.expiration.findMany({
    where: {
      Expiration: {
        gte: now,
        lte: thirtyDaysFromNow
      }
    },
    include: {
      employee: true,
      certificate: true
    },
    take: 5,
    orderBy: {
      Expiration: 'asc'
    }
  });

  const recentTraining = await prisma.attendance.findMany({
    take: 5,
    orderBy: {
      attendanceDate: 'desc'
    },
    include: {
      employee: true,
      training: true
    }
  });

  // Check for pending DORs for the current user
  const session = await auth();
  let pendingDORs: any[] = [];

  if (session?.user?.email) {
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (currentUser?.empId) {
      pendingDORs = await prisma.formResponse.findMany({
        where: {
          traineeId: currentUser.empId,
          status: 'SUBMITTED'
        },
        include: {
          template: true,
          fto: true
        },
        orderBy: { date: 'desc' }
      });
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>

      {pendingDORs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-blue-900 flex items-center mb-4">
            <FileSignature className="w-5 h-5 mr-2" />
            Action Required: Pending DOR Signatures
          </h2>
          <div className="space-y-3">
            {pendingDORs.map(dor => (
              <div key={dor.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                <div>
                  <p className="font-semibold text-slate-800">{dor.template.title}</p>
                  <p className="text-sm text-slate-500">
                    Date: {dor.date.toLocaleDateString()} • FTO: {dor.fto.name}
                  </p>
                </div>
                <Link
                  href={`/dor/${dor.id}`}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Review & Sign
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Employees</p>
            <p className="text-2xl font-bold text-slate-800">{totalEmployees}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 rounded-full text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Expiring Soon</p>
            <p className="text-2xl font-bold text-slate-800">{upcomingExpirations.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">System Status</p>
            <p className="text-2xl font-bold text-slate-800">Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-slate-400" />
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTraining.map((log: any) => (
                <div key={log.attendanceID} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="font-medium text-slate-800">{log.training?.TrainingName}</p>
                    <p className="text-sm text-slate-500">{log.employee.empName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{log.attendanceHours} hrs</p>
                    <p className="text-xs text-slate-400">
                      {log.attendanceDate ? log.attendanceDate.toLocaleDateString() : 'No Date'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
              Upcoming Expirations
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingExpirations.map((exp: any) => (
                <div key={exp.expirationID} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="font-medium text-slate-800">{exp.certificate.certificateName}</p>
                    <p className="text-sm text-slate-500">{exp.employee.empName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-amber-600">
                      {exp.Expiration ? Math.ceil((new Date(exp.Expiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days
                    </p>
                    <p className="text-xs text-slate-400">
                      {exp.Expiration ? exp.Expiration.toLocaleDateString() : 'No Date'}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingExpirations.length === 0 && (
                <p className="text-slate-500 text-center py-4">No upcoming expirations.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
