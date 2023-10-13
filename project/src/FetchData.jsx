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
    const blockPerYear = 6 * 60 * 24 * 365; //block per minute, hour, day, year
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

    },
    {//Getting wBTC/wPL reserves to calculate wBTC price
        address: '0x1EA22beA96C5498C8347Cc98b76d2dB1D0609Cea',
        abi: lpAbi,
        functionName: 'getReserves',
    
    },
    {//Getting wBTC/wPL reserves to calculate wBTC price
        address: '0x10843FB4c712526E3fEef838D72059EbfC0cF61f',
        abi: lpAbi,
        functionName: 'getReserves',
        
        },
    {//Getting wBTC/wPL reserves to calculate wBTC price
        address: '0x9B00c1e16C9681D791A1143bDf70b42D77AA4f65',
        abi: lpAbi,
        functionName: 'getReserves',
            
        },
    ]
});

//token 0/1 might need swapped
const pulsePrice = parseInt(data[5].result[1].toString())/parseInt(data[5].result[0].toString())
const atropaPrice = parseInt(data[6].result[0].toString())/parseInt(data[6].result[1].toString()) * pulsePrice
const wBtcPrice = parseInt(data[7].result[1].toString())/parseInt(data[7].result[0].toString()) * pulsePrice / 10**10
const afcPrice = parseInt(data[8].result[0].toString())/parseInt(data[8].result[1].toString()) * pulsePrice
const ciaPrice = parseInt(data[9].result[1].toString())/parseInt(data[9].result[0].toString()) * pulsePrice
const trsPrice = parseInt(data[10].result[1].toString())/parseInt(data[10].result[0].toString()) * pulsePrice /10**9

const nativeTokenPriceUsd = (parseInt(data[0].result[1].toString())/parseInt(data[0].result[0].toString()) * pulsePrice).toString();
const nativeToken = await fetchToken({ address: import.meta.env.VITE_TOKEN })
const nativeTokenSupply = nativeToken.totalSupply.formatted;

const numberOfPool = parseInt((data[1].result).toString());
const tokenMintedPerBlock = data[2].result;
const tokenMintedPerDay = parseInt(tokenMintedPerBlock.toString()) / (10**18) * 6 * 60 * 24;
const multiplier = data[3].result;
const totalAllocPoint = data[4].result;

