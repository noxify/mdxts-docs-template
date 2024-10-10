import type { ConstDirectiveNode } from "graphql/language";
import {
  GraphQLDirective,
  GraphQLEnumType,
  GraphQLScalarType,
} from "graphql/type";
import { DirectiveLocation, Kind } from "graphql/language";

import {
  hasPrintableDirective,
  printCustomDirectives,
  printDeprecation,
  printDescription,
  printWarning,
} from "../../src/common";

import { DEFAULT_OPTIONS } from "../../src/const/options";
import type { PrintTypeOptions } from "@graphql-markdown/types";

import * as DocusaurusUtils from "@docusaurus/utils";
jest.mock("@docusaurus/utils", (): unknown => {
  return {
    __esModule: true,
    DOCUSAURUS_VERSION: "1.0.0",
  };
});
const mockDocusaurusUtils = jest.mocked(DocusaurusUtils, { shallow: true });

import * as GraphQL from "@graphql-markdown/graphql";
jest.mock("@graphql-markdown/graphql", (): unknown => {
  return {
    ...jest.requireActual("@graphql-markdown/graphql"),
    isDeprecated: jest.fn(),
    hasDirective: jest.fn(),
  };
});
const mockGraphQL = jest.mocked(GraphQL, { shallow: true });

describe("common", () => {
  beforeEach(() => {
    mockGraphQL.isDeprecated.mockReturnValue(false);
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("printDescription()", () => {
    test("returns the type description text", () => {
      expect.hasAssertions();

      const type = new GraphQLDirective({
        name: "TestDirective",
        locations: [],
        description: "Lorem ipsum",
      });
      const description = printDescription(type);

      expect(description).toMatchInlineSnapshot(`
        "

        Lorem ipsum"
      `);
    });

    test("returns the default text if no description", () => {
      expect.hasAssertions();

      const type = new GraphQLDirective({
        name: "TestDirective",
        locations: [],
      });
      const description = printDescription(type);

      expect(description).toMatchInlineSnapshot(`
        "

        No description"
      `);
    });

    test("returns the defined text if no description", () => {
      expect.hasAssertions();

      const type = new GraphQLDirective({
        name: "TestDirective",
        locations: [],
      });
      const description = printDescription(type, undefined, "");

      expect(description).toMatchInlineSnapshot(`
        "

        "
      `);
    });

    test("returns the default text if description is undefined", () => {
      expect.hasAssertions();

      const type = new GraphQLDirective({
        name: "TestDirective",
        locations: [],
        description: undefined,
      });
      const description = printDescription(type);

      expect(description).toMatchInlineSnapshot(`
        "

        No description"
      `);
    });

    test("returns the default text if noText is not a string", () => {
      expect.hasAssertions();

      const type = new GraphQLDirective({
        name: "TestDirective",
        locations: [],
        description: undefined,
      });
      const description = printDescription(type);

      expect(description).toMatchInlineSnapshot(`
        "

        No description"
      `);
    });

    test("return DEPRECATED tag if deprecated", () => {
      expect.hasAssertions();

      mockDocusaurusUtils.DOCUSAURUS_VERSION = "3.0.0";

      mockGraphQL.isDeprecated.mockReturnValue(true);

      const type = {
        description: "Lorem ipsum",
        isDeprecated: true,
        deprecationReason: "{ Foobar }",
      };
      const description = printDescription(type);

      expect(description).toMatchInlineSnapshot(`
        "

        :::warning[DEPRECATED]

        &#x007B; Foobar &#x007D;

        :::

        Lorem ipsum"
      `);
    });

    test("return custom directive description if applied", () => {
      expect.hasAssertions();

      const directiveType = new GraphQLDirective({
        name: "testDirective",
        locations: [DirectiveLocation.OBJECT],
      });

      const type = {
        name: "TestType",
        description: "Lorem ipsum",
        astNode: {
          directives: [
            {
              name: {
                value: "testDirective",
              },
            },
          ],
        },
      };

      const options = {
        ...DEFAULT_OPTIONS,
        customDirectives: {
          testDirective: {
            type: directiveType,
            descriptor: (directive: GraphQLDirective): string => {
              return `Test ${directive.name}`;
            },
          },
        },
      };

      const description = printDescription(type, options);

      expect(description).toMatchInlineSnapshot(`
        "

        Lorem ipsum

        Test testDirective"
      `);
    });
  });

  describe("printDeprecation()", () => {
    beforeEach(() => {
      mockDocusaurusUtils.DOCUSAURUS_VERSION = "3.0.0";
    });

    test("prints deprecated badge if type is deprecated", () => {
      expect.hasAssertions();

      mockGraphQL.isDeprecated.mockReturnValue(true);

      const type = {
        name: "EntityTypeName",
        isDeprecated: true,
      };
      const deprecation = printDeprecation(type);

      expect(deprecation).toMatchInlineSnapshot(`
        "

        :::warning[DEPRECATED]

        :::"
      `);
    });

    test("prints deprecation reason if type is deprecated with reason", () => {
      expect.hasAssertions();

      mockGraphQL.isDeprecated.mockReturnValue(true);

      const type = {
        name: "EntityTypeName",
        isDeprecated: true,
        deprecationReason: "{ foobar }",
      };
      const deprecation = printDeprecation(type);

      expect(deprecation).toMatchInlineSnapshot(`
        "

        :::warning[DEPRECATED]

        &#x007B; foobar &#x007D;
        
        :::"
      `);
    });

    test("does not print deprecated badge if type is not deprecated", () => {
      expect.hasAssertions();

      const type = new GraphQLScalarType({
        name: "LoremScalar",
        description: "Lorem Ipsum",
        specifiedByURL: "https://lorem.ipsum",
      });

      const deprecation = printDeprecation(type);

      expect(deprecation).toBe("");
    });
  });

  describe("printCustomDirectives()", () => {
    const directiveType = new GraphQLDirective({
      name: "testDirective",
      locations: [DirectiveLocation.OBJECT],
    });
    const type = {
      name: "TestType",
      astNode: {
        directives: [
          {
            name: {
              value: "testDirective",
            },
          },
        ],
      },
    };

    test("does not print directive description if type has no directive", () => {
      expect.hasAssertions();

      const description = printCustomDirectives(type, DEFAULT_OPTIONS);

      expect(description).toBe("");
    });

    test("prints directive description", () => {
      expect.hasAssertions();

      const options = {
        ...DEFAULT_OPTIONS,
        customDirectives: {
          testDirective: {
            type: directiveType,
            descriptor: (directive: GraphQLDirective): string => {
              return `Test ${directive.name}`;
            },
          },
        },
      };

      const description = printCustomDirectives(type, options);

      expect(description).toMatchInlineSnapshot(`
"

Test testDirective"
`);
    });
  });

  describe("hasPrintableDirective()", () => {
    const noDocDirective = new GraphQLDirective({
      name: "noDoc",
      locations: [DirectiveLocation.ENUM],
      astNode: {
        kind: Kind.DIRECTIVE_DEFINITION,
        name: { kind: Kind.NAME, value: "noDoc" },
        repeatable: false,
        locations: [],
      },
    });
    const publicDirective = new GraphQLDirective({
      name: "public",
      locations: [DirectiveLocation.ENUM],
      astNode: {
        kind: Kind.DIRECTIVE_DEFINITION,
        name: { kind: Kind.NAME, value: "public" },
        repeatable: false,
        locations: [],
      },
    });
    const docDirective = new GraphQLDirective({
      name: "doc",
      locations: [DirectiveLocation.OBJECT],
      astNode: {
        kind: Kind.DIRECTIVE_DEFINITION,
        name: { kind: Kind.NAME, value: "doc" },
        repeatable: false,
        locations: [],
      },
    });
    const enumType = new GraphQLEnumType({
      name: "test",
      values: {
        RED: { value: 0 },
        GREEN: { value: 1 },
        BLUE: { value: 2 },
      },
      astNode: {
        kind: Kind.ENUM_TYPE_DEFINITION,
        name: { kind: Kind.NAME, value: "test" },
        directives: [
          {
            ...publicDirective.astNode,
            kind: Kind.DIRECTIVE,
          } as ConstDirectiveNode,
        ],
      },
    });

    test.each([
      { options: undefined },
      {
        options: {
          skipDocDirectives: undefined,
          onlyDocDirectives: undefined,
          deprecated: undefined,
        },
      },
      {
        options: {},
      },
    ])("return true if no option set", ({ options }) => {
      expect.assertions(1);

      expect(
        hasPrintableDirective({}, options as unknown as PrintTypeOptions),
      ).toBeTruthy();
    });

    test("return false if type undefined", () => {
      expect.assertions(1);

      expect(hasPrintableDirective(undefined, {})).toBeFalsy();
    });

    test("return false if type has skip directive", () => {
      expect.assertions(1);

      const options = {
        skipDocDirectives: [noDocDirective],
      } as unknown as PrintTypeOptions;
      mockGraphQL.isDeprecated.mockReturnValue(false);
      mockGraphQL.hasDirective.mockReturnValue(true);

      expect(hasPrintableDirective(enumType, options)).toBeFalsy();
    });

    test("return true if type has not skip directive", () => {
      expect.assertions(1);

      const options = {
        skipDocDirectives: [noDocDirective],
      } as unknown as PrintTypeOptions;
      mockGraphQL.isDeprecated.mockReturnValue(false);
      mockGraphQL.hasDirective.mockReturnValue(false);

      expect(hasPrintableDirective(enumType, options)).toBeTruthy();
    });

    test("return false if type has skip deprecated", () => {
      expect.assertions(1);

      const options = {
        deprecated: "skip",
      } as unknown as PrintTypeOptions;
      mockGraphQL.isDeprecated.mockReturnValue(true);
      mockGraphQL.hasDirective.mockReturnValue(true);

      expect(hasPrintableDirective(enumType, options)).toBeFalsy();
    });

    test("return true if type has not skip deprecated", () => {
      expect.assertions(1);

      const options = {
        deprecated: "default",
      } as unknown as PrintTypeOptions;
      mockGraphQL.isDeprecated.mockReturnValue(true);
      mockGraphQL.hasDirective.mockReturnValue(true);

      expect(hasPrintableDirective(enumType, options)).toBeTruthy();
    });

    test("return true if type has only directive", () => {
      expect.assertions(1);

      const options = {
        onlyDocDirectives: [publicDirective],
      } as unknown as PrintTypeOptions;
      mockGraphQL.isDeprecated.mockReturnValue(false);
      mockGraphQL.hasDirective.mockImplementation(
        jest.requireActual("@graphql-markdown/graphql").hasDirective,
      );

      expect(hasPrintableDirective(enumType, options)).toBeTruthy();
    });

    test("return false if type has not only directive and type is a valid location", () => {
      expect.assertions(1);

      const options = {
        onlyDocDirectives: [noDocDirective],
      } as unknown as PrintTypeOptions;
      mockGraphQL.isDeprecated.mockReturnValue(false);
      mockGraphQL.hasDirective.mockImplementation(
        jest.requireActual("@graphql-markdown/graphql").hasDirective,
      );

      expect(hasPrintableDirective(enumType, options)).toBeFalsy();
    });

    test("return true if type has not only directive and type is not a valid location", () => {
      expect.assertions(1);

      const options = {
        onlyDocDirectives: [docDirective],
      } as unknown as PrintTypeOptions;
      mockGraphQL.isDeprecated.mockReturnValue(false);
      mockGraphQL.hasDirective.mockImplementation(
        jest.requireActual("@graphql-markdown/graphql").hasDirective,
      );

      expect(hasPrintableDirective(enumType, options)).toBeTruthy();
    });

    test("return false if type has only directive and skip deprecated", () => {
      expect.assertions(1);

      const options = {
        deprecated: "skip",
        onlyDocDirectives: [publicDirective],
      } as unknown as PrintTypeOptions;
      mockGraphQL.isDeprecated.mockReturnValue(true);
      mockGraphQL.hasDirective.mockImplementation(
        jest.requireActual("@graphql-markdown/graphql").hasDirective,
      );

      expect(hasPrintableDirective(enumType, options)).toBeFalsy();
    });
  });

  describe("printWarning()", () => {
    test("prints admonition caution for Docusaurus v2", () => {
      expect.assertions(1);

      mockDocusaurusUtils.DOCUSAURUS_VERSION = "2.4.2";

      expect(printWarning("test", "DEPRECATED")).toMatchInlineSnapshot(`
        "

        :::caution DEPRECATED

        test

        :::"
      `);
    });
    test("prints admonition warning for Docusaurus v3", () => {
      expect.assertions(1);

      mockDocusaurusUtils.DOCUSAURUS_VERSION = "3.0.0";

      expect(printWarning("test", "DEPRECATED")).toMatchInlineSnapshot(`
        "

        :::warning[DEPRECATED]

        test

        :::"
      `);
    });
  });
});
