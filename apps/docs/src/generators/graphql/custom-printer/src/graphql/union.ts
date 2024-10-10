import type {
  GraphQLObjectType,
  MDXString,
  PrintTypeOptions,
} from "@graphql-markdown/types";

import { printSection } from "../section";
import { getTypeName, isUnionType } from "@graphql-markdown/graphql";

export const printUnionMetadata = (
  type: unknown,
  options: PrintTypeOptions,
): MDXString | string => {
  if (!isUnionType(type)) {
    return "";
  }

  return printSection(type.getTypes(), "Possible types", {
    ...options,
    parentType: type.name,
  });
};

export const printCodeUnion = (
  type: unknown,
  options?: PrintTypeOptions, // eslint-disable-line @typescript-eslint/no-unused-vars
): string => {
  if (!isUnionType(type)) {
    return "";
  }

  let code = `union ${getTypeName(type)} = `;
  code += type
    .getTypes()
    .map((v: GraphQLObjectType<unknown, unknown>): string => {
      return getTypeName(v);
    })
    .join(" | ");

  return code;
};
