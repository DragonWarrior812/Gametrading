import {
    Transaction, 
    ComputeBudgetProgram
} from '@solana/web3.js';
import axios from "axios";
import bs58 from "bs58";
import { networkUrl } from "./config";


export async function getPriorityFeeEstimateForTransaction(tx) {
    try {
        const endpoint = networkUrl;
        
        // First try using Helius's recommended priority fee for staked connections
        try {
            const recommendedPayload = {
                jsonrpc: '2.0',
                id: '1',
                method: 'getPriorityFeeEstimate',
                params: [
                    {
                        transaction: bs58.encode(tx.serialize({ verifySignatures: false, requireAllSignatures: false })),
                        options: { recommended: true }, // Use recommended for Helius's staked connections
                    },
                ]
            };
            
            const recommendedRes = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recommendedPayload)
            }).then(res => res.json());

            if (recommendedRes?.result?.priorityFeeEstimate) {
                const recommendedFee = recommendedRes.result.priorityFeeEstimate;
                console.log('Using Helius recommended priority fee:', recommendedFee);
                // Cap at 20M microlamports for safety
                return Math.min(Math.floor(recommendedFee * 1.2), 20_000_000);
            }
        } catch (recommendedError) {
            console.warn('Recommended fee fetch failed, falling back to priority levels');
        }

        // Fallback to priority levels if recommended fails
        const jsonPayload = {
            jsonrpc: '2.0',
            id: '1',
            method: 'getPriorityFeeEstimate',
            params: [
                {
                    transaction: bs58.encode(tx.serialize({ verifySignatures: false, requireAllSignatures: false })),
                    options: { includeAllPriorityFeeLevels: true },
                },
            ]
        };
        
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonPayload)
        }).then(res => res.json());

        const veryHighFee = res.result.priorityFeeLevels.veryHigh;
        const finalFee = Math.min(Math.floor((veryHighFee * 2)), 20_000_000);
        console.log('Using veryHigh priority fee:', finalFee);
        return finalFee;
    } catch (e) {
        console.error('Priority fee estimation failed:', e);
        // Return a reasonable default (1M microlamports = 0.001 SOL per 200k CU)
        return 1_000_000;
    }
}

export async function getComputeUnitsForTransaction(tx, connection) {
    try {
        const newTx = new Transaction();
        newTx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_000_000 }));
        newTx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }));
        newTx.add(...tx.instructions);
        newTx.recentBlockhash = tx.recentBlockhash;
        newTx.lastValidBlockHeight = tx.lastValidBlockHeight;
        newTx.feePayer = tx.feePayer;

        const simulation = await connection.simulateTransaction(newTx);
        if (simulation.value.err) {
            return 0;
        }

        return simulation.value.unitsConsumed ?? 200_000;
    } catch (e) {
        console.log(e);
        return 0
    }
}

export async function getOptimalPriceAndBudget(hydratedTransaction, connection) {
    const [priorityFee, computeUnits] = await Promise.all([
        getPriorityFeeEstimateForTransaction(hydratedTransaction), 
        getComputeUnitsForTransaction(hydratedTransaction, connection),
    ]);
    return [priorityFee, computeUnits];
}


export async function getComputeBudgetConfigHigh() {
    const response = await axios.get('https://solanacompass.com/api/fees');
    const json = response.data;
    const { avg } = json?.[15] ?? {};
    console.log('avg:', avg);
    if (!avg) return undefined; // fetch error
    return {
      units: 100_000,
      microLamports: Math.max(Math.ceil((avg * 1_000_000) / 100_000), 25000)
    };
}

