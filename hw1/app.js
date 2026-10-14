// app.js – User interface and tests. The math lives in curve.js.

const curve = CURVE_17;
const POINTS = allPoints(curve);

const kInput = document.getElementById("k");
const baseSelect = document.getElementById("base");
const methodSelect = document.getElementById("method");
const errorText = document.getElementById("error");
const infoText = document.getElementById("info");
const resultText = document.getElementById("result");
const tableBody = document.querySelector("#steps tbody");

// Fill the menu with every valid point and its order.
POINTS.forEach((P, i) => {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = `${format(P)} – order ${order(P, curve)}`;
  if (equal(P, curve.G)) option.selected = true;
  baseSelect.appendChild(option);
});

// Read and validate the inputs. Returns null if they are not valid.
function readInput() {
  const text = kInput.value.trim();
  const k = Number(text);
  if (text === "" || !Number.isInteger(k) || k < 1) return { error: "The private key k must be an integer ≥ 1." };
  if (k > 100000) return { error: "Please use k ≤ 100000." };
  if (methodSelect.value === "naive" && k > 200) return { error: "The naive method is limited to k ≤ 200: use double-and-add." };
  return { k, P: POINTS[Number(baseSelect.value)] };
}

function compute() {
  errorText.textContent = "";
  infoText.textContent = "";
  resultText.textContent = "";
  tableBody.innerHTML = "";

  const input = readInput();
  if (input.error) {
    errorText.textContent = input.error;
    return;
  }
  const { k, P } = input;
  const res = methodSelect.value === "naive" ? scalarMultNaive(k, P, curve) : scalarMult(k, P, curve);
  const n = order(P, curve);

  for (const s of res.steps) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${s.step}</td><td>${s.operation}</td><td>${s.bit ?? "–"}</td><td>${s.multiple}·G</td><td>${format(s.point)}</td>`;
    tableBody.appendChild(row);
  }

  resultText.textContent = `TOY PUBLIC KEY  Q = ${k}·G = ${format(res.result)}`;
  infoText.textContent = `Point operations: ${res.operations}. Order of G: ${n}.` +
    (k >= n ? ` Since ${n}·G = O, ${k}·G = ${k % n}·G.` : "");

  // Also print G, 2G, 3G, ..., kG in the console (F12).
  console.table(res.steps.map(s => ({ step: s.step, operation: s.operation, multiple: s.multiple, point: format(s.point) })));
}

document.getElementById("compute").addEventListener("click", compute);
kInput.addEventListener("keydown", e => { if (e.key === "Enter") compute(); });

// ===== Tests – results in the browser console (F12) =====
(function runTests() {
  const G = curve.G;
  console.assert(mod(-3, 17) === 14, "mod with a negative number");
  for (let a = 1; a < 17; a++) console.assert(mod(a * inv(a, 17), 17) === 1, `inverse of ${a}`);
  console.assert(isOnCurve(G, curve), "G is on the curve");
  console.assert(!isOnCurve({ x: 1, y: 6 }, curve), "(1, 6) is not on the curve");
  console.assert(POINTS.length + 1 === 18, "the curve has 18 points including O");
  console.assert(equal(add(G, G, curve), { x: 2, y: 10 }), "2G = (2, 10)");
  console.assert(add(G, neg(G, curve), curve) === null, "G + (-G) = O");
  console.assert(inv(10, 17) === 12, "inverse of 10 is 12");
  const n = order(G, curve);
  console.assert(18 % n === 0, "the order of G divides 18");
  for (let k = 1; k <= 50; k++) {
    const a = scalarMultNaive(k, G, curve).result;
    const b = scalarMult(k, G, curve).result;
    console.assert(equal(a, b), `the two methods differ for k = ${k}`);
    console.assert(equal(b, scalarMult(k + n, G, curve).result), `kG ≠ (k+n)G for k = ${k}`);
  }
  console.log(`All tests done. Order of G = ${n}.`);
})();

compute();