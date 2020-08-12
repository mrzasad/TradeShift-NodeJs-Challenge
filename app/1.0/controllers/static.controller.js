import { readFile, parseJSON } from "../../../utilities";
class StaticController {
  constructor() {}
  async countries(request, response, next) {
    try {
      let countries = await readFile(`./countries.json`);
      response.ok(countries);
    } catch (error) {
      next(error);
    }
  }

  async companyFindByName(request, response, next) {
    try {
      const { country_name, company_name } = request.params;
      const searchResults = await readFile(`./searchResults.json`);
      const results = searchResults.filter((searchResult) => {
        return (
          searchResult.name.includes(company_name) &&
          searchResult.country === country_name
        );
      });
      response.ok(results);
    } catch (error) {
      next(error);
    }
  }
}
export default new StaticController();
