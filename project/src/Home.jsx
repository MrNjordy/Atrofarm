import { useContractWrite } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Box, Button, Center, Flex, HStack, VStack, Text, SimpleGrid, Image, Link, Tooltip, useClipboard, IconButton } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { InfoContext } from "./App";
import { masterAbi } from "./data";
import { usePublicClient } from "wagmi";
import { CopyIcon, CheckIcon } from '@chakra-ui/icons'
import dexscreener from './assets/dexscreener.png'
import dextool from './assets/dextool.jpeg'
import geckoTerminal from './assets/geckoterminal.png'
import pulseChain from './assets/PulseChain.jpeg'
import coinGecko from './assets/coinG.jpeg'
import gitBook from './assets/gitbook.svg'

function Home() {
    const allPools = useContext(InfoContext);
    const { open } = useWeb3Modal()
    const [totalRewards, setTotalRewards] = useState();
    const [totalRewardsUsd, setTotalRewardsUsd] = useState();
    const [tvl, setTvl] = useState();
    // const [allPools, setAllPools] = useState();
    const [nativeTokenPrice, setNativeTokenPrice] = useState();
    const [marketCap, setMarketCap] = useState();
    const [totalSupply, setTotalSupply] = useState();
    const [inflation, setInflation] = useState();
    const [averageApr, setAverageApr] = useState();
    const [userTotalStaked, setUserTotalStaked] = useState();
    const [dailyEarnings, setDailyEarnings] = useState();

    const { address, isConnected } = useAccount();
    const { data, isLoading, isSuccess, write } = useContractWrite({
        address: import.meta.env.VITE_MASTER,
        abi: masterAbi,
        functionName: 'claimAll',
      })
    const { onCopy, value, setValue, hasCopied } = useClipboard(address);
    useEffect(() => {
        let protocolPools = [];
        let tvl = 0;
        let totalRewards = 0;
        let totalRewardsUsd = 0;

        let sumApr = 0;
        let poolStaked = 0;
        let averageApr = 0;

        let userTotalStaked = 0
        let poolEarnings = 0;
        let sumEarnings = 0;

        function wait() {
            if (!allPools) {
              setTimeout(wait, 100)
            } else {
                const pulsePrice = allPools.generalInfo[0].pulsePrice;
                const nativeTokenPrice = allPools.generalInfo[0].nativeTokenPriceUsd;
                const marketCap = (allPools.generalInfo[0].nativeTokenSupply) * nativeTokenPrice;
                const totalSupply = parseInt(allPools.generalInfo[0].nativeTokenSupply);
                const inflation = allPools.generalInfo[0].inflation;

                setNativeTokenPrice(parseFloat(nativeTokenPrice).toFixed(4));
                setMarketCap(marketCap.toFixed(0));
                setTotalSupply(totalSupply);

                for(let i=0; i<(allPools.farmingPools).length; i++) { 
                    protocolPools.push(allPools.farmingPools[i])
                }
                for(let i=0; i<(allPools.stakingPools).length; i++) { 
                    protocolPools.push(allPools.stakingPools[i])
                }
                for(let i=0; i<protocolPools.length; i++) {
                    tvl += parseFloat(protocolPools[i].totalStakedUsd);
                    totalRewards += parseFloat(protocolPools[i].rewards);
                    totalRewardsUsd += parseFloat((protocolPools[i].rewardsUsd));
                    if(protocolPools[i].userStaked > 0) {
                        sumApr += protocolPools[i].apr;
                        poolStaked += 1;
                        userTotalStaked += protocolPools[i].userStakedUsd
                        poolEarnings = protocolPools[i].userStakedUsd * protocolPools[i].apr  / 100 / 365
                        sumEarnings += poolEarnings
                    }
                }
                averageApr = sumApr / poolStaked / 365;

                setTotalRewards(totalRewards.toFixed(2));
                setTotalRewardsUsd(totalRewardsUsd.toFixed(2));
                setTvl(tvl.toFixed(2));
                setInflation(inflation)
                setAverageApr(averageApr);
                setUserTotalStaked(userTotalStaked);
                setDailyEarnings(sumEarnings);
            }
          }
          wait();
    },[address, allPools])

        // async function displayData() {
            // const allPools = await fetchData();
            // let protocolPools = [];
            // let tvl = 0;
            // let totalRewards = 0;
            // let totalRewardsUsd = 0;

            // const pulsePrice = allPools.generalInfo[0].pulsePrice;
            // const nativeTokenPrice = allPools.generalInfo[0].nativeTokenPriceUsd;
            // const marketCap = (allPools.generalInfo[0].nativeTokenSupply) * nativeTokenPrice;

            // setNativeTokenPrice(parseFloat(nativeTokenPrice).toFixed(4));
            // setMarketCap(marketCap.toFixed(0));

    //         for(let i=0; i<(allPools.farmingPools).length; i++) { 
    //         protocolPools.push(allPools.farmingPools[i])
    //         }
    //         for(let i=0; i<(allPools.stakingPools).length; i++) { 
    //             protocolPools.push(allPools.stakingPools[i])
    //         }
    //         for(let i=0; i<protocolPools.length; i++) {
    //             tvl += parseFloat(protocolPools[i].totalStakedUsd);
    //             totalRewards += parseFloat(protocolPools[i].rewards);
    //             totalRewardsUsd += parseFloat((protocolPools[i].rewardsUsd));
    //         }
    //         setTotalRewards(totalRewards.toFixed(2));
    //         setTotalRewardsUsd(totalRewardsUsd.toFixed(2));
    //         setTvl(tvl.toFixed(2));
    //         setAllPools(allPools);
    //     }
    //     displayData()

    // }, [address, allPools])
     
         return(
            <Box minHeight='100vh'>
                <Box bgGradient='linear(to-bl, yellow.400, yellow.700)' width='100%' height={[120, 130, 150,200]}>
                        <Center height={[120, 130, 150,200]}>
                            <Box>
                            <Text fontFamily='heading' fontWeight='bold' fontSize={[15, 20, 25, 30, 35]} color='black' ml={[10,20,30,40]} mr={[10,20,30,40]} mn='auto' align='center'>
                                Liquidity Hub of the Atropa Ecosystem
                            </Text>  
                            <Center>      
                            <Text fontSize={[10, 15,20, 25, 30]} fontFamily='fantasy' fontWeight='semibold'>
                                Yield farming powered by $Atrofa
                            </Text> 
                            </Center>  
                            </Box>                     
                        </Center>                  
                </Box>
                <Flex>
                <SimpleGrid columns={[1, null, null, 2]} spacing={[8, 15, 30, 40]} ml='auto' mr='auto' mt={[45, 50, 70, 75]}>
                <Box  bgColor='gray.900' padding={3} width={[300, 350, 400, 450]} fontSize={[null, 18, 20, 20]} color='gray.300'>
                        <HStack>
                            <Text mb={3} fontWeight='semibold' fontSize={[null, 20, 25, 25]} ml={2}>
                                $Atrofa
                            </Text>
                            <HStack ml='auto' mr={2}>
                                <Tooltip label="View on PulseScan">
                                    <Link href="https://scan.pulsechain.com/address/0x303f764A9c9511c12837cD2D1ECF13d4a6F99E17" isExternal>
                                        <Image src={pulseChain} alt='dex' boxSize={[6,7,8,9]} mb={3}></Image>
                                    </Link>
                                </Tooltip>
                                <Tooltip label="Dexscreener">
                                    <Link href="https://dexscreener.com/pulsechain/0x772d497bcdeb51fdf38bd7d097a4cb38cf7420a7" isExternal>
                                        <Image src={dexscreener} alt='dex' boxSize={[5,5,6,7]} mb={3}></Image>
                                    </Link>
                                </Tooltip>
                            </HStack>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={2} mr='auto'>
                                Price:
                            </Flex>
                            <Flex ml='auto' mr={2} fontWeight='semibold'>
                                ${nativeTokenPrice}
                            </Flex>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={2} mr='auto'>
                                Market Cap:
                            </Flex>
                            <Flex ml='auto' mr={2} fontWeight='semibold'>
                                ${marketCap}
                            </Flex>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={2} mr='auto'>
                                Total Supply:
                            </Flex>
                            <Flex ml='auto' mr={2} fontWeight='semibold'>
                                {totalSupply}
                            </Flex>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={2} mr='auto'>
                                Daily Inflation:
                            </Flex>
                            <Flex ml='auto' mr={2} fontWeight='semibold'>
                                {parseInt(inflation)}
                            </Flex>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={2} mr='auto'>
                                Buy & Burn:
                            </Flex>
                            <Flex ml='auto' mr={2} fontWeight='semibold'>
                                0
                            </Flex>
                        </HStack>
                </Box>
                {isConnected ? 
                <Box padding={2} ml='auto' mr='auto' bgColor='gray.900' color='gray.300' width={[300, 350, 400, 450]} fontSize={[null, 18, 20, 20]}> 
                    <HStack>
                            <Text mb={3} fontWeight='semibold' fontSize={[null, 20, 25, 25]} ml={2}>
                                {address.substring(0,5) + '...' + address.substring(address.length - 5)}
                            </Text>
                            <HStack ml='auto' mr={2}>
                                <Tooltip label="View on PulseScan">
                                    <Link href={`https://scan.pulsechain.com/address/${address}`} isExternal>
                                        <Image src={pulseChain} alt='dex' boxSize={[6,7,8,9]} mb={3}></Image>
                                    </Link>
                                </Tooltip>
                                <Tooltip label="Copy Address">
                                        <IconButton variant='unstyled' ml={-3} color='gray.300' icon={hasCopied ? <CheckIcon /> : <CopyIcon />} onClick={onCopy} mb={3}></IconButton>
                                </Tooltip>
                            </HStack>
                    </HStack>
                    <HStack mb={1}>
                        <Flex fontFamily='heading' ml={2} mr='auto'>
                            Total Staked:
                        </Flex>
                        <Flex fontFamily='heading' mr={2} ml={'auto'}>
                            ${parseFloat(userTotalStaked).toFixed(2)}
                        </Flex>
                    </HStack>
                    <HStack mb={1}>
                        <Flex fontFamily='heading' ml={2} mr='auto' fontSize='smaller' fontWeight='light'>
                            Daily APR:
                        </Flex>
                        <Flex fontFamily='heading' mr={2} ml={'auto'} fontSize='smaller' fontWeight='light'>
                            {parseFloat(averageApr).toFixed(2)}%
                        </Flex>
                    </HStack>
                    <HStack mb={1}>
                        <Flex fontFamily='heading' ml={2} mr='auto'>
                            Daily Earnings:
                        </Flex>
                        <Flex fontFamily='heading' mr={2} ml={'auto'}>
                            ${parseFloat(dailyEarnings).toFixed(2)}
                        </Flex>
                    </HStack>
                    <HStack mb={1}>
                        <Flex fontFamily='heading' ml={2} mr='auto'>
                            $Atrofa to claim:
                        </Flex>
                        <Flex fontFamily='heading' mr={2} ml={'auto'}>
                            {totalRewards}
                        </Flex>
                    </HStack>
                    <HStack>
                        <Flex mt={-2} mr={2} ml={'auto'} fontSize='smaller' fontWeight='light'>
                            ${totalRewardsUsd}
                        </Flex>
                    </HStack>
                    <HStack>
                            <Flex ml='auto' mr='auto'>
                                <Button mt='auto' mb={1} onClick={write} isLoading={isLoading} width={[100, 100, 150, 150]} height={[10,35,45, 50]} paddingBottom={2} paddingTop={2} fontSize={[null, 15, 20, 20]} bgGradient='linear(to-bl, yellow.400, yellow.700)' color='black' _hover={{ bgColor: 'gray.600'}}>
                                    Claim
                                </Button>
                            </Flex>
                    </HStack>
                </Box>
                :   <Box padding={2} ml='auto' mr='auto' bgColor='gray.900' color='gray.300' width={[300, 350, 400, 450]} fontSize={[null, 18, 20, 20]} h={[200, 200, 200, 250]}>
                       <Center h={[200, 200, 200, 250]}>
                        <Flex>
                            <Button width={[150, 150, 175, 200]} height={50} fontSize={15} paddingTop={2} paddingBottom={2} bgColor='gray.500' color='gray.200' onClick={() => open()}> 
                                {isConnected ? address.substring(0,5) + '...' + address.substring(address.length - 5) : "Connect Wallet" }
                            </Button>
                        </Flex>
                        </Center>
                    </Box>
                }
                </SimpleGrid> 
                </Flex>
                <Box fontFamily='heading' ml='auto' mr='auto' mt={[5, null, null, 10]} padding={2} width={[300, 350, 400, 450]} bgColor='gray.900' color='gray.300'>
                    <VStack fontSize={[null, 15, 20, 25]} fontWeight='semibold'>
                        <Flex fontFamily='heading' ml='auto' mr='auto'>
                            TVL:
                        </Flex>
                        <Flex ml='auto' mr='auto'>
                        ${tvl}
                        </Flex>
                    </VStack>
                </Box> 
             </Box>
        ) 
}

export default Home;