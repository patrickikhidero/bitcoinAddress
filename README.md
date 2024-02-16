## A repository for: Wallet creation | Decoding raw transactions | Building Transactions


## Table of Contents
Installation
Usage
Contributing


# Clone the repository
git clone https://github.com/patrickikhidero/bitcoinAddress.git

# Navigate to the project directory
cd bitcoinAddress

# Install dependencies
npm install

# Run and test each script
`node walletCreation` -- Wallet creation

`node transactionDecoder` -- Decoding raw transactions (You need an API key from `cryptoapis.io` and the raw transaction you want to decode in order to run this)

`node trxnBuild` -- Building Transactions

# Note
The trxnBuild script is expected to achieve the following:
- Generate the redeem script
- Generate an Address
- Construct a transaction that sends Bitcoins to the address.
- Construct another transaction that spends from the above previous transaction given that you have both locking and unlock scripts.

This last requirement is currently failing and the project is a work in progress. We are actively working on resolving the issues and improving the script. Feel free to check back later for updates.

Contributing
Contributions are welcome! If you'd like to contribute to this project, feel free to fork the repository, make your changes, and submit a pull request.


# Contact
For any inquiries or feedback, please contact me at codepreneur414@gmail.com