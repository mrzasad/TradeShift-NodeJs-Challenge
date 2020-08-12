// Includes crypto and fs modules
import crypto from "crypto";
import { parse } from "dotenv";
import path from "path";
import { readFileSync } from "fs";

// Defining constants
const CDT_ALGORITHM = "aes-256-cbc",
  CDT_KEY = crypto.randomBytes(32),
  CDT_KEYS_FILENAME = "conduit-keys.json",
  CDT_ENCRYPTED_FILENAME = ".conduit-secure.enc";
const fullPath = (fileOrDir) => {
  return path.resolve(`${process.cwd()}/secrets/${fileOrDir}`);
};
export default class SecureEnv {
  constructor(options) {
    this.KEYS = this.constructor.load(options);
  }
  get(key) {
    return this.KEYS[key] || null;
  }
  static load(opts = { password }) {
    try {
      console.log("Init Secure Env Load");
      const { password } = opts;
      if (!password) {
        throw new Error(`Password can't be blank.`);
      }
      //read the conduit-keys.json file
      const data = readFileSync(fullPath(CDT_KEYS_FILENAME), "utf-8"),
        // read .env content
        encryptedContent = readFileSync(fullPath(CDT_ENCRYPTED_FILENAME)),
        // parse keys JSON object to get IV
        keyFile = JSON.parse(data),
        // make IV buffer
        IV = Buffer.from(keyFile.CDT_IV, "hex"),
        // make the key something other than a blank buffer
        CDT_STRONG_KEY = Buffer.concat([Buffer.from(password)], CDT_KEY.length),
        // make the decipher with the current suite, key, and iv
        decipher = crypto.createDecipheriv(CDT_ALGORITHM, CDT_STRONG_KEY, IV),
        // decrypted .conduit-secure.enc content
        decryptedContent = decipher.update(encryptedContent);
      return parse(decryptedContent, { debug: false });
    } catch (error) {
      throw error;
    }
  }
}
