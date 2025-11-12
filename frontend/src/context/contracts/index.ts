
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
// import * as anchor from '@project-serum/anchor';
// import { Idl, Program, AnchorProvider, BN } from '@project-serum/anchor';
import * as anchor from '@coral-xyz/anchor';
import { Idl, Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { 
    LAMPORTS_PER_SOL, 
    PublicKey, 
    SystemProgram, 
    Transaction
} from '@solana/web3.js';
import { 
    NATIVE_MINT, 
    TOKEN_PROGRAM_ID, 
    ASSOCIATED_TOKEN_PROGRAM_ID, 
    getMint, 
    getAssociatedTokenAddressSync
} from '@solana/spl-token';

import { PUMPFUN_PROGRAM_ID, FEE_PRE_DIV } from './constants';
import { IDL } from './idl';
import * as Keys from './keys';
import { connection } from '../../engine/config';
import { sendSmartTxWithWallet } from "@/engine/helius";
import { TOKEN_DECIMALS } from "@/engine/consts";

// Tier type definition (moved from types/index.ts since it's TypeScript-only)
type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

// TypeScript interfaces for better type safety
interface WalletContext {
    connected: boolean;
    publicKey: PublicKey;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    [key: string]: any;
}

interface SwapInfo {
    tradingFee: number;
    virtBaseReserves: number;
    virtQuoteReserves: number;
    realBaseReserves: number;
    realQuoteReserves: number;
    realQuoteThreshold: number;
}

// Define proper IDL types
type PumpFunProgram = Program<typeof IDL>;

const getProgram = (wallet: WalletContext): PumpFunProgram => {
    const provider = new AnchorProvider(
        connection, 
        wallet, 
        AnchorProvider.defaultOptions()
    );

    const program = new Program(IDL as Idl, PUMPFUN_PROGRAM_ID, provider);
    return program as PumpFunProgram;
};

export const contract_getMainStateInfo = async (walletCtx: WalletContext) => {
    if (!walletCtx.connected) return null;

    const program = getProgram(walletCtx);
    
    try {
        // Find the mainState account by querying all MainState accounts from the program
        // Since there should only be one mainState initialized by the protocol owner
        const mainStateAccounts = await program.account.mainState.all();
        
        if (mainStateAccounts.length === 0) {
            console.log('No mainState account found - contract not initialized yet');
            return null;
        }
        
        // Return the first (and should be only) mainState account
        const mainState = mainStateAccounts[0].account;
        console.log('Found mainState with owner:', mainState.owner.toBase58());
        return mainState;
    } catch (err: any) {
        console.error('Error fetching mainState:', err.message);
        return null;
    }
};

export const contract_isInitialized = async (walletCtx: WalletContext): Promise<boolean> => {
    const mainStateInfo = await contract_getMainStateInfo(walletCtx);
    return mainStateInfo !== null && mainStateInfo.owner !== null;
};

export const contract_initMainState = async (walletCtx: WalletContext): Promise<void> => {
    if (!walletCtx.connected)
        throw new WalletNotConnectedError();

    const program = getProgram(walletCtx);
    const mainStateKey: PublicKey = await Keys.getMainStateKey(walletCtx.publicKey);

    const quoteMint = new PublicKey(NATIVE_MINT);
    const platformFeeQuoteAta = getAssociatedTokenAddressSync(quoteMint, walletCtx.publicKey);

    const tx = new Transaction().add(
        await program.methods
            .initMainState()
            .accounts({
                owner: walletCtx.publicKey, 
                mainState: mainStateKey, 
                quoteMint, 
                platformFeeQuoteAta, 
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID, 
                tokenProgram: TOKEN_PROGRAM_ID, 
                systemProgram: SystemProgram.programId
            })
            .instruction()
    );

    const txHash = await sendSmartTxWithWallet(walletCtx, tx);
    console.log('  initMainState txHash:', txHash);
};

export const contract_isPoolCreated = async (walletCtx: WalletContext, baseToken: string): Promise<boolean> => {
    if (!walletCtx.connected) return false;

    try {
        const baseMint = new PublicKey(baseToken);
        const quoteMint = new PublicKey(NATIVE_MINT);
        const poolStateKey: PublicKey = await Keys.getPoolStateKey(baseMint, quoteMint);
        if (!poolStateKey) return false;

        const program = getProgram(walletCtx);
        const poolStateInfo = await program.account.poolState.fetch(poolStateKey);
        return poolStateInfo ? true : false;
    } catch (err: any) {
        console.error(err.message);
        return false;
    }
};

// Helper function to convert Tier string to Anchor enum format
function convertTierToAnchorEnum(tier: Tier): any {
    const tierMap: { [key in Tier]: any } = {
        'Bronze': { bronze: {} },
        'Silver': { silver: {} },
        'Gold': { gold: {} },
        'Diamond': { diamond: {} }
    };
    
    const tierEnum = tierMap[tier];
    if (!tierEnum) {
        throw new Error(`Invalid tier: ${tier}. Must be one of: Bronze, Silver, Gold, Diamond`);
    }
    
    console.log(`[convertTierToAnchorEnum] Converting tier "${tier}" to`, tierEnum);
    return tierEnum;
}

export const contract_createPoolTx = async (walletCtx: WalletContext, baseToken: string, tier: Tier, creatorFeeRecipient: string) => {
    if (!walletCtx.connected)
        throw new WalletNotConnectedError();

    const creator = walletCtx.publicKey;
    const program = getProgram(walletCtx);
    
    // Get mainState to find the actual owner address
    const mainStateInfo = await contract_getMainStateInfo(walletCtx);
    if (!mainStateInfo) {
        throw new Error("MainState not initialized. Please initialize the contract first.");
    }
    const mainStateKey: PublicKey = await Keys.getMainStateKey(mainStateInfo.owner);

    // Validate and convert base mint
    let baseMint: PublicKey;
    try {
        baseMint = new PublicKey(baseToken);
    } catch (err) {
        throw new Error(`Invalid base token address: ${baseToken}`);
    }

    // Validate and convert creator fee recipient
    let creatorFeeRecipientPubkey: PublicKey;
    try {
        creatorFeeRecipientPubkey = new PublicKey(creatorFeeRecipient);
    } catch (err) {
        throw new Error(`Invalid creator fee recipient address: ${creatorFeeRecipient}`);
    }

    const quoteMint = new PublicKey(NATIVE_MINT);
    const creatorBaseAta = getAssociatedTokenAddressSync(baseMint, creator);
    const poolStateKey: PublicKey = await Keys.getPoolStateKey(baseMint, quoteMint);
    const reserverBaseAta = getAssociatedTokenAddressSync(baseMint, poolStateKey, true);
    const reserverQuoteAta = getAssociatedTokenAddressSync(quoteMint, poolStateKey, true);
    
    // Convert tier string to Anchor enum format
    const tierEnum = convertTierToAnchorEnum(tier);
    
    console.log(`[contract_createPoolTx] Creating pool for token ${baseToken}, tier:`, tierEnum, `creator fee recipient: ${creatorFeeRecipient}`);
    
    const ix = await program.methods
        .createPool(tierEnum, creatorFeeRecipientPubkey)
        .accounts({
            creator, 
            mainState: mainStateKey, 
            poolState: poolStateKey, 
            baseMint, quoteMint, 
            creatorBaseAta, 
            reserverBaseAta, reserverQuoteAta, 
            systemProgram: SystemProgram.programId, 
            tokenProgram: TOKEN_PROGRAM_ID, 
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
        })
        // .preInstructions([web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 })]);
        .instruction();

    console.log(`[contract_createPoolTx] Pool creation instruction generated successfully`);
    return ix;
};

export const contract_buyTx = async (walletCtx: WalletContext, baseToken: string, amount: number, isSol: boolean, providedCreatorFeeRecipient?: string, slippagePercent: number = 10) => {
    if (!walletCtx.connected)
        throw new WalletNotConnectedError();

    const buyer = walletCtx.publicKey;
    const program = getProgram(walletCtx);
    
    // Get mainState using the correct method
    const mainStateInfo = await contract_getMainStateInfo(walletCtx);
    if (!mainStateInfo) {
        throw new Error("Failed to fetch mainState!");
    }
    const mainStateKey: PublicKey = await Keys.getMainStateKey(mainStateInfo.owner);

    const baseMint = new PublicKey(baseToken);
    if (!baseMint) {
        throw new Error("Invalid token");
    }
    const quoteMint = new PublicKey(NATIVE_MINT);
    const poolStateKey: PublicKey = await Keys.getPoolStateKey(baseMint, quoteMint);
    
    // Try to fetch pool state info, handle case where pool doesn't exist yet
    let poolStateInfo: any = null;
    try {
        poolStateInfo = await program.account.poolState.fetch(poolStateKey);
    } catch (err: any) {
        // Pool doesn't exist yet - this can happen when creating pool and buying in same transaction
        if (err.message?.includes('Account does not exist') || err.message?.includes('has no data')) {
            console.log('Pool state not found, using default values for new pool');
            poolStateInfo = null; // Will use mainState defaults below
        } else {
            throw new Error(`Failed to fetch pool state: ${err.message}`);
        }
    }
    
    const buyerBaseAta = getAssociatedTokenAddressSync(baseMint, buyer);
    const buyerQuoteAta = getAssociatedTokenAddressSync(quoteMint, buyer);
    const reserverBaseAta = getAssociatedTokenAddressSync(baseMint, poolStateKey, true);
    const reserverQuoteAta = getAssociatedTokenAddressSync(quoteMint, poolStateKey, true);
    const platformFeeQuoteAta = getAssociatedTokenAddressSync(quoteMint, mainStateInfo.platformFeeRecipient);

    let ix = null;

    if (isSol) {
        const quoteBalance = new BN(Math.floor(amount * LAMPORTS_PER_SOL));
        const outBaseAmount = await getOutputAmountOnBuy(
            {
                tradingFee: mainStateInfo.tradingFee / FEE_PRE_DIV,
                virtBaseReserves: Number(poolStateInfo?.virtBaseReserves || mainStateInfo.initVirtBaseReserves),
                virtQuoteReserves: Number(poolStateInfo?.virtQuoteReserves || mainStateInfo.initVirtQuoteReserves),
                realBaseReserves: Number(poolStateInfo?.realBaseReserves || mainStateInfo.totalSupply),
                realQuoteReserves: Number(poolStateInfo?.realQuoteReserves || 0),
                realQuoteThreshold: Number(poolStateInfo?.realQuoteThreshold || mainStateInfo.realQuoteThreshold)
            },
            Number(quoteBalance)
        );
        const minBaseAmount = Math.trunc(outBaseAmount * (100 - slippagePercent) / 100); // Apply user slippage
        
        // Fetch pool state info for creator fee recipient if needed
        let creatorFeeRecipient: PublicKey;
        if (providedCreatorFeeRecipient) {
            // Use the provided creator fee recipient (for new pools in same transaction)
            creatorFeeRecipient = new PublicKey(providedCreatorFeeRecipient);
        } else if (poolStateInfo) {
            creatorFeeRecipient = poolStateInfo.creatorFeeRecipient;
        } else {
            // If pool doesn't exist yet, we need to get it from the pool state when it's created
            // For now, we'll attempt to fetch it again or use a fallback
            try {
                const currentPoolState = await program.account.poolState.fetch(poolStateKey);
                creatorFeeRecipient = currentPoolState.creatorFeeRecipient;
            } catch {
                // If still not available, this will fail at instruction level
                throw new Error("Unable to determine creator fee recipient");
            }
        }
        const creatorFeeQuoteAta = getAssociatedTokenAddressSync(quoteMint, creatorFeeRecipient);

        ix = await program.methods
        .buyTokensFromExactSol(quoteBalance, new BN(minBaseAmount))
        .accounts({
            buyer,
            mainState: mainStateKey,
            platformFeeRecipient: mainStateInfo.platformFeeRecipient,
            platformFeeQuoteAta,
            creatorFeeRecipient,
            creatorFeeQuoteAta,
            poolState: poolStateKey,
            baseMint,
            quoteMint,
            buyerBaseAta,
            buyerQuoteAta,
            reserverBaseAta,
            reserverQuoteAta,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();

    } else {
        const baseMintDecimals = TOKEN_DECIMALS;
        const baseBalance = new BN(Math.floor(amount * (10 ** baseMintDecimals)));
        const inQuoteAmount = await getInputAmountOnBuy(
            {
                tradingFee: mainStateInfo.tradingFee / FEE_PRE_DIV,
                virtBaseReserves: Number(poolStateInfo?.virtBaseReserves || mainStateInfo.initVirtBaseReserves),
                virtQuoteReserves: Number(poolStateInfo?.virtQuoteReserves || mainStateInfo.initVirtQuoteReserves),
                realBaseReserves: Number(poolStateInfo?.realBaseReserves || mainStateInfo.totalSupply),
                realQuoteReserves: Number(poolStateInfo?.realQuoteReserves || 0),
                realQuoteThreshold: Number(poolStateInfo?.realQuoteThreshold || mainStateInfo.realQuoteThreshold)
            },
            Number(baseBalance)
        );
        const maxQuoteAmount = Math.trunc(inQuoteAmount * (100 + slippagePercent) / 100); // Apply user slippage
        
        // Determine creator fee recipient
        let creatorFeeRecipient: PublicKey;
        if (providedCreatorFeeRecipient) {
            creatorFeeRecipient = new PublicKey(providedCreatorFeeRecipient);
        } else if (poolStateInfo?.creatorFeeRecipient) {
            creatorFeeRecipient = poolStateInfo.creatorFeeRecipient;
        } else {
            throw new Error("Unable to determine creator fee recipient");
        }
        const creatorFeeQuoteAta = getAssociatedTokenAddressSync(quoteMint, creatorFeeRecipient);

        ix = await program.methods
        .buyExactTokensFromSol(baseBalance, new BN(maxQuoteAmount))
        .accounts({
            buyer,
            mainState: mainStateKey,
            platformFeeRecipient: mainStateInfo.platformFeeRecipient,
            platformFeeQuoteAta,
            creatorFeeRecipient,
            creatorFeeQuoteAta,
            poolState: poolStateKey,
            baseMint,
            quoteMint,
            buyerBaseAta,
            buyerQuoteAta,
            reserverBaseAta,
            reserverQuoteAta,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();

    }

    return ix;
};

export const contract_sellTx = async (walletCtx: WalletContext, baseToken: string, sellAmount: number, slippagePercent: number = 10) => {
    if (!walletCtx.connected)
        throw new WalletNotConnectedError();

    const seller = walletCtx.publicKey;
    const program = getProgram(walletCtx);
    
    // Get mainState using the correct method
    const mainStateInfo = await contract_getMainStateInfo(walletCtx);
    if (!mainStateInfo) {
        throw new Error("Failed to fetch mainState!");
    }
    const mainStateKey: PublicKey = await Keys.getMainStateKey(mainStateInfo.owner);

    const baseMint = new PublicKey(baseToken);
    if (!baseMint) {
        throw new Error("Invalid token");
    }
    const quoteMint = new PublicKey(NATIVE_MINT);
    const poolStateKey: PublicKey = await Keys.getPoolStateKey(baseMint, quoteMint);
    const poolStateInfo = await program.account.poolState.fetch(poolStateKey);
    if (!poolStateInfo)
        throw new Error("Failed to fetch poolState!");
    
    const baseMintDecimals = TOKEN_DECIMALS;
    const sellBalance = new BN(Math.floor(sellAmount * (10 ** baseMintDecimals)));
    const sellerBaseAta = getAssociatedTokenAddressSync(baseMint, seller);
    const sellerQuoteAta = getAssociatedTokenAddressSync(quoteMint, seller);
    const reserverBaseAta = getAssociatedTokenAddressSync(baseMint, poolStateKey, true);
    const reserverQuoteAta = getAssociatedTokenAddressSync(quoteMint, poolStateKey, true);
    const platformFeeQuoteAta = getAssociatedTokenAddressSync(quoteMint, mainStateInfo.platformFeeRecipient);

    const outQuoteAmount = await getOutputAmountOnSell(
        {
            tradingFee: mainStateInfo.tradingFee / FEE_PRE_DIV,
            virtBaseReserves: Number(poolStateInfo.virtBaseReserves),
            virtQuoteReserves: Number(poolStateInfo.virtQuoteReserves),
            realBaseReserves: Number(poolStateInfo.realBaseReserves),
            realQuoteReserves: Number(poolStateInfo.realQuoteReserves),
            realQuoteThreshold: Number(poolStateInfo.realQuoteThreshold)
        },
        Number(sellBalance)
    );
    const minQuoteAmount = Math.trunc(outQuoteAmount * (100 - slippagePercent) / 100); // Apply user slippage
    
    const creatorFeeRecipient = poolStateInfo.creatorFeeRecipient;
    const creatorFeeQuoteAta = getAssociatedTokenAddressSync(quoteMint, creatorFeeRecipient);

    const ix = await program.methods
    .sell(sellBalance, new BN(minQuoteAmount))
    .accounts({
        seller,
        mainState: mainStateKey,
        platformFeeRecipient: mainStateInfo.platformFeeRecipient,
        platformFeeQuoteAta,
        creatorFeeRecipient,
        creatorFeeQuoteAta,
        poolState: poolStateKey,
        baseMint,
        quoteMint,
        sellerBaseAta,
        sellerQuoteAta,
        reserverBaseAta,
        reserverQuoteAta,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    })
    .instruction();

    return ix;
};

export const contract_updateMainStateInfo = async (walletCtx: WalletContext, feeRecipient: string, tradingFee: number): Promise<void> => {
    if (!walletCtx.connected) return;

    let newFeeRecipient: PublicKey;
    let newTradingFee: BN;
    
    const address2 = new PublicKey(feeRecipient);
    if (!address2) throw new Error('Invalid fee recipient address!');
    newFeeRecipient = address2;

    const quoteMint = new PublicKey(NATIVE_MINT);
    const platformFeeQuoteAta = getAssociatedTokenAddressSync(quoteMint, newFeeRecipient);
    
    const tmpFee = Math.trunc(tradingFee * FEE_PRE_DIV);
    newTradingFee = new BN(tmpFee);

    const program = getProgram(walletCtx);
    
    // Get mainState using the correct method
    const mainStateInfo = await contract_getMainStateInfo(walletCtx);
    if (!mainStateInfo) {
        throw new Error("Failed to fetch mainState!");
    }
    const mainStateKey: PublicKey = await Keys.getMainStateKey(mainStateInfo.owner);

    const tx = new Transaction().add(
        await program.methods
          .updateMainState({
            platformFeeRecipient: newFeeRecipient,
            tradingFee: newTradingFee,
            totalSupply: mainStateInfo.totalSupply ? new BN(mainStateInfo.totalSupply) : null,
            initVirtBaseReserves: mainStateInfo.initVirtBaseReserves ? new BN(mainStateInfo.initVirtBaseReserves) : null,
            initVirtQuoteReserves: mainStateInfo.initVirtQuoteReserves ? new BN(mainStateInfo.initVirtQuoteReserves) : null,
            realQuoteThreshold: mainStateInfo.realQuoteThreshold ? new BN(mainStateInfo.realQuoteThreshold) : null,
            bronzeFeeConfig: null,
            silverFeeConfig: null,
            goldFeeConfig: null,
            diamondFeeConfig: null,
          })
          .accounts({
            owner: walletCtx.publicKey,
            mainState: mainStateKey,
            quoteMint,
            platformFeeRecipient: newFeeRecipient,
            platformFeeQuoteAta,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      );
      
    const txHash = await sendSmartTxWithWallet(walletCtx, tx);
    console.log('  updateMainState txHash:', txHash);
};

export const contract_isPoolComplete = async (walletCtx: WalletContext, baseToken: string): Promise<boolean> => {
    if (!walletCtx.connected) return false;

    try {
        const baseMint = new PublicKey(baseToken);
        const quoteMint = new PublicKey(NATIVE_MINT);
        const poolStateKey: PublicKey = await Keys.getPoolStateKey(baseMint, quoteMint);

        const program = getProgram(walletCtx);
        const poolStateInfo = await program.account.poolState.fetch(poolStateKey);
        if (!poolStateInfo) return false;

        return poolStateInfo?.complete;
    } catch (err: any) {
        console.error('Error checking pool completion:', err.message);
        return false;
    }
};

export const contract_waitForPoolCreation = async (walletCtx: WalletContext, baseToken: string, maxRetries: number = 10, delayMs: number = 1000): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const isCreated = await contract_isPoolCreated(walletCtx, baseToken);
            if (isCreated) {
                return true;
            }
        } catch (err: any) {
            console.log(`Pool check attempt ${i + 1} failed:`, err.message);
        }
        
        if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    return false;
};

const getOutputAmountOnBuy = async (swapInfo: SwapInfo, inputSolAmount: number): Promise<number> => {
    if (inputSolAmount <= 0) return 0;

    const fee = inputSolAmount * swapInfo.tradingFee / 100;
    let buySolAmount = inputSolAmount - fee;
    if (swapInfo.realQuoteReserves + buySolAmount > swapInfo.realQuoteThreshold) {
        buySolAmount = swapInfo.realQuoteThreshold - swapInfo.realQuoteReserves;
    }
    const inputReserve = swapInfo.realQuoteReserves + swapInfo.virtQuoteReserves;
    const outputReserve = swapInfo.realBaseReserves + swapInfo.virtBaseReserves;
    const outputAmount = calculateOutputAmount(buySolAmount, inputReserve, outputReserve);

    return outputAmount;
}

const getInputAmountOnBuy = async (swapInfo: SwapInfo, outputTokenAmount: number): Promise<number> => {
    if (outputTokenAmount <= 0) return 0;
    if (outputTokenAmount > swapInfo.realBaseReserves) {
        throw new Error(`outputTokenAmount can't be greater than realBaseReserves`);
    }

    const inputReserve = swapInfo.realQuoteReserves + swapInfo.virtQuoteReserves;
    const outputReserve = swapInfo.realBaseReserves + swapInfo.virtBaseReserves;
    const inputAmount = calculateInputAmount(outputTokenAmount, inputReserve, outputReserve);
    const fee = inputAmount * swapInfo.tradingFee / (100 - swapInfo.tradingFee);
    const totalInputAmount = inputAmount + fee;

    return totalInputAmount;
}

const getOutputAmountOnSell = async (swapInfo: SwapInfo, inputTokenAmount: number): Promise<number> => {
    if (inputTokenAmount <= 0) return 0;

    const inputReserve = swapInfo.realBaseReserves + swapInfo.virtBaseReserves;
    const outputReserve = swapInfo.realQuoteReserves + swapInfo.virtQuoteReserves;
    const outputAmount = calculateOutputAmount(inputTokenAmount, inputReserve, outputReserve);
    const fee = outputAmount * swapInfo.tradingFee / 100;
    const sellSolAmount = outputAmount - fee;
    
    return sellSolAmount;
}

// output_amount = output_reserve * input_amount / (input_reserve + input_amount)
const calculateOutputAmount = (inputAmount: number, inputReserve: number, outputReserve: number): number => {
    const amount = outputReserve * inputAmount
    const divider = inputReserve + inputAmount
    return Math.trunc(amount / divider)
}

// input_amount = output_amount * input_reserve / (output_reserve - output_amount)
const calculateInputAmount = (outputAmount: number, inputReserve: number, outputReserve: number): number => {
    if (outputAmount >= outputReserve) {
        throw new Error(`outputAmount can't be greater than or equal to outputReserve`)
    }

    const amount = inputReserve * outputAmount
    const divider = outputReserve - outputAmount
    return Math.trunc(amount / divider)
}

/**
 * Calculate expected token output for a given SOL input amount based on bonding curve
 * @param walletCtx Wallet context
 * @param baseToken Token mint address
 * @param solAmount Amount of SOL to spend
 * @returns Expected token amount (before slippage)
 */
export const contract_calculateBuyOutput = async (walletCtx: WalletContext, baseToken: string, solAmount: number): Promise<number> => {
    try {
        const program = getProgram(walletCtx);
        const mainStateInfo = await contract_getMainStateInfo(walletCtx);
        if (!mainStateInfo) return 0;

        const baseMint = new PublicKey(baseToken);
        const quoteMint = new PublicKey(NATIVE_MINT);
        const poolStateKey: PublicKey = await Keys.getPoolStateKey(baseMint, quoteMint);
        
        let poolStateInfo: any = null;
        try {
            poolStateInfo = await program.account.poolState.fetch(poolStateKey);
        } catch (err: any) {
            console.log('Pool state not found, using default values');
        }
        
        const inputSolLamports = Math.floor(solAmount * LAMPORTS_PER_SOL);
        const outputTokenLamports = await getOutputAmountOnBuy(
            {
                tradingFee: mainStateInfo.tradingFee / FEE_PRE_DIV,
                virtBaseReserves: Number(poolStateInfo?.virtBaseReserves || mainStateInfo.initVirtBaseReserves),
                virtQuoteReserves: Number(poolStateInfo?.virtQuoteReserves || mainStateInfo.initVirtQuoteReserves),
                realBaseReserves: Number(poolStateInfo?.realBaseReserves || mainStateInfo.totalSupply),
                realQuoteReserves: Number(poolStateInfo?.realQuoteReserves || 0),
                realQuoteThreshold: Number(poolStateInfo?.realQuoteThreshold || mainStateInfo.realQuoteThreshold)
            },
            inputSolLamports
        );
        
        return outputTokenLamports / (10 ** TOKEN_DECIMALS);
    } catch (err) {
        console.error('Error calculating buy output:', err);
        return 0;
    }
}

/**
 * Calculate expected SOL output for a given token input amount based on bonding curve
 * @param walletCtx Wallet context
 * @param baseToken Token mint address
 * @param tokenAmount Amount of tokens to sell
 * @returns Expected SOL amount (before slippage)
 */
export const contract_calculateSellOutput = async (walletCtx: WalletContext, baseToken: string, tokenAmount: number): Promise<number> => {
    try {
        const program = getProgram(walletCtx);
        const mainStateInfo = await contract_getMainStateInfo(walletCtx);
        if (!mainStateInfo) return 0;

        const baseMint = new PublicKey(baseToken);
        const quoteMint = new PublicKey(NATIVE_MINT);
        const poolStateKey: PublicKey = await Keys.getPoolStateKey(baseMint, quoteMint);
        
        const poolStateInfo = await program.account.poolState.fetch(poolStateKey);
        if (!poolStateInfo) return 0;
        
        const inputTokenLamports = Math.floor(tokenAmount * (10 ** TOKEN_DECIMALS));
        const outputSolLamports = await getOutputAmountOnSell(
            {
                tradingFee: mainStateInfo.tradingFee / FEE_PRE_DIV,
                virtBaseReserves: Number(poolStateInfo.virtBaseReserves),
                virtQuoteReserves: Number(poolStateInfo.virtQuoteReserves),
                realBaseReserves: Number(poolStateInfo.realBaseReserves),
                realQuoteReserves: Number(poolStateInfo.realQuoteReserves),
                realQuoteThreshold: Number(poolStateInfo.realQuoteThreshold)
            },
            inputTokenLamports
        );
        
        return outputSolLamports / LAMPORTS_PER_SOL;
    } catch (err) {
        console.error('Error calculating sell output:', err);
        return 0;
    }
}
