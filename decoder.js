// decoding the transaction without API or Library
const rawTransactionHex = "020000000001010ccc140e766b5dbc884ea2d780c5e91e4eb77597ae64288a42575228b79e234900000000000000000002bd37060000000000225120245091249f4f29d30820e5f36e1e5d477dc3386144220bd6f35839e94de4b9cae81c00000000000016001416d31d7632aa17b3b316b813c0a3177f5b6150200140838a1f0f1ee607b54abf0a3f55792f6f8d09c3eb7a9fa46cd4976f2137ca2e3f4a901e314e1b827c3332d7e1865ffe1d7ff5f5d7576a9000f354487a09de44cd00000000"; // Your raw transaction hex

// Function to decode hexadecimal string to bytes
function hexToBytes(hex) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return Buffer.from(bytes);
}

// Function to read variable-length integer (varInt) from buffer
function readVarInt(buffer, offset) {
    let result = 0;
    let shift = 0;
    let currentByte;

    do {
        if (offset >= buffer.length) {
            throw new Error(`Offset out of bounds when reading varInt. Offset: ${offset}, Buffer length: ${buffer.length}`);
        }

        currentByte = buffer.readUInt8(offset);
        result |= (currentByte & 0x7f) << shift;
        shift += 7;
        offset++;
    } while (currentByte & 0x80);

    return { value: result, bytesRead: offset };
}

// Function to read 64-bit unsigned integer from buffer
function readUInt64LE(buffer, offset) {
    const low = buffer.readUInt32LE(offset);
    const high = buffer.readUInt32LE(offset + 4);
    return BigInt(low) + (BigInt(high) << BigInt(32));
}

// Function to deserialize Bitcoin transaction
function deserializeTransaction(rawHex) {
    const buffer = hexToBytes(rawHex);
    let offset = 0;

    // Version
    if (offset + 4 > buffer.length) {
        throw new Error(`Offset out of bounds when reading version. Offset: ${offset}, Buffer length: ${buffer.length}`);
    }
    const version = buffer.readUInt32LE(offset);
    offset += 4;

    // Input count
    const { value: inputCount, bytesRead: inputCountBytes } = readVarInt(buffer, offset);
    offset += inputCountBytes;

    // Inputs
    const inputs = [];
    for (let i = 0; i < inputCount; i++) {
        // Input transaction hash (reverse byte order)
        if (offset + 32 > buffer.length) {
            throw new Error(`Offset out of bounds when reading inputTxHash. Offset: ${offset}, Buffer length: ${buffer.length}`);
        }
        const inputTxHash = buffer.slice(offset, offset + 32).reverse().toString('hex');
        offset += 32;

        // Input index
        if (offset + 4 > buffer.length) {
            throw new Error(`Offset out of bounds when reading inputIndex. Offset: ${offset}, Buffer length: ${buffer.length}`);
        }
        const inputIndex = buffer.readUInt32LE(offset);
        offset += 4;

        // Script length
        const { value: scriptLength, bytesRead: scriptLengthBytes } = readVarInt(buffer, offset);
        offset += scriptLengthBytes;

        // Script
        if (offset + scriptLength > buffer.length) {
            throw new Error(`Offset out of bounds when reading input script. Offset: ${offset}, Buffer length: ${buffer.length}`);
        }
        const script = buffer.slice(offset, offset + scriptLength).toString('hex');
        offset += scriptLength;

        // Sequence
        if (offset + 4 > buffer.length) {
            throw new Error(`Offset out of bounds when reading sequence. Offset: ${offset}, Buffer length: ${buffer.length}`);
        }
        const sequence = buffer.readUInt32LE(offset);
        offset += 4;

        inputs.push({ inputTxHash, inputIndex, script, sequence });
    }

    // Output count
    const { value: outputCount, bytesRead: outputCountBytes } = readVarInt(buffer, offset);
    offset += outputCountBytes;

    // Outputs
    const outputs = [];
    for (let i = 0; i < outputCount; i++) {
        // Output value
        if (offset + 8 > buffer.length) {
            throw new Error(`Offset out of bounds when reading output value. Offset: ${offset}, Buffer length: ${buffer.length}`);
        }
        const value = readUInt64LE(buffer, offset);
        offset += 8;

        // Script length
        const { value: scriptLength, bytesRead: scriptLengthBytes } = readVarInt(buffer, offset);
        offset += scriptLengthBytes;

        // Script
        if (offset + scriptLength > buffer.length) {
            throw new Error(`Offset out of bounds when reading output script. Offset: ${offset}, Buffer length: ${buffer.length}`);
        }
        const script = buffer.slice(offset, offset + scriptLength).toString('hex');
        offset += scriptLength;

        outputs.push({ value, script });
    }

    // Locktime
    if (offset + 4 > buffer.length) {
        throw new Error(`Offset out of bounds when reading locktime. Offset: ${offset}, Buffer length: ${buffer.length}`);
    }
    const locktime = buffer.readUInt32LE(offset);
    offset += 4;

    return {
        version,
        inputs,
        outputs,
        locktime
    };
}

// Usage
try {
    const deserializedTransaction = deserializeTransaction(rawTransactionHex);
    console.log(deserializedTransaction);
} catch (error) {
    console.error(error);
}


// A possible error that requires a fix -- Error: Offset out of bounds when reading output script. Offset: 56, Buffer length: 193