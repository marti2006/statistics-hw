// curve.js – Toy elliptic curve y^2 = x^3 + b (mod p)
// Used by both index.html and stats.html.

// ===== 1. Curve parameters =====
// The point at infinity O (the identity element) is represented as null.
const CURVE_17 = { p: 17, b: 7, G: { x: 1, y: 5 } };

// ===== 2. Modular arithmetic =====
// In JavaScript -3 % 17 is -3: this version always returns a value in [0, p-1].
function mod(a, p) {
  return ((a % p) + p) % p;
}

// Fast modular exponentiation: a^e mod p.
function powMod(a, e, p) {
  let result = 1;
  a = mod(a, p);
  while (e > 0) {
    if (e % 2 === 1) result = (result * a) % p;
    a = (a * a) % p;
    e = Math.floor(e / 2);
  }
  return result;
}

// Modular inverse via Fermat's little theorem: a^(p-2) mod p (p prime).
function inv(a, p) {
  if (mod(a, p) === 0) throw new Error("0 has no modular inverse");
  return powMod(a, p - 2, p);
}

// ===== 3. Point operations =====
function isOnCurve(P, curve) {
  if (P === null) return true; // the point at infinity always belongs to the group
  const { p, b } = curve;
  return mod(P.y * P.y, p) === mod(P.x * P.x * P.x + b, p);
}

function equal(P, Q) {
  if (P === null || Q === null) return P === Q;
  return P.x === Q.x && P.y === Q.y;
}

function neg(P, curve) {
  if (P === null) return null;
  return { x: P.x, y: mod(-P.y, curve.p) };
}

// Point addition.
function add(P, Q, curve) {
  const { p } = curve;
  if (P === null) return Q;                                // O + Q = Q
  if (Q === null) return P;                                // P + O = P
  if (P.x === Q.x && mod(P.y + Q.y, p) === 0) return null; // P + (-P) = O (also covers y = 0)

  let lambda;
  if (equal(P, Q)) {
    lambda = mod(3 * P.x * P.x * inv(2 * P.y, p), p);      // doubling: tangent line
  } else {
    lambda = mod((Q.y - P.y) * inv(Q.x - P.x, p), p);      // addition: line through P and Q
  }
  const x3 = mod(lambda * lambda - P.x - Q.x, p);
  const y3 = mod(lambda * (P.x - x3) - P.y, p);
  return { x: x3, y: y3 };
}

// All affine points of the curve (O excluded).
function allPoints(curve) {
  const { p, b } = curve;
  const roots = Array.from({ length: p }, () => []); // roots[v] = all y with y^2 = v
  for (let y = 0; y < p; y++) roots[(y * y) % p].push(y);
  const points = [];
  for (let x = 0; x < p; x++) {
    for (const y of roots[mod(x * x * x + b, p)]) points.push({ x, y });
  }
  return points;
}

// Order of a point: the smallest n > 0 with nP = O.
function order(P, curve) {
  let Q = P;
  let n = 1;
  while (Q !== null) {
    Q = add(Q, P, curve);
    n++;
  }
  return n;
}

// ===== 4. Scalar multiplication =====
// Naive method: G, 2G, 3G, ..., kG.
function scalarMultNaive(k, P, curve) {
  const steps = [{ step: 1, operation: "start", multiple: 1, point: P }];
  let R = P;
  for (let i = 2; i <= k; i++) {
    R = add(R, P, curve);
    steps.push({ step: i, operation: "add", multiple: i, point: R });
  }
  return { result: R, steps, operations: k - 1 };
}

// Double-and-add: reads the bits of k from left to right.
function scalarMult(k, P, curve) {
  const bits = k.toString(2);
  const steps = [{ step: 1, operation: "start", bit: bits[0], multiple: 1, point: P }];
  let R = P; // the first bit is always 1
  let multiple = 1;
  for (let i = 1; i < bits.length; i++) {
    R = add(R, R, curve);
    multiple *= 2;
    steps.push({ step: steps.length + 1, operation: "double", bit: bits[i], multiple, point: R });
    if (bits[i] === "1") {
      R = add(R, P, curve);
      multiple += 1;
      steps.push({ step: steps.length + 1, operation: "add", bit: bits[i], multiple, point: R });
    }
  }
  return { result: R, steps, operations: steps.length - 1 };
}

function format(P) {
  return P === null ? "O (point at infinity)" : `(${P.x}, ${P.y})`;
}

// Lets this file also be loaded by Node.js (for terminal tests).
if (typeof module !== "undefined") {
  module.exports = { CURVE_17, mod, powMod, inv, isOnCurve, equal, neg, add, allPoints, order, scalarMultNaive, scalarMult, format };
}