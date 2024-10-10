import type {
  CustomDirectiveMap,
  CustomDirectiveMapItem,
  Maybe,
  MDXString,
  PrintTypeOptions,
} from "@graphql-markdown/types";

import { DEPRECATED, MARKDOWN_EOP, NO_DESCRIPTION_TEXT } from "./const/strings";
import { getCustomDirectiveResolver } from "./directive";
import { DOCUSAURUS_VERSION } from "@docusaurus/utils";
import {
  getConstDirectiveMap,
  hasDirective,
  isDeprecated,
} from "@graphql-markdown/graphql";
import { escapeMDX, isEmpty } from "@graphql-markdown/utils";

export const printCustomDirectives = (
  type: unknown,
  options?: PrintTypeOptions,
): string => {
  const constDirectiveMap = getConstDirectiveMap(
    type,
    options?.customDirectives,
  );

  if (isEmpty<CustomDirectiveMap>(constDirectiveMap)) {
    return "";
  }

  const content = Object.values<CustomDirectiveMapItem>(constDirectiveMap)
    .map((constDirectiveOption) => {
      return getCustomDirectiveResolver(
        "descriptor",
        type,
        constDirectiveOption,
        "",
      );
    })
    .filter((text) => {
      return typeof text === "string" && text.length > 0;
    })
    .map((text) => {
      return escapeMDX(text);
    })
    .join(MARKDOWN_EOP);

  return `${MARKDOWN_EOP}${content}`;
};

export const formatDescription = (
  type: unknown,
  replacement: Maybe<string> = NO_DESCRIPTION_TEXT,
): MDXString | string => {
  if (typeof type !== "object" || type === null) {
    return `${MARKDOWN_EOP}${escapeMDX(replacement)}`;
  }

  const description =
    "description" in type && typeof type.description === "string"
      ? type.description
      : replacement;
  return `${MARKDOWN_EOP}${escapeMDX(description)}`;
};

export const printWarning = (text?: string, title?: string): string => {
  const formattedText =
    typeof text !== "string" || text.trim() === ""
      ? MARKDOWN_EOP
      : `${MARKDOWN_EOP}${text}${MARKDOWN_EOP}`;

  if (DOCUSAURUS_VERSION.startsWith("2")) {
    return `${MARKDOWN_EOP}:::caution ${title}${formattedText}:::`;
  }
  return `${MARKDOWN_EOP}:::warning[${title}]${formattedText}:::`;
};

export const printDeprecation = (type: unknown): string => {
  if (typeof type !== "object" || type === null || !isDeprecated(type)) {
    return "";
  }

  const reason =
    "deprecationReason" in type && typeof type.deprecationReason === "string"
      ? escapeMDX(type.deprecationReason)
      : "";

  return printWarning(reason, DEPRECATED.toUpperCase());
};

export const printDescription = (
  type: unknown,
  options?: PrintTypeOptions,
  noText?: string,
): MDXString | string => {
  const description = formatDescription(type, noText);
  const customDirectives = printCustomDirectives(type, options);
  const deprecation = printDeprecation(type);
  return `${deprecation}${description}${customDirectives}`;
};

export const hasPrintableDirective = (
  type: unknown,
  options?: Pick<
    PrintTypeOptions,
    "deprecated" | "onlyDocDirectives" | "skipDocDirectives"
  >,
): boolean => {
  if (!type) {
    return false;
  }

  if (!options) {
    return true;
  }

  const skipDirective =
    "skipDocDirectives" in options && options.skipDocDirectives
      ? hasDirective(type, options.skipDocDirectives)
      : false;

  const skipDeprecated =
    "deprecated" in options &&
    options.deprecated === "skip" &&
    isDeprecated(type);

  const onlyDirective =
    "onlyDocDirectives" in options && options.onlyDocDirectives
      ? hasDirective(type, options.onlyDocDirectives, true)
      : true;

  return !(skipDirective || skipDeprecated) && onlyDirective;
};
