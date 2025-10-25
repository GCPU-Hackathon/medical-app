import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Folder, RefreshCw, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface GcsDirectory {
    name: string;
    path: string;
    file_count?: number;
    last_modified?: string;
}

interface Props {
    selectedDirectory: string | null;
    onDirectorySelect: (directory: string) => void;
    className?: string;
}

export function GcsDirectorySelector({
    selectedDirectory,
    onDirectorySelect,
    className,
}: Props) {
    const [directories, setDirectories] = useState<GcsDirectory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const loadingRef = useRef(false);

    const fetchDirectories = async (isMounted = true) => {
        // Prevent multiple simultaneous requests
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/gcs/directories', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });

            if (!isMounted) return;

            if (!response.ok) {
                throw new Error('Failed to fetch directories');
            }

            const data = await response.json();

            if (isMounted) {
                setDirectories(data.directories || []);
            }
        } catch (err) {
            if (isMounted) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Unknown error occurred',
                );
                setDirectories([]);
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
            loadingRef.current = false;
        }
    };

    useEffect(() => {
        let isMounted = true;

        fetchDirectories(isMounted);

        return () => {
            isMounted = false;
        };
    }, []);

    // Filter directories based on search query
    const filteredDirectories = useMemo(() => {
        if (!searchQuery.trim()) return directories;

        return directories.filter(
            (directory) =>
                directory.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                directory.path
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
        );
    }, [directories, searchQuery]);

    const handleDirectoryClick = (directory: GcsDirectory) => {
        onDirectorySelect(directory.path);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className={className}>
            {/* Header with Search and Refresh */}
            <div className="mb-4 flex items-center justify-between">
                {/* Search Input */}
                {!loading && !error && directories.length > 0 && (
                    <div className="relative mr-3 flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search directories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchDirectories(true)}
                    disabled={loading}
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                    />
                    Refresh
                </Button>
            </div>

            {/* Content */}
            <div>
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                        <span>Loading directories...</span>
                    </div>
                )}

                {error && (
                    <div className="py-8 text-center">
                        <div className="mb-2 text-red-600">Error: {error}</div>
                        <Button
                            variant="outline"
                            onClick={() => fetchDirectories(true)}
                            size="sm"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {!loading && !error && directories.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                        No directories found in Google Cloud Storage
                    </div>
                )}

                {!loading &&
                    !error &&
                    directories.length > 0 &&
                    filteredDirectories.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground">
                            No directories match your search query
                        </div>
                    )}

                {!loading && !error && filteredDirectories.length > 0 && (
                    <div className="max-h-[200px] overflow-y-auto">
                        <div className="grid grid-cols-3 gap-3">
                            {filteredDirectories.map((directory) => (
                                <div
                                    key={directory.path}
                                    className={`group relative cursor-pointer rounded-xl border-2 p-2 transition-all duration-200 hover:shadow-lg ${
                                        selectedDirectory === directory.path
                                            ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200/50'
                                            : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                    }`}
                                    onClick={() =>
                                        handleDirectoryClick(directory)
                                    }
                                >
                                    {/* Selection indicator */}
                                    {selectedDirectory === directory.path && (
                                        <div className="absolute -top-2 -right-2 rounded-full bg-green-500 p-1">
                                            <CheckCircle className="h-3 w-3 text-white" />
                                        </div>
                                    )}

                                    {/* Folder icon */}
                                    <div className="mb-2 flex justify-center">
                                        <Folder
                                            className={`h-8 w-8 transition-colors ${
                                                selectedDirectory ===
                                                directory.path
                                                    ? 'text-green-600'
                                                    : 'text-blue-500 group-hover:text-blue-600'
                                            }`}
                                        />
                                    </div>

                                    {/* Directory name */}
                                    <div className="text-center">
                                        <div className="line-clamp-2 text-xs leading-tight font-medium text-foreground">
                                            {directory.name}
                                        </div>

                                        {/* Last modified */}
                                        {directory.last_modified && (
                                            <div className="mt-1 text-[10px] text-muted-foreground">
                                                {formatDate(
                                                    directory.last_modified,
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
