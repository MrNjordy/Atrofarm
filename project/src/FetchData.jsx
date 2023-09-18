import { fetchBlockNumber, fetchToken, readContract, writeContract, readContracts } from 'wagmi/actions'
import { getAccount } from "wagmi/actions";
import { tokenAbi, masterAbi, masterContract, lpAbi } from "../../data";
import { etherPrice } from "./priceData";
import { useAccount, useConnect } from "wagmi";
import { useEffect, useState } from "react";
import axios from 'axios';

export const fetchData = async () => {
    const account = getAccount();
    const address = account.address;
    const isConnected = account.isConnected;

    const currentBlock = await fetchBlockNumber();
    const currentBlockInt = parseInt(currentBlock.toString());
    const blockPerYear = 5 * 60 * 24 * 365;
//===========================================
const data = await readContracts({
    contracts: [
     {
        address: import.meta.env.VITE_LP,
        abi: lpAbi,
        functionName: 'getReserves',
     },
     {
        ...masterContract,
        functionName: 'poolLength',
     },
     {
        ...masterContract,
        functionName: 'rewardsPerBlock',
     },
     {
        ...masterContract,
        functionName: 'getMultiplier',
        args: [currentBlockInt-1, currentBlockInt]
     },
     {
        ...masterContract,
        functionName: 'totalAllocPoint',
     }
    ]
});
const nativeTokenPriceUsd = (parseInt(data[0].result[1].toString())/parseInt(data[0].result[0].toString()) * etherPrice).toString();
const numberOfPool = parseInt((data[1].result).toString());
const tokenMintedPerBlock = data[2].result;
const multiplier = data[3].result;
const totalAllocPoint = data[4].result;
//============================================
    // const nativeTokenPriceEth = await readContract({
    //     address: import.meta.env.VITE_LP,
    //     abi: lpAbi,
    //     functionName: 'getReserves',
    // })
    // const nativeTokenPriceUsd = (parseInt(nativeTokenPriceEth[1].toString())/parseInt(nativeTokenPriceEth[0].toString()) * etherPrice).toString();
    // const farmNumber = await readContract({
    //     ...masterContract,
    //     functionName: 'poolLength',
    // })
    // const numberOfPool = parseInt(farmNumber.toString());

    // const tokenMintedPerBlock = await readContract({
    //     ...masterContract,
    //     functionName: 'rewardsPerBlock',
    // })
    // const multiplier = await readContract({
    //     ...masterContract,
    //     functionName: 'getMultiplier',
    //     args: [currentBlockInt-1, currentBlockInt]
    // })
    // const totalAllocPoint = await readContract({
    //     ...masterContract,
    //     functionName: 'totalAllocPoint',
    // })

//========================= Fill all pools with the data collected ========================
    let allPools = {}
    let farmingPools = [];
    let stakingPools = [];
    for( let i=0; i<numberOfPool; i++) {
        const allInfo = {}; //object which will contain all data for each pool

        const poolInfo = await readContract({
            ...masterContract,
            functionName: 'poolInfo',
            args: [i]
        })
        //Get the number of tokens staked in pool
        // const totalStaked = await readContract({
        //     address: poolInfo[0],
        //     abi: tokenAbi,
        //     functionName: 'balanceOf',
        //     args: [import.meta.env.VITE_MASTER]
        // })

        const tokenInfo = await fetchToken({ address: poolInfo[0]})

        const poolRewardPerBlock = parseInt(tokenMintedPerBlock.toString()) * parseInt(multiplier.toString()) * parseInt(poolInfo[1].toString()) / parseInt(totalAllocPoint.toString());
        const poolRewardPerYear = poolRewardPerBlock * blockPerYear;
        const poolRewardPerYearUsd = (poolRewardPerYear / 10**18) * nativeTokenPriceUsd;

        if(tokenInfo.name == 'Uniswap V2') {    //farm token is LP token
            const data = await readContracts({
                contracts: [
                    {
                        address: poolInfo[0],
                        abi: lpAbi,
                        functionName:'token0',
                    },
                    {
                        address: import.meta.env.VITE_LP,
                        abi: lpAbi,
                        functionName: 'totalSupply',
                    },
                    {
                        address: import.meta.env.VITE_LP,
                        abi: lpAbi,
                        functionName: 'getReserves',
                    },
                    {
                        address: poolInfo[0],
                        abi: tokenAbi,
                        functionName: 'balanceOf',
                        args: [import.meta.env.VITE_MASTER]
                    }
                ]
            });
            const lpTokensName = data[0].result
            const lpTotalSupply = data[1].result;
            const getLpReserves = data[2].result;
            const totalStaked = data[3].result;
            
            const token1Name = await fetchToken({ address: lpTokensName })
            const lpName = token1Name.symbol + '-wETH LP'

            const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
            const lpPriceUsd = (lpPriceEth * etherPrice).toString();

            const totalStakedUsd = (parseInt(totalStaked.toString()) / 10**18) * lpPriceUsd;

            const Apr = poolRewardPerYearUsd / totalStakedUsd * 100

            if(isConnected) {
                const data = await readContracts({
                    contracts: [
                        {
                            address: poolInfo[0],
                            abi: tokenAbi,
                            functionName: 'balanceOf',
                            args: [address] 
                        },
                        {
                            ...masterContract,
                            functionName: 'degenInfo',
                            args:[i, address]
                        },
                        {
                            ...masterContract,
                            functionName: 'pendingRewards',
                            args:[i, address]
                        }
                    ]
                });
                const userBalance = data[0].result;
                const userInfo = data[1].result;
                const rewards = data[2].result;

                const pendingRewards = (parseFloat(rewards.toString()) / 10**18).toFixed(2);
                const pendingRewardsUsd = (pendingRewards * nativeTokenPriceUsd).toFixed(2);

                const userStaked = parseInt(userInfo[0].toString()) / 10**18;
                const userStakedUsd = userStaked * lpPriceUsd;
                const rewardPerShare = poolRewardPerYear / parseInt(totalStaked.toString());
                const rewardPerShareUsd = rewardPerShare * etherPrice;

                const userShare = parseInt(userStaked.toString()) / (parseInt(totalStaked.toString())/10**18);
                const userShareUsdPerYear = rewardPerShareUsd * userShare;

                allInfo.id = i;
                allInfo.name = lpName;
                allInfo.userStaked = userStaked.toFixed(2);
                allInfo.userStakedUsd = userStakedUsd.toFixed(2);
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = pendingRewards;
                allInfo.rewardsUsd = pendingRewardsUsd;
                allInfo.userBalance = (parseInt(userBalance.toString()) / 10**18);

            } else {    //user is not connected
                allInfo.name = lpName;
                allInfo.userStaked = '0';
                allInfo.userStakedUsd = '0';
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = '0';
                allInfo.rewardsUsd = '0';
            }
            farmingPools.push(allInfo) 

        } else { //Not a LP token ie. single sided pool

            const data = await readContracts({
                contracts: [
                    {
                        address: import.meta.env.VITE_LP,
                        abi: lpAbi,
                        functionName: 'getReserves',
                    },
                    {
                        address: poolInfo[0],
                        abi: tokenAbi,
                        functionName: 'balanceOf',
                        args: [import.meta.env.VITE_MASTER]
                    }
                ]
            })
            const tokenPriceEth = data[0].result;
            const totalStaked = data[1].result;
            //This one would be more generic as long as tokens are paired with the same token eg:wETH
            //Should find a way to find a pair reliably
            // const tokenPair = await readContract({
            //     address: import.meta.env.VITE_FACTORY,
            //     abi: factoryAbi,
            //     functionName: 'getPair',
            //     args: [poolInfo[0], import.meta.env.VITE_WETH]
            // });
            const apiCall = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${poolInfo[0]}`)

            const tokenPriceUsd = (parseInt(tokenPriceEth[1].toString())/parseInt(tokenPriceEth[0].toString()) * etherPrice).toString();
            const totalStakedUsd = (parseInt(totalStaked.toString()) / 10**18) * tokenPriceUsd;

            const Apr = poolRewardPerYearUsd / totalStakedUsd * 100

            if(isConnected) {

                const data = await readContracts({
                    contracts: [
                        {
                            address: poolInfo[0],
                            abi: tokenAbi,
                            functionName: 'balanceOf',
                            args: [address] 
                        },
                        {
                            ...masterContract,
                            functionName: 'degenInfo',
                            args:[i, address]
                        },
                        {
                            ...masterContract,
                            functionName: 'pendingRewards',
                            args:[i, address]
                        }
                    ]
                });
                const userBalance = data[0].result;
                const userInfo = data[1].result;
                const rewards = data[2].result;

                const pendingRewards = (parseFloat(rewards.toString()) / 10**18)
                const pendingRewardsUsd = (pendingRewards * nativeTokenPriceUsd)

                const userStaked = parseInt(userInfo[0].toString()) / 10**18;
                const userStakedUsd = userStaked * parseFloat(tokenPriceUsd);

                const rewardPerShare = poolRewardPerYear / parseInt(totalStaked.toString());
                const rewardPerShareUsd = rewardPerShare * etherPrice;
                const userShare = parseInt(userStaked.toString()) / (parseInt(totalStaked.toString())/ 10**18);
                const userShareUsdPerYear = rewardPerShareUsd * userShare;
        
                allInfo.id = i;
                allInfo.name = tokenInfo.symbol
                allInfo.userStaked = userStaked.toFixed(2)
                allInfo.userStakedUsd = userStakedUsd.toFixed(2)
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2)
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = pendingRewards.toFixed(2);
                allInfo.rewardsUsd = pendingRewardsUsd.toFixed(2);
                allInfo.userBalance = (parseInt(userBalance.toString()) / 10**18)

            } else {    //user not connected
                allInfo.name = tokenInfo.symbol;
                allInfo.userStaked = '0';
                allInfo.userStakedUsd = '0';
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = '0';
                allInfo.rewardsUsd = '0';
            }
            stakingPools.push(allInfo);
        } 
    }   
    allPools.farmingPools = farmingPools;
    allPools.stakingPools = stakingPools;
    console.log("ALL DONE")

    return allPools
}