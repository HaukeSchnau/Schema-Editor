export function toSnakeCase(string: String) {
  return string
    .split(/(?=[A-Z])/)
    .join("_")
    .toLowerCase();
}

export function pluralize(str: string) {
  if (str.endsWith("y")) return `${str.slice(0, str.length - 1)}ies`;

  return `${str}s`;
}
