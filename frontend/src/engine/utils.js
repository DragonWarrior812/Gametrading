import {
    PublicKey,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    ComputeBudgetProgram,
    VersionedTransaction,
    TransactionMessage
} from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    SPL_ACCOUNT_LAYOUT,
    InstructionType
} from '@raydium-io/raydium-sdk';
import {
    getComputeBudgetConfigHigh,
    getOptimalPriceAndBudget
} from './fee';

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getWalletTokenAccounts(connection, wallet) {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID
    });
    return walletTokenAccount.value.map((i) => ({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
}


export const prioritizeIxs = async (connection, ixs, feePayer) => {
    try {
        let transaction = new Transaction();

        // const {units, microLamports} = await getComputeBudgetConfigHigh();
        // console.log('units:', units);
        // console.log('microLamports:', microLamports);

        transaction.add(...ixs);
        transaction.recentBlockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
        transaction.feePayer = feePayer;
        const [priorityFee, computeUnits] = await getOptimalPriceAndBudget(transaction, connection);
        console.log('computeUnits:', computeUnits);
        console.log('priorityFee:', priorityFee);

        // build new tx
        let allIxs = [];

        // Add 20% buffer to compute units for safety
        const bufferedComputeUnits = Math.min(Math.ceil(computeUnits * 1.2), 1_400_000);
        
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
            units: bufferedComputeUnits /* units */
        });
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: priorityFee /* microLamports */
        });

        allIxs.push(modifyComputeUnits);
        allIxs.push(addPriorityFee);
        allIxs.push(...ixs);

        return allIxs;
    } catch (e) {
        console.error(e);
        return ixs;
    }
};

export const prioritizeTx = async (tx) => {
    try {
        let modifyComputeUnits;
        let addPriorityFee;
        let allIxTypes = [];
        let allIxs = [];

        const { units, microLamports } = await getComputeBudgetConfigHigh();
        // console.log('units:', units);
        // console.log('microLamports:', microLamports);

        modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
            units: units * 2
        });

        addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: microLamports
        });

        allIxTypes.push(InstructionType.setComputeUnitLimit);
        allIxs.push(modifyComputeUnits);

        allIxTypes.push(InstructionType.setComputeUnitPrice);
        allIxs.push(addPriorityFee);

        allIxTypes.push(...tx.instructionTypes);
        allIxs.push(...tx.instructions);

        return {
            instructionTypes: allIxTypes,
            instructions: allIxs,
            signers: [],
            lookupTableAddress: {}
        };
    } catch (e) {
        console.error(e);
        return {
            instructionTypes: tx.instructionTypes,
            instructions: tx.instructions,
            signers: [],
            lookupTableAddress: {}
        };
    }
};

