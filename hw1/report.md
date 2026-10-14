# HW 1 – Private Key → Public Key with Elliptic Curve

## 1. Goal

In Ethereum, a public key is obtained from a private key by elliptic-curve scalar multiplication on the curve secp256k1: Q = kG. The operation is easy to compute in the forward direction, while recovering k from Q is computationally infeasible.

This homework implements the same operation on a small curve, then studies the statistical properties of the map k → kG and discusses which of them matter for a one-way function.

## 2. The toy curve

The curve has the same equation as secp256k1, but over a tiny prime field:

```
y² = x³ + 7  (mod 17)
```

Checking every x from 0 to 16 gives 17 affine points, plus the point at infinity O, which acts as the identity element. The group therefore has **18 elements**:

```
(1,5) (1,12) (2,7) (2,10) (3,0) (5,8) (5,9) (6,6) (6,11)
(8,3) (8,14) (10,2) (10,15) (12,1) (12,16) (15,4) (15,13)   + O
```

The base point is **G = (1, 5)**. Its multiples are:

| k   | kG         |
| --- | ---------- |
| 1   | (1, 5)     |
| 2   | (2, 10)    |
| 3   | (5, 9)     |
| 4   | (12, 1)    |
| 5   | (12, 16)   |
| 6   | **(5, 8)** |
| 7   | (2, 7)     |
| 8   | (1, 12)    |
| 9   | O          |

G has **order 9**: 9G = O, so G generates only 9 of the 18 points, and kG = (k mod 9)G for any k. The order of every point divides 18 (Lagrange's theorem); on this curve there are points of order 2, 3, 6, 9 and 18. Note also the symmetry kG = −(9 − k)G: for example 3G = (5, 9) and 6G = (5, 8) share the same x.

## 3. Result

With G = (1, 5) and private key k = 6:

> **TOY PUBLIC KEY: Q = 6G = (5, 8)**

## 4. Statistical exploration

### Method

With p = 17 the group is so small that every statistic is trivial, so the experiments were repeated on a second toy curve, y² = x³ + 7 (mod 10007). This curve has 10 008 points, and the base point G = (5, 566) has order 10 008, so it generates the whole group.

For each curve, 5000 private keys k were drawn uniformly at random with `crypto.getRandomValues`, and Q = kG was computed. Six experiments were run on the coordinates of Q. Each run uses new random keys, so the figures below come from one representative run and vary slightly between runs.

### Results

| Experiment                                               | p = 17 (n = 9)   | p = 10007 (n = 10 008) |
| -------------------------------------------------------- | ---------------- | ---------------------- |
| 1. χ² of x vs uniform                                    | 16 254 (16 d.f.) | 19.2 (19 d.f.)         |
| 2. x values that can never appear                        | 13 of 17 (76.5%) | 5003 of 10 007 (50.0%) |
| 3. Average fraction of 1 bits in x                       | 0.301            | 0.462                  |
| 4. Pearson correlation between k and x                   | −0.015           | 0.021                  |
| 5. Avalanche: bits of x changed by flipping one bit of k | 43.0%            | 48.5%                  |
| 6. kG and (n − k)G with the same x                       | 100%             | 100%                   |
| 6. (k₁ + k₂)G = k₁G + k₂G                                | 100%             | 100%                   |

**1–2. Distribution and frequency of values.** On the large curve, the x coordinates spread evenly over the range (χ² close to its degrees of freedom). This apparent uniformity hides a strong constraint: exactly half of the possible x values never occur, because x³ + 7 must be a square mod p, and each x that occurs appears exactly twice, as (x, y) and (x, −y), except for the single point with y = 0. On the small curve, G generates only 4 distinct x values, so the distribution is far from uniform.

**3. Distribution of bits.** The low bits of x are balanced (≈ 0.5), but the highest bits are not, because x < p and p is not a power of two (10 007 < 2¹⁴). The average is therefore below 0.5.

**4. Correlation.** There is no linear correlation between k and the x coordinate of kG (|r| ≈ 0.02): consecutive private keys give public keys that look scattered.

**5. Avalanche.** On the large curve, flipping one bit of k changes on average 48.5% of the bits of x, close to the 50% expected from a hash function. On the small curve the effect is weaker (43%) because there are very few possible outputs.

**6. Algebraic structure.** Two exact relations hold in every case tested: kG and (n − k)G have the same x coordinate and opposite y, and the map is linear, (k₁ + k₂)G = k₁G + k₂G. These relations are invisible in experiments 1–5, but they show that k → kG is a group homomorphism, not a random function.

## 5. Discussion: one-way function vs hash function

The experiments show that k → kG looks random in simple tests: uniform coordinates, no correlation and an avalanche effect close to 50%. However, the properties that define it are different from those of a hash function.

What makes it useful as a one-way function is only the difficulty of inverting it. Its algebraic structure is not a weakness but its purpose: linearity is what allows a signature made with k to be verified with Q, which ECDSA relies on. A hash function must have the opposite behaviour. It must accept inputs of any length, have no exploitable algebraic relations, and produce outputs indistinguishable from random bits.
