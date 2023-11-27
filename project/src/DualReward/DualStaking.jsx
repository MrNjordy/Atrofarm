import { useAccount } from "wagmi";
import { fetchToken, readContracts, fetchBlockNumber } from 'wagmi/actions';
import { useEffect, useState } from "react";
import { Flex, HStack, Box, Center, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, useNumberInput, Spinner, Text, Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, VStack, Image, SimpleGrid } from "@chakra-ui/react"
import { useContext } from "react";
import { InfoContext } from "../App";
import { vaultAbi, tokenAbi, masterContract, lpAbi, dualAbi } from "../data";
import DualInfo from "./DualInfo";
import { Link } from "react-router-dom";

function DualStaking() {
    const allPools = useContext(InfoContext);
    const [vaults, setVaults] = useState([]);
    const [lpPrice, setLpPrice] = useState();
    const [pulsePrice, setPulsePrice] = useState();
    const { address ,isConnected } = useAccount();

    useEffect(() => {
        let pulsePrice;
        let nativeTokenPriceUsd;
        let ggcPrice;
        let lamb0Price;
        let dualLambVault = {};
        let allVaults = [];

        function wait() {
            if (!allPools) {
              setTimeout(wait, 100)
            } else {
                pulsePrice = allPools.generalInfo[0].pulsePrice;
                nativeTokenPriceUsd = allPools.generalInfo[0].nativeTokenPriceUsd;
                ggcPrice = allPools.generalInfo[0].ggcPrice;
            }
        }
        wait()
        async function getInfo() {
            const currentBlock = await fetchBlockNumber();
            const currentBlockInt = parseInt(currentBlock.toString());
            const blockPerYear = 6 * 60 * 24 * 365;

//========================= DAI VAULT =============================================================

            const lpInfo = await fetchToken({ address: '0x536c730d891bE8d573248939a5B6806b9f4716FA'})

            const generalData = await readContracts ({
                contracts: [
                    {
                        address: '0x536c730d891bE8d573248939a5B6806b9f4716FA',
                        abi: tokenAbi,
                        functionName: 'balanceOf',
                        args:['0x7bBDd4605A99071ff057bdCbb32971e50c2cE2aF'] //vault
                     },
                     {
                        ...masterContract,
                        functionName: 'getMultiplier',
                        args: [currentBlockInt-1, currentBlockInt]
                     },
                     {
                     ...masterContract,
                     functionName: 'poolInfo',
                     args: [45]
                     },
                     {
                        ...masterContract,
                        functionName: 'totalAllocPoint',
                     },
                    {
                        ...masterContract,
                        functionName: 'rewardsPerBlock',
                    },
                    {
                        address: '0x7bBDd4605A99071ff057bdCbb32971e50c2cE2aF',
                        abi: dualAbi,
                        functionName: 'poolInfo',
                        args: [0]
                    },
                    {
                        address: '0x536c730d891bE8d573248939a5B6806b9f4716FA',
                        abi: lpAbi,
                        functionName: 'getReserves',
                    },
                    {
                        address: '0xb8c821539AA2532B4eAF9f6Ab7aE9a833966eB86', //lamb0/PLS for lamb0 proce
                        abi: lpAbi,
                        functionName: 'getReserves',
                    },
                    {
                        address: '0x7bBDd4605A99071ff057bdCbb32971e50c2cE2aF',
                        abi: dualAbi,
                        functionName: 'rewardRate',
                    },
                    {
                        address: '0x536c730d891bE8d573248939a5B6806b9f4716FA',
                        abi: lpAbi,
                        functionName: 'token0',
                    },
                    {
                        address: '0x536c730d891bE8d573248939a5B6806b9f4716FA',
                        abi: lpAbi,
                        functionName: 'token1',
                    },

                ]
            })

            const totalLpStaked = generalData[0].result;
            let multiplier = generalData[1].result;
            let poolInfo = generalData[2].result;
            let totalAllocPoint = generalData[3].result;
            let tokenMintedPerBlock = generalData[4].result;
            let vaultInfo = generalData[5].result;
            let lpReserve = generalData[6].result;
            let token0 = generalData[9].result;
            let token1 = generalData[10].result;

            const lpPrice = parseInt(lpReserve[0].toString()) * 2 / parseInt((lpInfo.totalSupply.value).toString())
            const lpPriceUsd = lpPrice * ggcPrice;
            const totalLpStakedUsd = parseInt(totalLpStaked.toString()) * lpPriceUsd /10**18;

            const lamb0Price = parseInt(generalData[7].result[1].toString())/parseInt(generalData[7].result[0].toString()) * pulsePrice;

            let atrofaRewardPerBlock = parseInt(tokenMintedPerBlock.toString()) * parseInt(multiplier.toString()) * parseInt(poolInfo[1].toString()) / parseInt(totalAllocPoint.toString());
            let atrofaRewardPerYear = atrofaRewardPerBlock * blockPerYear;
            let atrofaRewardPerYearUsd = (atrofaRewardPerYear / 10**18) * nativeTokenPriceUsd;

            let lambRewardPerBlock = parseInt((generalData[8].result).toString());
            let lambRewardPerYear = lambRewardPerBlock * blockPerYear;
            let lambRewardPerYearUsd = (lambRewardPerYear / 10**18) * lamb0Price;

            let atrofaApr;
            if (totalLpStakedUsd == 0) {
                atrofaApr = atrofaRewardPerYearUsd / 1 * 100
            }
            else {atrofaApr = atrofaRewardPerYearUsd / totalLpStakedUsd * 100 }
            if (atrofaApr > 10000000) {Apr = 1000000}

            let lambApr;
            if (totalLpStakedUsd == 0) {
                lambApr = lambRewardPerYearUsd / 1 * 100
            }
            else {lambApr = lambRewardPerYearUsd / totalLpStakedUsd * 100 }
            if (lambApr > 10000000) {Apr = 1000000}

            let totalApr = atrofaApr + lambApr;

            let depositFee = parseInt(vaultInfo[3].toString()) / 100;

            if(isConnected) {
                const lpData = await readContracts ({
                    contracts: [
                        {
                            address: '0x7bBDd4605A99071ff057bdCbb32971e50c2cE2aF',
                            abi: dualAbi,
                            functionName: 'degenInfo',
                            args:[0, address]
                        },
                        {
                            address: '0x7bBDd4605A99071ff057bdCbb32971e50c2cE2aF',
                            abi: dualAbi,
                            functionName: 'pendingRewards',
                            args:[address]
                        },
                        {
                            address: '0x536c730d891bE8d573248939a5B6806b9f4716FA',
                            abi: tokenAbi,
                            functionName: 'balanceOf',
                            args:[address]
                        },
                        {
                            address: '0x536c730d891bE8d573248939a5B6806b9f4716FA',
                            abi: lpAbi,
                            functionName:'allowance',
                            args: [address, '0x7bBDd4605A99071ff057bdCbb32971e50c2cE2aF'],
                        },
                    ]
                })

                const userLpInfo = lpData[0].result;
                const lpRewards = lpData[1].result;
                const userLpBalance = lpData[2].result;
                const lpAllowance = lpData[3].result;

                const userLpStaked = userLpInfo[0];
                const userLpStakedUsd = parseInt(userLpStaked.toString()) * lpPriceUsd;            
                const lpAtrofaRewards = parseFloat((lpRewards.atrofaRewards).toString());
                const lpAtrofaRewardsUsd = (lpAtrofaRewards * nativeTokenPriceUsd);
                const lpDualRewards = parseFloat((lpRewards.dualRewards).toString());
                const lpDualRewardsUsd = (lpDualRewards * lamb0Price);
                const totalReward = lpAtrofaRewardsUsd + lpDualRewardsUsd;

                const token0Amount = parseInt(lpReserve[0].toString()) / parseInt((lpInfo.totalSupply.value).toString())
                const token1Amount = parseInt(lpReserve[1].toString()) / parseInt((lpInfo.totalSupply.value).toString())
    
                const token0Staked = token0Amount * (parseInt(userLpStaked) / 10**18)
                const token1Staked = token1Amount * (parseInt(userLpStaked) / 10**18)

                dualLambVault.id = 1;
                dualLambVault.name = 'GGC-Lamb0';
                dualLambVault.userStaked = userLpStaked;
                dualLambVault.userStakedUsd = userLpStakedUsd;
                dualLambVault.totalStakedUsd = totalLpStakedUsd;
                dualLambVault.atrofaApr = parseInt(atrofaApr);
                dualLambVault.lambApr = parseInt(lambApr);
                dualLambVault.totalApr = parseInt(totalApr);
                dualLambVault.atrofaRewards = lpAtrofaRewards;
                dualLambVault.atrofaRewardsUsd = lpAtrofaRewardsUsd;
                dualLambVault.dualRewards = lpDualRewards;
                dualLambVault.dualRewardsUsd = lpDualRewardsUsd;
                dualLambVault.totalReward = totalReward;
                dualLambVault.userBalance = userLpBalance;
                dualLambVault.allowance = lpAllowance;
                dualLambVault.address = "0x536c730d891bE8d573248939a5B6806b9f4716FA";
                dualLambVault.vaultAddress = '0x7bBDd4605A99071ff057bdCbb32971e50c2cE2aF';
                dualLambVault.depositFee = depositFee;
                dualLambVault.price = lpPrice;
                dualLambVault.token0 = token0;
                dualLambVault.token1 = token1;
                dualLambVault.token0Staked = token0Staked;
                dualLambVault.token1Staked = token1Staked;
            }
            else { //Not connected

                dualLambVault.id = 1;
                dualLambVault.name = 'GGC-Lamb0';
                dualLambVault.userStaked = '0';
                dualLambVault.userStakedUsd = '0';
                dualLambVault.totalStakedUsd = totalLpStakedUsd.toFixed(2);
                dualLambVault.atrofaApr = parseInt(atrofaApr);
                dualLambVault.lambApr = parseInt(lambApr);
                dualLambVault.totalApr = parseInt(totalApr);
                dualLambVault.actualRewards = '0';
                dualLambVault.actualRewardsUsd = '0';
                dualLambVault.burnRewards = '0';
                dualLambVault.burnRewardsUsd = '0';
                dualLambVault.address = "0x536c730d891bE8d573248939a5B6806b9f4716FA";
                dualLambVault.vaultAddress = '0x7bBDd4605A99071ff057bdCbb32971e50c2cE2aF';
                dualLambVault.depositFee = depositFee;
                dualLambVault.token0 = token0;
                dualLambVault.token1 = token1;
                dualLambVault.token0Staked = '0';
                dualLambVault.token1Staked = '0';
            }

            allVaults.push(dualLambVault);

            setVaults(allVaults);
            setLpPrice(lpPrice);
            setPulsePrice(pulsePrice);
        }   
        getInfo();
    }, [address, allPools]);

    return(
        <Box  minHeight='100vh'>
            <VStack>
            <Center bgGradient='linear(to-bl, yellow.400, yellow.700)' width='full' >
            <Box height={[120, 130, 150,200]} bgGradient='linear(to-bl, yellow.400, yellow.700)' width='100%' padding={[5, null, null, 10]}>
                <Text fontFamily='heading' fontWeight='bold' fontSize={[20, 20, 30, 40]} color='black' ml={[10,20,30,40]} mr={[10,20,30,40]} align='center'>
                    Dual Rewards Pools
                </Text>
                <Text ml='auto' mr='auto' Text fontSize={[15, 15,20, 25, 30]} fontFamily='fantasy' align='center' >
                    Earn $Atrofa and Other Tokens
                </Text>
            </Box>
            </Center>
            <Flex fontSize={[7, 10, 15, 20]} paddingBottom={5}>
            </Flex>
            </VStack>
            <Flex></Flex>
            <Center>
                <Box color = 'black' bg={'yellow.500'} width={[300, 400, 500, 600]}>

                </Box>
            </Center>
            <Flex>
            <SimpleGrid columns={[1, null, 3]} spacing={[null, 15, 20]} ml='auto' mr='auto' mt= {5} mb={10}>       
                    {vaults.map((item) => {
                        return (
                            <DualInfo key={item.name} {...item} />
                                            )
                        })}
             </SimpleGrid>
             </Flex>
            </Box>
    )
}

export default DualStaking;