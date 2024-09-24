import { CartesianGrid, Label, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { UploadingChartDataItem } from "../types";

export default function UploadingChart({ data }: { data: UploadingChartDataItem[] }) {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-center text-2xl">Uploading Status</h1>
            <LineChart width={880} height={480} data={data}
                margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t">
                    <Label value="Time (s)" offset={-8} position="insideBottomRight" />
                </XAxis>
                <YAxis>
                    <Label value="Upload Speed (MBps)" angle={-90} position="insideBottomLeft" />
                </YAxis>
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="uploadMbps" name="Upload Mbps" stroke="#640D5F" dot={false} />
                <Line type="monotone" dataKey="mean" name="Mean" stroke="#CDC1FF" dot={false} />
                <Line type="monotone" dataKey="variant" name="Variant" stroke="#697565" dot={false} />
                <Line type="monotone" dataKey="median" name="Median" stroke="#C96868" dot={false} />
            </LineChart>
        </div>
    );
}