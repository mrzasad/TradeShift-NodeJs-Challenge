import { config } from "dotenv";
config();
const NODE_ENV = process.env.NODE_ENV || "development";
const CDT_ENV = require(`./environments/${NODE_ENV}`);
export class AppSetting {
  static getConfig() {
    return CDT_ENV;
  }
  static isProduction() {
    return NODE_ENV === "production";
  }

  static getDBConnection() {
    const CONFIG = this.getConfig();
    switch (CONFIG.DB.DIALECT) {
      case "mssql":
        return this.getMsSql();
        break;
      case "oracledb":
        return this.getOracle();
        break;
      default:
        throw new Error("No DB connection found");
    }
  }

  static getMsSql() {
    const CONFIG = this.getConfig();
    return {
      server: CONFIG.DB.HOST,
      database: CONFIG.DB.DATABASE_NAME,
      connectionTimeout: 30000,
      options: {
        packetSize: 32768,
        encrypt: true,
        port: CONFIG.DB.PORT,
        enableArithAbort: false,
      },
      password: CONFIG.DB.PASSWORD,
      user: CONFIG.DB.USERNAME,
    };
  }

  static getOracle() {
    const CONFIG = this.getConfig();
    return {
      host: CONFIG.DB.HOST,
      port: CONFIG.DB.PORT,
      user: CONFIG.DB.USERNAME,
      password: CONFIG.DB.PASSWORD,
      database: CONFIG.DB.DATABASE_NAME,
    };
  }
}
export default AppSetting;
