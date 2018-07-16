import { Subscription } from 'rxjs/Subscription';

export class FileUpload {
    id: string;
    data: File;
    state: string;
    inProgress: boolean;
    progress: number;
    canRetry: boolean;
    canCancel: boolean;
    sub?: Subscription;
}
