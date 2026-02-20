import pino from "pino";

const isProd = process.env.NODE_ENV === "production";
const isServer = typeof window === "undefined";

export const consolePino = pino({
  level: isProd ? "info" : "debug",

  // Better browser/server differentiation
  browser: isServer
    ? undefined
    : {
        asObject: true,
        write: (o: any) => {
          const method =
            o.level >= 50 ? "error" : o.level >= 40 ? "warn" : "log";

          // Print error/warn/log with message if available, fallback to object
          if (method === "error") {
            // eslint-disable-next-line no-console
            console.error(o.msg || o);
          } else if (method === "warn") {
            // eslint-disable-next-line no-console
            console.warn(o.msg || o);
          } else {
            // eslint-disable-next-line no-console
            console.log(o.msg || o);
          }
        },
        serialize: true,
      },

  // Enhanced formatters
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => {
      return {
        ...bindings,
        environment: isProd ? "production" : "development",
        runtime: isServer ? "server" : "client",
      };
    },
  },

  // Better timestamp handling
  timestamp: pino.stdTimeFunctions.isoTime,

  // Additional safety for Next.js
  base: isServer
    ? {
        pid: process.pid,
        hostname: process.env.HOSTNAME,
      }
    : undefined,
});
