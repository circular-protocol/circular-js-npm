
# Circular Protocol Node.js API

## Overview

This is the **Circular Protocol Node.js API**, an open-source Node.js package designed to interact with the Circular Blockchain platform and its associated Network Access Gateway (NAG). This package provides a comprehensive set of APIs to manage wallets, assets, smart contracts, and blockchain transactions.

### Version: 1.0.14
- **Creation Date**: 7/12/2022
- **Last Update**: 28/01/2025
- **Originator**: Gianluca De Novi, PhD
- **Contributors**: Danny De Novi, redorc83

---

## Features
- Smart contract management and execution.
- Wallet creation, registration, and balance retrieval.
- Blockchain transaction submission and querying.
- Asset and voucher management.
- Domain resolution and association with wallets.
- Analytics and blockchain data retrieval.
- Support for `secp256k1` signing and verification using elliptic curve cryptography.

---

## Installation

```bash
npm install circular-protocol-api
```

---

## Usage

### CommonJS
```js
const CircularProtocolAPI = require('circular-protocol-api');

(async () => {
    try {
        const blockchain = 'your-blockchain';
        const wallet = 'your-wallet';
        const walletExists = await CircularProtocolAPI.getWallet(blockchain, wallet); // 60-second timeout, 5-second interval
        console.log('Wallet exists:', walletExists);
    } catch (error) {
        console.error('Error:', error);
    }
})();
```

### ES Modules
```js
import CircularProtocolAPI from 'circular-protocol-api';

var walletExists = await CircularProtocolAPI.getWallet('BlockchainHex', 'WalletAddressHex');
console.log(walletExists)
```

---

## API Documentation

Find more on [GitBook](https://circular-protocol.gitbook.io/circular-sdk/api-docs/node.js)

---

## License

This library is open-source and available for both private and commercial use. For detailed terms, please refer to the LICENSE file provided in the repository.

---

## Contributors

- **Gianluca De Novi, PhD**
- **Danny De Novi**
- **redorc83**

For any issues or feature requests, feel free to open an issue or submit a pull request on the GitHub repository.
