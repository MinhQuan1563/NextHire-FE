export interface ConnectionDto {
    userCode: string;
    fullName: string;
    avatarUrl?: string | null;
    headline?: string | null;
    connectedAt?: string | null;
}


export interface PagedResultDto<T> {
    items: T[];
    totalCount: number;
}