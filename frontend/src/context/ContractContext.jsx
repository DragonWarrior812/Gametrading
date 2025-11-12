import React, { createContext, useState, useContext } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { contract_getMainStateInfo, 
    contract_isInitialized, 
    contract_initMainState, 
    contract_isPoolCreated, 
    contract_createPoolTx, 
    contract_buyTx, 
    contract_sellTx, 
    contract_updateMainStateInfo,
    contract_isPoolComplete,
    contract_calculateBuyOutput,
    contract_calculateSellOutput
} from './contracts';

export const ContractContext = createContext(null);

const ContractContextProvider = ({ children }) => {
    const [txLoading, setTxLoading] = useState(false);

    const walletCtx = useWallet();

    const getOwnerAddress = async () => {
        const mainStateInfo = await contract_getMainStateInfo(walletCtx);
        if (!mainStateInfo) return null;
        return mainStateInfo.owner || null;
    };

    const getMainStateInfo = async () => {
        return await contract_getMainStateInfo(walletCtx);
    };

    const isContractInitialized = async () => {
        return await contract_isInitialized(walletCtx);
    };

    const initializeContract = async () => {
        setTxLoading(true);

        try {
            await contract_initMainState(walletCtx);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }

        setTxLoading(false);
    };

    const isPoolCreated = async (baseToken) => {
        return await contract_isPoolCreated(walletCtx, baseToken);
    };

    const getCreatePoolTx = async (baseToken, tier, creatorFeeRecipient) => {
        let tx = null;

        setTxLoading(true);

        try {
            tx = await contract_createPoolTx(walletCtx, baseToken, tier, creatorFeeRecipient);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }

        setTxLoading(false);

        return tx;
    };

    const getBuyTx = async (token, amount, isSol, creatorFeeRecipient, slippagePercent) => {
        let tx = null;

        setTxLoading(true);

        try {
            tx = await contract_buyTx(walletCtx, token, amount, isSol, creatorFeeRecipient, slippagePercent);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }

        setTxLoading(false);

        return tx;
    };

    const getSellTx = async (token, amount, slippagePercent) => {
        let tx = null;

        setTxLoading(true);

        try {
            tx = await contract_sellTx(walletCtx, token, amount, slippagePercent);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }

        setTxLoading(false);

        return tx;
    };

    const updateMainStateInfo = async (feeRecipient, tradingFee) => {
        setTxLoading(true);

        try {
            await contract_updateMainStateInfo(walletCtx, feeRecipient, tradingFee);
        } catch (err) {
            console.error(err);
            throw new Error(err.message);
        }

        setTxLoading(false);
    };

    const isPoolComplete = async (baseToken) => {
        return await contract_isPoolComplete(walletCtx, baseToken);
    };

    const calculateBuyOutput = async (baseToken, solAmount) => {
        return await contract_calculateBuyOutput(walletCtx, baseToken, solAmount);
    };

    const calculateSellOutput = async (baseToken, tokenAmount) => {
        return await contract_calculateSellOutput(walletCtx, baseToken, tokenAmount);
    };

    const context = {
        getOwnerAddress, 
        getMainStateInfo, 
        isContractInitialized, 
        initializeContract, 
        isPoolCreated, 
        getCreatePoolTx, 
        getBuyTx, 
        getSellTx, 
        updateMainStateInfo, 
        isPoolComplete,
        calculateBuyOutput,
        calculateSellOutput
    };

    return <ContractContext.Provider value={context}>{children}</ContractContext.Provider>
};

export const useContract = () => {
    const contractManager = useContext(ContractContext);
    if (!contractManager) {
        throw new Error('useContract must be used within a ContractContextProvider');
    }
    return contractManager;
};

export default ContractContextProvider;

