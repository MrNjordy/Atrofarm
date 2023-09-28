import { Button, Flex, HStack, Image, Link } from "@chakra-ui/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {  useAccount } from "wagmi";
import { Link as RouteLink } from "react-router-dom";
import { useEffect, useState } from "react";
import atrofaIcon from './assets/Atrofa.png'
import atropaIcon from './assets/Atropa.png'
import { useContext } from "react";
import { InfoContext } from "./App";

function Profile() {
    const allPools = useContext(InfoContext);

    const { open } = useWeb3Modal()
    const { address, isConnected } = useAccount()
    // const [allPools, setAllPools] = useState();
    const [atropaPrice, setAtropaPrice] = useState(0);
    const [nativeTokenPrice, setNativeTokenPrice] = useState(0);
    useEffect(() => {
        function wait() {
            if (!allPools) {
              setTimeout(wait, 100)
            } else {
              setAtropaPrice((allPools.generalInfo[0].atropaPrice).toFixed(4));
              setNativeTokenPrice(parseFloat(allPools.generalInfo[0].nativeTokenPriceUsd).toFixed(4));
            }
          }
          wait();
    },[address,allPools])

    // useEffect(() => {

    //     async function displayData() {
    //         const allPools = await fetchData();

    //         setPulsePrice((allPools.generalInfo[0].pulsePrice).toFixed(4));
    //         setNativeTokenPrice(parseFloat(allPools.generalInfo[0].nativeTokenPriceUsd).toFixed(4));
    //     }
    //     displayData()
    // }, [address, allPools])
    // console.log(allPools)
    return (
        <Flex paddingBottom={3} bgGradient='linear(to-b, gray.400, gray.700)' color='gray.800' fontWeight='bold' fontSize={[11, 14, 17, 20]}>
            <HStack ml={[5, null, null, 10]} spacing={[5, null, null, 20]} height={45} mr={2}>
                <Flex>
                    <RouteLink to='/' >Home</RouteLink>
                </Flex>
                <Flex>
                    <RouteLink to='/Farms' >Farm</RouteLink>
                </Flex>
                <Flex>
                    <RouteLink to='/Staking' >Stake</RouteLink>
                </Flex>
            </HStack>
            <HStack ml='auto' spacing={[5, null, null, 20]} height={45} mr={10} mb={2}>
                <Flex fontSize={[8, 11, 14, 17]}>
                    <Image src={atrofaIcon} alt='Atrofa' boxSize={[3,4,5,6]} mr={1}></Image>
                    <Link href="https://dexscreener.com/pulsechain/0x772d497bcdeb51fdf38bd7d097a4cb38cf7420a7" isExternal>
                    <Flex>
                    ${nativeTokenPrice}
                    </Flex>
                    </Link>
                </Flex>
                <Flex fontSize={[8, 11, 14, 17]}>
                    <Image src={atropaIcon} alt='Atropa' boxSize={[3,4,5,6]} mr={1}></Image>
                    <Link href="https://dexscreener.com/pulsechain/0xf892d93199b4de0ab1cdf35799ccf9d5a425581b" isExternal>
                    <Flex>
                    ${atropaPrice}
                    </Flex>
                    </Link>
                </Flex>
                <Button fontSize={[null, 11, 14, 17]} height={[null,31,null,42]} paddingTop={2} paddingBottom={2} mt={2} bgGradient='linear(to-b, gray.700, gray.900)' color='wheat' onClick={() => open()}> 
                    {isConnected ? address.substring(0,7) + '...' : "Connect" }
                </Button>
            </HStack>
        </Flex>
    )
}

export default Profile;