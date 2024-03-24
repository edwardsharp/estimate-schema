import { expect, describe, it } from "vitest";
import { buildIdealObject, getDeepKeys, sumDeepKeys } from "./index";
import example from "../example/example.json";

describe("estimate-schema", () => {
  it("returns a list of string keys when calling getDeepKeys()", () => {
    const myObject = {
      foo: "bar",
      baz: {
        whee: "bpeep",
        oh: ["my", 1, 2, 3],
      },
      where: [
        {
          do: "all",
          the: "thingz",
          hey: {
            go: 666,
          },
        },
        {
          do: "they",
          the: "thingz",
          hey: {
            go: "wheee",
          },
        },
        {
          or: "hey",
          do: "some",
          the: "thingz",
          go: ["beep", { and: "then", dive: ["deeper", "into"] }],
        },
      ],
    };

    const getDeepKeysOut = getDeepKeys(myObject);

    expect(getDeepKeysOut).toEqual([
      "foo",
      "baz",
      "baz.whee",
      "baz.oh",
      "baz.oh.0",
      "where",
      "where.0",
      "where.0.do",
      "where.0.the",
      "where.0.hey",
      "where.0.hey.go",
      "where.0.or",
      "where.0.go",
      "where.0.go.0",
      "where.0.go.0.and",
      "where.0.go.0.dive",
      "where.0.go.0.dive.0",
    ]);
  });

  // note: 10 objects in array, below, to make understanding freq percentages easier 🤓
  const someKindaSimilarObjects = example;

  it("returns information about key frequencies when calling sumDeepKeysOut()", () => {
    const sumDeepKeysOut = sumDeepKeys(someKindaSimilarObjects);

    // console.log(JSON.stringify(sumDeepKeysOut));
    expect(sumDeepKeysOut).toEqual([
      [
        "foo",
        {
          sum: 10,
          types: ["string"],
          enums: {
            values: [
              "bar",
              "oof",
              "gnar",
              "foo!",
              "wha",
              "bun",
              "another foo",
              "and this just foo ",
              "random foo",
              "foo sooo lonely :/",
            ],
            sum_uniq: 10,
          },
          freq: 100,
        },
      ],
      [
        "baz",
        {
          sum: 7,
          types: ["string", "undefined", "null"],
          enums: {
            values: [
              "beep",
              "zab",
              "honk",
              "baz!",
              "zee",
              "gulp",
              undefined,
              null,
            ],
            sum_uniq: 8,
          },
          freq: 70,
        },
      ],
      [
        "deepObj",
        {
          sum: 3,
          types: ["object", "undefined"],
          enums: {
            values: [
              { also: "has propz!", and: "other stuff!" },
              { also: "has stuff!", and: "suffy stuff!" },
              {
                also: "zee stuff",
                and: "other goodiez",
                but: "also more propz!",
              },
              undefined,
            ],
            sum_uniq: 4,
          },
          freq: 30,
        },
      ],
      [
        "deepObj.also",
        {
          sum: 3,
          types: ["string", "undefined"],
          enums: {
            values: ["has propz!", "has stuff!", "zee stuff", undefined],
            sum_uniq: 4,
          },
          freq: 30,
        },
      ],
      [
        "deepObj.and",
        {
          sum: 3,
          types: ["string", "undefined"],
          enums: {
            values: [
              "other stuff!",
              "suffy stuff!",
              "other goodiez",
              undefined,
            ],
            sum_uniq: 4,
          },
          freq: 30,
        },
      ],
      [
        "deepObj.but",
        {
          sum: 1,
          types: ["undefined", "string"],
          enums: { values: [undefined, "also more propz!"], sum_uniq: 2 },
          freq: 10,
        },
      ],
      [
        "whee",
        {
          sum: 5,
          types: ["undefined", "array"],
          enums: {
            values: [
              undefined,
              [1, 2, 3],
              [4, 5, 6],
              ["hey", "its", "a string"],
              [-1, -2, -3],
              [11, 22, 33],
            ],
            sum_uniq: 6,
          },
          freq: 50,
        },
      ],
      [
        "whee.0",
        {
          sum: 5,
          types: ["undefined", "number", "string"],
          enums: { values: [undefined, 1, 4, "hey", -1, 11], sum_uniq: 6 },
          freq: 50,
        },
      ],
      [
        "ohey",
        {
          sum: 2,
          types: ["undefined", "string"],
          enums: {
            values: [undefined, "im new!", "it just these two"],
            sum_uniq: 3,
          },
          freq: 20,
        },
      ],
      [
        "just_a_random_one",
        {
          sum: 1,
          types: ["undefined", "number"],
          enums: { values: [undefined, 1], sum_uniq: 2 },
          freq: 10,
        },
      ],
      [
        "and_some_other_lonely_prop",
        {
          sum: 1,
          types: ["undefined", "number"],
          enums: { values: [undefined, 10], sum_uniq: 2 },
          freq: 10,
        },
      ],
    ]);
  });

  it("will build an ideal object with all keys found when calling buildIdealObject()", () => {
    const idealObj = buildIdealObject(sumDeepKeys(someKindaSimilarObjects));

    // console.log(JSON.stringify(idealObj));
    expect(idealObj).toEqual({
      foo: {
        __stats: {
          sum: 10,
          types: ["string"],
          enums: {
            values: [
              "bar",
              "oof",
              "gnar",
              "foo!",
              "wha",
              "bun",
              "another foo",
              "and this just foo ",
              "random foo",
              "foo sooo lonely :/",
            ],
            sum_uniq: 10,
          },
          freq: 100,
        },
      },
      baz: {
        __stats: {
          sum: 7,
          types: ["string", "undefined", "null"],
          enums: {
            values: [
              "beep",
              "zab",
              "honk",
              "baz!",
              "zee",
              "gulp",
              undefined,
              null,
            ],
            sum_uniq: 8,
          },
          freq: 70,
        },
      },
      deepObj: {
        __stats: {
          sum: 3,
          types: ["object", "undefined"],
          enums: {
            values: [
              { also: "has propz!", and: "other stuff!" },
              { also: "has stuff!", and: "suffy stuff!" },
              {
                also: "zee stuff",
                and: "other goodiez",
                but: "also more propz!",
              },
              undefined,
            ],
            sum_uniq: 4,
          },
          freq: 30,
        },
        also: {
          __stats: {
            sum: 3,
            types: ["string", "undefined"],
            enums: {
              values: ["has propz!", "has stuff!", "zee stuff", undefined],
              sum_uniq: 4,
            },
            freq: 30,
          },
        },
        and: {
          __stats: {
            sum: 3,
            types: ["string", "undefined"],
            enums: {
              values: [
                "other stuff!",
                "suffy stuff!",
                "other goodiez",
                undefined,
              ],
              sum_uniq: 4,
            },
            freq: 30,
          },
        },
        but: {
          __stats: {
            sum: 1,
            types: ["undefined", "string"],
            enums: { values: [undefined, "also more propz!"], sum_uniq: 2 },
            freq: 10,
          },
        },
      },
      whee: {
        "0": {
          __stats: {
            sum: 5,
            types: ["undefined", "number", "string"],
            enums: { values: [undefined, 1, 4, "hey", -1, 11], sum_uniq: 6 },
            freq: 50,
          },
        },
        __stats: {
          sum: 5,
          types: ["undefined", "array"],
          enums: {
            values: [
              undefined,
              [1, 2, 3],
              [4, 5, 6],
              ["hey", "its", "a string"],
              [-1, -2, -3],
              [11, 22, 33],
            ],
            sum_uniq: 6,
          },
          freq: 50,
        },
      },
      ohey: {
        __stats: {
          sum: 2,
          types: ["undefined", "string"],
          enums: {
            values: [undefined, "im new!", "it just these two"],
            sum_uniq: 3,
          },
          freq: 20,
        },
      },
      just_a_random_one: {
        __stats: {
          sum: 1,
          types: ["undefined", "number"],
          enums: { values: [undefined, 1], sum_uniq: 2 },
          freq: 10,
        },
      },
      and_some_other_lonely_prop: {
        __stats: {
          sum: 1,
          types: ["undefined", "number"],
          enums: { values: [undefined, 10], sum_uniq: 2 },
          freq: 10,
        },
      },
    });
  });

  it("will report empty arrays", () => {
    const someKindaSimilarObjectsWithEmptyArray = [
      {
        fooArray: [1, 2, 3],
      },
      {
        fooArray: [],
      },
    ];
    const sumDeepKeysOut = sumDeepKeys(someKindaSimilarObjectsWithEmptyArray);

    // console.log(">>>> ", JSON.stringify(sumDeepKeysOut));
    expect(sumDeepKeysOut).toEqual([
      [
        "fooArray",
        {
          sum: 2,
          types: ["array", "empty array"],
          enums: { values: [[1, 2, 3], []], sum_uniq: 2 },
          freq: 100,
        },
      ],
      [
        "fooArray.0",
        {
          sum: 1,
          types: ["number", "undefined"],
          enums: { values: [1, undefined], sum_uniq: 2 },
          freq: 50,
        },
      ],
    ]);
  });
});
