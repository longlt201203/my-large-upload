import axios from "axios";
import { ChangeEventHandler, useState } from "react";
import { io } from "socket.io-client";

function calculateFileSize(file: File): [number, string] {
    let size = file.size;
    let prefix = 'B';

    if (size >= 1024) {
        size /= 1024;
        prefix = 'KB';
    }

    if (size >= 1024) {
        size /= 1024;
        prefix = 'MB';
    }

    if (size >= 1024) {
        size /= 1024;
        prefix = 'GB';
    }

    return [size, prefix];
}

function calculateNumberOfChunks(file: File, chunkSize: number) {
    return Math.ceil((file.size / 1024 / 1024)/chunkSize);
}

const endpoints = [
    '/api/upload/multer',
    '/api/upload/busboy',
];

export default function AppV2() {
    const [endpoint, setEndpoint] = useState(endpoints[0]);
    const [file, setFile] = useState<File | null>(null);
    const [prefix, setPrefix] = useState<string | null>(null);
    const [fileSize, setFileSize] = useState<number | null>(null);
    const [chunkSize, setChunkSize] = useState(10);
    const [maxAsyncCalls, setMaxAsyncCalls] = useState(3);
    const [isUploading, setIsUploading] = useState(false);
    const [chunkInfo, setChunkInfo] = useState<{
        chunkIndex: number;
        progress: string;
    }[]>([]);
    const [totalUploadTime, setTotalUploadTime] = useState<number | null>(null);
    const [totalProgress, setTotalProgress] = useState<string | null>(null);
    
    const onFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        if (!e.target.files) return;
        const file = e.target.files.item(0);
        if (!file) return;
        setFile(file);
        const [size, prefix] = calculateFileSize(file);
        setFileSize(size);
        setPrefix(prefix);
    }

    const validateBeforeUpload = () => {
        const errors: string[] = [];
        if (!file) {
            errors.push("Select file to upload");
        }
        if (chunkSize <= 0) {
            errors.push("Chunk size must > 0");
        }
        return errors;
    }

    const resetStatistics = () => {
        setChunkInfo([]);
        setTotalUploadTime(null);
        setTotalProgress(null);
    }

    const onSubmit = async () => {
        const errors = validateBeforeUpload();
        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }
        resetStatistics();
        setIsUploading(true);
        const totalTime1 = performance.now();
        if (!file || chunkSize <= 0) return;
        const numberOfChunks = calculateNumberOfChunks(file, chunkSize);
        const chunkSizeByte = chunkSize*1024*1024;
        let promises: Promise<any>[] = [];
        for (let i = 0; i < numberOfChunks; i++) {
            const start = i*chunkSizeByte;
            const end = Math.min(file.size, start+chunkSizeByte);
            const blob = file.slice(start, end);
            const formData = new FormData();
            formData.set('filename', file.name);
            formData.set('chunk', blob);
            formData.set('chunkIndex', String(i+1));
            setChunkInfo((prev) => [...prev, {
                chunkIndex: i+1,
                progress: "0"
            }])
            promises.push(axios.post(endpoint, formData, {
                onUploadProgress: (e) => {
                    if (e.total) {
                        const uploadedBytes = i*chunkSizeByte+e.loaded;
                        const totalProgress = ((uploadedBytes/file.size)*100).toFixed(2);
                        setTotalProgress(totalProgress);
                        const progress = ((e.loaded / e.total) * 100).toFixed(2);
                        setChunkInfo((prev) => {
                            prev[i].progress = progress
                            return [...prev];
                        });
                    }
                },
            }));
            if (promises.length == maxAsyncCalls) {
                await Promise.all(promises)
                promises = [];
            }
        }
        const totalTime2 = performance.now();
        setTotalUploadTime(totalTime2-totalTime1);
        setIsUploading(false);
    }

    const testSocket = () => {
        const socket = io('ws://localhost:3333/socket');
    
        socket.on('pong', () => {
            alert("Socket test success!");
            socket.off('pong');
            socket.disconnect();
        })

        socket.emit('ping');
    }

    return (
        <div className="flex flex-col min-h-screen justify-center items-center">
            <h1 className="text-4xl font-bold">Upload</h1>
            <form className="flex flex-col gap-8 p-8 shadow-lg">
                <div className="flex gap-4 items-center">
                    {totalUploadTime && <label className="text-green-600">Uploading finished after {(totalUploadTime / 1000).toFixed(2)}(s)</label>}
                </div>
                <div className="flex gap-4 items-center">
                    <label htmlFor="endpoint">Endpoint</label>
                    <select className="border rounded p-1" name="endpoint" id="endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)}>
                        {endpoints.map((item) => (<option key={item} value={item}>{item}</option>))}
                    </select>
                </div>
                <div className="flex gap-4 items-center">
                    <label htmlFor="file">File</label>
                    <input type="file" id="file" name="file" onChange={onFileChange} />
                    {file && <label htmlFor="">File size: {fileSize?.toFixed(2)} {prefix}</label>}
                </div>
                <div className="flex gap-4 items-center">
                    <label htmlFor="">Chunk size (MB)</label>
                    <input type="number" className="border rounded p-1" value={String(chunkSize)} onChange={(e) => setChunkSize(Number(e.target.value))} />
                </div>
                <div className="flex gap-4 items-center">
                    <input type="checkbox" id="uploadSocket" />
                    <label htmlFor="uploadSocket">Upload socket</label>
                </div>
                <div className="flex gap-4 items-center">
                    <label htmlFor="">Max number of async calls</label>
                    <input type="number" className="border rounded p-1" value={String(maxAsyncCalls)} onChange={(e) => setMaxAsyncCalls(Number(e.target.value))} />
                </div>
                {file && chunkSize > 0 && <div className="flex gap-4 items-center">
                    <label htmlFor="">Expected number of chunks: {calculateNumberOfChunks(file, chunkSize)}</label>
                </div>}
                <div className="flex flex-col gap-2">
                    <button type="button" className="px-4 py-2 bg-orange-200 rounded" onClick={onSubmit} disabled={isUploading}>{isUploading ? "Uploading..." : "Upload"}</button>
                    <button type="button" className="px-4 py-2 bg-orange-200 rounded" onClick={testSocket}>Test Socket</button>
                </div>
                <hr />
                {totalProgress && <div className="flex flex-col gap-2">
                    <p>Total Progress: {totalProgress}%</p>
                    {chunkInfo.map((item, index) => (
                        <p key={index}>Chunk {item.chunkIndex}: {item.progress}%</p>
                    ))}
                </div>}
            </form>
        </div>
    );
}