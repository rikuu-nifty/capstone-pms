import { toast } from 'sonner';

export const notifyFiltersCleared = () => {
    toast.success('Filters cleared', {
        description: 'The table is now showing all available records.',
    });
};

export const notifyNoRecordsFound = () => {
    toast.info('No records found', {
        description: 'Try adjusting your search or filter settings.',
    });
};

export const notifyExportReady = (format?: string) => {
    toast.success('Export ready', {
        description: format ? `The ${format} file is being generated.` : 'The file is being generated successfully.',
    });
};

export const notifyUploadStarted = () =>
    toast.loading('Uploading assets', {
        description: 'Please wait while the records are being processed.',
    });

export const notifyImageUploaded = () => {
    toast.success('Image uploaded', {
        description: 'The asset image has been attached successfully.',
    });
};
