import UploadingChart from "../components/UploadingChart";
import UploadForm from "../components/UploadForm";
import { useEffect, useState } from "react";
import { ChunkUploadChartDataItem, UploadBytesRecord, UploadingChartDataItem } from "../types";
import { calculateMean, calculateVariant, findMedian } from "../utils";
import ChunkUploadChart from "../components/ChunkUploadChart";

export default function AppV2() {
    const [uploadingChartData, setUploadingChartData] = useState<UploadingChartDataItem[]>([]);
    const [chunkUploadChartData, setChunkUploadChartData] = useState<ChunkUploadChartDataItem[]>([]);
    const [uploadBytesRecords, setUploadBytesRecords] = useState<UploadBytesRecord[]>([]);
    const [startTime, setStartTime] = useState<Date>(new Date());

    const handleStartUpload = () => {
        setStartTime(new Date());
        setUploadBytesRecords([]);
    }

    const handleCompleteUpload = () => {
    }

    useEffect(() => {
        if (uploadBytesRecords.length > 0) {
            const uploadingChartData: UploadingChartDataItem[] = [];
            const uploadSpeedArr = uploadBytesRecords.map((item) => item.mbps)
            const mean = calculateMean(uploadSpeedArr);
            const variant = calculateVariant(uploadSpeedArr, mean);
            const median = findMedian(uploadSpeedArr);
            uploadBytesRecords.forEach((item) => {
                uploadingChartData.push({
                    mean: mean,
                    median: median,
                    variant: variant,
                    t: (item.recordTime.getTime() - startTime.getTime()) / 1000,
                    uploadMbps: item.mbps
                });
            });

            setUploadingChartData(uploadingChartData);
            setChunkUploadChartData((prev) => {
                const lastRecord = uploadBytesRecords[uploadBytesRecords.length-1];
                if (lastRecord.currentChunk == prev.length) {
                    prev.push({
                        chunkName: `Chunk ${lastRecord.currentChunk+1}`,
                        uploadedMbs: lastRecord.currentChunkUploadedMbs
                    });
                } else {
                    prev[lastRecord.currentChunk].uploadedMbs = lastRecord.currentChunkUploadedMbs;
                }
                return [...prev];
            })
        }
    }, [uploadBytesRecords])

    return (
        <div className="flex flex-col min-h-screen justify-center items-center gap-16">
            <h1 className="text-4xl font-bold">Upload</h1>
            <UploadForm onStart={handleStartUpload} onUploadBytesRecord={(record) => {
                setUploadBytesRecords(prev => [...prev, record])
            }} onComplete={handleCompleteUpload} />
            <UploadingChart data={uploadingChartData} />
            <ChunkUploadChart data={chunkUploadChartData} />
        </div>
    );
}