import { fetchBlockNumber, fetchToken, readContract, readContracts } from 'wagmi/actions'
import { getAccount } from "wagmi/actions";
import { tokenAbi, masterContract, lpAbi, vaultAbi, distributorAbi } from "../data";

export const loopOne = async(index) => {
    const data = await readContract({
        ...masterContract,
        functionName: 'poolInfo',
        args: [index]
    })
    return data
}

export const loopTwo = async(lpAddress, address) => {
    const data = await readContracts({
        contracts: [
            {
                address: lpAddress,
                abi: lpAbi,
                functionName:'token0',
            },
            {
                address: lpAddress,
                abi: lpAbi,
                functionName:'token1',
            },
            {
                address: lpAddress,
                abi: lpAbi,
                functionName: 'totalSupply',
            },
            {
                address: lpAddress,
                abi: lpAbi,
                functionName: 'getReserves',
            },
            {
                address: lpAddress,
                abi: tokenAbi,
                functionName: 'balanceOf',
                args: [masterContract.address]
            },
            {
                address: lpAddress,
                abi: lpAbi,
                functionName:'allowance',
                args: [address, masterContract.address],
            },
        ]
    });
    return data
}

export const stakingLoop = async(tokenAddress, address) => {
    const data = await readContracts({
        contracts: [
            {
                address: import.meta.env.VITE_LP,
                abi: lpAbi,
                functionName: 'getReserves',
            },
            {
                address: tokenAddress,
                abi: tokenAbi,
                functionName: 'balanceOf',
                args: [masterContract.address]
            },
            {
                address: tokenAddress,
                abi: tokenAbi,
                functionName:'allowance',
                args: [address, masterContract.address],
            },
            {
                address: '0x0f93aB5AfEE39ecfeC04eB5E2B49dC9F28A77936', //MEGA/wETH
                abi: lpAbi,
                functionName: 'getReserves',
            },
            {
                address: '0xa995397733D2a6D5a51ec5D0Cc378c63E486CbD1', //GGC/wPLS
                abi: lpAbi,
                functionName: 'getReserves',
            },
        ]
    })
    return data;
}

export const loopThree = async(lpAddress, index, address) => {
    const data = await readContracts({
        contracts: [
            {
                address: lpAddress,
                abi: tokenAbi,
                functionName: 'balanceOf',
                args: [address] 
            },
            {
                ...masterContract,
                functionName: 'degenInfo',
                args:[index, address]
            },
            {
                ...masterContract,
                functionName: 'pendingRewards',
                args:[index, address]
            },
            {
                address: lpAddress,
                abi: tokenAbi,
                functionName: 'decimals', 
            },
        ]
    });
    return data
}