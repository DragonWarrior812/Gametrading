import { Connection, 
    clusterApiUrl
} from "@solana/web3.js";
import { 
    TxVersion, 
    MAINNET_PROGRAM_ID,
    DEVNET_PROGRAM_ID, 
    LOOKUP_TABLE_CACHE,
} from "@raydium-io/raydium-sdk";

// Vite uses import.meta.env instead of process.env
const IS_MAINNET = import.meta.env.VITE_IS_MAINNET || "";

export const isMainNet = IS_MAINNET === "true";

export const networkUrl = !isMainNet 
    ? (import.meta.env.VITE_DEVNET_RPC || clusterApiUrl("devnet"))
    : (import.meta.env.VITE_MAINNET_RPC || clusterApiUrl("mainnet-beta"));
    
export const PROGRAMIDS = isMainNet ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID;
export const BUNDLR_URL = isMainNet ? "https://node1.bundlr.network" : "https://devnet.bundlr.network";
export const addLookupTableInfo = isMainNet ? LOOKUP_TABLE_CACHE : undefined;

export const connection = new Connection(networkUrl, "confirmed");

export const makeTxVersion = TxVersion.V0; // LEGACY

