import { createHelius } from "helius-sdk";
import { 
    Keypair,
    VersionedTransaction,
    Transaction,
    ComputeBudgetProgram,
} from "@solana/web3.js";
import { connection, isMainNet, networkUrl } from "./config";
import base58 from "bs58";

// Initialize Helius client
const heliusApiKey = import.meta.env.VITE_HELIUS_API_KEY || "";

let helius = null;

// Initialize Helius only if API key is provided
if (heliusApiKey) {
    helius = createHelius({
        apiKey: heliusApiKey,
        network: isMainNet ? "mainnet" : "devnet"
    });
}

/**
 * Simulate transaction to determine precise compute units needed
 * Following Helius best practices: simulate with high CU limit first
 * @param {Transaction | VersionedTransaction} transaction - Transaction to simulate
 * @returns {Promise<number>} Compute units consumed with generous buffer for safety
 */
async function getOptimizedComputeUnits(transaction) {
    try {
        if (transaction instanceof Transaction) {
            const testTx = new Transaction();
            testTx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }));
            testTx.add(...transaction.instructions);
            testTx.recentBlockhash = transaction.recentBlockhash;
            testTx.feePayer = transaction.feePayer;

            const simulation = await connection.simulateTransaction(testTx);

            if (simulation.value.err) {
                console.warn('Simulation failed:', simulation.value.err);
                return 200_000; // Default fallback
            }

            const unitsConsumed = simulation.value.unitsConsumed || 200_000;
            console.log(`📊 Simulation consumed: ${unitsConsumed} compute units`);
            
            // Be very conservative with compute units to avoid "ComputationalBudgetExceeded"
            // Use 3x multiplier + 20k base for safety, especially for low estimates
            const bufferedUnits = Math.ceil(unitsConsumed * 3) + 20_000;
            
            // Ensure reasonable bounds: min 50k for simple txs, cap at 1.4M (Solana max)
            const finalUnits = Math.min(Math.max(bufferedUnits, 50_000), 1_400_000);
            
            console.log(`✅ Final compute units (with safety buffer): ${finalUnits}`);
            return finalUnits;
        } else {
            // For VersionedTransaction, simulate directly
            const simulation = await connection.simulateTransaction(transaction, {
                replaceRecentBlockhash: true,
                sigVerify: false
            });

            if (simulation.value.err) {
                console.warn('Simulation failed:', simulation.value.err);
                return 200_000; // Default fallback
            }

            const unitsConsumed = simulation.value.unitsConsumed || 200_000;
            console.log(`📊 Simulation consumed: ${unitsConsumed} compute units`);
            
            // Be very conservative with compute units to avoid "ComputationalBudgetExceeded"
            // Use 3x multiplier + 20k base for safety, especially for low estimates
            const bufferedUnits = Math.ceil(unitsConsumed * 3) + 20_000;
            
            // Ensure reasonable bounds: min 50k for simple txs, cap at 1.4M (Solana max)
            const finalUnits = Math.min(Math.max(bufferedUnits, 50_000), 1_400_000);
            
            console.log(`✅ Final compute units (with safety buffer): ${finalUnits}`);
            return finalUnits;
        }
    } catch (error) {
        console.warn('Failed to optimize compute units:', error);
        return 200_000; // Default fallback
    }
}

/**
 * Get priority fee estimate from Helius API
 * Uses "recommended" option for optimal inclusion via Helius staked connections
 * @param {Transaction | VersionedTransaction} transaction - Transaction to estimate fee for
 * @returns {Promise<number>} Priority fee in microlamports
 */
async function getPriorityFeeEstimate(transaction) {
    try {
        const serializedTx = base58.encode(
            transaction.serialize({ 
                verifySignatures: false, 
                requireAllSignatures: false 
            })
        );

        const response = await fetch(networkUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: '1',
                method: 'getPriorityFeeEstimate',
                params: [
                    {
                        transaction: serializedTx,
                        options: { recommended: true }, // Use recommended for Helius staked connections
                    },
                ],
            }),
        });

        const data = await response.json();

        if (data?.result?.priorityFeeEstimate) {
            const fee = data.result.priorityFeeEstimate;
            console.log('Helius recommended priority fee:', fee);
            // Add 50% buffer for high probability of inclusion, cap at 20M microlamports
            const bufferedFee = Math.floor(fee * 1.5);
            return Math.min(Math.max(bufferedFee, 10_000), 20_000_000);
        }

        console.warn('No priority fee estimate returned, using default');
        return 1_000_000; // Default 1M microlamports
    } catch (error) {
        console.error('Failed to get priority fee estimate:', error);
        return 1_000_000; // Default fallback
    }
}

