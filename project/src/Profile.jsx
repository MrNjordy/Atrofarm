import { Button, Flex, HStack, Image } from "@chakra-ui/react";
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
    const [pulsePrice, setPulsePrice] = useState(0);
    const [nativeTokenPrice, setNativeTokenPrice] = useState(0);
    useEffect(() => {
        function wait() {
            if (!allPools) {
              setTimeout(wait, 100)
            } else {
              setPulsePrice((allPools.generalInfo[0].pulsePrice).toFixed(4));
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
            <HStack ml={10} spacing={[5, null, null, 20]} height={45} mr={2}>
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
                    <Flex>
                    ${nativeTokenPrice}
                    </Flex>
                </Flex>
                <Flex fontSize={[8, 11, 14, 17]}>
                    <Image src={atropaIcon} alt='Atropa' boxSize={[3,4,5,6]} mr={1}></Image>
                    <Flex>
                    ${pulsePrice}
                    </Flex>
                </Flex>
                <Button fontSize={[8, 11, 14, 17]} mt={2} bgGradient='linear(to-b, gray.700, gray.900)' color='wheat' onClick={() => open()}> 
                    {isConnected ? address.substring(0,7) + '...' : "Connect" }
                </Button>
            </HStack>
        </Flex>
    )
}

export default Profile;