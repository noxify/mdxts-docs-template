import type { SectionLevelValue } from "@graphql-markdown/types";

import { DEFAULT_OPTIONS, SectionLevels } from "../../src/const/options";
import { HIDE_DEPRECATED, SHOW_DEPRECATED } from "../../src/const/strings";
import {
  printSection,
  printSectionItem,
  printSectionItems,
} from "../../src/section";
import { DirectiveLocation, Kind } from "graphql/language";
import {
  GraphQLDirective,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql/type";

describe("section", () => {
  describe("printSection()", () => {
    test("returns Markdown ### section by default", () => {
      expect.hasAssertions();

      const title = "section title";
      const content = ["section content"];

      const section = printSection(content, title, DEFAULT_OPTIONS);

      expect(section).toMatchInlineSnapshot(`
"### section title

####   



"
`);
    });

    test("returns Markdown ### section with collapsible content", () => {
      expect.hasAssertions();

      const content = ["section content"];

      const section = printSection(content, "", {
        ...DEFAULT_OPTIONS,
        level: SectionLevels.NONE as SectionLevelValue,
        collapsible: {
          dataOpen: HIDE_DEPRECATED,
          dataClose: SHOW_DEPRECATED,
        },
      });

      expect(section).toMatchInlineSnapshot(`
" 

<Details dataOpen={<><span className="deprecated">Hide deprecated</span></>} dataClose={<><span className="deprecated">Show deprecated</span></>}>

####   



</Details>

"
`);
    });

    test("returns Markdown custom section level", () => {
      expect.hasAssertions();

      const title = "section title";
      const content = ["section content"];

      const section = printSection(content, title, {
        ...DEFAULT_OPTIONS,
        level: "#" as SectionLevelValue,
      });

      expect(section).toMatchInlineSnapshot(`
"# section title

####   



"
`);
    });

    test("returns empty string if content is empty", () => {
      expect.hasAssertions();

      const title = "section title";
      const content: unknown[] = [];

      const section = printSection(content, title, DEFAULT_OPTIONS);

      expect(section).toBe("");
    });
  });

  describe("printSectionItems()", () => {
    test("returns Markdown one line per item", () => {
      expect.hasAssertions();

      const itemList = ["one", "two", "three"];

      const section = printSectionItems(itemList, DEFAULT_OPTIONS);

      expect(section).toMatchInlineSnapshot(`
"####   



####   



####   

"
`);
    });

    test("returns empty text if not a list", () => {
      expect.hasAssertions();

      const itemList = "list";

      const section = printSectionItems(itemList, DEFAULT_OPTIONS);

      expect(section).toMatch("");
    });
  });

  describe("printSectionItem()", () => {
    const noDoc = new GraphQLDirective({
      name: "noDoc",
      locations: [DirectiveLocation.FIELD],
    });

    test("returns Markdown #### link section with description", () => {
      expect.hasAssertions();

      const type = new GraphQLObjectType({
        name: "EntityTypeName",
        description: "Lorem ipsum",
        fields: {},
      });

      const section = printSectionItem(type, DEFAULT_OPTIONS);

      expect(section).toMatchInlineSnapshot(`
"#### [\`EntityTypeName\`](/types/objects/entity-type-name.mdx) <Badge class="badge badge--secondary" text="object"/> 
Lorem ipsum
"
`);
    });

    test("returns Markdown #### link section with multi-lines description", () => {
      expect.hasAssertions();

      const type = new GraphQLObjectType({
        name: "EntityTypeName",
        description: `Lorem ipsum dolor sit amet, 
consectetur adipiscing elit, 
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 

Ut enim ad minim veniam, 
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, 
sunt in culpa qui officia deserunt mollit anim id est laborum.`,
        fields: {},
      });

      const section = printSectionItem(type, DEFAULT_OPTIONS);

      expect(section).toMatchInlineSnapshot(`
"#### [\`EntityTypeName\`](/types/objects/entity-type-name.mdx) <Badge class="badge badge--secondary" text="object"/> 
Lorem ipsum dolor sit amet, 
consectetur adipiscing elit, 
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 

Ut enim ad minim veniam, 
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, 
sunt in culpa qui officia deserunt mollit anim id est laborum.
"
`);
    });

    test("returns Markdown #### link section with sub type is non-nullable", () => {
      expect.hasAssertions();

      const type = {
        name: "EntityTypeName",
        type: new GraphQLNonNull(
          new GraphQLObjectType({
            name: "NonNullableObjectType",
            fields: {},
          }),
        ),
      };

      const section = printSectionItem(type, DEFAULT_OPTIONS);

      expect(section).toMatchInlineSnapshot(`
"#### [\`EntityTypeName\`](#)<Bullet />[\`NonNullableObjectType!\`](/types/objects/non-nullable-object-type.mdx) <Badge class="badge badge--secondary" text="non-null"/> <Badge class="badge badge--secondary" text="object"/> 

"
`);
    });

    test("returns Markdown #### link section with sub type list and non-nullable", () => {
      expect.hasAssertions();

      const type = {
        name: "EntityTypeName",
        type: new GraphQLNonNull(
          new GraphQLList(
            new GraphQLObjectType({
              name: "NonNullableObjectType",
              fields: {},
            }),
          ),
        ),
      };

      const section = printSectionItem(type, DEFAULT_OPTIONS);

      expect(section).toMatchInlineSnapshot(`
"#### [\`EntityTypeName\`](#)<Bullet />[\`[NonNullableObjectType]!\`](/types/objects/non-nullable-object-type.mdx) <Badge class="badge badge--secondary" text="non-null"/> <Badge class="badge badge--secondary" text="object"/> 

"
`);
    });

    test("returns Markdown #### link section with parent type prefix", () => {
      expect.hasAssertions();

      const type = {
        name: "EntityTypeName",
      };

      const section = printSectionItem(type, {
        ...DEFAULT_OPTIONS,
        parentType: "parentTypePrefix",
      });

      expect(section).toMatchInlineSnapshot(`
"#### [<code style={{ fontWeight: 'normal' }}>parentTypePrefix.<b>EntityTypeName</b></code>](#)  

"
`);
    });

    test("returns Markdown #### link section with field parameters", () => {
      expect.hasAssertions();

      const type = {
        name: "EntityTypeName",
        args: [
          {
            name: "ParameterTypeName",
            type: GraphQLString,
          },
        ],
      };
      const section = printSectionItem(type, DEFAULT_OPTIONS);

      expect(section).toMatchInlineSnapshot(`
"#### [\`EntityTypeName\`](#)  

##### [<code style={{ fontWeight: 'normal' }}>EntityTypeName.<b>ParameterTypeName</b></code>](#)<Bullet />[\`String\`](/types/scalars/string.mdx) <Badge class="badge badge--secondary" text="scalar"/> 

"
`);
    });

    test("returns Markdown #### link section with non empty nullable list [!]", () => {
      expect.hasAssertions();

      const type = {
        name: "EntityTypeNameList",
        type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
      };

      const section = printSectionItem(type, DEFAULT_OPTIONS);

      expect(section).toMatchInlineSnapshot(`
"#### [\`EntityTypeNameList\`](#)<Bullet />[\`[Int!]\`](/types/scalars/int.mdx) <Badge class="badge badge--secondary" text="list"/> <Badge class="badge badge--secondary" text="scalar"/> 

"
`);
    });

    test("returns Markdown #### link section with non empty no nullable list [!]!", () => {
      expect.hasAssertions();

      const type = {
        name: "EntityTypeNameList",
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(GraphQLInt)),
        ),
      };

      const section = printSectionItem(type, DEFAULT_OPTIONS);

      expect(section).toMatchInlineSnapshot(`
"#### [\`EntityTypeNameList\`](#)<Bullet />[\`[Int!]!\`](/types/scalars/int.mdx) <Badge class="badge badge--secondary" text="non-null"/> <Badge class="badge badge--secondary" text="scalar"/> 

"
`);
    });

    test("returns no section if item matches skipDocDirective", () => {
      expect.hasAssertions();

      const type = {
        name: "EntityTypeNameList",
        astNode: {
          kind: Kind.FIELD,
          directives: [{ name: { value: "noDoc", appliedTo: [Kind.FIELD] } }],
        },
      };

      const section = printSectionItem(type, {
        ...DEFAULT_OPTIONS,
        skipDocDirectives: [noDoc],
      });

      expect(section).toBe("");
    });

    test("returns no section if item deprecated and SKIP", () => {
      expect.hasAssertions();

      const type = {
        name: "EntityTypeNameList",
        isDeprecated: true,
        astNode: {
          kind: Kind.FIELD,
          directives: [{ name: { value: "@noDoc" }, appliedTo: [Kind.FIELD] }],
        },
      };

      const section = printSectionItem(type, {
        ...DEFAULT_OPTIONS,
        skipDocDirectives: [noDoc],
        deprecated: "skip",
      });

      expect(section).toBe("");
    });

    test("returns Markdown #### link section without field parameters matching skipDocDirective", () => {
      expect.hasAssertions();

      const type = {
        name: "EntityTypeName",
        isDeprecated: true,
        args: [
          {
            name: "ParameterTypeName",
            type: GraphQLString,
            astNode: {
              kind: Kind.FIELD,
              directives: [{ name: { value: "doc", appliedTo: [Kind.FIELD] } }],
            },
          },
          {
            name: "ParameterSkipDoc",
            type: GraphQLString,
            astNode: {
              kind: Kind.FIELD,
              directives: [
                { name: { value: "noDoc" }, appliedTo: [Kind.FIELD] },
              ],
            },
          },
        ],
      };

      const section = printSectionItem(type, {
        ...DEFAULT_OPTIONS,
        skipDocDirectives: [noDoc],
      });

      expect(section).toMatchInlineSnapshot(`
"#### [\`EntityTypeName\`](#) <Badge class="badge badge--deprecated badge--secondary" text="deprecated"/> 
:::warning[DEPRECATED]

:::
##### [<code style={{ fontWeight: 'normal' }}>EntityTypeName.<b>ParameterTypeName</b></code>](#)<Bullet />[\`String\`](/types/scalars/string.mdx) <Badge class="badge badge--secondary" text="scalar"/> 



"
`);
    });
  });
});
