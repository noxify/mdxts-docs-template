import type { PrintTypeOptions } from "@graphql-markdown/types";

import { printCodeField } from "../code";
import { MARKDOWN_CODE_INDENTATION, MARKDOWN_EOL } from "../const/strings";
import { printMetadataSection, printSection } from "../section";
import { getFields, getTypeName } from "@graphql-markdown/graphql";

const printImplementedInterfaceMetadata = (
  type: unknown,
  options: PrintTypeOptions,
): string => {
  if (
    typeof type !== "object" ||
    type === null ||
    !("getInterfaces" in type) ||
    typeof type.getInterfaces !== "function"
  ) {
    return "";
  }

  return printSection(type.getInterfaces(), "Interfaces", options);
};

export const printObjectMetadata = (
  type: unknown,
  options: PrintTypeOptions,
): string => {
  const interfaceMeta = printImplementedInterfaceMetadata(type, options);
  const metadata = printMetadataSection(
    type,
    getFields(type),
    "Fields",
    options,
  );

  return `${metadata}${interfaceMeta}`;
};

export const printCodeType = (
  type: unknown,
  entity: string,
  options: PrintTypeOptions,
): string => {
  if (typeof type !== "object" || type === null) {
    return "";
  }

  const name = getTypeName(type);
  const extendsInterface =
    "getInterfaces" in type &&
    typeof type.getInterfaces === "function" &&
    type.getInterfaces().length > 0
      ? ` implements ${type
          .getInterfaces()
          .map((field: unknown): string => {
            return getTypeName(field);
          })
          .join(", ")}`
      : "";
  const typeFields = getFields(type)
    .map((field: unknown): string => {
      const f = printCodeField(field, options, 1);
      return f.length > 0 ? `${MARKDOWN_CODE_INDENTATION}${f}` : "";
    })
    .filter((field) => {
      return field.length > 0;
    })
    .join("");

  return `${entity} ${name}${extendsInterface} {${MARKDOWN_EOL}${typeFields}}`;
};

export const printCodeObject = (
  type: unknown,
  options: PrintTypeOptions,
): string => {
  return printCodeType(type, "type", options);
};
