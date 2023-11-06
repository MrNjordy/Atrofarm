import { useAccount } from "wagmi";
import { fetchToken, readContracts, fetchBlockNumber } from 'wagmi/actions';
import { useEffect, useState } from "react";
import { Flex, HStack, Box, Center, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, useNumberInput, Spinner, Text, Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, VStack, Image, SimpleGrid } from "@chakra-ui/react"
import { useContext } from "react";
import { InfoContext } from "../App";
import { vaultAbi, tokenAbi, masterContract, lpAbi } from "../data";
import VaultInfo from "./VaultInfo";

function VaultStaking() {
    const allPools = useContext(InfoContext);
    const [vaults, setVaults] = useState([]);
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
                        args:['0xD2F81BF629e052a48fff15A789B60308c04a9D41']
                     },
                     {
                        ...masterContract,
                        functionName: 'getMultiplier',
                        args: [currentBlockInt-1, currentBlockInt]
                     },
                     {
                     ...masterContract,
                     functionName: 'poolInfo',
                     args: [26]
                     },
                     {
                        ...masterContract,
                        functionName: 'totalAllocPoint',
                     },
                     {
                        address: '0xD2F81BF629e052a48fff15A789B60308c04a9D41',
                        abi: vaultAbi,
                        functionName: 'getVaultTokenPulseValue',
                    },
                    {
                        ...masterContract,
                        functionName: 'rewardsPerBlock',
                    },
                ]
            })

            const totalDaiStaked = daiGeneralData[0].result;
            let multiplier = daiGeneralData[1].result;
            let poolInfo = daiGeneralData[2].result;
            let totalAllocPoint = daiGeneralData[3].result;
            const daiPulseValue = daiGeneralData[4].result;
            let tokenMintedPerBlock = daiGeneralData[5].result;

            const daiPrice = parseInt(daiPulseValue.toString()) * pulsePrice / 10**18

            const totalDaiStakedUsd = parseInt(totalDaiStaked.toString()) * daiPrice;
            let poolRewardPerBlock = parseInt(tokenMintedPerBlock.toString()) * parseInt(multiplier.toString()) * parseInt(poolInfo[1].toString()) / parseInt(totalAllocPoint.toString());
            let poolRewardPerYear = poolRewardPerBlock * blockPerYear;
            let poolRewardPerYearUsd = (poolRewardPerYear / 10**18) * nativeTokenPriceUsd;

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
                            address: '0xD2F81BF629e052a48fff15A789B60308c04a9D41',
                            abi: vaultAbi,
                            functionName: 'degenInfo',
                            args:[0, address]
                        },
                        {
                            address: '0xD2F81BF629e052a48fff15A789B60308c04a9D41',
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
                            args: [address, '0xD2F81BF629e052a48fff15A789B60308c04a9D41'],
                        },
                    ]
                })

                const userDaiInfo = daiData[0].result;
                const daiRewards = daiData[1].result;
                const userDaiBalance = daiData[2].result;
                const daiAllowance = daiData[3].result;

                const userDaiStaked = userDaiInfo[0];
                const userDaiStakedUsd = parseInt(userDaiStaked.toString()) * daiPrice;            
                const daiActualRewards = (parseFloat((daiRewards.actualRewards).toString()) / 10**18).toFixed(2);
                const daiActualRewardsUsd = (daiActualRewards * nativeTokenPriceUsd).toFixed(2);
                const daiBurnRewards = (parseFloat((daiRewards.burnedRewards).toString()) / 10**18).toFixed(2);
                const daiBurnRewardsUsd = (daiBurnRewards * nativeTokenPriceUsd).toFixed(2);

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
                daiVault.vaultAddress = '0xD2F81BF629e052a48fff15A789B60308c04a9D41';
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
                daiVault.vaultAddress = '0xD2F81BF629e052a48fff15A789B60308c04a9D41';
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
            args:['0xA3585CF187738eA346c78Ad1A01f7c885DA7cA52']
         },
         {
            ...masterContract,
            functionName: 'getMultiplier',
            args: [currentBlockInt-1, currentBlockInt]
         },
         {
            ...masterContract,
            functionName: 'poolInfo',
            args: [27]
         },
         {
            ...masterContract,
            functionName: 'totalAllocPoint',
         },
         {
            address: '0xA3585CF187738eA346c78Ad1A01f7c885DA7cA52',
            abi: vaultAbi,
            functionName: 'getVaultTokenPulseValue',
        },
        {
            ...masterContract,
            functionName: 'rewardsPerBlock',
        },
    ]
})

