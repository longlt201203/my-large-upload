import axios from "axios";
import { ServerStatusChartDataItem, ServerStatusResponse } from "../types";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

export default function ServerStatusChart() {
    const [serverStatusData, setServerStatusData] = useState<ServerStatusResponse[]>([]);
    const [startTimestamp, setStartTimestamp] = useState(Date.now());
    const [serverStatusChartData, setServerStatusChartData] = useState<ServerStatusChartDataItem[]>([]);

    const addServerStatus = (item: ServerStatusResponse) => {
        const maxRange = 100;
        if (serverStatusData.length > maxRange) {
            setServerStatusData(prev => {
                prev.splice(prev.length-1, 1, item);
                return [...prev]
            });
        } else {
            setServerStatusData(prev => [...prev, item]);
        }
    }

    const fetchServerStatus = async () => {
        try {
            const response = await axios.get<ServerStatusResponse>("/api/status");
            addServerStatus(response.data);
        } catch (err) {
            console.log("Server error!");
        }
    }

    useEffect(() => {
        setStartTimestamp(Date.now());
        const interval = setInterval(() => {
            fetchServerStatus();
        }, 1000);
        
        return () => {
            clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        setServerStatusChartData(serverStatusData.map((item => ({
            t: (item.timestamp - startTimestamp)/1000,
            appCpu: item.cpuUsagePercentage,
            appMem: item.ramUsagePercentage,
            otherCpu: item.totalCpuUsagePercentage-item.cpuUsagePercentage,
            otherMem: item.totalMemoryUsagePercentage-item.ramUsagePercentage,
            freeMem: 100-item.totalMemoryUsagePercentage,
            freeCpu: 100-item.totalCpuUsagePercentage
        }))))
    }, [serverStatusData])
    
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
                <h1 className="text-center text-2xl">Server RAM</h1>
                <AreaChart width={880} height={480} margin={{ top: 0, right: 8, left: 8, bottom: 0 }} data={serverStatusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area startOffset="expand" stackId="1" dataKey="appMem" stroke="#C96868" fill="#C96868" name="Application Memory Usage" />
                    <Area startOffset="expand" stackId="1" dataKey="otherMem" stroke="#FADFA1" fill="#FADFA1" name="Other Memory Usage" />
                    <Area startOffset="expand" stackId="1" dataKey="freeMem" stroke="#6EC207" fill="#6EC207" name="Free Memory" />
                </AreaChart>
            </div>
            <div className="flex flex-col gap-4">
                <h1 className="text-center text-2xl">Server CPU</h1>
                <AreaChart width={880} height={480} margin={{ top: 0, right: 8, left: 8, bottom: 0 }} data={serverStatusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area startOffset="expand" stackId="2" dataKey="appCpu" stroke="#C96868" fill="#C96868" name="Application CPU Usage" />
                    <Area startOffset="expand" stackId="2" dataKey="otherCpu" stroke="#FADFA1" fill="#FADFA1" name="Other CPU Usage" />
                    <Area startOffset="expand" stackId="2" dataKey="freeCpu" stroke="#6EC207" fill="#6EC207" name="Free CPU" />
                </AreaChart>
            </div>
        </div>
    );
}