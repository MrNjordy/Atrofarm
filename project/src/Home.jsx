import { useContractWrite } from "wagmi";
import { Box, Button, Center, Flex, HStack, VStack, Text, SimpleGrid, Image, Link, Tooltip } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { InfoContext } from "./App";
import { masterAbi } from "./data";
import { usePublicClient } from "wagmi";
import dexscreener from './assets/dexscreener.png'
import dextool from './assets/dextool.jpeg'
import geckoTerminal from './assets/geckoterminal.png'
import pulseChain from './assets/PulseChain.jpeg'
import coinGecko from './assets/coinG.jpeg'
import gitBook from './assets/gitbook.svg'


function Home() {
    const allPools = useContext(InfoContext);
    const [totalRewards, setTotalRewards] = useState();
    const [totalRewardsUsd, setTotalRewardsUsd] = useState();
    const [tvl, setTvl] = useState();
    // const [allPools, setAllPools] = useState();
    const [nativeTokenPrice, setNativeTokenPrice] = useState();
    const [marketCap, setMarketCap] = useState();
    const [totalSupply, setTotalSupply] = useState();
    const [inflation, setInflation] = useState();

    const { address } = useAccount();
    const { data, isLoading, isSuccess, write } = useContractWrite({
        address: import.meta.env.VITE_MASTER,
        abi: masterAbi,
        functionName: 'claimAll',
      })
    useEffect(() => {
        let protocolPools = [];
        let tvl = 0;
        let totalRewards = 0;
        let totalRewardsUsd = 0;

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
                }
                setTotalRewards(totalRewards.toFixed(2));
                setTotalRewardsUsd(totalRewardsUsd.toFixed(2));
                setTvl(tvl.toFixed(2));
                setInflation(inflation)
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
                <VStack>
                    <Box bgGradient='linear(to-bl, yellow.400, yellow.700)' width='100%' padding={[5, null, null, 10]} height={[120, 130, 150,220]}>
                        <Center>
                            <Text fontFamily='heading' fontWeight='bold' fontSize={[null, 15, 35, 40]} color='black' ml={[10,20,30,40]} mr={[10,20,30,40]} align='center'>
                                Liquidity Hub of the Atropa Ecosystem
                            </Text>
                        </Center>  
                        <Center>                 
                            <Text ml='auto' mr='auto' fontSize={[10, 15, 25, 35]} fontFamily='fantasy' fontWeight='semibold'>
                                Yield farming powered by $Atrofa
                            </Text>
                        </Center>
                    <Flex>
                    <SimpleGrid columns={6} spacing={3} ml='auto' mr='auto' mt={2}>
                        <Tooltip label="Docs">
                            <Link href="https://atrofarm.gitbook.io/atrofarm/" isExternal>
                                <Image src={gitBook} alt='dex' boxSize={[3,4,5,6]} mr={1}></Image>
                            </Link>
                        </Tooltip>
                        <Tooltip label="Block Explorer">
                            <Link href="https://scan.pulsechain.com/address/0x303f764A9c9511c12837cD2D1ECF13d4a6F99E17" isExternal>
                                <Image src={pulseChain} alt='dex' boxSize={[3,4,5,6]} mr={1}></Image>
                            </Link>
                        </Tooltip>
                        <Tooltip label="CoinGecko">
                            <Link href="https://www.coingecko.com/en/coins/atrofarm" isExternal>
                                <Image src={coinGecko} alt='dex' boxSize={[3,4,5,6]} mr={1}></Image>
                            </Link>
                        </Tooltip>
                        <Tooltip label="Dexscreener">
                            <Link href="https://dexscreener.com/pulsechain/0x772d497bcdeb51fdf38bd7d097a4cb38cf7420a7" isExternal>
                                <Image src={dexscreener} alt='dex' boxSize={[3,4,5,6]} mr={1}></Image>
                            </Link>
                        </Tooltip>
                        <Tooltip label="Dextool">
                            <Link href="https://www.dextools.io/app/en/pulse/pair-explorer/0x772d497bcdeb51fdf38bd7d097a4cb38cf7420a7" isExternal>
                                <Image src={dextool} alt='dex' boxSize={[3,4,5,6]} mr={1}></Image>
                            </Link>
                        </Tooltip>
                        <Tooltip label="Geckoterminal">
                            <Link href="https://www.geckoterminal.com/pulsechain/pools/0x772d497bcdeb51fdf38bd7d097a4cb38cf7420a7" isExternal>
                                <Image src={geckoTerminal} alt='dex' boxSize={[3,4,5,6]} mr={1}></Image>
                            </Link>
                        </Tooltip>
                    </SimpleGrid> 
                    </Flex>
                    </Box>
                </VStack>
                <Flex>
                <SimpleGrid columns={[1, null, null, 2]} spacing={[8, 15, 30, 40]} ml='auto' mr='auto' mt={[5, 10, 15, 20]}>
                <Box  bgColor='gray.900' padding={3} width={[null, 250, 350, 450]} fontSize={[null, 10, 15, 20]} color='gray.300'>
                        <Center>
                        <Text mb={3} fontWeight='semibold' fontSize={[null, 15, 20, 25]}>
                                $Atrofa
                        </Text>
                        </Center>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={1} mr='auto'>
                                Price:
                            </Flex>
                            <Flex ml='auto' mr={1} fontWeight='semibold'>
                                ${nativeTokenPrice}
                            </Flex>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={1} mr='auto'>
                                Market Cap:
                            </Flex>
                            <Flex ml='auto' mr={1} fontWeight='semibold'>
                                ${marketCap}
                            </Flex>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={1} mr='auto'>
                                Total Supply:
                            </Flex>
                            <Flex ml='auto' mr={1} fontWeight='semibold'>
                                {totalSupply}
                            </Flex>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={1} mr='auto'>
                                Daily Inflation:
                            </Flex>
                            <Flex ml='auto' mr={1} fontWeight='semibold'>
                                {parseInt(inflation)}
                            </Flex>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={1} mr='auto'>
                                Buy & Burn:
                            </Flex>
                            <Flex ml='auto' mr={1} fontWeight='semibold'>
                                0
                            </Flex>
                        </HStack>
                </Box>
                <Box ml='auto' mr='auto' bgColor='gray.900' color='gray.300'  padding={3} width={[null, 250, 350, 450]} fontSize={[null, 10, 15, 20]}>
                    <Center>
                        <Text mb={3} fontWeight='semibold' fontSize={[null, 15, 20, 25]}>
                            Available to claim:
                        </Text>
                    </Center>
                    <HStack >
                        <Flex ml='auto' mr='auto' fontWeight='semibold'>
                            {totalRewards}
                        </Flex>
                    </HStack>
                    <HStack>
                        <Flex ml='auto' mr='auto' fontSize='smaller' fontWeight='light'>
                            ${totalRewardsUsd}
                        </Flex>
                    </HStack>
                        <Center>
                            <Button mt={9} onClick={write} isLoading={isLoading} width={[null, 75, 100, 150]} height={[null,31,null,34]} paddingBottom={2} paddingTop={2} fontSize={[null, 11, 13, 15]} bgGradient='linear(to-bl, yellow.400, yellow.700)' color='black' _hover={{ bgColor: 'gray.600'}}>
                                Claim
                            </Button>
                        </Center> 
                </Box>
                </SimpleGrid> 
                </Flex>
                <Box fontFamily='heading' ml='auto' mr='auto' mt={[5, null, null, 10]} padding={2} width={[null, 250, 350, 450]} bgColor='gray.900' color='gray.300'>
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