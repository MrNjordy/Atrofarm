import { fetchBlockNumber, fetchToken, readContract, readContracts } from 'wagmi/actions'
import { getAccount } from "wagmi/actions";
import { useBlockNumber } from 'wagmi';
import { tokenAbi, masterContract, lpAbi, vaultAbi, distributorAbi } from "./data";
import axios from 'axios';
import { etherUnits } from 'viem';
import { someInfo } from './functions/generalInfo';
import { loopOne, loopThree, loopTwo, stakingLoop } from './functions/loops';

export const fetchData = async () => {
    const account = getAccount();
    const address = account.address;
    const isConnected = account.isConnected;

    const currentBlock = await fetchBlockNumber()
    const currentBlockInt = parseInt(currentBlock.toString());
    const blockPerYear = 6 * 60 * 24 * 365; //block per minute, hour, day, year
//===========================================

const data = await someInfo(address, currentBlockInt);

//token 0/1 might need swapped
const pulsePrice = parseInt(data[5].result[1].toString())/parseInt(data[5].result[0].toString())
const atropaPrice = parseInt(data[6].result[0].toString())/parseInt(data[6].result[1].toString()) * pulsePrice
const wBtcPrice = parseInt(data[7].result[1].toString())/parseInt(data[7].result[0].toString()) * pulsePrice / 10**10
const wethPrice = parseInt(data[8].result[1].toString())/parseInt(data[8].result[0].toString()) * pulsePrice
const burnedAtrofa = parseInt(data[9].result.toString()) / 10**18;
const daiPrice = parseInt(data[11].result[0].toString())/parseInt(data[11].result[1].toString()) * pulsePrice
const plsxPrice = parseInt(data[12].result[1].toString())/parseInt(data[12].result[0].toString()) * pulsePrice
const minuPrice =  parseInt(data[13].result[1].toString())/parseInt(data[13].result[0].toString()) * daiPrice;
const anonPrice =  parseInt(data[19].result[1].toString())/parseInt(data[19].result[0].toString()) * pulsePrice;
const degengPice = parseInt(data[20].result[1].toString())/parseInt(data[20].result[0].toString()) * pulsePrice / 10**10;

const plsReserve = parseInt(data[10].result[1].toString())/10**18
const plsbReserve = parseInt(data[10].result[0].toString())/10**12
const plsbPrice = plsReserve/plsbReserve * pulsePrice

const nativeTokenPriceUsd = (parseInt(data[0].result[1].toString())/parseInt(data[0].result[0].toString()) * pulsePrice).toString();
const nativeToken = await fetchToken({ address: import.meta.env.VITE_TOKEN })
const nativeTokenSupply = nativeToken.totalSupply.formatted;

const ggcPrice = (parseInt(data[14].result[1].toString())/parseInt(data[14].result[0].toString()) * pulsePrice).toString();
const goatPrice = (parseInt(data[17].result[0].toString())/parseInt(data[17].result[1].toString()) * pulsePrice).toString();
const ggcToken = await fetchToken( {address: '0x393672F3D09E7fC18E90b6113DCe8958e8B3A13b'})
const ggcBurn = parseInt(data[15].result.toString()) / 10**18;
const ggcTotalSupply = ggcToken.totalSupply.formatted - ggcBurn;
const ggcReflections = parseInt(data[16].result.toString()) / 10**18;
const ggcReflectionsUsd = ggcReflections * goatPrice;
const ggcReflectionsUser = isConnected? parseInt(data[18].result[2].toString()) / 10**18 : 0;
const ggcReflectionsUserUsd = ggcReflectionsUser * goatPrice;

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
generalInfo.burned = burnedAtrofa;
generalInfo.pulsePrice = pulsePrice;
generalInfo.daiPrice = daiPrice;
generalInfo.plsxPrice = plsxPrice;
generalInfo.ggcPrice = ggcPrice;
generalInfo.ggcTotalSupply = ggcTotalSupply;
generalInfo.ggcBurn = ggcBurn;
generalInfo.ggcReflections = ggcReflections;
generalInfo.ggcReflectionsUsd = ggcReflectionsUsd;
generalInfo.ggcReflectionsUser = ggcReflectionsUser;
generalInfo.ggcReflectionsUserUsd = ggcReflectionsUserUsd;



//========================= Fill all pools with the data collected ========================
//=========================================================================================== 
    
    let allPools = {}
    let general = [];
    let farmingPools = [];
    let stakingPools = [];

    console.log("fetch data start")
    general.push(generalInfo);

    let promises = [];
    for( let i=0; i<numberOfPool; i++) {
        let tmpPromise = loopOne(i);
        promises.push(tmpPromise);
    }
    let poolInfo = await Promise.all(promises);

    let promiseToken = [];
    for( let i=0; i<numberOfPool; i++) {
        let tmpPromiseToken = fetchToken({ address: poolInfo[i][0]});
        promiseToken.push(tmpPromiseToken);
    }
    let tokenInfo = await Promise.all(promiseToken)

    let farmTokensInfo = [];
    let stakingTokensInfo = [];
    for(let i=0; i<numberOfPool; i++) {
        if(tokenInfo[i].symbol == 'PLP' || tokenInfo[i].symbol == '9mm-LP') {
            farmTokensInfo.push(tokenInfo[i]);
        }
        else { stakingTokensInfo.push(tokenInfo[i]) }
    }

    let farmTokens = [];
    let stakingTokens = [];
    for(let i=0; i<numberOfPool; i++) {
        if(tokenInfo[i].symbol == 'PLP' || tokenInfo[i].symbol == '9mm-LP') {
            farmTokens.push(poolInfo[i]);
        }
        else { stakingTokens.push(poolInfo[i]) }
    }

    let promisesTwo = [];
    let promiseStaking = [];
    for( let i=0; i<farmTokens.length; i++) {
        let tmpPromiseTwo = loopTwo(farmTokens[i][0], address);
        promisesTwo.push(tmpPromiseTwo);
    }

    for( let i=0; i<stakingTokens.length; i++) {
        let tmpPromiseStaking = stakingLoop(stakingTokens[i][0], address);
        promiseStaking.push(tmpPromiseStaking);
    }
    let loopTwoResults = await Promise.all(promisesTwo);
    let stakingLoopResults = await Promise.all(promiseStaking)

    let promiseLpToken0 = [];
    let promiseLpToken1 = [];
    for( let i=0; i<loopTwoResults.length; i++) {
        let tmpPromiseToken0 = fetchToken({ address: loopTwoResults[i][0].result});
        let tmpPromiseToken1 = fetchToken({ address: loopTwoResults[i][1].result});
        promiseLpToken0.push(tmpPromiseToken0);
        promiseLpToken1.push(tmpPromiseToken1);
    }
    let lpToken0Info = await Promise.all(promiseLpToken0)
    let lpToken1Info = await Promise.all(promiseLpToken1)

    let promisesThree = [];
    let promisesThreeStaking = [];
    if(isConnected) {
        for( let i=0; i<farmTokens.length; i++) {
            let tmpPromiseThree = loopThree(farmTokens[i][0], i, address);
            promisesThree.push(tmpPromiseThree);
        }
        for( let i=0; i<stakingTokens.length; i++) {
            let tmpPromiseThree = loopThree(stakingTokens[i][0], i, address);
            promisesThreeStaking.push(tmpPromiseThree);
        }
    }
    let loopThreeResults = await Promise.all(promisesThree)
    let loopThreeStakingR = await Promise.all(promisesThreeStaking)

//=============================================================================
//=======================   NEXT: USE THE INFO COLLECTED =====================
    console.log("info fetched")
    for( let i=0; i<farmTokens.length; i++) {

        const allInfo = {}; //object which will contain all data for each pool
        const rewardAlloc = farmTokens[i][1];
        const depositFee = parseInt(farmTokens[i][4].toString()) /100;

        const poolRewardPerBlock = parseInt(tokenMintedPerBlock.toString()) * parseInt(multiplier.toString()) * parseInt(farmTokens[i][1].toString()) / parseInt(totalAllocPoint.toString());
        const poolRewardPerYear = poolRewardPerBlock * blockPerYear;
        const poolRewardPerYearUsd = (poolRewardPerYear / 10**18) * nativeTokenPriceUsd;

                // if(
                    //  poolInfo[i][1] == 0
        //     || poolInfo[i][0] == '0x7824E9940AD6d3C7c633B28160C5Ab6F2847ED8F'
        //     || poolInfo[i][0] == '0xf8AB3393b1f5CD6184Fb6800A1fC802043C4063e'
        //     || poolInfo[i][0] == '0x10843FB4c712526E3fEef838D72059EbfC0cF61f'
        //     || poolInfo[i][0] == '0xB231AFB4f010E68eaA11dE1F7Ef9E1618967de73'
        //     || poolInfo[i][0] == '0x9AEaef961DE2D3f6A6999D5bA7436FB6f2d01013'
        //     || poolInfo[i][0] == '0x7DDCD6131753C0DE6e88E3d515a87245fAD0be1C' 
        //     || poolInfo[i][0] == '0x88e120936FFc1297431e14157d4110379F53F830'
        //     || poolInfo[i][0] == '0x9928bC26D73F1470043637f50898908AB80379a3'
        //     || poolInfo[i][0] == '0xc0a705bF4F57780Bd48B2bf25394ecA5Feb96746'
        //     || poolInfo[i][0] == '0x05E981a0Fa6afDe3043187d44B7E09b6aa38f1ee'
        //     || poolInfo[i][0] == '0x0A849f780CAf3b9b8E74034F3ECd4e93d228246A'
        //     || poolInfo[i][0] == '0x7824E9940AD6d3C7c633B28160C5Ab6F2847ED8F'
        //     ) {
        //     continue
        // }

            const lpToken0Name = loopTwoResults[i][0].result
            const lpToken1Name = loopTwoResults[i][1].result
            const lpTotalSupply = loopTwoResults[i][2].result;
            const getLpReserves = loopTwoResults[i][3].result;
            const totalStaked = loopTwoResults[i][4].result;
            const allowance = loopTwoResults[i][5].result;
            
            const token0Name = lpToken0Info[i]
            const token1Name = lpToken1Info[i]

            let lpName = '';
            let isAtrofa = false;
            let isV1 = false;

            // ======================== SORT V1 PAIRS AND NAME WITH SYMBOLS ====================================
            if(poolInfo[i][0] == '0x5EF7AaC0DE4F2012CB36730Da140025B113FAdA4') {
                lpName = 'p' + token0Name.symbol + "-" + token1Name.symbol + " V1";
                isV1 = true;
            }
            else if(poolInfo[i][0] == '0xF892d93199B4DE0aB1CDf35799Ccf9D5A425581B') {
                lpName = token1Name.symbol + "-" + token0Name.symbol;
            }
            else if(poolInfo[i][0] == '0x0f93aB5AfEE39ecfeC04eB5E2B49dC9F28A77936') {
                lpName = token1Name.symbol + "-" + token0Name.symbol;
            }
            else if(poolInfo[i][0] == '0xc2eACD88cb2579DFe0890f887A34feAe729d522B') {
                lpName = token1Name.symbol + "-" + token0Name.symbol;
            }
            else if(poolInfo[i][0] == '0xC2131e4A8aaA8A47BeBe87482B67Be2d6701Ce98') {
                lpName = "T.BEAR" + "-" + token0Name.symbol;
                token1Name.symbol = "BEAR";
            }
            else if(poolInfo[i][0] == '0x71423f29f8376eF8EFdB9207343a5ff32604C2E3') {
                lpName = "Monat Money" + "-" + token0Name.symbol;
                token1Name.symbol = "Monat";
            }
            else if(poolInfo[i][0] == '0x10843FB4c712526E3fEef838D72059EbfC0cF61f' ||
            poolInfo[i][0] == '0x0b1B8f70816a4f52427AA7A759b05EAe4e743b40') {
                lpName = "CiA" + "-" + token1Name.symbol;
            }
            else if(poolInfo[i][0] == '0x3D3B080A1Ec1AFc121a27AE4cBad17A14E80f7B5' ||
            poolInfo[i][0] == '0x0b1B8f70816a4f52427AA7A759b05EAe4e743b40') {
            lpName = token1Name.symbol + "-" + token0Name.symbol;
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
            else if(token0Name.name == 'Atrofarm'){
                const lpPriceEth = parseInt(getLpReserves[0].toString()) * 2 / parseInt(lpTotalSupply.toString());
                lpPriceUsd = (lpPriceEth * nativeTokenPriceUsd).toString();
            }
            else if (token1Name.name == 'Atrofarm'){
                const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
                lpPriceUsd = (lpPriceEth * nativeTokenPriceUsd).toString();
            }
            else if(token0Name.address == '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C'){ //WETH
                const lpPriceEth = parseInt(getLpReserves[0].toString()) * 2 / parseInt(lpTotalSupply.toString());
                lpPriceUsd = (lpPriceEth * wethPrice).toString();
            }
            else if (token1Name.address == '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C'){ //WETH
                const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
                lpPriceUsd = (lpPriceEth * wethPrice).toString();
            }
            else if(token0Name.address == '0x5EE84583f67D5EcEa5420dBb42b462896E7f8D06'){ //PLSB
                const lpPriceEth = (parseInt(getLpReserves[0].toString()) * 2 /10**12) / (parseInt(lpTotalSupply.toString()) /10**18);
                lpPriceUsd = (lpPriceEth * plsbPrice).toString();
            }
            else if (token1Name.address == '0x5EE84583f67D5EcEa5420dBb42b462896E7f8D06'){ //PLSB
                const lpPriceEth = (parseInt(getLpReserves[1].toString()) * 2 /10**12) / (parseInt(lpTotalSupply.toString()) /10**18);
                lpPriceUsd = (lpPriceEth * plsbPrice).toString();
            }
            else if(token0Name.address == '0x0E5E2d2480468561dFF0132317615F7D6C27D397'){ //MINU
                const lpPriceEth = (parseInt(getLpReserves[0].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * minuPrice).toString();
            }
            else if (token1Name.address == '0x0E5E2d2480468561dFF0132317615F7D6C27D397'){ //MINU
                const lpPriceEth = (parseInt(getLpReserves[1].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * minuPrice).toString();
            } 
            else if(token0Name.address == '0x393672F3D09E7fC18E90b6113DCe8958e8B3A13b'){ //GGC
                const lpPriceEth = (parseInt(getLpReserves[0].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * ggcPrice).toString();
            }
            else if (token1Name.address == '0x393672F3D09E7fC18E90b6113DCe8958e8B3A13b'){ //GGC
                const lpPriceEth = (parseInt(getLpReserves[1].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * ggcPrice).toString();
            }
            else if(token0Name.address == '0x075F7F657AEAD0e698EDb4E0A47d1DEF869536B4'){ //GGC
                const lpPriceEth = (parseInt(getLpReserves[0].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * anonPrice).toString();
            }
            else if (token1Name.address == '0x075F7F657AEAD0e698EDb4E0A47d1DEF869536B4'){ //GGC
                const lpPriceEth = (parseInt(getLpReserves[1].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * anonPrice).toString();
            }        
            if (token0Name.symbol == 'Atrofa' || token1Name.symbol == 'Atrofa') {
                isAtrofa = true;
            };

    //=======================================================================================
    //=======================================================================================
            const totalStakedUsd = (parseInt(totalStaked.toString()) / 10**18) * lpPriceUsd;

            let Apr;
            if (totalStakedUsd == 0) {
                Apr = poolRewardPerYearUsd / 1 * 100
            }
            else {Apr = poolRewardPerYearUsd / totalStakedUsd * 100 }
            if (Apr > 10000000) {Apr = 1000000}

            if(isConnected) {
                const userBalance = loopThreeResults[i][0].result;
                const userInfo = loopThreeResults[i][1].result;
                const rewards = loopThreeResults[i][2].result;

                const pendingRewards = (parseFloat(rewards.toString()) / 10**18).toFixed(2);
                const pendingRewardsUsd = (pendingRewards * nativeTokenPriceUsd).toFixed(2);

                // const userStaked = parseInt(userInfo[0].toString()) / 10**18;
                const userStaked = userInfo[0].toString();
                const userStakedUsd = parseInt(userStaked.toString()) /10**18 * lpPriceUsd;
                const rewardPerShare = poolRewardPerYear / parseInt(totalStaked.toString());
                const rewardPerShareUsd = rewardPerShare * pulsePrice;

                const userShare = parseInt(userStaked.toString()) / (parseInt(totalStaked.toString())/10**18);
                const userShareUsdPerYear = rewardPerShareUsd * userShare;
            // ================= GET THE COMPOSITION OF LP TOKENS ==================
                //Amount of each token per LP token
                const token0Amount = parseInt(getLpReserves[0].toString())/ parseInt(lpTotalSupply.toString())
                const token1Amount = parseInt(getLpReserves[1].toString()) / parseInt(lpTotalSupply.toString())

                const token0staked = token0Amount * (parseInt(userStaked) / 10**token0Name.decimals)
                const token1staked = token1Amount * (parseInt(userStaked) / 10**token1Name.decimals)

                allInfo.id = i;
                allInfo.name = lpName;
                allInfo.userStaked = userStaked.toString();
                allInfo.userStakedUsd = userStakedUsd;
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = pendingRewards;
                allInfo.rewardsUsd = pendingRewardsUsd;
                allInfo.userBalance = userBalance.toString();
                allInfo.allowance = allowance;
                allInfo.address = farmTokens[i][0];
                allInfo.depositFee = depositFee;
                allInfo.isAtrofa = isAtrofa;
                allInfo.isV1 = isV1;
                allInfo.token0 = token0;
                allInfo.token1 = token1;
                allInfo.rewardAlloc = rewardAlloc;
                allInfo.token0Staked = token0staked;
                allInfo.token1Staked = token1staked;
                allInfo.token0Symbol = token0Name.symbol;
                allInfo.token1Symbol = token1Name.symbol;

            }
            else { //Not Connected
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
                allInfo.rewardAlloc = rewardAlloc;
            } 
            farmingPools.push(allInfo)
    

// =========================== SINGLE SIDED STAKING ==============================
        
        }
            for( let i=0; i<stakingTokens.length; i++) {


                if(
                    stakingTokens[i][1] == 0
                    || stakingTokens[i][0] == '0x7824E9940AD6d3C7c633B28160C5Ab6F2847ED8F'
                    || stakingTokens[i][0] == '0xf8AB3393b1f5CD6184Fb6800A1fC802043C4063e'
                    || stakingTokens[i][0] == '0x10843FB4c712526E3fEef838D72059EbfC0cF61f'
                    || stakingTokens[i][0] == '0xB231AFB4f010E68eaA11dE1F7Ef9E1618967de73'
                    || stakingTokens[i][0] == '0x9AEaef961DE2D3f6A6999D5bA7436FB6f2d01013'
                    || stakingTokens[i][0] == '0x7DDCD6131753C0DE6e88E3d515a87245fAD0be1C' 
                    || stakingTokens[i][0] == '0x88e120936FFc1297431e14157d4110379F53F830'
                    || stakingTokens[i][0] == '0x9928bC26D73F1470043637f50898908AB80379a3'
                    || stakingTokens[i][0] == '0xc0a705bF4F57780Bd48B2bf25394ecA5Feb96746'
                    || stakingTokens[i][0] == '0x05E981a0Fa6afDe3043187d44B7E09b6aa38f1ee'
                    || stakingTokens[i][0] == '0x0A849f780CAf3b9b8E74034F3ECd4e93d228246A'
                    || stakingTokens[i][0] == '0x7824E9940AD6d3C7c633B28160C5Ab6F2847ED8F'
            ) {
            continue
        }
                
                console.log("tok", stakingTokens[i])
                console.log("HERE", i, "--",stakingLoopResults[i])

                const allInfo = {}; //object which will contain all data for each pool
                const rewardAlloc = stakingTokens[i][1];
                const depositFee = parseInt(stakingTokens[i][4].toString()) /100;
        
                const poolRewardPerBlock = parseInt(tokenMintedPerBlock.toString()) * parseInt(multiplier.toString()) * parseInt(stakingTokens[i][1].toString()) / parseInt(totalAllocPoint.toString());
                const poolRewardPerYear = poolRewardPerBlock * blockPerYear;
                const poolRewardPerYearUsd = (poolRewardPerYear / 10**18) * nativeTokenPriceUsd;

            const tokenPriceEth = stakingLoopResults[i][0].result;
            const totalStaked = stakingLoopResults[i][1].result;
            const allowance = stakingLoopResults[i][2].result;
            const megaReserve = stakingLoopResults[i][3].result;
            const ggcReserve = stakingLoopResults[i][4].result;

            const AtrofaPriceUsd = (parseInt(tokenPriceEth[1].toString())/parseInt(tokenPriceEth[0].toString()) * pulsePrice).toString();
            const megaPrice = (parseInt(megaReserve[0].toString())/parseInt(megaReserve[1].toString()) / 10**12 * wethPrice).toString();
            const ggcPrice = (parseInt(ggcReserve[1].toString())/parseInt(ggcReserve[0].toString()) * pulsePrice).toString();

            let tokenPriceUsd;
            if (stakingTokens[i][0] == '0x303f764A9c9511c12837cD2D1ECF13d4a6F99E17') {
                tokenPriceUsd = AtrofaPriceUsd;
            }
            else if (stakingTokens[i][0] == '0x8eDb13CE75562056DFf2221D193557Fb4A05770D') {
                tokenPriceUsd = megaPrice;
            }
            else if (stakingTokens[i][0] == '0x393672F3D09E7fC18E90b6113DCe8958e8B3A13b') {
                tokenPriceUsd = ggcPrice;

            }

            let totalStakedUsd = stakingTokens[i][0] == '0x8eDb13CE75562056DFf2221D193557Fb4A05770D' ?
                                    (parseInt(totalStaked.toString()) / 10**6) * tokenPriceUsd :
                                    (parseInt(totalStaked.toString()) / 10**18) * tokenPriceUsd;
            console.log("staked", totalStakedUsd)
            if(isConnected) {

                const userBalance = loopThreeStakingR[i][0].result;
                const userInfo = loopThreeStakingR[i][1].result;
                const rewards = loopThreeStakingR[i][2].result;
                const decimals = loopThreeStakingR[i][3].result;

                let Apr =0;
                if (totalStakedUsd == 0) {
                    Apr = poolRewardPerYearUsd / 1 * 100
                }
                else {Apr = poolRewardPerYearUsd / totalStakedUsd * 100 }
                if (Apr > 10000000) {Apr = 1000000}


                const pendingRewards = (parseFloat(rewards.toString()) / 10**18)
                const pendingRewardsUsd = (pendingRewards * nativeTokenPriceUsd)

                const userStaked = userInfo[0]
                const userStakedUsd = parseInt(userStaked.toString()) / (10**decimals) * parseFloat(tokenPriceUsd);
                const rewardPerShare = poolRewardPerYear / parseInt(totalStaked.toString());
                const rewardPerShareUsd = rewardPerShare * pulsePrice;
                const userShare = parseInt(userStaked.toString()) / (parseInt(totalStaked.toString()));
                const userShareUsdPerYear = rewardPerShareUsd * userShare;
        
                allInfo.id = i;
                allInfo.name = stakingTokensInfo[i].symbol
                allInfo.userStaked = userStaked.toString();
                allInfo.userStakedUsd = userStakedUsd
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2)
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = pendingRewards.toFixed(2);
                allInfo.rewardsUsd = pendingRewardsUsd.toFixed(2);
                allInfo.userBalance = userBalance;
                allInfo.allowance = allowance;
                allInfo.address = stakingTokens[i][0];
                allInfo.depositFee = depositFee;
                allInfo.pulsePrice = pulsePrice;
                allInfo.nativeTokenPriceUsd = nativeTokenPriceUsd;
                allInfo.token = stakingTokensInfo[i].address

            } else {    //user not connected
                allInfo.name = stakingTokensInfo[i].symbol;
                allInfo.userStaked = '0';
                allInfo.userStakedUsd = '0';
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = '0';
                allInfo.rewardsUsd = '0';
                allInfo.depositFee = depositFee;
                allInfo.pulsePrice = pulsePrice;
                allInfo.nativeTokenPriceUsd = nativeTokenPriceUsd;
                allInfo.token = stakingTokensInfo[i].address
            }
            stakingPools.push(allInfo);
        }  
    allPools.generalInfo = general;
    allPools.farmingPools = farmingPools;
    allPools.stakingPools = stakingPools;

    return allPools
}