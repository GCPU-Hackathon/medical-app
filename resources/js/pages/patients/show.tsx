import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index, show } from '@/routes/patients';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Cigarette,
    FileText,
    Heart,
    Mail,
    Pill,
    Ruler,
    User,
    Users,
    Weight,
    Wine,
} from 'lucide-react';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth: string;
    gender: 'male' | 'female';
    blood_type?: string;
    height?: number;
    weight?: number;
    allergies?: string;
    medical_history?: string;
    current_medications?: string;
    smoking_status: boolean;
    alcohol_consumption: boolean;
    family_medical_history?: string;
    created_at: string;
    updated_at: string;
}

interface Study {
    id: number;
    study_code: string;
    status: 'NEW' | 'PROCESSING' | 'READY' | 'FAILED';
    created_at: string;
    updated_at: string;
}

interface Props {
    patient: Patient;
    studies_count: number;
    latest_studies: Study[];
}

export default function PatientShow({
    patient,
    studies_count,
    latest_studies,
}: Props) {
    const calculateAge = (dateOfBirth: string) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }
        return age;
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'NEW':
                return 'secondary';
            case 'PROCESSING':
                return 'default';
            case 'READY':
                return 'default';
            case 'FAILED':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Patients', href: index().url },
        {
            title: `${patient.first_name} ${patient.last_name}`,
            href: show(patient.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${patient.first_name} ${patient.last_name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={index().url}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Patients
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {patient.first_name} {patient.last_name}
                            </h1>
                            <p className="text-muted-foreground">
                                Patient Details
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant={
                            patient.gender === 'male' ? 'default' : 'secondary'
                        }
                    >
                        {patient.gender}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="mr-2 h-5 w-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{patient.email}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {calculateAge(patient.date_of_birth)} years
                                    old
                                </span>
                            </div>

                            {patient.blood_type && (
                                <div className="flex items-center space-x-2">
                                    <Heart className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        Blood Type: {patient.blood_type}
                                    </span>
                                </div>
                            )}

                            {patient.height && (
                                <div className="flex items-center space-x-2">
                                    <Ruler className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        Height: {patient.height} cm
                                    </span>
                                </div>
                            )}

                            {patient.weight && (
                                <div className="flex items-center space-x-2">
                                    <Weight className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        Weight: {patient.weight} kg
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Lifestyle Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="mr-2 h-5 w-5" />
                                Lifestyle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Cigarette className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    Smoking:{' '}
                                    {patient.smoking_status ? 'Yes' : 'No'}
                                </span>
                                {patient.smoking_status && (
                                    <Badge
                                        variant="destructive"
                                        className="text-xs"
                                    >
                                        Smoker
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Wine className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    Alcohol:{' '}
                                    {patient.alcohol_consumption ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Medical Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Allergies */}
                    {patient.allergies && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-red-600">
                                    <AlertTriangle className="mr-2 h-5 w-5" />
                                    Allergies
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{patient.allergies}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Current Medications */}
                    {patient.current_medications && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Pill className="mr-2 h-5 w-5" />
                                    Current Medications
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">
                                    {patient.current_medications}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Medical History */}
                {patient.medical_history && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="mr-2 h-5 w-5" />
                                Medical History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{patient.medical_history}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Family Medical History */}
                {patient.family_medical_history && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                Family Medical History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">
                                {patient.family_medical_history}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Studies Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                Medical Studies ({studies_count})
                            </CardTitle>
                            <Button size="sm">Add Study</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {latest_studies.length > 0 ? (
                            <div className="space-y-3">
                                {latest_studies.map((study) => (
                                    <div
                                        key={study.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {study.study_code}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Created:{' '}
                                                {new Date(
                                                    study.created_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                getStatusBadgeVariant(
                                                    study.status,
                                                ) as any
                                            }
                                        >
                                            {study.status}
                                        </Badge>
                                    </div>
                                ))}
                                {studies_count > latest_studies.length && (
                                    <div className="pt-3 text-center">
                                        <Button variant="outline" size="sm">
                                            View All Studies ({studies_count})
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">
                                    No studies yet
                                </h3>
                                <p className="mb-4 text-muted-foreground">
                                    This patient doesn't have any medical
                                    studies.
                                </p>
                                <Button size="sm">Create First Study</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
