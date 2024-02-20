import { Worker, workerData, parentPort } from 'node:worker_threads';
import { app, ipcMain } from 'electron';

console.log(app, ipcMain);
