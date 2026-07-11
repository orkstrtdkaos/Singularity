// genschema.js — a small, dependency-free JSON-Schema checker + repair helper for the
// generative pipeline (SNG-BATCH-9). We have no build step and vendor nothing, so this
// implements exactly the subset the derived npc/location/arc schemas use:
//   type (incl. union ["string","null"]) · required · properties (recursive) ·
//   items (array element schema) · enum · additionalProperties (the number-map pattern).
// It is NOT a full draft-2020-12 implementation — it is the validator those three
// schemas need, and the green gate proves it accepts the whole authored corpus.

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v; // string | number | boolean | object
}

function typeMatches(v, t) {
  if (Array.isArray(t)) return t.some(tt => typeMatches(v, tt));
  const actual = typeOf(v);
  if (t === "integer") return actual === "number" && Number.isInteger(v);
  if (t === "number") return actual === "number";
  return actual === t;
}

/** Validate `obj` against a (subset) JSON schema. Returns { valid, errors:[path/message] }. */
export function validate(obj, schema, path = "") {
  const errors = [];
  const walk = (node, sch, p) => {
    if (!sch || typeof sch !== "object") return;
    if (sch.type && !typeMatches(node, sch.type)) {
      errors.push(`${p || "(root)"}: expected ${JSON.stringify(sch.type)}, got ${typeOf(node)}`);
      return; // type is wrong — deeper checks would be noise
    }
    if (sch.enum && !sch.enum.includes(node)) {
      errors.push(`${p || "(root)"}: ${JSON.stringify(node)} not in enum ${JSON.stringify(sch.enum)}`);
    }
    if (typeOf(node) === "object") {
      for (const req of sch.required || []) {
        if (!(req in node)) errors.push(`${p ? p + "." : ""}${req}: required field missing`);
      }
      const props = sch.properties || {};
      for (const [k, v] of Object.entries(node)) {
        if (props[k]) walk(v, props[k], `${p ? p + "." : ""}${k}`);
        else if (sch.additionalProperties && typeof sch.additionalProperties === "object") {
          walk(v, sch.additionalProperties, `${p ? p + "." : ""}${k}`);
        }
      }
    }
    if (typeOf(node) === "array" && sch.items) {
      node.forEach((el, i) => walk(el, sch.items, `${p}[${i}]`));
    }
  };
  walk(obj, schema, path);
  return { valid: errors.length === 0, errors };
}

/** Which required keys is `obj` missing (top level only)? Used by generate()'s repair step. */
export function missingRequired(obj, schema) {
  if (!obj || typeof obj !== "object") return [...(schema.required || [])];
  return (schema.required || []).filter(k => !(k in obj));
}

/** A safe default value for a property, from its schema declaration. Repair uses this
 *  when context can't supply a better one — a stub that VALIDATES, never a fabricated fact. */
export function defaultFor(propSchema) {
  if (!propSchema) return "";
  const t = Array.isArray(propSchema.type) ? propSchema.type[0] : propSchema.type;
  if (propSchema.enum) return propSchema.enum[propSchema.enum.length - 1]; // most-permissive-last convention (e.g. scale 'local')
  switch (t) {
    case "array": return [];
    case "object": return {};
    case "integer": case "number": return 0;
    case "boolean": return false;
    case "null": return null;
    default: return "";
  }
}
