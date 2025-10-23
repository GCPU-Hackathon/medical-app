import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Create } from '@/pages/studies/Create';
import { index, show } from '@/routes/studies';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ModalLink } from '@inertiaui/modal-react';
import { Calendar, Eye, FileText, User } from 'lucide-react';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
}

interface Study {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    study_date: string;
    created_at: string;
    patient: Patient;
    study_steps_count?: number;
    assets_count?: number;
}

interface Props {
    studies: {
        data: Study[];
        links: any;
        meta: any;
    };
    stats: {
        total: number;
        completed: number;
        in_progress: number;
        pending: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Studies', href: index().url }];

export default function StudiesIndex({ studies, stats }: Props) {
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'in_progress':
                return 'secondary';
            case 'pending':
                return 'outline';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Studies" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Studies</h1>
                        <p className="text-sm text-muted-foreground">
                            Medical studies and research data
                        </p>
                    </div>

                    <Button>
                        <ModalLink href="#create-study">
                            Start a study
                        </ModalLink>
                    </Button>
                </div>

                <Create />

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Studies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-green-600">
                                {stats.completed}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>In Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-blue-600">
                                {stats.in_progress}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-yellow-600">
                                {stats.pending}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Studies Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Studies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Study Date</TableHead>
                                    <TableHead>Steps</TableHead>
                                    <TableHead>Assets</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studies.data.map((study) => (
                                    <TableRow key={study.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-semibold">
                                                    {study.code}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {study.patient.first_name}{' '}
                                                    {study.patient.last_name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    getStatusBadgeVariant(
                                                        study.status,
                                                    ) as any
                                                }
                                            >
                                                {study.status
                                                    .replace('_', ' ')
                                                    .toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {formatDate(
                                                        study.study_date,
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {study.study_steps_count || 0}{' '}
                                                steps
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {study.assets_count || 0}{' '}
                                                    files
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(study.created_at)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Link href={show(study.id).url}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {studies.data.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground">
                                No studies found.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
