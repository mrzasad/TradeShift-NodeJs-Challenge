import StaticController from "../controllers/static.controller";

module.exports = (router) => {
  router.get("/countries/", StaticController.countries);
  router.get(
    "/countries/:country_name/companies/:company_name",
    StaticController.companyFindByName
  );
};
