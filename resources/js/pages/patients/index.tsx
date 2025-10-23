import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index, show } from '@/routes/patients';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Eye, Heart, Mail } from 'lucide-react';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth: string;
    gender: 'male' | 'female';
    blood_type?: string;
    allergies?: string;
}

interface Props {
    patients: { data: Patient[] };
    stats: {
        total: number;
        male: number;
        female: number;
        with_allergies: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Patients', href: index().url },
];

export default function PatientsIndexSimple({ patients, stats }: Props) {
    const ageFromDob = (dob?: string) => {
        if (!dob) return '-';
        const d = new Date(dob);
        const diff = new Date().getTime() - d.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patients" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Patients</h1>
                        <p className="text-sm text-muted-foreground">
                            Overview of all patients
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/patients/create">Add Patient</Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Male</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.male}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Female</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.female}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Allergies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.with_allergies}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {patients.data.map((p) => (
                        <Card
                            key={p.id}
                            className="transition-shadow hover:shadow"
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        {p.first_name} {p.last_name}
                                    </CardTitle>
                                    <Badge>{p.gender}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{p.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        Age: {ageFromDob(p.date_of_birth)}
                                    </span>
                                </div>
                                {p.blood_type && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Heart className="h-4 w-4" />
                                        <span>{p.blood_type}</span>
                                    </div>
                                )}

                                <div className="pt-3">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Link href={show(p.id).url}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
