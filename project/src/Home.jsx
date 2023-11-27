import { useContractWrite } from "wagmi";
import { readContracts } from 'wagmi/actions'
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Box, Button, Center, Flex, HStack, VStack, Text, SimpleGrid, Image, Link, Tooltip, useClipboard, IconButton, GenericAvatarIcon } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { InfoContext } from "./App";
import { lpAbi, masterAbi } from "./data";
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
    const [burned, setBurned] = useState();
    const [ggcPrice, setGgcPrice] = useState();
    const [ggcTotalSupply, setGgcTotalSupply] = useState();
    const [ggcMarketCap, setGgcMarketCap] = useState();
    const[ggcBurn, setGgcBurn] = useState();
    const [ggcReflections, setGgcReflections] = useState();
    const [ggcReflectionsUsd, setGgcReflectionsUsd] = useState();
    const [ggcReflectionsUser, setGgcReflectionsUser] = useState();
    const [ggcReflectionsUserUsd, setGgcReflectionsUserUsd] = useState();

    const { address, isConnected } = useAccount();
    const { data, isLoading, isSuccess, write } = useContractWrite({
        address: import.meta.env.VITE_MASTER,
        abi: masterAbi,
        functionName: 'claimAll',
      })

    const { onCopy, value, setValue, hasCopied } = useClipboard(address);
    useEffect(() => {
        async function getData() {
        let protocolPools = [];
        let tvl = 0;
        let totalRewards = 0;
        let totalRewardsUsd = 0;

        let sumApr = 0;
        let averageApr = 0;

        let userTotalStaked = 0
        let poolEarnings = 0;
        let sumEarnings = 0;

        const data = await readContracts({
            contracts: [
              {
                address: '0xefD766cCb38EaF1dfd701853BFCe31359239F305', //Dai
                abi: lpAbi,
                functionName: 'balanceOf',
                args: ['0x5726f36e62cf761332F5c655b68bc2E5D55ED083']
              },
              {
                address: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', //wPLS
                abi: lpAbi,
                functionName: 'balanceOf',
                args: ['0xc4d4fb6cAD2931e65C0BF44b2A3fA9C598ADd37B']
              },
              {
                address: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab', //PLSX
                abi: lpAbi,
                functionName: 'balanceOf',
                args: ['0x8615545328F1F6c8cefe8b48ad48c231731433ea'],
              },
              {
                address: '0x5726f36e62cf761332F5c655b68bc2E5D55ED083', //Dai vault
                abi: masterAbi,
                functionName: 'degenInfo',
                args: [0, address],
              },
              {
                address: '0xc4d4fb6cAD2931e65C0BF44b2A3fA9C598ADd37B', //PLS vault
                abi: masterAbi,
                functionName: 'degenInfo',
                args: [0, address],
              },
              {
                address: '0x8615545328F1F6c8cefe8b48ad48c231731433ea', //PLSX vault
                abi: masterAbi,
                functionName: 'degenInfo',
                args: [0, address],
              },
            ]
        });

        const daiTvl = data[0].result;
        const plsTvl = data[1].result;
        const plsxTvl = data[2].result;
        const daiStaked = address ? data[3].result[0] : 0;
        const plsStaked = address? data[4].result[0] : 0;
        const plsxStaked = address? data[5].result[0] : 0;

        function wait() {

            if (!allPools) {
              setTimeout(wait, 100)
            } else {
                const pulsePrice = allPools.generalInfo[0].pulsePrice;
                const nativeTokenPrice = allPools.generalInfo[0].nativeTokenPriceUsd;
                const marketCap = (allPools.generalInfo[0].nativeTokenSupply) * nativeTokenPrice;
                const totalSupply = parseInt(allPools.generalInfo[0].nativeTokenSupply);
                const inflation = allPools.generalInfo[0].inflation;
                const burned = allPools.generalInfo[0].burned;
                const daiPrice = allPools.generalInfo[0].daiPrice;
                const plsxPrice = allPools.generalInfo[0].plsxPrice;
                const ggcPrice = allPools.generalInfo[0].ggcPrice
                const ggcTotalSupply = allPools.generalInfo[0].ggcTotalSupply;
                const ggcMarketCap = ggcPrice * ggcTotalSupply;
                const ggcBurn = allPools.generalInfo[0].ggcBurn;
                const ggcReflections = allPools.generalInfo[0].ggcReflections;
                const ggcReflectionsUsd = allPools.generalInfo[0].ggcReflectionsUsd;
                const ggcReflectionsUser = isConnected ? allPools.generalInfo[0].ggcReflectionsUser : 0;
                const ggcReflectionsUserUsd = isConnected ? allPools.generalInfo[0].ggcReflectionsUserUsd : 0;

                const daiTvlUsd = parseInt(daiTvl.toString()) * daiPrice / 10**18
                const plsTvlUsd = parseInt(plsTvl.toString()) * pulsePrice / 10**18
                const plsxTvlUsd = parseInt(plsxTvl.toString()) * plsxPrice / 10**18
                const daiStakedUsd = parseInt(daiStaked.toString()) * daiPrice / 10**18
                const plsStakedUsd = parseInt(plsStaked.toString()) * pulsePrice / 10**18
                const plsxStakedUsd = parseInt(plsxStaked.toString()) * plsxPrice / 10**18

                setNativeTokenPrice(parseFloat(nativeTokenPrice).toFixed(4));
                setMarketCap(marketCap.toFixed(0));
                setTotalSupply(totalSupply);
                setBurned(burned)

                for(let i=0; i<(allPools.farmingPools).length; i++) { 
                    protocolPools.push(allPools.farmingPools[i])
                }
                for(let i=0; i<(allPools.stakingPools).length; i++) { 
                    protocolPools.push(allPools.stakingPools[i])
                }
                for(let i=0; i<protocolPools.length; i++) {
                    if(!parseFloat(protocolPools[i].totalStakedUsd)){
                        protocolPools[i].totalStakedUsd = 0
                    }
                    tvl += parseFloat(protocolPools[i].totalStakedUsd);
                    totalRewards += parseFloat(protocolPools[i].rewards);
                    totalRewardsUsd += parseFloat((protocolPools[i].rewardsUsd));
                    if(protocolPools[i].userStaked > 0) {
                        sumApr += protocolPools[i].apr * protocolPools[i].userStakedUsd;
                        userTotalStaked += protocolPools[i].userStakedUsd
                        poolEarnings = protocolPools[i].userStakedUsd * protocolPools[i].apr  / 100 / 365
                        sumEarnings += poolEarnings
                    }
                }
                averageApr = sumApr / userTotalStaked / 365;

                tvl += daiTvlUsd + plsTvlUsd + plsxTvlUsd;
                userTotalStaked += daiStakedUsd + plsStakedUsd + plsxStakedUsd

                setTotalRewards(totalRewards.toFixed(2));
                setTotalRewardsUsd(totalRewardsUsd.toFixed(2));
                setTvl(tvl.toFixed(2));
                setInflation(inflation)
                setAverageApr(averageApr);
                setUserTotalStaked(userTotalStaked);
                setDailyEarnings(sumEarnings);
                setGgcPrice(ggcPrice);
                setGgcBurn(ggcBurn);
                setGgcMarketCap(ggcMarketCap);
                setGgcTotalSupply(ggcTotalSupply);
                setGgcReflections(ggcReflections);
                setGgcReflectionsUsd(ggcReflectionsUsd);
                setGgcReflectionsUser(ggcReflectionsUser);
                setGgcReflectionsUserUsd(ggcReflectionsUserUsd);
            }
          }
          wait();
        }
        getData();
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
                                Liquidity Hub of PulseChain Communities
                            </Text>
                            <Text fontFamily='heading' fontWeight='bold' fontSize={[15, 20, 25, 30, 35]} color='black' ml={[10,20,30,40]} mr={[10,20,30,40]} mn='auto' align='center'>
                                and Home of the Good Goat Coin
                            </Text> 
                            <Center>      
                                <Text fontSize={[10, 15,20, 25, 30]} fontFamily='fantasy' fontWeight='semibold'>
                                    Yield farming powered by $Atrofa, supported by $GGC
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
                                    {parseInt(burned)}
                                </Flex>
                            </HStack>
                        </Box>
                        <Box  bgColor='gray.900' padding={3} width={[300, 350, 400, 450]} fontSize={[null, 18, 20, 20]} color='gray.300'>
                            <HStack>
                                <Text mb={3} fontWeight='semibold' fontSize={[null, 20, 25, 25]} ml={2}>
                                    $GGC
                                </Text>
                            <HStack ml='auto' mr={2}>
                                <Tooltip label="View on PulseScan">
                                    <Link href="https://scan.pulsechain.com/address/0x393672F3D09E7fC18E90b6113DCe8958e8B3A13b" isExternal>
                                        <Image src={pulseChain} alt='dex' boxSize={[6,7,8,9]} mb={3}></Image>
                                    </Link>
                                </Tooltip>
                                <Tooltip label="Dexscreener">
                                    <Link href="https://dexscreener.com/pulsechain/0xa995397733D2a6D5a51ec5D0Cc378c63E486CbD1" isExternal>
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
                                ${parseFloat(ggcPrice).toFixed(4)}
                            </Flex>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={2} mr='auto'>
                                Market Cap:
                            </Flex>
                            <Flex ml='auto' mr={2} fontWeight='semibold'>
                                ${parseInt(ggcMarketCap)}
                            </Flex>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={2} mr='auto'>
                                Total Supply:
                            </Flex>
                            <Flex ml='auto' mr={2} fontWeight='semibold'>
                                {parseInt(ggcTotalSupply)}
                            </Flex>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={2} mr='auto'>
                                Burnt:
                            </Flex>
                            <Flex ml='auto' mr={2} fontWeight='semibold'>
                                {parseInt(ggcBurn)}
                            </Flex>
                        </HStack>
                        <HStack mb={1}>
                            <Flex fontFamily='heading' ml={2} mr='auto'>
                                $GOAT distributed:
                            </Flex>
                            <Flex ml='auto' mr={2} fontWeight='semibold'>
                                {parseInt(ggcReflections)}
                            </Flex>
                        </HStack>
                        <Flex justify='right' mr={1} mt={-1} fontSize='smaller' fontWeight='light'>
                            ${parseFloat(ggcReflectionsUsd).toFixed(2)}
                        </Flex>
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
                            Total $GOAT earned:
                        </Flex>
                        <Flex fontFamily='heading' mr={2} ml={'auto'}>
                            {parseInt(ggcReflectionsUser)}
                        </Flex>
                    </HStack>
                    <Flex justify='right' mr={1} mt={-1} fontSize='smaller' fontWeight='light'>
                            ${parseFloat(ggcReflectionsUserUsd).toFixed(2)}
                       </Flex>
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
                    <Box fontFamily='heading' ml='auto' mr='auto'  padding={2} width={[300, 350, 400, 450]} bgColor='gray.900' color='gray.300'>
                        <Center height={300}>
                        <VStack fontSize={[null, 15, 20, 25]} fontWeight='semibold'>
                            <Flex fontFamily='heading' ml='auto' mr='auto'>
                                TVL:
                            </Flex>
                            <Flex ml='auto' mr='auto'>
                                ${tvl}
                            </Flex>
                        </VStack>
                        </Center>
                    </Box> 
                </SimpleGrid> 
                </Flex>
            </Box>
        ) 
}

export default Home;