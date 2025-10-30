import { GcsDirectorySelector } from '@/components/gcs-directory-selector';
import { PatientSelector } from '@/components/patient-selector-simple';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';
import { Modal } from '@inertiaui/modal-react';
import { FileText, FolderOpen, Save, X } from 'lucide-react';
import { useState } from 'react';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth?: string;
    gender?: 'male' | 'female';
    blood_type?: string;
}

export const Create = () => {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
        null,
    );
    const [selectedDirectory, setSelectedDirectory] = useState<string | null>(
        null,
    );
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [organType, setOrganType] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPatient) {
            alert('Please select a patient');
            return;
        }

        if (!selectedDirectory) {
            alert('Please select a GCS directory');
            return;
        }

        if (!title.trim()) {
            alert('Please enter a study title');
            return;
        }

        setIsSubmitting(true);

        try {
            router.post(
                '/studies',
                {
                    patient_id: selectedPatient.id,
                    title: title.trim(),
                    description: description.trim(),
                    gcs_directory: selectedDirectory,
                    status: 'pending',
                    study_date: new Date().toISOString().split('T')[0],
                },
                {
                    onSuccess: () => {
                        // Reset form
                        setSelectedPatient(null);
                        setSelectedDirectory(null);
                        setTitle('');
                        setDescription('');
                        setOrganType('');
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error creating study:', error);
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setSelectedPatient(null);
        setSelectedDirectory(null);
        setTitle('');
        setDescription('');
        setOrganType('');
    };

    return (
        <Modal name="create-study" maxWidth="4xl">
            <Card className="border-0 shadow-none">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Create New Study</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Grid Layout: Form on left, GCS Selector on right */}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {/* Left Column: Form Fields */}
                            <div className="space-y-6">
                                <h3 className="flex items-center space-x-2 text-lg font-semibold">
                                    <FileText className="h-4 w-4" />
                                    <span>Study Information</span>
                                </h3>

                                {/* Patient Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="patient">Patient *</Label>
                                    <PatientSelector
                                        selectedPatient={selectedPatient}
                                        onPatientSelect={setSelectedPatient}
                                    />
                                </div>

                                {/* Study Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Study Title *</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        placeholder="Enter study title..."
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="organ-type">
                                        Organ Type *
                                    </Label>
                                    <Select
                                        value={organType}
                                        onValueChange={setOrganType}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select organ type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="brain">
                                                Brain
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Description (Optional)
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        placeholder="Enter study description or comments..."
                                        rows={4}
                                    />
                                </div>
                            </div>

                            {/* Right Column: GCS Directory Selection */}
                            <div className="space-y-4">
                                <h3 className="flex items-center space-x-2 text-lg font-semibold">
                                    <FolderOpen className="h-4 w-4" />
                                    <span>IRM Scanner GCS Directories</span>
                                </h3>

                                <GcsDirectorySelector
                                    selectedDirectory={selectedDirectory}
                                    onDirectorySelect={setSelectedDirectory}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                disabled={isSubmitting}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Reset
                            </Button>

                            <div className="space-x-2">
                                <Button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        !selectedPatient ||
                                        !selectedDirectory ||
                                        !title.trim()
                                    }
                                    className="min-w-[120px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="mr-2 animate-spin">
                                                ⏳
                                            </span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Create Study
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </Modal>
    );
};
