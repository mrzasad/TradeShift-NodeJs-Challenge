import fs from "fs";
import swaggerJSDoc from "swagger-jsdoc";
import AppSetting from "./app.setting";
const { version, description } = require(`${process.cwd()}/package.json`);

class ApiDoc {
  constructor() {
    this.CONFIG = AppSetting.getConfig();
  }

  getDefination() {
    return {
      openapi: "3.0.0",
      info: {
        title: this.CONFIG.APP.NAME,
        version: version,
        description: description,
        "x-logo": {
          url: "./logo.png",
          altText: this.CONFIG.APP.NAME
        },
        contact: {
          name: "",
          url: "https://www.github.com/mrzasad",
          email: "mrzasad@gmail.com"
        },
        host: `http://localhost:${this.CONFIG.APP.PORT}/${this.CONFIG.APP.BASE_PATH}`,
        basePath: this.CONFIG.APP.BASE_PATH
      },
      securityDefinitions: {
        APP_SECRET: {
          type: "apiKey",
          in: "header",
          name: "x-channel-id"
        }
      },
      schemes: ["http", "https"],
      consumes: ["application/json"],
      produces: ["application/json"]
    };
  }
  publish(app) {
    if (!AppSetting.isProduction()) {
      const fileContent = this.fileContent();
      fs.writeFileSync(`${process.cwd()}/public/api.docs.json`, fileContent);
      app.get("/docs", function(req, res) {
        res.sendFile("index.html");
      });
    }
  }
  fileContent() {
    const docsDefination = this.getDefination();
    const content = swaggerJSDoc({
      swaggerDefinition: docsDefination,
      apis: ["./docs/**/*.yaml"]
    });
    return JSON.stringify(content, null, 2);
  }
}

export default new ApiDoc();
