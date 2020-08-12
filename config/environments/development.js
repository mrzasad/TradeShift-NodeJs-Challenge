module.exports = {
  APP: {
    NAME: "FS-ES-Static-API - Development",
    PORT: parseInt(process.env.ENV_CDT_PORT || process.env.PORT),
    BASE_PATH: process.env.ENV_CDT_BASE_PATH,
    VERSION: "1.0",
    SOURCE: process.env.ENV_CDT_SOURCE,
    AUTH_URL: process.env.ENV_CDT_AUTH_URL,
  },
  DB: {
    USERNAME: process.env.ENV_CDT_DB_USERNAME,
    PASSWORD: process.env.ENV_CDT_DB_PASSWORD,
    HOST: process.env.ENV_CDT_DB_HOST,
    DATABASE_NAME: process.env.ENV_CDT_DB_NAME,
    PORT: process.env.ENV_CDT_DB_PORT,
    DIALECT: process.env.ENV_CDT_DB_DIALECT,
    ENV_CDT_DATABASE_DEBUG: process.env.ENV_CDT_DB_DEBUG == "true",
  },
  CORE_BANKING: {
    BASE_URL: process.env.ENV_CDT_CORE_BANKING_BASE_URL,
    USER_NAME: process.env.ENV_CDT_CORE_BANKING_USER_NAME,
    PASSWORD: process.env.ENV_CDT_CORE_BANKING_PASSWORD,
    IS_MOCK: process.env.ENV_CDT_CORE_BANKING_IS_MOCK || "false",
  },
};