const totalPulseStaked = pulseGeneralData[0].result;
multiplier = pulseGeneralData[1].result;
poolInfo = pulseGeneralData[2].result;
totalAllocPoint = pulseGeneralData[3].result;
const pulseValue = pulseGeneralData[4].result;
tokenMintedPerBlock = pulseGeneralData[5].result;

const totalPulseStakedUsd = parseInt(totalPulseStaked.toString()) * pulsePrice;
poolRewardPerBlock = parseInt(tokenMintedPerBlock.toString()) * parseInt(multiplier.toString()) * parseInt(poolInfo[1].toString()) / parseInt(totalAllocPoint.toString());
poolRewardPerYear = poolRewardPerBlock * blockPerYear;
poolRewardPerYearUsd = (poolRewardPerYear / 10**18) * nativeTokenPriceUsd;

if (totalPulseStakedUsd == 0) {
    Apr = poolRewardPerYearUsd / 1 * 100
}
else {Apr = poolRewardPerYearUsd / totalPulseStakedUsd * 100 }
if (Apr > 10000000) {Apr = 1000000}

if(isConnected) {
    const pulseData = await readContracts ({
        contracts: [
            {
                address: '0xA3585CF187738eA346c78Ad1A01f7c885DA7cA52',
                abi: vaultAbi,
                functionName: 'degenInfo',
                args:[0, address]
            },
            {
                address: '0xA3585CF187738eA346c78Ad1A01f7c885DA7cA52',
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
                args: [address, '0xA3585CF187738eA346c78Ad1A01f7c885DA7cA52'],
            },
        ]
    })

    const userPulseInfo = pulseData[0].result;
    const pulseRewards = pulseData[1].result;
    const userPulseBalance = pulseData[2].result;
    const pulseAllowance = pulseData[3].result;

    const userPulseStaked = userPulseInfo[0];
    const userPulseStakedUsd = parseInt(userPulseStaked.toString()) * pulsePrice;            
    const pulseActualRewards = (parseFloat((pulseRewards.actualRewards).toString()) / 10**18).toFixed(2);
    const pulseActualRewardsUsd = (pulseActualRewards * nativeTokenPriceUsd).toFixed(2);
    const pulseBurnRewards = (parseFloat((pulseRewards.burnedRewards).toString()) / 10**18).toFixed(2);
    const pulseBurnRewardsUsd = (pulseBurnRewards * nativeTokenPriceUsd).toFixed(2);

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
    pulseVault.vaultAddress = '0xA3585CF187738eA346c78Ad1A01f7c885DA7cA52';
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
    pulseVault.vaultAddress = '0xA3585CF187738eA346c78Ad1A01f7c885DA7cA52';
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
            args:['0x4F3fd8C6d2ba3775CEfFdb57153447deCd2070C5']
         },
         {
            ...masterContract,
            functionName: 'getMultiplier',
            args: [currentBlockInt-1, currentBlockInt]
         },
         {
         ...masterContract,
         functionName: 'poolInfo',
         args: [27]
         },
         {
            ...masterContract,
            functionName: 'totalAllocPoint',
         },
         {
            address: '0x4F3fd8C6d2ba3775CEfFdb57153447deCd2070C5',
            abi: vaultAbi,
            functionName: 'getVaultTokenPulseValue',
        },
        {
            ...masterContract,
            functionName: 'rewardsPerBlock',
        },
    ]
})

