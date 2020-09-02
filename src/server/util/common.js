export default {
  isEmpty: (data) => {
    if (data === null) return true;
    if (data === undefined) return true;
    if (data === false) return true;
    if (data === '') return true;
    if (data === '0') return true;
    if (data === 0) return true;
    if (typeof data === 'object') {
      if (Array.isArray(data)) return data.length === 0;
      if (Object.keys(data).length > 0) return false;
      if (
        typeof Object.getOwnPropertySymbols !== 'undefined' &&
        Object.getOwnPropertySymbols(data).length > 0
      )
        return false;
      if (data.valueOf().length !== undefined)
        return data.valueOf().length === 0;
      if (typeof data.valueOf() !== 'object') return this.isEmpty(data.valueOf());
    }
    return false;
  },
}

