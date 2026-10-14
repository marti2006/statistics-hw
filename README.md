#statistics homework

This repository contains two homeworks on the cryptography behind Ethereum.

## Repository structure

```
statistics-hw/
├── README.md
├── hw1/                     JavaScript / HTML / CSS, runs in the browser
│   ├── index.html
│   ├── app.js
│   ├── curve.js
│   ├── stats.html
│   ├── stats.js
│   ├── style.css
│   └── report.md
└── hw2/
    └── Ethereum_pipeline.pdf
```

## HW 1 – Elliptic curve

A small JavaScript program shows how a private key k generates a public key Q = kG by elliptic-curve scalar multiplication, the same operation Ethereum performs on secp256k1. It uses the toy curve y² = x³ + 7 (mod 17) with base point G = (1, 5).

### How to run

**Online:** open the [https://marti2006.github.io/statistics-hw/hw1/]

## HW 2 – Ethereum pipeline: from mnemonic to address

A written report on the cryptographic pipeline used by Ethereum wallets:
[Report](hmwk2/Ethereum_pipeline.pdf)

```
Mnemonic ─BIP-39─▶ Seed ─BIP-32/BIP-44─▶ Private key ─secp256k1─▶ Public key ─Keccak-256─▶ Address ─EIP-55─▶ Checksummed address
```

The report covers:

- **Cryptographic techniques:** definitions of key generation, key derivation, public-key cryptography, hashing, checksums and encoding.
- **The pipeline:** each step with the technique and the standard involved: BIP-39 (mnemonic and PBKDF2 seed), BIP-32 (child key derivation), BIP-44 (derivation path), secp256k1, Keccak-256 and EIP-55.
- **Statistical properties** of each step: entropy, BIP-39 checksum, PBKDF2/HMAC-SHA512, secp256k1, Keccak-256 and EIP-55.
- **Historical overview:** from RSA (1977) to EIP-55 (2016).
