// Implemention of ECIES specified in https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme
'use strict';

const crypto = require('crypto');
const assert = require('assert');
const createECDH = require('./createECDH');

// E
function symmetricEncrypt(cypherName, iv, key, plaintext) {
    var cipher;
    if (iv) {
        cipher = crypto.createCipheriv(cypherName, key, iv);
    }
    else {
        cipher = crypto.createCipher(cypherName, key);
    }
    var firstChunk = cipher.update(plaintext);
    var secondChunk = cipher.final();
    return Buffer.concat([firstChunk, secondChunk]);
}

// E-1
function symmetricDecrypt(cypherName, iv, key, ciphertext) {
    var cipher;
    if (iv) {
        cipher = crypto.createDecipheriv(cypherName, key, iv);

    }
    else {
        cipher = crypto.createDecipher(cypherName, key);

    }
    var firstChunk = cipher.update(ciphertext);
    var secondChunk = cipher.final();
    return Buffer.concat([firstChunk, secondChunk]);
}

// KDF
function hashMessage(cypherName, message) {
    return crypto.createHash(cypherName).update(message).digest();
}

// MAC
function macMessage(cypherName, key, message) {
    return crypto.createHmac(cypherName, key).update(message).digest();
}

// Compare two buffers in constant time to prevent timing attacks.
function equalConstTime(b1, b2) {
    if (b1.length !== b2.length) {
        return false;
    }
    var result = 0;
    for (var i = 0; i < b1.length; i++) {
        result |= b1[i] ^ b2[i];  // jshint ignore:line
    }
    return result === 0;
}

function makeUpOptions(options) {
    options = options || {};
    if (options.hashName == undefined) {
        options.hashName = 'sha256';
    }
    if (options.hashLength == undefined) {
        options.hashLength = hashMessage(options.hashName, '').length;
    }
    if (options.macName == undefined) {
        options.macName = 'sha256';
    }
    if (options.macLength == undefined) {
        options.macLength = macMessage(options.hashName, '', '').length;
    }
    if (options.curveName == undefined) {
        options.curveName = 'secp256k1';
    }
    if (options.symmetricCypherName == undefined) {
        options.symmetricCypherName = 'aes-256-ecb';
        // use options.iv to determine is the cypher in ecb mode
        options.iv = null;
    }
    if (options.keyFormat == undefined) {
        options.keyFormat = 'uncompressed';
    }

    // S1 (optional shared information1)
    if (options.s1 == undefined) {
        options.s1 = new Buffer([]);
    }
    // S2 (optional shared information2)
    if (options.s2 == undefined) {
        options.s2 = new Buffer([]);
    }
    return options;
}

exports.encrypt = function(publicKey, message, options) {
    options = makeUpOptions(options);

    var ecdh = createECDH(options.curveName);
    // R
    var R = ecdh.generateKeys(null, options.keyFormat);
    // S
    var sharedSecret = ecdh.computeSecret(publicKey);

    // uses KDF to derive a symmetric encryption and a MAC keys:
    // Ke || Km = KDF(S || S1)
    var hash = hashMessage(
        options.hashName,
        Buffer.concat(
            [sharedSecret, options.s1],
            sharedSecret.length + options.s1.length
        )
    );
    // Ke
    var encryptionKey = hash.slice(0, hash.length / 2);
    // Km
    var macKey = hash.slice(hash.length / 2);

    // encrypts the message:
    // c = E(Ke; m);
    var cipherText = symmetricEncrypt(options.symmetricCypherName, options.iv, encryptionKey, message);

    // computes the tag of encrypted message and S2:
    // d = MAC(Km; c || S2)
    var tag = macMessage(
        options.macName,
        macKey,
        Buffer.concat(
            [cipherText, options.s2],
            cipherText.length + options.s2.length
        )
    );
    // outputs R || c || d
    return Buffer.concat([R, cipherText, tag]);
};

exports.decrypt = function(ecdh, message, options) {
    options = makeUpOptions(options);

    var publicKeyLength = ecdh.getPublicKey(null, options.keyFormat).length;
    // R
    var R = message.slice(0, publicKeyLength);
    // c
    var cipherText = message.slice(publicKeyLength, message.length - options.macLength);
    // d
    var messageTag = message.slice(message.length - options.macLength);

    // S
    var sharedSecret = ecdh.computeSecret(R);

    // derives keys the same way as Alice did:
    // Ke || Km = KDF(S || S1)
    var hash = hashMessage(
        options.hashName,
        Buffer.concat(
            [sharedSecret, options.s1],
            sharedSecret.length + options.s1.length
        )
    );
    // Ke
    var encryptionKey = hash.slice(0, hash.length / 2);
    // Km
    var macKey = hash.slice(hash.length / 2);

    // uses MAC to check the tag
    var keyTag = macMessage(
        options.macName,
        macKey,
        Buffer.concat(
            [cipherText, options.s2],
            cipherText.length + options.s2.length
        )
    );

    // outputs failed if d != MAC(Km; c || S2);
    assert(equalConstTime(messageTag, keyTag), "Bad MAC");

    // uses symmetric encryption scheme to decrypt the message
    // m = E-1(Ke; c)
    return symmetricDecrypt(options.symmetricCypherName, options.iv, encryptionKey, cipherText);
}
