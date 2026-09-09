/*
  Turning what someone typed into a search into the readings of it that might
  match a stored number.

  Stored numbers are bare national digits, but a receptionist searching may
  paste "+91 93266…" or "093266…". Search is partial, so the saved-number
  normaliser in lib/validations/enquiry.ts can't be reused directly — it expects
  a complete number. Instead we try each plausible reading of what was typed.

  Shared by every list that searches on phone. The phone number is the key the
  whole product is found by, so "search by phone" has to mean the same thing on
  students as it does on enquiries — one implementation is what guarantees that.
*/

// A shorter fragment than this matches too many numbers to be a useful search.
const MIN_PHONE_DIGITS = 3;

export function phoneCandidates(term: string): string[] {
  /*
    Only treat the term as a phone search when the whole thing is a number.
    Pulling the digits out of any query is wrong: "Test2" would search phones
    for "2" and match nearly every row.
  */
  const compact = term.replace(/[\s()+.-]/g, "");
  if (!/^\d+$/.test(compact) || compact.length < MIN_PHONE_DIGITS) return [];

  const digits = compact;
  const candidates = new Set<string>([digits]);

  const withoutTrunk = digits.replace(/^0+/, "");
  if (withoutTrunk) candidates.add(withoutTrunk);

  // Only treat a leading "91" as the country code when the typed text says so
  // (a "+91" or "0" prefix) or the number is too long to be national. In a bare
  // short query, "91…" is far more likely to be the start of the number itself.
  const hasCountryCode = /^\s*(?:\+\s*91|0)/.test(term) || withoutTrunk.length > 10;
  if (hasCountryCode && withoutTrunk.startsWith("91")) {
    const national = withoutTrunk.slice(2);
    if (national) candidates.add(national);
  }

  // The derived readings get the same floor as the typed one. Stripping the
  // zeros off a search for "0000004" leaves "4", which would match almost every
  // number in the database.
  return [...candidates].filter((candidate) => candidate.length >= MIN_PHONE_DIGITS);
}
