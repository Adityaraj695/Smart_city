// Provenance-carrying values.
//
// The problem this solves: a dashboard that renders a hardcoded constant with
// the same visual authority as a computed one. An official cannot audit what
// the interface does not distinguish, and the numbers on these screens are
// meant to justify spending public money.
//
// Every figure the dashboard shows now declares where it came from. The rule
// is enforced at construction rather than by convention, because a convention
// is exactly what fails once three people are committing to the same file.

export const Source = {
  OFFICIAL: 'official',   // published figure or a direct count of real input
  COMPUTED: 'computed',   // derived arithmetically from other Measures
  ESTIMATED: 'estimated', // modelled, and must carry an interval
  SAMPLE: 'sample',       // belongs to the built-in demo dataset only
};

// How each kind is allowed to appear. Kept beside the type so the rule travels
// with the data instead of living in a style guide nobody opens.
export const RENDER = {
  [Source.OFFICIAL]:  { badge: null,       tone: 'normal',  trustworthy: true },
  [Source.COMPUTED]:  { badge: null,       tone: 'normal',  trustworthy: true },
  [Source.ESTIMATED]: { badge: 'est.',     tone: 'normal',  trustworthy: true },
  [Source.SAMPLE]:    { badge: 'SAMPLE',   tone: 'warning', trustworthy: false },
};

export class ProvenanceError extends Error {}

const WEAKNESS = [Source.OFFICIAL, Source.COMPUTED, Source.ESTIMATED, Source.SAMPLE];

/**
 * A number plus everything needed to defend it.
 *
 * `coverage` is deliberately separate from the interval: a figure can be
 * statistically tight and still describe only part of the uploaded area. Those
 * are different failures and merging them hides the second.
 */
export class Measure {
  constructor({
    value, source, unit = '', citation = null, method = null,
    interval = null, coverage = 1, notes = '', inputs = [],
  }) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new ProvenanceError(`Measure needs a numeric value, got ${value}`);
    }
    if (source === Source.OFFICIAL && !citation) {
      throw new ProvenanceError(
        'an OFFICIAL measure must name its source; if you cannot cite it, ' +
        'it is ESTIMATED or SAMPLE'
      );
    }
    if (source === Source.ESTIMATED) {
      if (!interval) {
        throw new ProvenanceError(
          'an ESTIMATED measure must carry an interval; a bare point estimate ' +
          'overstates what is known'
        );
      }
      if (!method) {
        throw new ProvenanceError('an ESTIMATED measure must name its method');
      }
    }
    if (interval) {
      const [lo, hi] = interval;
      if (lo > hi) throw new ProvenanceError(`interval inverted: (${lo}, ${hi})`);
      if (value < lo || value > hi) {
        throw new ProvenanceError(`value ${value} lies outside its interval (${lo}, ${hi})`);
      }
    }
    if (coverage < 0 || coverage > 1) {
      throw new ProvenanceError(`coverage must be in [0,1], got ${coverage}`);
    }

    this.value = value;
    this.source = source;
    this.unit = unit;
    this.citation = citation;
    this.method = method;
    this.interval = interval;
    this.coverage = coverage;
    this.notes = notes;
    this.inputs = inputs;
    Object.freeze(this);
  }

  /** Whether this figure may be presented as a finding about the user's data. */
  get trustworthy() {
    return RENDER[this.source].trustworthy;
  }

  get badge() {
    return RENDER[this.source].badge;
  }

  /** True when an estimate sits anywhere upstream. */
  get uncertain() {
    if (this.source === Source.ESTIMATED) return true;
    return this.inputs.some((m) => m.uncertain);
  }

  /**
   * Derive a new figure from this one.
   *
   * Arithmetic must not launder a sample constant into something that looks
   * like a finding about the uploaded file, so a single SAMPLE parent makes
   * the whole result SAMPLE. Coverage takes the minimum rather than an
   * average: combining a well-observed figure with a poorly-observed one
   * cannot improve what the data can see.
   */
  derive(value, { unit, method = null, notes = '', others = [] } = {}) {
    const parents = [this, ...others];
    const tainted = parents.some((m) => m.source === Source.SAMPLE);
    return new Measure({
      value,
      source: tainted ? Source.SAMPLE : Source.COMPUTED,
      unit: unit !== undefined ? unit : this.unit,
      method,
      coverage: Math.min(...parents.map((m) => m.coverage)),
      notes,
      inputs: parents,
    });
  }

  /** One line for a tooltip or an audit export. */
  explain() {
    const bits = [`${formatNumber(this.value)}${this.unit ? ' ' + this.unit : ''}`];
    if (this.interval) {
      bits.push(`(range ${formatNumber(this.interval[0])}–${formatNumber(this.interval[1])})`);
    }
    bits.push(`[${this.source}]`);
    if (this.citation) bits.push(`source: ${this.citation}`);
    if (this.method) bits.push(`method: ${this.method}`);
    if (this.coverage < 1) bits.push(`covers ~${Math.round(this.coverage * 100)}% of the area`);
    if (this.notes) bits.push(`— ${this.notes}`);
    return bits.join(' ');
  }

  /** Full chain, so any displayed number can be traced to its inputs. */
  trace(depth = 0) {
    const pad = '  '.repeat(depth);
    return [pad + this.explain(), ...this.inputs.flatMap((m) => m.trace(depth + 1))];
  }
}

function formatNumber(n) {
  if (!Number.isFinite(n)) return String(n);
  if (Math.abs(n) >= 1000) return n.toLocaleString('en-IN', { maximumFractionDigits: 1 });
  return Number(n.toFixed(4)).toString();
}

export function weakest(sources) {
  if (!sources.length) throw new ProvenanceError('cannot derive provenance from nothing');
  return sources.reduce((a, b) => (WEAKNESS.indexOf(b) > WEAKNESS.indexOf(a) ? b : a));
}

// --- shorthands --------------------------------------------------------------

export const official = (value, citation, opts = {}) =>
  new Measure({ value, source: Source.OFFICIAL, citation, ...opts });

export const computed = (value, method, opts = {}) =>
  new Measure({ value, source: Source.COMPUTED, method, ...opts });

export const estimated = (value, interval, method, opts = {}) =>
  new Measure({ value, source: Source.ESTIMATED, interval, method, ...opts });

export const sample = (value, opts = {}) =>
  new Measure({
    value,
    source: Source.SAMPLE,
    notes: opts.notes || 'from the built-in demo dataset, not from your file',
    ...opts,
  });

/**
 * Count something actually present in the uploaded GeoJSON.
 *
 * The common case, and the one the dashboard previously had no way to express:
 * "this is a real count of what you gave me", as opposed to a constant someone
 * typed into a component.
 */
export const counted = (value, what, fileName) =>
  new Measure({
    value,
    source: Source.OFFICIAL,
    citation: `counted from ${fileName || 'the uploaded GeoJSON'}`,
    notes: what,
  });
