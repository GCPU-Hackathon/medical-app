import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { useMemo, useState } from 'react';

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
    patients: Patient[];
    selectedPatientId: number | null;
    onPatientSelect: (patientId: number | null) => void;
    placeholder?: string;
    className?: string;
}

export function PatientSelector({
    patients,
    selectedPatientId,
    onPatientSelect,
    placeholder = 'Select patient...',
    className,
}: Props) {
    const [open, setOpen] = useState(false);

    const selectedPatient = useMemo(() => {
        return (
            patients.find((patient) => patient.id === selectedPatientId) || null
        );
    }, [patients, selectedPatientId]);

    const calculateAge = (dateOfBirth?: string) => {
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

    const handleSelect = (patientId: string) => {
        const id = patientId === 'clear' ? null : parseInt(patientId);
        onPatientSelect(id);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('justify-between', className)}
                >
                    {selectedPatient ? (
                        <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>
                                {selectedPatient.first_name}{' '}
                                {selectedPatient.last_name}
                            </span>
                            {selectedPatient.gender && (
                                <Badge variant="secondary" className="text-xs">
                                    {selectedPatient.gender}
                                </Badge>
                            )}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">
                            {placeholder}
                        </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command>
                    <CommandInput placeholder="Search patients..." />
                    <CommandList>
                        <CommandEmpty>No patients found.</CommandEmpty>
                        <CommandGroup>
                            {selectedPatientId && (
                                <CommandItem
                                    value="clear"
                                    onSelect={handleSelect}
                                    className="text-muted-foreground"
                                >
                                    Clear selection
                                </CommandItem>
                            )}
                            {patients.map((patient) => {
                                const age = calculateAge(patient.date_of_birth);
                                const searchValue =
                                    `${patient.first_name} ${patient.last_name} ${patient.email}`.toLowerCase();

                                return (
                                    <CommandItem
                                        key={patient.id}
                                        value={searchValue}
                                        onSelect={() =>
                                            handleSelect(patient.id.toString())
                                        }
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Check
                                                    className={cn(
                                                        'h-4 w-4',
                                                        selectedPatientId ===
                                                            patient.id
                                                            ? 'opacity-100'
                                                            : 'opacity-0',
                                                    )}
                                                />
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {patient.first_name}{' '}
                                                        {patient.last_name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {patient.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {age && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {age}y
                                                    </Badge>
                                                )}
                                                {patient.gender && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {patient.gender}
                                                    </Badge>
                                                )}
                                                {patient.blood_type && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {patient.blood_type}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
