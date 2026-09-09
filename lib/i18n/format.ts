/*
  Interpolation for dictionary strings. Deliberately tiny: a translator moves
  `{name}` to wherever the sentence needs it in their language, and word order
  stops being English's problem.
*/
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/*
  Two forms is enough for every locale the product ships in — Hindi, Marathi and
  Tamil pluralise like English, and Japanese, Korean and Chinese use one form
  for both, which translators handle by putting the same string in each.
*/
export function pluralize(
  forms: { one: string; other: string },
  count: number,
  values: Record<string, string | number> = {},
): string {
  return fill(count === 1 ? forms.one : forms.other, { count, ...values });
}
