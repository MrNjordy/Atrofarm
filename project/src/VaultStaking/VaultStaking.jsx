import { useAccount } from "wagmi";
import { fetchToken, readContracts, fetchBlockNumber } from 'wagmi/actions';
import { useEffect, useState } from "react";
import { Flex, HStack, Box, Center, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, useNumberInput, Spinner, Text, Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, VStack, Image, SimpleGrid } from "@chakra-ui/react"
import { useContext } from "react";
import { InfoContext } from "../App";
import { vaultAbi, tokenAbi, masterContract, lpAbi } from "../data";
import VaultInfo from "./VaultInfo";
import { Link } from "react-router-dom";

function VaultStaking() {
    const allPools = useContext(InfoContext);
    const [vaults, setVaults] = useState([]);
    const [maxDai, setMaxDai] = useState();
    const [daiPrice, setDaiPrice] = useState();
    const [maxPulse, setMaxPulse] = useState();
    const [pulsePrice, setPulsePrice] = useState();
    const [maxPlsx, setMaxPlsx] = useState();
    const [plsxPrice, setPlsxPrice] = useState();
    const { address ,isConnected } = useAccount();

    useEffect(() => {
        let pulsePrice;
        let nativeTokenPriceUsd;
        let daiVault = {};
        let pulseVault = {};
        let plsxVault = {};
        let allVaults = [];

        function wait() {
            if (!allPools) {
              setTimeout(wait, 100)
            } else {
                pulsePrice = allPools.generalInfo[0].pulsePrice;
                nativeTokenPriceUsd = allPools.generalInfo[0].nativeTokenPriceUsd;
            }
        }
        wait()
        async function getInfo() {
            const currentBlock = await fetchBlockNumber();
            const currentBlockInt = parseInt(currentBlock.toString());
            const blockPerYear = 6 * 60 * 24 * 365;

//========================= DAI VAULT =============================================================

            const daiInfo = await fetchToken({ address: '0xefd766ccb38eaf1dfd701853bfce31359239f305'})

            const daiGeneralData = await readContracts ({
                contracts: [
                    {
                        address: '0xefd766ccb38eaf1dfd701853bfce31359239f305',
                        abi: tokenAbi,
                        functionName: 'balanceOf',
                        args:['0x5726f36e62cf761332F5c655b68bc2E5D55ED083']
                     },
                     {
                        ...masterContract,
                        functionName: 'getMultiplier',
                        args: [currentBlockInt-1, currentBlockInt]
                     },
                     {
                     ...masterContract,
                     functionName: 'poolInfo',
                     args: [34]
                     },
                     {
                        ...masterContract,
                        functionName: 'totalAllocPoint',
                     },
                     {
                        address: '0x5726f36e62cf761332F5c655b68bc2E5D55ED083',
                        abi: vaultAbi,
                        functionName: 'getVaultTokenPulseValue',
                    },
                    {
                        ...masterContract,
                        functionName: 'rewardsPerBlock',
                    },
                    {
                        address: '0x5726f36e62cf761332F5c655b68bc2E5D55ED083',
                        abi: vaultAbi,
                        functionName: 'poolInfo',
                        args: [0]
                    },
                    {
                        address: '0x5726f36e62cf761332F5c655b68bc2E5D55ED083',
                        abi: vaultAbi,
                        functionName: 'getMaxStakedAmount',
                        args: [address]
                    },
                ]
            })

            const totalDaiStaked = daiGeneralData[0].result;
            let multiplier = daiGeneralData[1].result;
            let poolInfo = daiGeneralData[2].result;
            let totalAllocPoint = daiGeneralData[3].result;
            const daiPulseValue = daiGeneralData[4].result;
            let tokenMintedPerBlock = daiGeneralData[5].result;
            let vaultInfo = daiGeneralData[6].result;
            let maxDaiStake = daiGeneralData[7].result;

            const daiPrice = parseInt(daiPulseValue.toString()) * pulsePrice / 10**18

            const totalDaiStakedUsd = parseInt(totalDaiStaked.toString()) * daiPrice /10**18;
            let poolRewardPerBlock = parseInt(tokenMintedPerBlock.toString()) * parseInt(multiplier.toString()) * parseInt(poolInfo[1].toString()) / parseInt(totalAllocPoint.toString());
            let poolRewardPerYear = poolRewardPerBlock * blockPerYear;
            let poolRewardPerYearUsd = (poolRewardPerYear / 10**18) * nativeTokenPriceUsd;

            let depositFee = parseInt(vaultInfo[3].toString()) / 100;
            let maxDaiStakeUsd = parseInt(maxDaiStake) * pulsePrice /10**18;

            let Apr;
            if (totalDaiStakedUsd == 0) {
                Apr = poolRewardPerYearUsd / 1 * 100
            }
            else {Apr = poolRewardPerYearUsd / totalDaiStakedUsd * 100 }
            if (Apr > 10000000) {Apr = 1000000}

            if(isConnected) {
                const daiData = await readContracts ({
                    contracts: [
                        {
                            address: '0x5726f36e62cf761332F5c655b68bc2E5D55ED083',
                            abi: vaultAbi,
                            functionName: 'degenInfo',
                            args:[0, address]
                        },
                        {
                            address: '0x5726f36e62cf761332F5c655b68bc2E5D55ED083',
                            abi: vaultAbi,
                            functionName: 'pendingRewards',
                            args:[address]
                        },
                        {
                            address: '0xefd766ccb38eaf1dfd701853bfce31359239f305',
                            abi: tokenAbi,
                            functionName: 'balanceOf',
                            args:[address]
                        },
                        {
                            address: '0xefd766ccb38eaf1dfd701853bfce31359239f305',
                            abi: lpAbi,
                            functionName:'allowance',
                            args: [address, '0x5726f36e62cf761332F5c655b68bc2E5D55ED083'],
                        },
                    ]
                })

                const userDaiInfo = daiData[0].result;
                const daiRewards = daiData[1].result;
                const userDaiBalance = daiData[2].result;
                const daiAllowance = daiData[3].result;

                const userDaiStaked = userDaiInfo[0];
                const userDaiStakedUsd = parseInt(userDaiStaked.toString()) * daiPrice;            
                const daiActualRewards = parseFloat((daiRewards.actualRewards).toString());
                const daiActualRewardsUsd = (daiActualRewards * nativeTokenPriceUsd);
                const daiBurnRewards = parseFloat((daiRewards.burnedRewards).toString());
                const daiBurnRewardsUsd = (daiBurnRewards * nativeTokenPriceUsd);

                daiVault.id = 1;
                daiVault.name = daiInfo.symbol;
                daiVault.userStaked = userDaiStaked;
                daiVault.userStakedUsd = userDaiStakedUsd;
                daiVault.totalStakedUsd = totalDaiStakedUsd;
                daiVault.apr = parseInt(Apr);
                daiVault.actualRewards = daiActualRewards;
                daiVault.actualRewardsUsd = daiActualRewardsUsd;
                daiVault.burnRewards = daiBurnRewards;
                daiVault.burnRewardsUsd = daiBurnRewardsUsd;
                daiVault.userBalance = userDaiBalance;
                daiVault.allowance = daiAllowance;
                daiVault.address = "0xefd766ccb38eaf1dfd701853bfce31359239f305";
                daiVault.vaultAddress = '0x5726f36e62cf761332F5c655b68bc2E5D55ED083';
                daiVault.depositFee = depositFee;
                daiVault.maxStake = maxDaiStake;
                daiVault.maxStakeUsd = maxDaiStakeUsd;
                daiVault.price = daiPrice;

            }
            else { //Not connected

                daiVault.id = 1;
                daiVault.name = daiInfo.symbol;
                daiVault.userStaked = '0';
                daiVault.userStakedUsd = '0';
                daiVault.totalStakedUsd = totalDaiStakedUsd.toFixed(2);
                daiVault.apr = parseInt(Apr);
                daiVault.actualRewards = '0';
                daiVault.actualRewardsUsd = '0';
                daiVault.burnRewards = '0';
                daiVault.burnRewardsUsd = '0';
                daiVault.address = "0xefd766ccb38eaf1dfd701853bfce31359239f305";
                daiVault.vaultAddress = '0x5726f36e62cf761332F5c655b68bc2E5D55ED083';
                daiVault.depositFee = depositFee;
                daiVault.maxStake = '0';
                daiVault.maxStakeUsd = '0';
            }

            allVaults.push(daiVault);

//=================================== PLS VAULT ==============================================
//===================================           ==============================================
const pulseInfo = await fetchToken({ address: '0xa1077a294dde1b09bb078844df40758a5d0f9a27'})

const pulseGeneralData = await readContracts ({
    contracts: [
        {
            address: '0xa1077a294dde1b09bb078844df40758a5d0f9a27',
            abi: tokenAbi,
            functionName: 'balanceOf',
            args:['0xc4d4fb6cAD2931e65C0BF44b2A3fA9C598ADd37B']
         },
         {
            ...masterContract,
            functionName: 'getMultiplier',
            args: [currentBlockInt-1, currentBlockInt]
         },
         {
            ...masterContract,
            functionName: 'poolInfo',
            args: [35]
         },
         {
            ...masterContract,
            functionName: 'totalAllocPoint',
         },
         {
            address: '0xc4d4fb6cAD2931e65C0BF44b2A3fA9C598ADd37B',
            abi: vaultAbi,
            functionName: 'getVaultTokenPulseValue',
        },
        {
            ...masterContract,
            functionName: 'rewardsPerBlock',
        },
        {
            address: '0xc4d4fb6cAD2931e65C0BF44b2A3fA9C598ADd37B',
            abi: vaultAbi,
            functionName: 'getMaxStakedAmount',
            args: [address]
        },
    ]
})

const totalPulseStaked = pulseGeneralData[0].result;
multiplier = pulseGeneralData[1].result;
poolInfo = pulseGeneralData[2].result;
totalAllocPoint = pulseGeneralData[3].result;
const pulseValue = pulseGeneralData[4].result;
tokenMintedPerBlock = pulseGeneralData[5].result;
let maxPulseStake = pulseGeneralData[6].result;

const totalPulseStakedUsd = parseInt(totalPulseStaked.toString()) * pulsePrice /10**18;
poolRewardPerBlock = parseInt(tokenMintedPerBlock.toString()) * parseInt(multiplier.toString()) * parseInt(poolInfo[1].toString()) / parseInt(totalAllocPoint.toString());
poolRewardPerYear = poolRewardPerBlock * blockPerYear;
poolRewardPerYearUsd = (poolRewardPerYear / 10**18) * nativeTokenPriceUsd;
let maxPulseStakeUsd = parseInt(maxPulseStake) * pulsePrice /10**18;


if (totalPulseStakedUsd == 0) {
    Apr = poolRewardPerYearUsd / 1 * 100
}
else {Apr = poolRewardPerYearUsd / totalPulseStakedUsd * 100 }
if (Apr > 10000000) {Apr = 1000000}

if(isConnected) {
    const pulseData = await readContracts ({
        contracts: [
            {
                address: '0xc4d4fb6cAD2931e65C0BF44b2A3fA9C598ADd37B',
                abi: vaultAbi,
                functionName: 'degenInfo',
                args:[0, address]
            },
            {
                address: '0xc4d4fb6cAD2931e65C0BF44b2A3fA9C598ADd37B',
                abi: vaultAbi,
                functionName: 'pendingRewards',
                args:[address]
            },
            {
                address: '0xa1077a294dde1b09bb078844df40758a5d0f9a27',
                abi: tokenAbi,
                functionName: 'balanceOf',
                args:[address]
            },
            {
                address: '0xa1077a294dde1b09bb078844df40758a5d0f9a27',
                abi: lpAbi,
                functionName:'allowance',
                args: [address, '0xc4d4fb6cAD2931e65C0BF44b2A3fA9C598ADd37B'],
            },
        ]
    })

    const userPulseInfo = pulseData[0].result;
    const pulseRewards = pulseData[1].result;
    const userPulseBalance = pulseData[2].result;
    const pulseAllowance = pulseData[3].result;

    const userPulseStaked = userPulseInfo[0];
    const userPulseStakedUsd = parseInt(userPulseStaked.toString()) * pulsePrice;            
    const pulseActualRewards = parseFloat((pulseRewards.actualRewards).toString());
    const pulseActualRewardsUsd = (pulseActualRewards * nativeTokenPriceUsd);
    const pulseBurnRewards = parseFloat((pulseRewards.burnedRewards).toString());
    const pulseBurnRewardsUsd = (pulseBurnRewards * nativeTokenPriceUsd);

    pulseVault.id = 2;
    pulseVault.name = pulseInfo.symbol;
    pulseVault.userStaked = userPulseStaked;
    pulseVault.userStakedUsd = userPulseStakedUsd;
    pulseVault.totalStakedUsd = totalPulseStakedUsd;
    pulseVault.apr = parseInt(Apr);
    pulseVault.actualRewards = pulseActualRewards;
    pulseVault.actualRewardsUsd = pulseActualRewardsUsd;
    pulseVault.burnRewards = pulseBurnRewards;
    pulseVault.burnRewardsUsd = pulseBurnRewardsUsd;
    pulseVault.userBalance = userPulseBalance;
    pulseVault.allowance = pulseAllowance;
    pulseVault.address = "0xa1077a294dde1b09bb078844df40758a5d0f9a27";
    pulseVault.vaultAddress = '0xc4d4fb6cAD2931e65C0BF44b2A3fA9C598ADd37B';
    pulseVault.depositFee = depositFee;
    pulseVault.maxStake = maxPulseStake;
    pulseVault.maxStakeUsd = maxPulseStakeUsd;
    pulseVault.price = pulsePrice;
}
else { //Not connected

    pulseVault.id = 2;
    pulseVault.name = pulseInfo.symbol;
    pulseVault.userStaked = '0';
    pulseVault.userStakedUsd = '0';
    pulseVault.totalStakedUsd = totalPulseStakedUsd.toFixed(2);
    pulseVault.apr = parseInt(Apr);
    pulseVault.actualRewards = '0';
    pulseVault.actualRewardsUsd = '0';
    pulseVault.burnRewards = '0';
    pulseVault.burnRewardsUsd = '0';
    pulseVault.address = "0xa1077a294dde1b09bb078844df40758a5d0f9a27";
    pulseVault.vaultAddress = '0xc4d4fb6cAD2931e65C0BF44b2A3fA9C598ADd37B';
    pulseVault.depositFee = depositFee;
    pulseVault.maxStake = '0';
    pulseVault.maxStakeUsd = '0';
}

allVaults.push(pulseVault);

//========================= PLSX VAULT =============================================================

const plsxInfo = await fetchToken({ address: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab'})

const plsxGeneralData = await readContracts ({
    contracts: [
        {
            address: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab',
            abi: tokenAbi,
            functionName: 'balanceOf',
            args:['0x8615545328F1F6c8cefe8b48ad48c231731433ea']
         },
         {
            ...masterContract,
            functionName: 'getMultiplier',
            args: [currentBlockInt-1, currentBlockInt]
         },
         {
         ...masterContract,
         functionName: 'poolInfo',
         args: [36]
         },
         {
            ...masterContract,
            functionName: 'totalAllocPoint',
         },
         {
            address: '0x8615545328F1F6c8cefe8b48ad48c231731433ea',
            abi: vaultAbi,
            functionName: 'getVaultTokenPulseValue',
        },
        {
            ...masterContract,
            functionName: 'rewardsPerBlock',
        },
        {
            address: '0x8615545328F1F6c8cefe8b48ad48c231731433ea',
            abi: vaultAbi,
            functionName: 'getMaxStakedAmount',
            args: [address]
        },
    ]
})

const totalPlsxStaked = plsxGeneralData[0].result;
multiplier = plsxGeneralData[1].result;
poolInfo = plsxGeneralData[2].result;
totalAllocPoint = plsxGeneralData[3].result;
const plsxPulseValue = plsxGeneralData[4].result;
tokenMintedPerBlock = plsxGeneralData[5].result;
let maxPlsxStake = plsxGeneralData[6].result;

const plsxPrice = parseInt(plsxPulseValue.toString()) * pulsePrice / 10**18

const totalPlsxStakedUsd = parseInt(totalPlsxStaked.toString()) * plsxPrice /10**18;
poolRewardPerBlock = parseInt(tokenMintedPerBlock.toString()) * parseInt(multiplier.toString()) * parseInt(poolInfo[1].toString()) / parseInt(totalAllocPoint.toString());
poolRewardPerYear = poolRewardPerBlock * blockPerYear;
poolRewardPerYearUsd = (poolRewardPerYear / 10**18) * nativeTokenPriceUsd;
let maxPlsxStakeUsd = parseInt(maxPlsxStake) * pulsePrice /10**18;

console.log(poolRewardPerYear)
if (totalPlsxStakedUsd == 0) {
    Apr = poolRewardPerYearUsd / 1 * 100
}
else {Apr = poolRewardPerYearUsd / totalPlsxStakedUsd * 100 }
if (Apr > 10000000) {Apr = 1000000}

if(isConnected) {
    const plsxData = await readContracts ({
        contracts: [
            {
                address: '0x8615545328F1F6c8cefe8b48ad48c231731433ea',
                abi: vaultAbi,
                functionName: 'degenInfo',
                args:[0, address]
            },
            {
                address: '0x8615545328F1F6c8cefe8b48ad48c231731433ea',
                abi: vaultAbi,
                functionName: 'pendingRewards',
                args:[address]
            },
            {
                address: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab',
                abi: tokenAbi,
                functionName: 'balanceOf',
                args:[address]
            },
            {
                address: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab',
                abi: lpAbi,
                functionName:'allowance',
                args: [address, '0x8615545328F1F6c8cefe8b48ad48c231731433ea'],
            },
        ]
    })

    const userPlsxInfo = plsxData[0].result;
    const plsxRewards = plsxData[1].result;
    const userPlsxBalance = plsxData[2].result;
    const plsxAllowance = plsxData[3].result;

    const userPlsxStaked = userPlsxInfo[0];
    const userPlsxStakedUsd = parseInt(userPlsxStaked.toString()) * plsxPrice;            
    const plsxActualRewards = (parseInt((plsxRewards.actualRewards).toString()));
    const plsxActualRewardsUsd = (plsxActualRewards * nativeTokenPriceUsd);
    const plsxBurnRewards = (parseInt((plsxRewards.burnedRewards).toString()));
    const plsxBurnRewardsUsd = (plsxBurnRewards * nativeTokenPriceUsd);

    plsxVault.id = 3;
    plsxVault.name = plsxInfo.symbol;
    plsxVault.userStaked = userPlsxStaked;
    plsxVault.userStakedUsd = userPlsxStakedUsd;
    plsxVault.totalStakedUsd = totalPlsxStakedUsd;
    plsxVault.apr = parseInt(Apr);
    plsxVault.actualRewards = plsxActualRewards;
    plsxVault.actualRewardsUsd = plsxActualRewardsUsd;
    plsxVault.burnRewards = plsxBurnRewards;
    plsxVault.burnRewardsUsd = plsxBurnRewardsUsd;
    plsxVault.userBalance = userPlsxBalance;
    plsxVault.allowance = plsxAllowance;
    plsxVault.address = "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab";
    plsxVault.vaultAddress = '0x8615545328F1F6c8cefe8b48ad48c231731433ea';
    plsxVault.depositFee = depositFee;
    plsxVault.maxStake = maxPlsxStake;
    plsxVault.maxStakeUsd = maxPlsxStakeUsd;
    plsxVault.price = plsxPrice;
}
else { //Not connected

    plsxVault.id = 3;
    plsxVault.name = plsxInfo.symbol;
    plsxVault.userStaked = '0';
    plsxVault.userStakedUsd = '0';
    plsxVault.totalStakedUsd = totalPlsxStakedUsd.toFixed(2);
    plsxVault.apr = parseInt(Apr);
    plsxVault.actualRewards = '0';
    plsxVault.actualRewardsUsd = '0';
    plsxVault.burnRewards = '0';
    plsxVault.burnRewardsUsd = '0';
    plsxVault.address = "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab";
    plsxVault.vaultAddress = '0x8615545328F1F6c8cefe8b48ad48c231731433ea';
    plsxVault.depositFee = depositFee;
    plsxVault.maxStake = '0';
    plsxVault.maxStakeUsd = '0';
}

allVaults.push(plsxVault);



            setVaults(allVaults);
            setMaxDai(maxDaiStakeUsd);
            setDaiPrice(daiPrice);
            setMaxPulse(maxPulseStakeUsd);
            setPulsePrice(pulsePrice);
            setMaxPlsx(maxPlsxStakeUsd);
            setPlsxPrice(plsxPrice);
        }   
        getInfo();
    }, [address, allPools]);

    return(
        <Box>
            <Center>
                <Box color = 'black' bg={'yellow.500'} width={[300, 400, 500, 600]}>

                </Box>
            </Center>
            <Flex>
            <SimpleGrid columns={[1, null, 3]} spacing={[null, 15, 20]} ml='auto' mr='auto' mt= {5} mb={10}>       
                    {vaults.map((item) => {
                        return (
                            <VaultInfo key={item.name} {...item} />
                                            )
                        })}
             </SimpleGrid>
             </Flex>
            </Box>
    )
}

export default VaultStaking;