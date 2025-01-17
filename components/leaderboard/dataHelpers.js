// components/leaderboard/dataHelpers.js

/**
 * Return a date at midnight X days ago.
 */
export function daysAgo(numDays) {
  const d = new Date();
  d.setDate(d.getDate() - numDays);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Create a Map from "owner/name" -> model object,
 * with new fields (like run_count_10d, run_count_growth, etc.).
 * You can pass a string or array of field names to initialize.
 */
export function buildSlugMap(models, fieldNames) {
  const map = new Map();
  for (const m of models) {
    const slug = `${m.owner}/${m.name}`;
    if (Array.isArray(fieldNames)) {
      const newFields = {};
      for (const f of fieldNames) newFields[f] = 0;
      map.set(slug, { ...m, ...newFields });
    } else {
      // single field
      map.set(slug, { ...m, [fieldNames]: 0 });
    }
  }
  return map;
}
