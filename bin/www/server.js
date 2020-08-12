import express from "express";
import { json, urlencoded } from "body-parser";
import http from "http";
import compression from "compression";
import AppError from "conduit-app-error";
import ApiRouting from "../../config/api.routing";
import { Logger, AppSetting } from "../../config";
import ApiDoc from "../../config/api.doc";
import AppResponse from "conduit-app-response";

class Server {
  constructor() {
    this.app = express();
    this.router = express.Router();
    this.configure();
  }

  configure() {
    this.configureMiddleware();
    this.configureRoutes();
    this.errorHandler();
  }

  configureMiddleware() {
    this.CONFIG = AppSetting.getConfig();
    this.app.use(express.static("public"));
    this.app.use(json({ limit: "50mb" }));
    this.app.use(compression());
    this.app.use(AppResponse(this.CONFIG.APP.SOURCE));
    this.app.use(urlencoded({ limit: "50mb", extended: true }));
    this.app.set("PORT", this.CONFIG.APP.PORT);
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });
    Logger.init(this.app);
    this.app.use(Logger.configureLogger());
  }

  configureRoutes() {
    this.app.use(function(req, res, next) {
      for (let key in req.query) {
        if (key) {
          req.query[key.toLowerCase()] = req.query[key];
        }
      }
      next();
    });
    ApiRouting.ConfigureRouters(this.app);
  }

  errorHandler() {
    this.app.use(function(err, req, res, next) {
      Logger.error(err);
      if (!AppSetting.isProduction()) {
        console.log(err);
        res.serverError(err);
      } else if (
        err instanceof AppError ||
        (Array.isArray(err) && err[0] instanceof AppError)
      ) {
        res.serverError(err);
      } else {
        console.log(err);
        res.serverError(new AppError("ERR_STATIC_SERVICE"));
      }
    });

    // // catch 404 and forward to error handler
    this.app.use((req, res, next) => {
      res.notFound(new AppError("ERR_INVALID_PATH"));
    });
  }

  run() {
    let server = http.createServer(this.app);
    server.listen(this.app.get("PORT"), () => {
      console.log(
        `${AppSetting.getConfig().APP.NAME} - is listening on ${
          server.address().port
        }`
      );
    });
    server.on("error", this.onError);
  }

  onError(error) {
    let port = this.app.get("PORT");
    if (error.syscall !== "listen") {
      throw error;
    }

    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
}
export default new Server();