/**
 * Send transaction with wallet context (for browser wallet signing)
 * Uses Helius's optimized RPC connection with best practices for transaction sending.
 * 
 * Implementation follows Helius documentation:
 * https://www.helius.dev/docs/sending-transactions/send-manually
 * 
 * Manual workflow steps:
 * 1. Build the initial transaction
 * 2. Optimize compute units by simulating with high CU limit
 * 3. Get priority fee estimate from Helius API (recommended option)
 * 4. Rebuild transaction with compute budget instructions
 * 5. Perform preflight simulation to catch errors early
 * 6. Send and implement robust polling with rebroadcasting
 * 
 * Key features:
 * - Uses Helius Priority Fee API with "recommended" option for staked connections
 * - Optimizes compute units through simulation with generous safety buffers (3x + 20k, min 50k)
 * - Adds 50% buffer to priority fees for high probability of inclusion
 * - Performs preflight simulation to catch errors before sending
 * - Implements aggressive polling and rebroadcasting (5 attempts every 1.5s)
 * - Checks blockhash expiration and handles timeouts properly
 * - Detailed logging at each step for debugging
 * 
 * @param {any} walletCtx - Wallet context with publicKey and signTransaction
 * @param {Transaction | VersionedTransaction} transaction - Transaction or VersionedTransaction to send
 * @param {Keypair[]} additionalSigners - Additional keypairs that need to sign
 * @returns {Promise<string>} Transaction signature or throws error if failed
 */
