import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index } from '@/routes/patients';
import { type BreadcrumbItem } from '@/types';
import { Deferred, Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Brain,
    Calculator,
    CheckCircle,
    Cloud,
    Eye,
    FileText,
    Loader2,
    Microscope,
    User,
    Users,
    XCircle,
} from 'lucide-react';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
}

interface GcsStatus {
    status: 'online' | 'offline';
    message: string;
    directories?: number;
    mri_scans?: number;
    bucket_name?: string;
    bucket_url?: string;
    project_id?: string;
    error?: string;
    checked_at: string;
}

interface ServiceStatus {
    name: string;
    description: string;
    status: 'online' | 'offline' | 'degraded';
    message?: string;
    response_time?: number;
    last_check: string;
    url?: string;
    timeout?: number;
}

interface DashboardStats {
    total_patients: number;
    total_studies: number;
    recent_patients: Patient[];
}

interface Props {
    stats: DashboardStats;
    gcs_status?: GcsStatus;
    segmentation_status?: ServiceStatus;
    volumetry_status?: ServiceStatus;
    analysis_status?: ServiceStatus;
    overall_status?: 'healthy' | 'degraded' | 'offline';
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({
    stats,
    gcs_status,
    segmentation_status,
    volumetry_status,
    analysis_status,
    overall_status,
}: Props) {
    const getGcsStatusIcon = (status?: string) => {
        switch (status) {
            case 'online':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'offline':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
        }
    };

    const getGcsStatusVariant = (status?: string) => {
        switch (status) {
            case 'online':
                return 'default';
            case 'offline':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getServiceStatusIcon = (status: string) => {
        switch (status) {
            case 'online':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'offline':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'degraded':
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getServiceStatusVariant = (status: string) => {
        switch (status) {
            case 'online':
                return 'default';
            case 'offline':
                return 'destructive';
            case 'degraded':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Medical application overview and system status
                        </p>
                    </div>
                    <Deferred
                        data="overall_status"
                        fallback={
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                                <Badge variant="outline">
                                    Checking System...
                                </Badge>
                            </div>
                        }
                    >
                        <div className="flex items-center space-x-2">
                            {overall_status === 'healthy' && (
                                <>
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <Badge variant="default">
                                        System Healthy
                                    </Badge>
                                </>
                            )}
                            {overall_status === 'degraded' && (
                                <>
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    <Badge variant="secondary">
                                        System Degraded
                                    </Badge>
                                </>
                            )}
                            {overall_status === 'offline' && (
                                <>
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    <Badge variant="destructive">
                                        System Offline
                                    </Badge>
                                </>
                            )}
                        </div>
                    </Deferred>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Google Cloud Storage Status */}
                    <Deferred
                        data="gcs_status"
                        fallback={
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Cloud Storage
                                    </CardTitle>
                                    <Cloud className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src="./img/google-cloud.png"
                                            alt="GCS Logo"
                                            className="h-8 w-8 object-contain"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                                            <Badge variant="outline">
                                                Checking...
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            Checking Google Cloud Storage
                                            connection...
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        }
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Cloud Storage
                                </CardTitle>
                                <Cloud className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src="./img/google-cloud.png"
                                        alt="GCS Logo"
                                        className="h-8 w-8 object-contain"
                                    />
                                    <div className="flex items-center space-x-2">
                                        {getGcsStatusIcon(gcs_status?.status)}
                                        <Badge
                                            variant={
                                                getGcsStatusVariant(
                                                    gcs_status?.status,
                                                ) as any
                                            }
                                        >
                                            {gcs_status?.status?.toUpperCase() ||
                                                'UNKNOWN'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        {gcs_status?.message}
                                    </p>

                                    {gcs_status?.bucket_name && (
                                        <div className="text-xs text-muted-foreground">
                                            <span className="font-medium">
                                                Bucket:
                                            </span>{' '}
                                            {gcs_status.bucket_name}
                                        </div>
                                    )}

                                    {gcs_status?.bucket_url && (
                                        <div className="font-mono text-xs text-muted-foreground">
                                            {gcs_status.bucket_url}
                                        </div>
                                    )}

                                    {gcs_status?.status === 'online' && (
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="text-xs text-muted-foreground">
                                                <span className="font-medium">
                                                    Directories:
                                                </span>{' '}
                                                {gcs_status.directories}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                <span className="font-medium">
                                                    MRI Scans:
                                                </span>{' '}
                                                {gcs_status.mri_scans}
                                            </div>
                                        </div>
                                    )}

                                    {gcs_status?.error && (
                                        <p className="text-xs text-red-600">
                                            Error: {gcs_status.error}
                                        </p>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        Last checked:{' '}
                                        {gcs_status?.checked_at
                                            ? new Date(
                                                  gcs_status.checked_at,
                                              ).toLocaleTimeString()
                                            : 'Never'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Deferred>

                    {/* Segmentation Agent */}
                    <Deferred
                        data="segmentation_status"
                        fallback={
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Segmentation Agent
                                    </CardTitle>
                                    <Microscope className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                                        <Badge variant="outline">
                                            Checking...
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            Medical image segmentation service
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Checking service status...
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        }
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Segmentation Agent
                                </CardTitle>
                                <Microscope className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    {getServiceStatusIcon(
                                        segmentation_status?.status ||
                                            'offline',
                                    )}
                                    <Badge
                                        variant={
                                            getServiceStatusVariant(
                                                segmentation_status?.status ||
                                                    'offline',
                                            ) as any
                                        }
                                    >
                                        {segmentation_status?.status?.toUpperCase() ||
                                            'UNKNOWN'}
                                    </Badge>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Medical image segmentation service
                                    </p>

                                    {segmentation_status?.message && (
                                        <p className="text-xs text-muted-foreground">
                                            {segmentation_status.message}
                                        </p>
                                    )}

                                    {segmentation_status?.response_time && (
                                        <p className="text-xs text-muted-foreground">
                                            Response time:{' '}
                                            {Math.round(
                                                segmentation_status.response_time *
                                                    1000,
                                            )}
                                            ms
                                        </p>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        Last checked:{' '}
                                        {segmentation_status?.last_check
                                            ? new Date(
                                                  segmentation_status.last_check,
                                              ).toLocaleTimeString()
                                            : 'Never'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Deferred>

                    {/* Volumetry Agent */}
                    <Deferred
                        data="volumetry_status"
                        fallback={
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Volumetry Agent
                                    </CardTitle>
                                    <Calculator className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                                        <Badge variant="outline">
                                            Checking...
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            Volume measurement analysis service
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Checking service status...
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        }
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Volumetry Agent
                                </CardTitle>
                                <Calculator className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    {getServiceStatusIcon(
                                        volumetry_status?.status || 'offline',
                                    )}
                                    <Badge
                                        variant={
                                            getServiceStatusVariant(
                                                volumetry_status?.status ||
                                                    'offline',
                                            ) as any
                                        }
                                    >
                                        {volumetry_status?.status?.toUpperCase() ||
                                            'UNKNOWN'}
                                    </Badge>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Volume measurement analysis service
                                    </p>

                                    {volumetry_status?.message && (
                                        <p className="text-xs text-muted-foreground">
                                            {volumetry_status.message}
                                        </p>
                                    )}

                                    {volumetry_status?.response_time && (
                                        <p className="text-xs text-muted-foreground">
                                            Response time:{' '}
                                            {Math.round(
                                                volumetry_status.response_time *
                                                    1000,
                                            )}
                                            ms
                                        </p>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        Last checked:{' '}
                                        {volumetry_status?.last_check
                                            ? new Date(
                                                  volumetry_status.last_check,
                                              ).toLocaleTimeString()
                                            : 'Never'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Deferred>

                    {/* Analysis Agent */}
                    <Deferred
                        data="analysis_status"
                        fallback={
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Analysis Agent
                                    </CardTitle>
                                    <Brain className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                                        <Badge variant="outline">
                                            Checking...
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            AI-powered medical analysis service
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Checking service status...
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        }
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Analysis Agent
                                </CardTitle>
                                <Brain className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    {getServiceStatusIcon(
                                        analysis_status?.status || 'offline',
                                    )}
                                    <Badge
                                        variant={
                                            getServiceStatusVariant(
                                                analysis_status?.status ||
                                                    'offline',
                                            ) as any
                                        }
                                    >
                                        {analysis_status?.status?.toUpperCase() ||
                                            'UNKNOWN'}
                                    </Badge>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        AI-powered medical analysis service
                                    </p>

                                    {analysis_status?.message && (
                                        <p className="text-xs text-muted-foreground">
                                            {analysis_status.message}
                                        </p>
                                    )}

                                    {analysis_status?.response_time && (
                                        <p className="text-xs text-muted-foreground">
                                            Response time:{' '}
                                            {Math.round(
                                                analysis_status.response_time *
                                                    1000,
                                            )}
                                            ms
                                        </p>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        Last checked:{' '}
                                        {analysis_status?.last_check
                                            ? new Date(
                                                  analysis_status.last_check,
                                              ).toLocaleTimeString()
                                            : 'Never'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Deferred>
                </div>

                {/* System Stats Section */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Total Patients */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Patients
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_patients}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Registered in the system
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Studies */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Studies
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_studies}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Medical studies created
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Patients */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Patients</CardTitle>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={index().url}>View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {stats.recent_patients.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recent_patients.map((patient) => (
                                    <div
                                        key={patient.id}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {patient.first_name}{' '}
                                                    {patient.last_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {patient.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(
                                                    patient.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/patients/${patient.id}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">
                                    No patients yet
                                </h3>
                                <p className="mb-4 text-muted-foreground">
                                    Start by adding your first patient to the
                                    system.
                                </p>
                                <Button asChild>
                                    <Link href={index().url}>
                                        Go to Patients
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>System Status: All services operational</span>
                            <span>
                                Last updated: {new Date().toLocaleString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
