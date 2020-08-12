import winston from "winston";
import expressWinston from "express-winston";
import DailyRotateFile from "winston-daily-rotate-file";
import fs from "fs";
import path from "path";
import AppSetting from "./app.setting";
import {CURRENT_TIMESTAMP} from "../utilities"

class Logger {
  constructor() {
    this.logger = undefined;
  }

  static get logDirectory() {
    return path.join(process.cwd(), "logs");
  }
  static CreateLogFolderIfNotExists() {
    // ensure log directory exists
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory);
    }
  }

  static configureLogger() {
    return expressWinston.logger({
      format: this.logFormat,
      level: (req, res) => "info",
      transports: this.transports,
      msg: (req, res) => {
        return `HTTP {{req.method}} ${req.protocol}://${req.get("host")}${
          req.originalUrl
        }`;
      }, // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
      baseMeta: {
        timestamp: CURRENT_TIMESTAMP('LLLL')
      },
      expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
      colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
      ignoreRoute: function(req, res) {
        return false;
      },
      dynamicMeta: (req, res) => {
        const meta = {
          "x-trans-id": req.get("x-trans-id")
        };
        if (req.customer) {
          meta.customerId = req.customer.id;
        }
        return meta;
      }
    });
  }
  static errorLogger() {
    return expressWinston.errorLogger({
      format: this.logFormat,
      transports: this.transports,
      msg: (req, res) => {
        return `HTTP {{req.method}} ${req.protocol}://${req.get("host")}${
          req.originalUrl
        }`;
      },
      baseMeta: {
        timestamp: CURRENT_TIMESTAMP('LLLL')
      },
      dynamicMeta: (req, res) => {
        const meta = {
          "x-trans-id": req.get("x-trans-id")
        };
        if (req.customer) {
          meta.customerId = req.customer.id;
        }
        return meta;
      }
    });
  }
  static get logFormat() {
    return winston.format.combine(
      winston.format.label({ label: AppSetting.getConfig().APP.NAME }),
      winston.format.colorize(),
      winston.format.json(),
      winston.format.timestamp(),
      winston.format.align()
      // winston.format.printf(
      //   msg =>
      //     `${msg.timestamp} ${[msg.label]} - ${[msg.level]}: ${msg.message}`
      // )
    );
  }

  static get transports() {
    return [
      new DailyRotateFile({
        filename: path.join(Logger.logDirectory, "%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        prepend: true,
        localTime: true,
        level: "verbose",
        handleExceptions: true,
        json: true,
        colorize: true,
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d"
      }),
      new winston.transports.Console({
        timestamp: true,
        json: true,
        colorize: true
      })
    ];
  }
  static setLogger() {
    if (!this.logger) {
      this.logger = winston.createLogger({
        format: this.logFormat,
        transports: this.transports,
        exitOnError: false
      });
    }
  }

  static init() {
    this.CreateLogFolderIfNotExists();
    this.setLogger();
  }

  static GetValue(value) {
    try {
      if (typeof value === "string") {
        return value;
      }
      return JSON.stringify(value);
    } catch (error) {
      return null;
    }
  }

  static log(level, value) {
    if (this.logger) {
      this.logger.log({
        level: level,
        timestamp: CURRENT_TIMESTAMP('LLLL'),
        message: this.GetValue(value)
      });
    } else {
      //   console.log(this.GetValue(value));
    }
  }
  static debug(value) {
    this.log("debug", value);
  }

  static error(value) {
    this.log("error", value);
  }

  static warn(value) {
    this.log("warn", value);
  }

  static info(value) {
    this.log("info", value);
  }
}
export default Logger;
