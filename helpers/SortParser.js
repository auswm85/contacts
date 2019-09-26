export default class SortParser {
  constructor(req, fields = []) {
    this._fields = new Set(fields);
    this._allowedSorts = ["asc", "desc"];
    this._sortString = req.query.sort;
    this._rawSortParts =
      this._sortString && this._sortString.indexOf(",") !== 1
        ? this._sortString.split(",")
        : [];
  }

  parse() {
    const sorting = [];
    const keys = new Set();

    this._rawSortParts.map(sort => {
      sort = this._prepareSort(sort);
      const parts = sort.indexOf(":") !== -1 ? sort.split(":") : [];
      const [col, dir] = parts;

      if (this._isValidCol(col) && !keys.has(col)) {
        keys.add(col);
        sorting.push({
          column: col,
          direction: this._getSortDirection(dir)
        });
      }
    });

    return sorting;
  }

  _prepareSort(sort) {
    return sort.replace(/:+/g, ":");
  }

  _getSortDirection(direction) {
    return direction && this._allowedSorts.indexOf(direction) !== -1
      ? direction.toUpperCase()
      : this._allowedSorts[0].toUpperCase();
  }

  _isValidCol(col) {
    return this._fields.has(col);
  }
}
