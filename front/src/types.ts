export interface UploadBytesRecord {
    currentChunk: number;
    currentChunkUploadedMbs: number;
    currentUploadedMbs: number;
    mbps: number;
    recordTime: Date;
}

export interface UploadingChartDataItem {
    uploadMbps: number;
    mean: number;
    variant: number;
    median: number;
    t: number;
}

export interface ChunkUploadChartDataItem {
    chunkName: string;
    uploadedMbs: number;
}