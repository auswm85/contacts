export default class FitlerParser {
  constructor(req, fields = []) {
    this._fields = new Set(fields);
    this._query = req.query;
    this._keys = Object.keys(this._query);
  }

  parse() {
    const filters = [];
    const keys = new Set();

    this._keys.forEach(key => {
      const value = this._query[key];

      if (!keys.has(key) && this._isValidField(key)) {
        keys.add(key);

        filters.push({
          column: key,
          value: value
        });
      }
    });

    return filters;
  }

  _isValidField(field) {
    return this._fields.has(field);
  }
}
