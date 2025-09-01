/**
 * Generates a custom Snowflake ID.
 * 
 * Structure:
 * [41 bits timestamp] [11 bits machine ID (from "Trans Pride")] [12 bits random]
 */

let lastTimestamp = 0n;
let sequence = 0n;

function generateSnowflake() {
  const EPOCH = 1700000000000n; // Custom epoch (Nov 2023)
  const now = BigInt(Date.now());

  let timestamp = now - EPOCH;

  if (timestamp === lastTimestamp) {
    sequence++;
    if (sequence >= 4096n) {
      while (BigInt(Date.now()) - EPOCH <= lastTimestamp) {}
      timestamp = BigInt(Date.now()) - EPOCH;
      sequence = 0n;
    }
  } else {
    sequence = 0n;
  }

  lastTimestamp = timestamp;

  const phrase = "Trans Pride";
  let hash = 0;
  for (let i = 0; i < phrase.length; i++) {
    hash = (hash * 31 + phrase.charCodeAt(i)) % 2048;
  }
  const machineId = BigInt(hash);

  const snowflake = (timestamp << 23n) | (BigInt(hash) << 12n) | sequence;
  return snowflake.toString();
}

export { generateSnowflake };