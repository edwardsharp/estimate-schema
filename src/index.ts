const {
  flow,
  groupBy,
  head,
  last,
  map,
  mapValues,
  sumBy,
  toPairs,
  flatten,
  set,
  get,
  uniq,
  isArray,
  isNull,
  isEmpty,
} = require("lodash/fp");

type AnyPOJO = Record<string, any>;

// ...arbitrary cutoff for number of unique values that suggest an enum vs. an open string.
const WHEN_IS_AN_ENUM_AN_ENUM = 50;

export function getDeepKeys(obj: AnyPOJO) {
  // Set, here, to avoid extra work later on by not including duplicate keys
  let keys = new Set<string>();
  for (let rawKey in obj) {
    // flatten all collections into a single key `0` instead of one for each element of the array
    const key = isNaN(parseInt(rawKey)) ? rawKey : "0";
    keys.add(key);
    // but use the rawKey for actually digging deeper into structure.
    if (typeof obj[rawKey] === "object") {
      getDeepKeys(obj[rawKey]).forEach((nestedKey) =>
        keys.add(`${key}.${nestedKey}`)
      );
    }
  }
  return Array.from(keys);
}

interface Stats {
  sum: number;
  freq: number;
  types: string[];
  enums: { values: any[] | null; sum_uniq: number } | null;
}
type StatsTuple = [string, Stats];
type StatsTupleCollection = Array<StatsTuple>;

export const sumDeepKeys = (data: AnyPOJO[]): StatsTupleCollection =>
  flow(
    map(getDeepKeys), // get all nested keys as strings
    flatten, // flatten into single array of all keys-strings
    map((v: string) => [v, 1]), // init sum counter to 1
    groupBy(head), // group distinct key-strings together
    mapValues(sumBy(last)), // with each group, sum by 2nd elem in the tuple (the counter form above)
    toPairs, // turn obj into tuple of [key:string, sum:number]
    // #todo: operating on a single Stats key (sum, freq, types, enums) could be better fp-expressed
    // i.e. the next three map() calls need pretty verbose anon fn args
    // and each needs to be in a specific order :/

    //// #TODO: the next two maps could be one map...
    map(
      ([key, sum]: [string, number]): StatsTuple => [
        key,
        {
          sum,
          enums: null, //handle enum next step.
          freq: 0, // handle freq in next step.
          // not as fp, here :/
          types: uniq(
            data.map((o) => {
              const val = get(key)(o);
              // #todo (maybe): could take a stab at estimating enums, here?
              if (isArray(val)) {
                return `${isEmpty(val) ? "empty " : ""}array`;
              }
              if (isNull(val)) {
                return "null";
              }
              return typeof val;
            })
          ),
        },
      ]
    ), // gather a list of distinct value types
    map(([key, { sum, types }]: StatsTuple): StatsTuple => {
      // losing some fp-elegance, in this anon fn :/
      // values fans out to two prop expression-values
      const values: any[] = uniq(data.map(get(key)));
      return [
        key,
        {
          sum,
          types,
          freq: 0, // handle freq in next step.
          enums: {
            values: values.length > WHEN_IS_AN_ENUM_AN_ENUM ? null : values,
            sum_uniq: values.length,
          },
        },
      ];
    }), // gather a list of all distinct values
    map(
      ([key, { sum, types, enums }]: StatsTuple): StatsTuple => [
        key,
        {
          sum,
          types,
          enums,
          freq: Math.floor((sum / data.length) * 100),
        },
      ]
    ) // calc frequency % to input length.
  )(data);

export const buildIdealObject = (data: StatsTupleCollection) =>
  data.reduce((acc, [key, stats]) => set(key, { __stats: stats })(acc), {});