let generalInfo = {};
generalInfo.atropaPrice = atropaPrice;
generalInfo.nativeTokenPriceUsd = nativeTokenPriceUsd;
generalInfo.nativeTokenSupply = nativeTokenSupply;
generalInfo.inflation = tokenMintedPerDay;



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
        if(poolInfo[1] == 0) { //if allocpoint == 0
            continue
        }
        if(poolInfo[0] == '0xf8AB3393b1f5CD6184Fb6800A1fC802043C4063e') {
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

            let lpName = '';
            let isAtrofa = false;
            let isV1 = false;

// ======================== SORT V1 PAIRS AND NAME WITH SYMBOLS ====================================
            if(poolInfo[0] == '0x5EF7AaC0DE4F2012CB36730Da140025B113FAdA4') {
                lpName = 'p' + token0Name.symbol + "-" + token1Name.symbol + " V1";
                isV1 = true;
            }
            else if(poolInfo[0] == '0xF892d93199B4DE0aB1CDf35799Ccf9D5A425581B') {
                lpName = token1Name.symbol + "-" + token0Name.symbol;
            }
            else if(poolInfo[0] == '0xC2131e4A8aaA8A47BeBe87482B67Be2d6701Ce98') {
                lpName = "T.BEAR" + "-" + token0Name.symbol;
            }
            else if(poolInfo[0] == '0x71423f29f8376eF8EFdB9207343a5ff32604C2E3') {
                lpName = "Monat Money" + "-" + token0Name.symbol;
            }
            else if(poolInfo[0] == '0x10843FB4c712526E3fEef838D72059EbfC0cF61f' ||
                poolInfo[0] == '0x0b1B8f70816a4f52427AA7A759b05EAe4e743b40') {
                lpName = "CiA" + "-" + token1Name.symbol;
            }

            else {lpName = token0Name.symbol + "-" + token1Name.symbol}

// ========================= GET THE CORRECT LP PRICE DEPENDING ON PAIRING =======================          
            let lpPriceUsd;
            let token0 = lpToken0Name;
            let token1 = lpToken1Name;

            if(token0Name.name == 'Wrapped Pulse'){
            const lpPriceEth = parseInt(getLpReserves[0].toString()) * 2 / parseInt(lpTotalSupply.toString());
            lpPriceUsd = (lpPriceEth * pulsePrice).toString();
            token0 ='PLS'
            }
            else if (token1Name.name == 'Wrapped Pulse'){
            const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
            lpPriceUsd = (lpPriceEth * pulsePrice).toString();
            token1 = 'PLS'
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
                const lpPriceEth = (parseInt(getLpReserves[0].toString()) * 2 / 10**8) / (parseInt(lpTotalSupply.toString()) /10**18);
                lpPriceUsd = (lpPriceEth * wBtcPrice).toString();
            }
            else if (token1Name.name == 'Wrapped BTC') {
                const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
                lpPriceUsd = (lpPriceEth * wBtcPrice).toString();
            }
            else if(token0Name.name == 'Atropa Fan Club'){
                const lpPriceEth = parseInt(getLpReserves[0].toString()) * 2 / parseInt(lpTotalSupply.toString());
                lpPriceUsd = (lpPriceEth * afcPrice).toString();
            }
            else if (token1Name.name == 'Atropa Fan Club'){
                const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
                lpPriceUsd = (lpPriceEth * afcPrice).toString();
                }
            else if(token0Name.address == '0x2e5898b2e107a3cAf4f0597aCFE5D2e6d73F2196'){
                    const lpPriceEth = parseInt(getLpReserves[0].toString()) * 2 / parseInt(lpTotalSupply.toString());
                    lpPriceUsd = (lpPriceEth * ciaPrice).toString();
                }
            else if (token1Name.address == '0x2e5898b2e107a3cAf4f0597aCFE5D2e6d73F2196'){
                    const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
                    lpPriceUsd = (lpPriceEth * ciaPrice).toString();
                    }
            // else if(token0Name.address == '0x359C29e88992A7F4De7C0a00f78E3373d1A710Cb'){
            //         const lpPriceEth = parseInt(getLpReserves[0].toString()) * 2 / parseFloat(lpTotalSupply.toString());
            //         console.log(lpPriceEth)
            //         lpPriceUsd = (lpPriceEth * trsPrice).toString();
            //         }
            // else if (token1Name.address == '0x359C29e88992A7F4De7C0a00f78E3373d1A710Cb'){
            //         const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseFloat(lpTotalSupply.toString());
            //         console.log(lpPriceEth)
            //         lpPriceUsd = (lpPriceEth * trsPrice).toString();
            //          }
            else if(token0Name.name == 'Atrofarm'){
                        const lpPriceEth = parseInt(getLpReserves[0].toString()) * 2 / parseInt(lpTotalSupply.toString());
                        lpPriceUsd = (lpPriceEth * nativeTokenPriceUsd).toString();
                        }
            else if (token1Name.name == 'Atrofarm'){
                        const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
                        lpPriceUsd = (lpPriceEth * nativeTokenPriceUsd).toString();
                         }     
            if (token0Name.symbol == 'Atrofa' || token1Name.symbol == 'Atrofa') {
                isAtrofa = true;
            };
//=======================================================================================
            const totalStakedUsd = (parseInt(totalStaked.toString()) / 10**18) * lpPriceUsd;

            let Apr
            if (totalStakedUsd == 0) {
                Apr = poolRewardPerYearUsd / 1 * 100
            }
            else {Apr = poolRewardPerYearUsd / totalStakedUsd * 100 }
            if (Apr > 10000000) {Apr = 1000000}

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

                // const userStaked = parseInt(userInfo[0].toString()) / 10**18;
                const userStaked = userInfo[0].toString();
                const userStakedUsd = parseInt(userStaked.toString()) /10**18 * lpPriceUsd;
                const rewardPerShare = poolRewardPerYear / parseInt(totalStaked.toString());
                const rewardPerShareUsd = rewardPerShare * pulsePrice;

                const userShare = parseInt(userStaked.toString()) / (parseInt(totalStaked.toString())/10**18);
                const userShareUsdPerYear = rewardPerShareUsd * userShare;

                allInfo.id = i;
                allInfo.name = lpName;
                allInfo.userStaked = userStaked.toString();
                allInfo.userStakedUsd = userStakedUsd;
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = pendingRewards;
                allInfo.rewardsUsd = pendingRewardsUsd;
                allInfo.userBalance = userBalance.toString();
                // allInfo.userBalance = (parseInt(userBalance.toString()) / 10**18);
                allInfo.allowance = allowance;
                allInfo.address = poolInfo[0];
                allInfo.depositFee = depositFee;
                allInfo.isAtrofa = isAtrofa;
                allInfo.isV1 = isV1;
                allInfo.token0 = token0;
                allInfo.token1 = token1;
            } else {    //user is not connected
                allInfo.name = lpName;
                allInfo.userStaked = '0';
                allInfo.userStakedUsd = '0';
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = '0';
                allInfo.rewardsUsd = '0';
                allInfo.depositFee = depositFee;
                allInfo.isAtrofa = isAtrofa;
                allInfo.isV1 = isV1;
                allInfo.token0 = token0;
                allInfo.token1 = token1;
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

                const userStaked = userInfo[0]
                const userStakedUsd = parseInt(userStaked.toString()) / 10**18 * parseFloat(tokenPriceUsd);

                const rewardPerShare = poolRewardPerYear / parseInt(totalStaked.toString());
                const rewardPerShareUsd = rewardPerShare * pulsePrice;
                const userShare = parseInt(userStaked.toString()) / (parseInt(totalStaked.toString())/ 10**18);
                const userShareUsdPerYear = rewardPerShareUsd * userShare;
        
                allInfo.id = i;
                allInfo.name = tokenInfo.symbol
                allInfo.userStaked = userStaked.toString();
                allInfo.userStakedUsd = userStakedUsd
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2)
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = pendingRewards.toFixed(2);
                allInfo.rewardsUsd = pendingRewardsUsd.toFixed(2);
                allInfo.userBalance = userBalance;
                allInfo.allowance = allowance;
                allInfo.address = poolInfo[0];
                allInfo.depositFee = depositFee;
                allInfo.pulsePrice = pulsePrice;
                allInfo.nativeTokenPriceUsd = nativeTokenPriceUsd;
                allInfo.token = tokenInfo.address

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
                allInfo.token = tokenInfo.address
            }
            stakingPools.push(allInfo);
        } 
    }   
    allPools.generalInfo = general;
    allPools.farmingPools = farmingPools;
    allPools.stakingPools = stakingPools;

    return allPools
}