import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Modal } from '@inertiaui/modal-react';
import { Controls, Player } from '@lottiefiles/react-lottie-player';
import { AlertTriangle, CheckCircle, Clock, Send, X } from 'lucide-react';
import { useState, useEffect } from 'react';

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

    // Reset state when modal is opened
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === `#send-to-vr-${study.id}`) {
                setIsSuccess(false);
                setIsSending(false);
            }
        };

        // Reset state immediately if modal is already open
        if (window.location.hash === `#send-to-vr-${study.id}`) {
            setIsSuccess(false);
            setIsSending(false);
        }

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [study.id]);

    const handleCancel = () => {
        setIsSuccess(false);
        setIsSending(false);
        // Close the modal by removing the hash
        window.location.hash = '';
    };

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

    return (
        <Modal ref={modalRef} name={`send-to-vr-${study.id}`} maxWidth="2xl">
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
                            onClick={handleCancel}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSendToVR}
                            disabled={study.status !== 'completed'}
                            className="min-w-[140px] bg-purple-600 hover:bg-purple-700"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Enable VR Access
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Modal>
    );
};
