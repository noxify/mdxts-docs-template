import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLInputObjectType,
} from "graphql/type";

import { DEFAULT_OPTIONS } from "../../../src/const/options";

import { printCodeInput, printInputMetadata } from "../../../src/graphql/input";

describe("input", () => {
  const type = new GraphQLInputObjectType({
    name: "TestName",
    fields: {
      one: { type: GraphQLString },
      two: { type: GraphQLBoolean },
    },
  });

  describe("printInputMetadata()", () => {
    test("returns input metadata", () => {
      expect.hasAssertions();

      const metadata = printInputMetadata(type, DEFAULT_OPTIONS);

      expect(metadata).toMatchInlineSnapshot(`
"### Fields

#### [<code style={{ fontWeight: 'normal' }}>TestName.<b>one</b></code>](#)<Bullet />[\`String\`](/types/scalars/string.mdx) <Badge class="badge badge--secondary" text="scalar"/> 



#### [<code style={{ fontWeight: 'normal' }}>TestName.<b>two</b></code>](#)<Bullet />[\`Boolean\`](/types/scalars/boolean.mdx) <Badge class="badge badge--secondary" text="scalar"/> 



"
`);
    });
  });

  describe("printCodeInput()", () => {
    test("returns an input with its fields", () => {
      expect.hasAssertions();

      const code = printCodeInput(type, DEFAULT_OPTIONS);

      expect(code).toMatchInlineSnapshot(`
        "input TestName {
          one: String
          two: Boolean
        }"
      `);
    });
  });
});
