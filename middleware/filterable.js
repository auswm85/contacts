import FilterParser from "../helpers/FilterParser";

export default fields => (req, res, next) => {
  if (!fields.length) return next();

  const filterParser = new FilterParser(req, fields);
  const filtering = filterParser.parse();

  if (filtering.length) {
    req.filtering = filtering;
  }

  return next();
};
