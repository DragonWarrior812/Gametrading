
import { PublicKey } from '@solana/web3.js';
import { 
    TOKEN_PROGRAM_ID, 
    ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { 
    PUMPFUN_PROGRAM_ID, 
    MAINSTATE_PREFIX_SEED, 
    POOLSTATE_PREFIX_SEED
} from './constants';

const asyncGetPda = async (seeds: (Buffer | Uint8Array)[], programId: PublicKey): Promise<[PublicKey, number]> => {
    const [pubKey, bump] = await PublicKey.findProgramAddress(seeds, programId);
    return [pubKey, bump];
};

export const getMainStateKey = async (owner: PublicKey): Promise<PublicKey> => {
    const [mainStateKey] = await asyncGetPda(
        [
            Buffer.from(MAINSTATE_PREFIX_SEED),
            owner.toBuffer()
        ], 
        PUMPFUN_PROGRAM_ID
    );
    return mainStateKey;
};

export const getPoolStateKey = async (baseMint: PublicKey, quoteMint: PublicKey): Promise<PublicKey> => {
    const [poolStateKey] = await asyncGetPda(
        [
            Buffer.from(POOLSTATE_PREFIX_SEED), 
            baseMint.toBuffer(), 
            quoteMint.toBuffer(),
        ], 
        PUMPFUN_PROGRAM_ID
    );
    return poolStateKey;
};

export const getAssociatedTokenAccountKey = async (ownerPubkey: PublicKey, tokenMint: PublicKey): Promise<PublicKey> => {
    const [associatedTokenAccountKey] = await PublicKey.findProgramAddress(
        [
            ownerPubkey.toBuffer(), 
            TOKEN_PROGRAM_ID.toBuffer(), 
            tokenMint.toBuffer()
        ], 
        ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return associatedTokenAccountKey;
};
