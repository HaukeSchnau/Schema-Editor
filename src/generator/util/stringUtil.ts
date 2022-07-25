export function toSnakeCase(string: string) {
  return string
    .split(/(?=[A-Z])/)
    .join("_")
    .toLowerCase();
}

export function pluralize(str: string) {
  if (str.endsWith("y")) return `${str.slice(0, str.length - 1)}ies`;
  if (str.endsWith("ss")) return `${str}es`;
  if (str.endsWith("s")) return str;

  return `${str}s`;
}

export function singularize(str: string) {
  if (str.endsWith("ies")) return `${str.slice(0, str.length - 3)}y`;
  if (str.endsWith("sses")) return str.slice(0, str.length - 2);
  if (str.endsWith("ss")) return str;
  if (str.endsWith("s")) return str.slice(0, str.length - 1);
  return str;
}

export function toCamelCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}
