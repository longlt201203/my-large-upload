import { ChunkUploadChartDataItem } from "../types";
import { Bar, BarChart, CartesianGrid, Label, Legend, Tooltip, XAxis, YAxis } from "recharts";

export default function ChunkUploadChart({ data }: { data: ChunkUploadChartDataItem[] }) {
    return (
        <div>
            <h1 className="text-center text-2xl">Chunk Status</h1>
            <BarChart width={880} height={480} margin={{ top: 0, right: 8, left: 8, bottom: 0 }} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="chunkName" />
                <YAxis>
                    <Label value="MBs" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip />
                <Legend />
                <Bar dataKey="uploadedMbs" name="Uploaded MBs" fill="#8884d8" />
            </BarChart>
        </div>
    );
}