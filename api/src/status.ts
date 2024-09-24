import { freemem, totalmem } from "os";
import { cpus } from "os";
import { Request, Response } from "express";

function getCpuUsage() {
  const cpuInfo = cpus();
  let totalIdle = 0, totalTick = 0;

  cpuInfo.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  return { idle: totalIdle, total: totalTick };
}

function calculateCpuUsage(start: ReturnType<typeof getCpuUsage>, end: ReturnType<typeof getCpuUsage>) {
  const idleDifference = end.idle - start.idle;
  const totalDifference = end.total - start.total;

  return (1 - idleDifference / totalDifference) * 100;
}

async function getServerStatus() {
  const memUsage = process.memoryUsage();
  const freeMemory = freemem();
  const totalMemory = totalmem();

  // Total RAM of the server (in MB)
  const totalRamInMB = totalMemory / 1024 / 1024;

  // Total RAM the application is using (in MB, using rss)
  const appRamUsageInMB = memUsage.rss / 1024 / 1024;

  // Percentage of RAM the application is using
  const ramUsagePercentage = (appRamUsageInMB / totalRamInMB) * 100;

  // Total % of memory used by the system
  const totalUsedMemory = totalMemory - freeMemory;
  const totalMemoryUsagePercentage = (totalUsedMemory / totalMemory) * 100;

  // CPU Usage sampling
  const startCpu = getCpuUsage();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
  const endCpu = getCpuUsage();

  // Calculate the CPU usage over the interval
  const totalCpuUsagePercentage = calculateCpuUsage(startCpu, endCpu);

  const timestamp = Date.now();

  return {
    totalRamInMB,
    appRamUsageInMB,
    ramUsagePercentage,
    totalMemoryUsagePercentage,
    totalCpuUsagePercentage,
    timestamp
  };
}

export const getServerStatusHandler = async (req: Request, res: Response) => {
    const statusData = await getServerStatus();
    res.status(200).send(statusData);
}