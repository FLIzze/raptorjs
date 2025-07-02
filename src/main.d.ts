export class Logger {
  constructor(...args: any[]);
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
}

declare const db: any;
export default db;