import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, Heart, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth?: string;
    gender?: 'male' | 'female';
    blood_type?: string;
}

interface Props {
    selectedPatient: Patient | null;
    onPatientSelect: (patient: Patient | null) => void;
    className?: string;
}

export function PatientSelector({
    selectedPatient,
    onPatientSelect,
    className,
}: Props) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch('/api/patients', {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        Accept: 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setPatients(data.patients || []);
                }
            } catch (error) {
                console.error('Failed to fetch patients:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const getAge = (dateOfBirth?: string) => {
        if (!dateOfBirth) return null;
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

    const formatPatientDisplay = (patient: Patient) => {
        return `${patient.first_name} ${patient.last_name}`;
    };

    const filteredPatients = patients.filter((patient) =>
        `${patient.first_name} ${patient.last_name} ${patient.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
    );

    return (
        <div className={className}>
            <div className="relative">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {selectedPatient ? (
                        <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{formatPatientDisplay(selectedPatient)}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">
                            Select a patient...
                        </span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>

                {isOpen && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg">
                        <div className="p-2">
                            <input
                                type="text"
                                placeholder="Search patients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="py-1">
                            {loading ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    Loading patients...
                                </div>
                            ) : filteredPatients.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                    No patients found.
                                </div>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <div
                                        key={patient.id}
                                        className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-gray-100"
                                        onClick={() => {
                                            onPatientSelect(patient);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {formatPatientDisplay(
                                                        patient,
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {patient.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {patient.gender && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {patient.gender}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
