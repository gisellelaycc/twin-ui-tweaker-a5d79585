/**
 * Twin Matrix — Shared Library Barrel Export
 */

// Encoding engines
export {
    encodeContinuous, decodeContinuous,
    encodeDiscrete, decodeDiscrete,
    encodeTimeSeries, decodeTimeSeries,
    encodeMedia, decodeMedia,
    encodeNarrative, decodeNarrative, bitmaskJaccard,
    encodeVector, decodeVector,
    encodeIndexing, IndexingRegistry,
    encodeByType,
    buildSoulVector,
} from "./encoders";

export type {
    EncodingType,
    DimensionSpec,
    VectorEncoderConfig,
    AxisWeights,
} from "./encoders";

// Permutation cipher
export {
    generatePermutation,
    applyCipher,
    reverseCipher,
    generateSeedFromWallet,
    createAuthorizationMapping,
} from "./permutation";

export type { AuthorizationConfig, DimMapping } from "./permutation";
