import SortParser from "../helpers/SortParser";

export default fields => (req, res, next) => {
  if (!fields.length) return next();

  const sortParser = new SortParser(req, fields);
  const sorting = sortParser.parse();

  if (sorting.length) {
    req.sorting = sorting;
  }

  return next();
};
