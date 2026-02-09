
import { getTemplate } from '@/app/actions/form-builder';
import FormBuilder from '../FormBuilder';
import { notFound } from 'next/navigation';

export default async function BuilderPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const template = await getTemplate(parseInt(params.id));

    if (!template) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            <FormBuilder template={template} />
        </div>
    );
}
