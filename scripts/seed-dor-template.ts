
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding DOR Template: Metro 911 Telecommunicator Standard");

    const template = await prisma.formTemplate.create({
        data: {
            title: 'Metro 911 Telecommunicator Standard',
            isPublished: true,
            version: 5,
            sections: {
                create: [
                    {
                        title: 'APPEARANCE',
                        order: 1,
                        fields: {
                            create: [
                                { label: '1. Properly dressed (Uniform or Business Casual)', type: 'RATING', order: 1 }
                            ]
                        }
                    },
                    {
                        title: 'ATTITUDE',
                        order: 2,
                        fields: {
                            create: [
                                { label: '2. Acceptance of Feedback', type: 'RATING', order: 1 },
                                { label: '3. Attitude Towards Communications Work', type: 'RATING', order: 2 }
                            ]
                        }
                    },
                    {
                        title: 'KNOWLEDGE',
                        order: 3,
                        fields: {
                            create: [
                                { label: '4. Knowledge of Departmental Policies and Procedures', type: 'RATING', order: 1 }
                            ]
                        }
                    },
                    {
                        title: 'PERFORMANCE',
                        order: 4,
                        fields: {
                            create: [
                                { label: '5. Position Performance: General', type: 'RATING', order: 1 },
                                { label: '6. Position Performance: Non-Stress Conditions', type: 'RATING', order: 2 },
                                { label: '7. Position Performance: Moderate Conditions', type: 'RATING', order: 3 },
                                { label: '8. Position Performance: Stress Conditions', type: 'RATING', order: 4 },
                                { label: '9. CAD Skills: Normal Conditions', type: 'RATING', order: 5 },
                                { label: '10. CAD Skills: Moderate & High-Stress Conditions', type: 'RATING', order: 6 },
                                { label: '11. CAD Skills: Update & Relay', type: 'RATING', order: 7 },
                                { label: '12. EMD Skills: General Understanding', type: 'RATING', order: 8 },
                                { label: '13. EMD Skills: Vital Point Questions / Pre-Arrival', type: 'RATING', order: 9 },
                                { label: '14. Telephone Skill – Control and Handle Conversation', type: 'RATING', order: 10 },
                                { label: '15. Control of Conflict: Hysterical Caller', type: 'RATING', order: 11 },
                                { label: '16. Control of Conflict: Caller Safety Awareness', type: 'RATING', order: 12 },
                                { label: '17. Problem Solving / Decision-Making', type: 'RATING', order: 13 },
                                { label: '18. Radio: Appropriate Use of Procedures', type: 'RATING', order: 14 },
                                { label: '19. Radio: Listens & Comprehends', type: 'RATING', order: 15 },
                                { label: '20. Radio: Articulation of Transmission', type: 'RATING', order: 16 },
                                { label: '21. General Ability to Multitask', type: 'RATING', order: 17 }
                            ]
                        }
                    },
                    {
                        title: 'NARRATIVE',
                        order: 5,
                        fields: {
                            create: [
                                { label: 'The Most Satisfactory area of performance today:', type: 'TEXT', order: 1 },
                                { label: 'The Least Satisfactory area of performance today:', type: 'TEXT', order: 2 },
                                { label: 'Explain a specific Incident which demonstrates todays performance:', type: 'TEXT', order: 3 }
                            ]
                        }
                    },
                    {
                        title: 'RELATIONSHIP',
                        order: 6,
                        fields: {
                            create: [
                                { label: '22. With External Customers', type: 'RATING', order: 1 },
                                { label: '23. With Internal Customers', type: 'RATING', order: 2 }
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log(`Created Template ID: ${template.id}`);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
