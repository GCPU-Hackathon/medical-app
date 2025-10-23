import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router, usePage, usePoll } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
    RefreshCw,
    Square,
    X,
} from 'lucide-react';

interface StudyStep {
    id: number;
    name: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    step_order: number;
    started_at: string | null;
    completed_at: string | null;
    notes: string | null;
}

interface Study {
    id: number;
    code: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    gcs_directory: string;
    study_date: string;
    processing_started_at: string | null;
    processing_completed_at: string | null;
    processing_errors: any;
    patient: {
        id: number;
        name: string;
        mrn: string;
    };
    study_steps: StudyStep[];
}

interface Props {
    study: Study;
}

const statusColors = {
    pending: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    cancelled: 'bg-orange-500',
};

const statusIcons = {
    pending: Clock,
    in_progress: RefreshCw,
    completed: CheckCircle,
    failed: AlertTriangle,
    cancelled: X,
};

export default function StudyShow({ study: initialStudy }: Props) {
    const { props } = usePage();
    const study = (props as any).study as Study;

    console.log(study);

    // Use Inertia's built-in polling helper
    const { start: startPolling, stop: stopPolling } = usePoll(
        2000,
        {
            only: ['study'],
            onStart() {
                console.log('Started polling study:', study.code);
            },
            onFinish() {
                console.log('Polling request finished for study:', study.code);

                // Stop polling if study is no longer in a processing state
                if (
                    study.status === 'completed' ||
                    study.status === 'failed' ||
                    study.status === 'cancelled'
                ) {
                    stopPolling();
                    console.log(
                        'Stopped polling - study status:',
                        study.status,
                    );
                }
            },
        },
        {
            autoStart:
                study.status === 'in_progress' || study.status === 'pending',
        },
    );

    const isPolling =
        study.status === 'in_progress' || study.status === 'pending';

    const handleCancelStudy = () => {
        if (confirm('Are you sure you want to cancel this study?')) {
            router.post(`/studies/${study.id}/cancel`);
        }
    };

    const getStepIcon = (step: StudyStep) => {
        const Icon = statusIcons[step.status];
        return (
            <Icon
                className={cn(
                    'h-4 w-4',
                    step.status === 'in_progress' && 'animate-spin',
                )}
            />
        );
    };

    const getStepStatusBadge = (step: StudyStep) => {
        return (
            <Badge
                variant="secondary"
                className={cn(
                    'font-medium text-white',
                    statusColors[step.status],
                )}
            >
                {step.status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const formatDateTime = (dateTime: string | null) => {
        if (!dateTime) return 'Not started';
        return new Date(dateTime).toLocaleString();
    };

    return (
        <AppLayout>
            <Head title={`Study ${study.code}`} />

            <div className="space-y-6">
                {/* Polling Status Indicator */}
                {isPolling && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                                    <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-blue-500"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        Live Monitoring Active
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Refreshing every 2 seconds to show
                                        real-time updates
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={stopPolling}
                                className="text-xs font-medium text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                                Stop monitoring
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/studies')}
                            className="p-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Study Control Center
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Real-time monitoring for {study.code}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isPolling && (
                            <div className="flex items-center space-x-2 text-blue-500">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Live monitoring</span>
                            </div>
                        )}

                        {study.status === 'in_progress' && (
                            <Button
                                variant="destructive"
                                onClick={handleCancelStudy}
                            >
                                <Square className="mr-2 h-4 w-4" />
                                Cancel Study
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Study Information */}
                    <div className="space-y-6 lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <div
                                        className={cn(
                                            'mr-3 h-3 w-3 rounded-full',
                                            statusColors[study.status],
                                        )}
                                    />
                                    Study Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Study Code
                                    </label>
                                    <p className="font-mono text-lg">
                                        {study.code}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Title
                                    </label>
                                    <p>{study.title}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Patient
                                    </label>
                                    <p>{study.patient.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        MRN: {study.patient.mrn}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Status
                                    </label>
                                    <div className="mt-1">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                'font-medium text-white',
                                                statusColors[study.status],
                                            )}
                                        >
                                            {study.status
                                                .replace('_', ' ')
                                                .toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        GCS Directory
                                    </label>
                                    <p className="font-mono text-sm break-all text-muted-foreground">
                                        {study.gcs_directory}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Started
                                    </label>
                                    <p className="text-sm">
                                        {formatDateTime(
                                            study.processing_started_at,
                                        )}
                                    </p>
                                </div>

                                {study.processing_completed_at && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Completed
                                        </label>
                                        <p className="text-sm">
                                            {formatDateTime(
                                                study.processing_completed_at,
                                            )}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Processing Steps */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="mr-3 h-3 w-3 animate-pulse rounded-full bg-blue-500" />
                                        Processing Pipeline
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            'text-white',
                                            statusColors[study.status],
                                        )}
                                    >
                                        {study.status
                                            .replace('_', ' ')
                                            .toUpperCase()}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                {!study.study_steps ||
                                study.study_steps.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                            <Clock className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                            Initializing Pipeline
                                        </h3>
                                        <p className="max-w-sm text-center text-sm text-gray-500">
                                            The processing pipeline is being
                                            prepared. This may take a few
                                            moments.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {study.study_steps
                                            .sort(
                                                (a, b) =>
                                                    a.step_order - b.step_order,
                                            )
                                            .map((step, index) => {
                                                const isLast =
                                                    index ===
                                                    study.study_steps.length -
                                                        1;

                                                return (
                                                    <div
                                                        key={step.id}
                                                        className="relative"
                                                    >
                                                        {/* Timeline connector */}
                                                        {!isLast && (
                                                            <div className="absolute top-8 left-4 h-16 w-px bg-gray-200 dark:bg-gray-700" />
                                                        )}

                                                        <div className="flex items-start gap-6">
                                                            {/* Step indicator */}
                                                            <div className="relative flex-shrink-0">
                                                                <div
                                                                    className={cn(
                                                                        'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200',
                                                                        step.status ===
                                                                            'completed' &&
                                                                            'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
                                                                        step.status ===
                                                                            'in_progress' &&
                                                                            'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
                                                                        step.status ===
                                                                            'failed' &&
                                                                            'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
                                                                        step.status ===
                                                                            'pending' &&
                                                                            'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800',
                                                                    )}
                                                                >
                                                                    {step.status ===
                                                                        'completed' && (
                                                                        <div className="h-3 w-3 rounded-full bg-green-500" />
                                                                    )}
                                                                    {step.status ===
                                                                        'in_progress' && (
                                                                        <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500" />
                                                                    )}
                                                                    {step.status ===
                                                                        'failed' && (
                                                                        <div className="h-3 w-3 rounded-full bg-red-500" />
                                                                    )}
                                                                    {step.status ===
                                                                        'pending' && (
                                                                        <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Step content */}
                                                            <div className="min-w-0 flex-1 pb-8">
                                                                <div className="mb-3 flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                            {
                                                                                step.name
                                                                            }
                                                                        </h3>
                                                                        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                                                            {
                                                                                step.description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <span
                                                                        className={cn(
                                                                            'ml-4 flex-shrink-0 rounded-full px-2 py-1 text-xs font-medium',
                                                                            step.status ===
                                                                                'completed' &&
                                                                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                                                                            step.status ===
                                                                                'in_progress' &&
                                                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                                                                            step.status ===
                                                                                'failed' &&
                                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                                                                            step.status ===
                                                                                'pending' &&
                                                                                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                                                                        )}
                                                                    >
                                                                        {step.status ===
                                                                        'in_progress'
                                                                            ? 'Running'
                                                                            : step.status ===
                                                                                'completed'
                                                                              ? 'Done'
                                                                              : step.status ===
                                                                                  'failed'
                                                                                ? 'Failed'
                                                                                : 'Pending'}
                                                                    </span>
                                                                </div>

                                                                {/* Timestamps */}
                                                                {(step.started_at ||
                                                                    step.completed_at) && (
                                                                    <div className="mb-3 flex gap-6 text-xs text-gray-500">
                                                                        {step.started_at && (
                                                                            <span>
                                                                                Started{' '}
                                                                                {formatDateTime(
                                                                                    step.started_at,
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                        {step.completed_at && (
                                                                            <span>
                                                                                Completed{' '}
                                                                                {formatDateTime(
                                                                                    step.completed_at,
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Progress indicator for running steps */}
                                                                {step.status ===
                                                                    'in_progress' && (
                                                                    <div className="mb-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                                                        <div className="flex gap-1">
                                                                            <div className="h-1 w-1 animate-pulse rounded-full bg-current"></div>
                                                                            <div
                                                                                className="h-1 w-1 animate-pulse rounded-full bg-current"
                                                                                style={{
                                                                                    animationDelay:
                                                                                        '0.2s',
                                                                                }}
                                                                            ></div>
                                                                            <div
                                                                                className="h-1 w-1 animate-pulse rounded-full bg-current"
                                                                                style={{
                                                                                    animationDelay:
                                                                                        '0.4s',
                                                                                }}
                                                                            ></div>
                                                                        </div>
                                                                        <span>
                                                                            Processing
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {/* Notes/Error information */}
                                                                {step.notes && (
                                                                    <div
                                                                        className={cn(
                                                                            'rounded-lg border-l-3 py-3 pl-4 text-sm',
                                                                            step.status ===
                                                                                'failed' &&
                                                                                'border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-950/20',
                                                                            step.status ===
                                                                                'completed' &&
                                                                                'border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-950/20',
                                                                            step.status ===
                                                                                'in_progress' &&
                                                                                'border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/20',
                                                                        )}
                                                                    >
                                                                        <div
                                                                            className={cn(
                                                                                'leading-relaxed',
                                                                                step.status ===
                                                                                    'failed' &&
                                                                                    'text-red-800 dark:text-red-200',
                                                                                step.status ===
                                                                                    'completed' &&
                                                                                    'text-green-800 dark:text-green-200',
                                                                                step.status ===
                                                                                    'in_progress' &&
                                                                                    'text-blue-800 dark:text-blue-200',
                                                                            )}
                                                                        >
                                                                            {
                                                                                step.notes
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                        {/* Pipeline status summary */}
                                        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                                            <div className="text-center">
                                                {study.status ===
                                                    'in_progress' && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Pipeline is currently
                                                        processing...
                                                    </p>
                                                )}
                                                {study.status ===
                                                    'completed' && (
                                                    <p className="text-sm text-green-600 dark:text-green-400">
                                                        All steps completed
                                                        successfully
                                                    </p>
                                                )}
                                                {study.status === 'failed' && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                        Pipeline failed - see
                                                        error details above
                                                    </p>
                                                )}
                                                {study.status ===
                                                    'cancelled' && (
                                                    <p className="text-sm text-orange-600 dark:text-orange-400">
                                                        Pipeline was cancelled
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
