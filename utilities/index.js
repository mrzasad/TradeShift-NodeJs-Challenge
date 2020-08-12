import { Duplex } from "stream";
import { readFileSync } from "fs";
import xml2js from "xml2js";
const builder = new xml2js.Builder();
import path from "path";
import moment from "moment-timezone";

export const CURRENT_TIMESTAMP = (format = null) => {
  const tz = process.env.TZ || "UTC";
  return moment()
    .tz(tz)
    .format(format);
};

export const parseDecimal = (value, fixed = 2) => {
  return 1 * parseFloat(value).toFixed(fixed);
};

export const currentDate = () => {
  return new Date();
};

export const sanitizeName = (name) => {
  return name
    ?.replace(/[&\/\\#,+()$~%.'":*?<>{}¬`£^]/g, "")
    ?.replace(/ {2,}/g, " ")
    ?.replace(/\d+|^\s+|\s+$/g, "");
};

export const base64ToBlob = (base64String, contentType = "image/png") => {
  let stream = new Duplex();
  stream.push(new Buffer.from(base64String, "base64"));
  stream.push(null);
  return stream;
};

export const catchErrors = (promise) => {
  return (req, res, next) => {
    return promise(req, res, next)
      .then((data) => res.ok(data))
      .catch(next);
  };
};
export const promiseHandler = (promise) => {
  return promise
    .then((data) => [data, undefined])
    .catch((error) => Promise.resolve([undefined, error]));
};
export const parseJSON = (o) => {
  return new Promise((success, failure) => {
    try {
      const result = JSON.parse(o);
      success(result);
    } catch (error) {
      failure(error);
    }
  });
};

export const JSONstringify = (data) => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    return null;
  }
};

export function getCircularReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
}
const fullPath = (fileOrDir) => {
  return path.resolve(`${process.cwd()}/${fileOrDir}`);
};
export const readFile = async (fileOrDir, encoding = "utf-8") => {
  try {
    const result = await readFileSync(fullPath(fileOrDir), encoding);
    return JSON.parse(result);
  } catch (error) {
    throw error;
  }
};
export const ENV = (key, _default = null) => {
  return process.env[key] || _default;
};

export const xmlToJs = async (str) => {
  const options = {
    explicitArray: false,
    tagNameProcessors: [xml2js.processors.stripPrefix],
  };
  return new Promise((resolve, reject) => {
    xml2js.parseString(str, options, (err, result) => {
      if (err) {
        return reject(err);
      }
      let soapBody = result.Envelope.Body;
      if (soapBody.$) {
        delete soapBody.$;
      }
      let soapBodyXML = builder.buildObject(soapBody);
      xml2js.parseString(soapBodyXML, { explicitArray: false }, function(
        err,
        result
      ) {
        resolve(result);
      });
    });
  });
};
export const isEmptyObject = (obj) => {
  return !Object.keys(obj).length;
};