const totalPlsxStaked = plsxGeneralData[0].result;
multiplier = plsxGeneralData[1].result;
poolInfo = plsxGeneralData[2].result;
totalAllocPoint = plsxGeneralData[3].result;
const plsxPulseValue = plsxGeneralData[4].result;
tokenMintedPerBlock = plsxGeneralData[5].result;

const plsxPrice = parseInt(plsxPulseValue.toString()) * pulsePrice / 10**18

const totalPlsxStakedUsd = parseInt(totalPlsxStaked.toString()) * plsxPrice;
poolRewardPerBlock = parseInt(tokenMintedPerBlock.toString()) * parseInt(multiplier.toString()) * parseInt(poolInfo[1].toString()) / parseInt(totalAllocPoint.toString());
poolRewardPerYear = poolRewardPerBlock * blockPerYear;
poolRewardPerYearUsd = (poolRewardPerYear / 10**18) * nativeTokenPriceUsd;

if (totalPlsxStakedUsd == 0) {
    Apr = poolRewardPerYearUsd / 1 * 100
}
else {Apr = poolRewardPerYearUsd / totalPlsxStakedUsd * 100 }
if (Apr > 10000000) {Apr = 1000000}

if(isConnected) {
    const plsxData = await readContracts ({
        contracts: [
            {
                address: '0x4F3fd8C6d2ba3775CEfFdb57153447deCd2070C5',
                abi: vaultAbi,
                functionName: 'degenInfo',
                args:[0, address]
            },
            {
                address: '0x4F3fd8C6d2ba3775CEfFdb57153447deCd2070C5',
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
                args: [address, '0x4F3fd8C6d2ba3775CEfFdb57153447deCd2070C5'],
            },
        ]
    })

    const userPlsxInfo = plsxData[0].result;
    const plsxRewards = plsxData[1].result;
    const userPlsxBalance = plsxData[2].result;
    const plsxAllowance = plsxData[3].result;

    const userPlsxStaked = userPlsxInfo[0];
    const userPlsxStakedUsd = parseInt(userPlsxStaked.toString()) * plsxPrice;            
    const plsxActualRewards = (parseFloat((plsxRewards.actualRewards).toString()) / 10**18).toFixed(2);
    const plsxActualRewardsUsd = (plsxActualRewards * nativeTokenPriceUsd).toFixed(2);
    const plsxBurnRewards = (parseFloat((plsxRewards.burnedRewards).toString()) / 10**18).toFixed(2);
    const plsxBurnRewardsUsd = (plsxBurnRewards * nativeTokenPriceUsd).toFixed(2);

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
    plsxVault.vaultAddress = '0x4F3fd8C6d2ba3775CEfFdb57153447deCd2070C5';
}
else { //Not connected

    plsxVault.id = 3;
    plsxVault.name = plsxInfo.symbol;
    plsxVault.userStaked = '0';
    plsxVault.userStakedUsd = '0';
    plsxVault.totalStakedUsd = totalPLSXStakedUsd.toFixed(2);
    plsxVault.apr = parseInt(Apr);
    plsxVault.actualRewards = '0';
    plsxVault.actualRewardsUsd = '0';
    plsxVault.burnRewards = '0';
    plsxVault.burnRewardsUsd = '0';
    plsxVault.address = "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab";
    plsxVault.vaultAddress = '0x4F3fd8C6d2ba3775CEfFdb57153447deCd2070C5';
}

allVaults.push(plsxVault);



            setVaults(allVaults);
        }   
        getInfo();
    }, [address, allPools]);

    return(
        <Flex>
            <SimpleGrid columns={[1, null, 3]} spacing={[null, 15, 20]} ml='auto' mr='auto' mt= {5} mb={10}>       
                    {vaults.map((item) => {
                        return (
                            <VaultInfo key={item.name} {...item} />
                                            )
                        })}
             </SimpleGrid>
            </Flex>
    )
}

export default VaultStaking;