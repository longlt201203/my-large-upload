import { freemem, totalmem } from "os";
import { cpus } from "os";
import { Request, Response } from "express";

function getServerStatus() {
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

  // CPU Usage calculation
  const cpuInfo = cpus();
  const totalCpuTime = cpuInfo.reduce(
    (acc, cpu) => acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq,
    0
  );
  const appCpuTime = cpuInfo.reduce((acc, cpu) => acc + cpu.times.user + cpu.times.sys, 0);
  const cpuUsagePercentage = (appCpuTime / totalCpuTime) * 100;

  // Total % of CPU usage by the system
  const totalActiveCpuTime = cpuInfo.reduce(
    (acc, cpu) => acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq,
    0
  );
  const totalCpuUsagePercentage = (totalActiveCpuTime / totalCpuTime) * 100;
  const timestamp = Date.now();

  return {
    totalRamInMB,
    appRamUsageInMB,
    ramUsagePercentage,
    cpuUsagePercentage,
    totalMemoryUsagePercentage,
    totalCpuUsagePercentage,
    timestamp
  };
}

export const getServerStatusHandler = async (req: Request, res: Response) => {
    const statusData = getServerStatus();
    res.status(200).send(statusData);
}