
import { getLatestPublishedTemplate, getTrainees } from '@/app/actions/dor-submission';
import DORForm from './DORForm';

export default async function NewDORPage() {
    const template = await getLatestPublishedTemplate();
    const trainees = await getTrainees();

    if (!template) {
        return (
            <div className="p-8 text-center text-slate-500">
                <h1 className="text-2xl font-bold mb-2">No Active Template</h1>
                <p>Please ask an administrator to publish a DOR form first.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen py-8 px-4">
            <DORForm template={template} trainees={trainees} />
        </div>
    );
}
