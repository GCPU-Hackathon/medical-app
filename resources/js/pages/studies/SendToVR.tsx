import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Modal } from '@inertiaui/modal-react';
import { Controls, Player } from '@lottiefiles/react-lottie-player';
import { AlertTriangle, CheckCircle, Clock, Send, X } from 'lucide-react';
import { useState } from 'react';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
}

interface Study {
    id: number;
    code: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    patient: Patient;
    assets_count?: number;
    is_vr?: boolean;
}

interface SendToVRProps {
    study: Study;
}

export const SendToVR = ({ study }: SendToVRProps) => {
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSendToVR = () => {
        setIsSending(true);

        router.post(
            `/studies/${study.id}/send-to-vr`,
            {},
            {
                onSuccess: () => {
                    setIsSuccess(true);
                    setTimeout(() => {
                        router.reload();
                    }, 1500);
                },
                onError: (errors) => {
                    console.error('Error enabling VR:', errors);
                    setIsSending(false);
                },
            },
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'in_progress':
                return 'bg-blue-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'in_progress':
                return <Clock className="h-4 w-4 animate-spin" />;
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'cancelled':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <Modal name={`send-to-vr-${study.id}`} maxWidth="2xl">
            <Card className="border-0 shadow-none">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <span>Enable Study for VR Platform</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {study.status !== 'completed' && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    Study must be completed before enabling VR
                                    access
                                </span>
                            </div>
                        </div>
                    )}

                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-green-900 dark:text-green-100">
                                Successfully Enabled for VR!
                            </h3>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Study {study.code} has been enabled for VR
                                access. You can now access it through the VR
                                platform API.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Study Information */}
                            <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50">
                                <Player
                                    autoplay
                                    loop
                                    src="./lottiefiles/VR Learning.json"
                                    style={{ height: '300px', width: '300px' }}
                                >
                                    <Controls visible={false} />
                                </Player>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between border-t pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isSending}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>

                                <Button
                                    onClick={handleSendToVR}
                                    disabled={
                                        isSending ||
                                        study.status !== 'completed'
                                    }
                                    className="min-w-[140px] bg-purple-600 hover:bg-purple-700"
                                >
                                    {isSending ? (
                                        <>
                                            <span className="mr-2 animate-spin">
                                                ⏳
                                            </span>
                                            Enabling VR...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Enable VR Access
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </Modal>
    );
};
