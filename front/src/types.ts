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

export interface ServerStatusResponse {
    totalRamInMB: number;
    appRamUsageInMB: number;
    ramUsagePercentage: number;
    cpuUsagePercentage: number;
    totalMemoryUsagePercentage: number;
    totalCpuUsagePercentage: number;
    timestamp: number;
}

export interface ServerStatusChartDataItem {
    t: number;
    appMem: number;
    appCpu: number;
    otherMem: number;
    otherCpu: number;
    freeMem: number;
    freeCpu: number;
}