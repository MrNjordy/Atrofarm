import { fetchBlockNumber, fetchToken, readContract, readContracts } from 'wagmi/actions'
import { getAccount } from "wagmi/actions";
import { tokenAbi, masterContract, lpAbi } from "./data";
import axios from 'axios';

export const fetchData = async () => {
    const account = getAccount();
    const address = account.address;
    const isConnected = account.isConnected;

    const currentBlock = await fetchBlockNumber();
    const currentBlockInt = parseInt(currentBlock.toString());
    const blockPerYear = 5 * 60 * 24 * 365; //block per minute, hour, day, year
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
     },
     {//Getting wPLS / DAI reserves to calculate Pulse price
        address: import.meta.env.VITE_PULSE_LP,
        abi: lpAbi,
        functionName: 'getReserves',
     },
    {//Getting Atropa/wPLS reserves to calculate Atropa price
        address: import.meta.env.VITE_ATROPA_LP,
        abi: lpAbi,
        functionName: 'getReserves',
    },
    {//Getting wBTC/wPL reserves to calculate wBTC price
        address: '0x46E27Ea3A035FfC9e6d6D56702CE3D208FF1e58c',
        abi: lpAbi,
        functionName: 'getReserves',

    }
    ]
});

//token 0/1 might need swapped
const pulsePrice = parseInt(data[5].result[1].toString())/parseInt(data[5].result[0].toString())
const atropaPrice = parseInt(data[6].result[0].toString())/parseInt(data[6].result[1].toString()) * pulsePrice
const wBtcPrice = parseInt(data[7].result[1].toString())/parseInt(data[7].result[0].toString()) * pulsePrice / 10**10
console.log(wBtcPrice)

const nativeTokenPriceUsd = (parseInt(data[0].result[1].toString())/parseInt(data[0].result[0].toString()) * pulsePrice).toString();
const nativeToken = await fetchToken({ address: import.meta.env.VITE_TOKEN })
const nativeTokenSupply = nativeToken.totalSupply.formatted;

const numberOfPool = parseInt((data[1].result).toString());
const tokenMintedPerBlock = data[2].result;
const multiplier = data[3].result;
const totalAllocPoint = data[4].result;

let generalInfo = {};
generalInfo.atropaPrice = atropaPrice;
generalInfo.nativeTokenPriceUsd = nativeTokenPriceUsd;
generalInfo.nativeTokenSupply = nativeTokenSupply;


