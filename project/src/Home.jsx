import { Box, Button, Center, Flex, HStack, VStack, Text } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { InfoContext } from "./App";

function Home() {
    const allPools = useContext(InfoContext);
    const [totalRewards, setTotalRewards] = useState();
    const [totalRewardsUsd, setTotalRewardsUsd] = useState();
    const [tvl, setTvl] = useState();
    // const [allPools, setAllPools] = useState();
    const [nativeTokenPrice, setNativeTokenPrice] = useState();
    const [marketCap, setMarketCap] = useState();

    const { address } = useAccount();

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

                setNativeTokenPrice(parseFloat(nativeTokenPrice).toFixed(4));
                setMarketCap(marketCap.toFixed(0));

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
                    <Box width={[null, 250, 350, 700]} mt={[5, null, null, 10]} padding={5} fontWeight='bold' border='4px' borderRadius='2xl' bgGradient='linear(to-bl, yellow.400, yellow.600)' >
                        <Text ml='auto' mr='auto' fontFamily='heading' fontSize={[null, 20, 30, 40]}>
                        Welcome to Atrofarm
                        </Text>
                    </Box >
                    <Text ml='auto' mr='auto' fontSize={[11, 15, 20, 25]} fontFamily='fantasy' fontWeight='semibold' bgGradient='linear(to-bl, yellow.400, yellow.600)' bgClip='text'>
                        Where degens get rewarded for supporting the Atropa ecosystem
                    </Text>
                </VStack>
                <Box  bgGradient='linear(to-bl, yellow.400, yellow.600)' ml='auto' mr='auto' mt='40px' border='2px' padding={3} width={[null, 250, 350, 450]} borderRadius='2xl' fontSize={[null, 15, 20, 25]} fontWeight='bold'>
                        <HStack mb={5}>
                            <Flex fontFamily='heading' ml={1} mr='auto'>
                                $Atrofa:
                            </Flex>
                            <Flex ml='auto' mr={1}>
                                ${nativeTokenPrice}
                            </Flex>
                        </HStack>
                        <HStack>
                            <Flex fontFamily='heading' ml={1} mr='auto'>
                                Market Cap:
                            </Flex>
                            <Flex ml='auto' mr={1}>
                                ${marketCap}
                            </Flex>
                        </HStack>
                </Box>
                <Box fontFamily='heading' ml='auto' mr='auto' mt={10} border='2px' padding={2} width={[null, 500, 700, 900]} borderRadius='2xl' bgGradient='linear(to-bl, yellow.400, yellow.600)'>
                    <VStack fontSize={[null, 15, 20, 25]} fontWeight='bold'>
                        <Flex fontFamily='heading' ml='auto' mr='auto'>
                            Total Value Locked accross the protocol:
                        </Flex>
                        <Flex ml='auto' mr='auto'>
                        ${tvl}
                        </Flex>
                    </VStack>
                </Box>
                <Box ml='auto' mr='auto' mt={10} bgGradient='linear(to-bl, yellow.400, yellow.600)' border='2px'padding={3} width={[null, 250, 350, 450]} borderRadius='2xl' fontSize={[null, 15, 20, 25]} fontWeight='bold'>
                    <HStack >
                        <Flex fontFamily='heading' ml={1} mr='auto'>
                            Your rewards: 
                        </Flex>
                        <Flex ml='auto' mr={1}>
                            {totalRewards}
                        </Flex>
                    </HStack>
                    <HStack mb={2}>
                        <Flex ml='auto' mr={1} fontSize='smaller' fontWeight='light'>
                            ${totalRewardsUsd}
                        </Flex>
                    </HStack>
                        <Center>
                            <Button width={[null, 75, 100, 150]} height={[null,31,null,34]} paddingBottom={2} paddingTop={2} fontSize={[null, 11, 13, 15]} bgColor='blackAlpha.800' color='wheat' _hover={{ bgColor: 'gray.600'}}>
                                Claim All
                            </Button>
                        </Center> 
                </Box>  
             </Box>
        ) 
}

export default Home;