export async function sendSmartTxWithWallet(
    walletCtx,
    transaction,
    additionalSigners = []
) {
    try {
        if (!helius) {
            console.warn("Helius not initialized. Falling back to regular send");
            throw new Error("Helius not initialized");
        }

        if (walletCtx.publicKey === null || walletCtx.signTransaction === undefined) {
            throw new Error("Invalid wallet!");
        }

        const start = Date.now();
        console.log('🚀 Starting Helius priority fee transaction workflow...');

        // STEP 1: Build the initial transaction and get blockhash
        const latestBlockhash = await helius.raw.getLatestBlockhash({
            commitment: "confirmed"
        });
        
        // Set transaction properties
        if (transaction instanceof Transaction) {
            transaction.recentBlockhash = latestBlockhash.value.blockhash;
            transaction.feePayer = walletCtx.publicKey;
        } else if (transaction instanceof VersionedTransaction) {
            // For VersionedTransaction, the blockhash should already be set
            // We'll rebuild it later with compute budget instructions
        }

        // STEP 2: Optimize compute units through simulation
        console.log('📊 Step 2: Optimizing compute units...');
        const computeUnits = await getOptimizedComputeUnits(transaction);
        console.log(`✅ Optimized compute units: ${computeUnits}`);

        // STEP 3: Get priority fee estimate from Helius
        console.log('💰 Step 3: Getting priority fee estimate...');
        const priorityFee = await getPriorityFeeEstimate(transaction);
        console.log(`✅ Priority fee estimate: ${priorityFee} microlamports`);

        // STEP 4: Rebuild transaction with compute budget instructions
        console.log('🔨 Step 4: Rebuilding transaction with compute budget...');
        let finalTransaction;
        
        if (transaction instanceof Transaction) {
            finalTransaction = new Transaction();
            
            // Add compute budget instructions first
            finalTransaction.add(
                ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnits })
            );
            finalTransaction.add(
                ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee })
            );
            
            // Add original instructions
            finalTransaction.add(...transaction.instructions);
            
            // Set transaction properties
            finalTransaction.recentBlockhash = latestBlockhash.value.blockhash;
            finalTransaction.feePayer = walletCtx.publicKey;
        } else {
            // For VersionedTransaction, handle differently
            finalTransaction = transaction;
        }

        // Sign with wallet
        console.log('✍️  Requesting wallet signature...');
        const signedTx = await walletCtx.signTransaction(finalTransaction);

        // Sign with additional signers if any
        if (additionalSigners.length > 0) {
            console.log(`✍️  Signing with ${additionalSigners.length} additional signers...`);
            if (signedTx instanceof Transaction) {
                signedTx.partialSign(...additionalSigners);
            } else if (signedTx instanceof VersionedTransaction) {
                signedTx.sign(additionalSigners);
            }
        }

        // Preflight check: Simulate the final transaction to catch errors early
        console.log('🔍 Performing preflight simulation...');
        let preflightSim;
        if (signedTx instanceof Transaction) {
            preflightSim = await connection.simulateTransaction(signedTx);
        } else {
            preflightSim = await connection.simulateTransaction(signedTx, {
                replaceRecentBlockhash: false,
                sigVerify: false
            });
        }
        
        if (preflightSim.value.err) {
            console.error('❌ Preflight simulation failed:', preflightSim.value.err);
            console.error('Logs:', preflightSim.value.logs);
            throw new Error(`Preflight failed: ${JSON.stringify(preflightSim.value.err)}`);
        }
        console.log(`✅ Preflight passed! Used ${preflightSim.value.unitsConsumed} compute units`);

        // STEP 5: Send and confirm with robust polling
        console.log('📤 Step 5: Sending transaction with robust polling...');
        const serializedTx = signedTx.serialize();
        
        // Send transaction
        const signature = await connection.sendRawTransaction(serializedTx, {
            skipPreflight: true,
            maxRetries: 0 // We handle retries ourselves
        });
        console.log('✅ Transaction sent! Signature:', signature);

        // Implement robust polling and rebroadcasting as per Helius best practices
        const lastValidBlockHeight = Number(latestBlockhash.value.lastValidBlockHeight);
        let confirmed = false;
        let pollCount = 0;
        let rebroadcastCount = 0;
        const maxRebroadcasts = 5; // Increased for better success rate
        const pollIntervalMs = 1500; // Poll every 1.5 seconds for faster confirmation
        
        while (!confirmed) {
            pollCount++;
            
            // Check transaction status
            const statuses = await connection.getSignatureStatuses([signature]);
            const status = statuses?.value?.[0];

            if (status) {
                if (status.confirmationStatus === 'confirmed' || status.confirmationStatus === 'finalized') {
                    console.log(`✅ Transaction confirmed after ${pollCount} polls and ${rebroadcastCount} rebroadcasts!`);
                    confirmed = true;
                    break;
                }
                
                if (status.err) {
                    // Log the full error for debugging
                    console.error('Transaction error details:', JSON.stringify(status.err, null, 2));
                    throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
                }
            }

            // Check if blockhash has expired
            const currentBlockHeight = await connection.getBlockHeight();
            if (currentBlockHeight > lastValidBlockHeight) {
                throw new Error('Transaction expired: blockhash exceeded lastValidBlockHeight');
            }

            // Rebroadcast transaction aggressively for better success rate
            if (rebroadcastCount < maxRebroadcasts) {
                try {
                    await connection.sendRawTransaction(serializedTx, {
                        skipPreflight: true,
                        maxRetries: 0
                    });
                    rebroadcastCount++;
                    console.log(`🔄 Rebroadcasted transaction (attempt ${rebroadcastCount}/${maxRebroadcasts})`);
                } catch (rebroadcastError) {
                    // Only log warnings, don't fail on rebroadcast errors (tx might already be in mempool)
                    if (!rebroadcastError?.message?.includes('already been processed')) {
                        console.warn('⚠️  Rebroadcast warning:', rebroadcastError?.message || rebroadcastError);
                    }
                }
            }
            
            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        }
        
        const elapsed = Date.now() - start;
        console.log(`🎉 Transaction successful! Took ${elapsed}ms. Signature: ${signature}`);

        return signature;

    } catch (err) {
        console.error("❌ Helius transaction error:", err);
        throw new Error(err.message || "Transaction failed or was rejected by user");
    }
}

export default helius;