//========================= Fill all pools with the data collected ========================
    
    let allPools = {}
    let general = [];
    let farmingPools = [];
    let stakingPools = [];

    general.push(generalInfo);
    for( let i=0; i<numberOfPool; i++) {
        const allInfo = {}; //object which will contain all data for each pool

        const poolInfo = await readContract({
            ...masterContract,
            functionName: 'poolInfo',
            args: [i]
        })
        if(poolInfo[1] == 0) {
            continue
        }
        const tokenInfo = await fetchToken({ address: poolInfo[0]})
        const depositFee = parseInt(poolInfo[4].toString()) /100;

        const poolRewardPerBlock = parseInt(tokenMintedPerBlock.toString()) * parseInt(multiplier.toString()) * parseInt(poolInfo[1].toString()) / parseInt(totalAllocPoint.toString());
        const poolRewardPerYear = poolRewardPerBlock * blockPerYear;
        const poolRewardPerYearUsd = (poolRewardPerYear / 10**18) * nativeTokenPriceUsd;

        if(tokenInfo.symbol == 'PLP') {    //farm token is LP token
            const data = await readContracts({
                contracts: [
                    {
                        address: poolInfo[0],
                        abi: lpAbi,
                        functionName:'token0',
                    },
                    {
                        address: poolInfo[0],
                        abi: lpAbi,
                        functionName:'token1',
                    },
                    {
                        address: poolInfo[0],
                        abi: lpAbi,
                        functionName: 'totalSupply',
                    },
                    {
                        address: poolInfo[0],
                        abi: lpAbi,
                        functionName: 'getReserves',
                    },
                    {
                        address: poolInfo[0],
                        abi: tokenAbi,
                        functionName: 'balanceOf',
                        args: [import.meta.env.VITE_MASTER]
                    },
                    {
                        address: poolInfo[0],
                        abi: lpAbi,
                        functionName:'allowance',
                        args: [address, import.meta.env.VITE_MASTER],
                    },
                ]
            });

            const lpToken0Name = data[0].result
            const lpToken1Name = data[1].result
            const lpTotalSupply = data[2].result;
            const getLpReserves = data[3].result;
            const totalStaked = data[4].result;
            const allowance = data[5].result;
            
            const token0Name = await fetchToken({ address: lpToken0Name })
            const token1Name = await fetchToken({ address: lpToken1Name })
            const lpName = token0Name.symbol + "-" + token1Name.symbol + " LP"
            
            let lpPriceUsd;
            if(token0Name.name == 'Wrapped Pulse'){
            const lpPriceEth = parseInt(getLpReserves[0].toString()) * 2 / parseInt(lpTotalSupply.toString());
            lpPriceUsd = (lpPriceEth * pulsePrice).toString();
            }
            else if (token1Name.name == 'Wrapped Pulse'){
            const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
            lpPriceUsd = (lpPriceEth * pulsePrice).toString();
            }
            else if (token0Name.name == 'Atropa') {
            const lpPriceEth = parseInt(getLpReserves[0].toString()) * 2 / parseInt(lpTotalSupply.toString());
            lpPriceUsd = (lpPriceEth * atropaPrice).toString();
            }
            else if (token1Name.name == 'Atropa') {
            const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
            lpPriceUsd = (lpPriceEth * atropaPrice).toString();
            }
            else if (token0Name.name == 'Wrapped BTC') {
                const lpPriceEth = parseInt(getLpReserves[0].toString()) * 2 / parseInt(lpTotalSupply.toString());
                lpPriceUsd = (lpPriceEth * wBtcPrice).toString();
                }
            else if (token1Name.name == 'Wrapped BTC') {
                const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
                lpPriceUsd = (lpPriceEth * wBtcPrice).toString();
            }
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
                const rewardPerShareUsd = rewardPerShare * pulsePrice;

                const userShare = parseInt(userStaked.toString()) / (parseInt(totalStaked.toString())/10**18);
                const userShareUsdPerYear = rewardPerShareUsd * userShare;

                allInfo.id = i;
                allInfo.name = lpName;
                allInfo.userStaked = userStaked;
                allInfo.userStakedUsd = userStakedUsd.toFixed(2);
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = pendingRewards;
                allInfo.rewardsUsd = pendingRewardsUsd;
                allInfo.userBalance = (parseInt(userBalance.toString()) / 10**18);
                allInfo.allowance = allowance;
                allInfo.address = poolInfo[0];
                allInfo.depositFee = depositFee;
            } else {    //user is not connected
                allInfo.name = lpName;
                allInfo.userStaked = '0';
                allInfo.userStakedUsd = '0';
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = '0';
                allInfo.rewardsUsd = '0';
                allInfo.depositFee = depositFee;
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
                    },
                    {
                        address: poolInfo[0],
                        abi: tokenAbi,
                        functionName:'allowance',
                        args: [address, import.meta.env.VITE_MASTER],
                    },
                ]
            })
            const tokenPriceEth = data[0].result;
            const totalStaked = data[1].result;
            const allowance = data[2].result;

            //This one would be more generic as long as tokens are paired with the same token eg:wETH
            //Should find a way to find a pair reliably
            // const tokenPair = await readContract({
            //     address: import.meta.env.VITE_FACTORY,
            //     abi: factoryAbi,
            //     functionName: 'getPair',
            //     args: [poolInfo[0], import.meta.env.VITE_WETH]
            // });
            //const apiCall = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${poolInfo[0]}`)

            const tokenPriceUsd = (parseInt(tokenPriceEth[1].toString())/parseInt(tokenPriceEth[0].toString()) * pulsePrice).toString();
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
                const rewardPerShareUsd = rewardPerShare * pulsePrice;
                const userShare = parseInt(userStaked.toString()) / (parseInt(totalStaked.toString())/ 10**18);
                const userShareUsdPerYear = rewardPerShareUsd * userShare;
        
                allInfo.id = i;
                allInfo.name = tokenInfo.symbol
                allInfo.userStaked = userStaked;
                allInfo.userStakedUsd = userStakedUsd.toFixed(2)
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2)
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = pendingRewards.toFixed(2);
                allInfo.rewardsUsd = pendingRewardsUsd.toFixed(2);
                allInfo.userBalance = (parseInt(userBalance.toString()) / 10**18)
                allInfo.allowance = allowance;
                allInfo.address = poolInfo[0];
                allInfo.depositFee = depositFee;
                allInfo.pulsePrice = pulsePrice;
                allInfo.nativeTokenPriceUsd = nativeTokenPriceUsd;

            } else {    //user not connected
                allInfo.name = tokenInfo.symbol;
                allInfo.userStaked = '0';
                allInfo.userStakedUsd = '0';
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = '0';
                allInfo.rewardsUsd = '0';
                allInfo.depositFee = depositFee;
                allInfo.pulsePrice = pulsePrice;
                allInfo.nativeTokenPriceUsd = nativeTokenPriceUsd;
            }
            stakingPools.push(allInfo);
        } 
    }   
    allPools.generalInfo = general;
    allPools.farmingPools = farmingPools;
    allPools.stakingPools = stakingPools;

    return allPools
}