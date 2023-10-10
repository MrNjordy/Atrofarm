import { Button, Flex, HStack, Image, Link, Text } from "@chakra-ui/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {  useAccount } from "wagmi";
import { Link as RouteLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { InfoContext } from "./App";
import {FaSquareXTwitter} from 'react-icons/fa6'
import X from './assets/X.png'
import telegram from './assets/telegram3.png'
import atroc from './assets/Atrofarm.png'
import piteas from './assets/Piteas.png'

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
        <Flex paddingBottom={3} bgColor='gray.800' color='gray.300' fontWeight='bold' fontSize={[11, 12, 16, 17]}>
            <HStack ml={[5, null, null, 10]} spacing={[2, null, null, 9]} height={75} mr={2}>
                <Flex>
                    <RouteLink to='/' >
                        <Image src={atroc} boxSize={[6,8,10,12]}></Image>
                    </RouteLink>
                </Flex>
                <Flex>
                    <RouteLink to='/Farms' >Farm</RouteLink>
                </Flex>
                <Flex>
                    <RouteLink to='/Staking' >Stake</RouteLink>
                </Flex>
            </HStack>
            <HStack ml='auto' spacing={[1, 3, 4, 5]} height={45} mt={4} mr={[5, null, null, 10]} mb={2}>
                <Flex fontSize={[8, 11, 14, 16]}>
                    <Link href="https://app.piteas.io/#/swap?exactField=input&exactAmount=0&inputCurrency=ETH&outputCurrency=0x303f764A9c9511c12837cD2D1ECF13d4a6F99E17" isExternal>
                        <HStack spacing={1}>
                        <Text>Buy on</Text>
                        <Image src={piteas} alt='Piteas' boxSize={[3,4,5,6]} mr={1} ></Image>
                        </HStack>
                    </Link>
                </Flex>
                <Flex fontSize={[8, 11, 14, 17]}>
                    <Text>${nativeTokenPrice}</Text>
                </Flex>
                <Flex fontSize={[8, 11, 14, 17]}>
                    <Link href="https://twitter.com/Atrofarm17023" isExternal>
                        <Image src={X} alt='dex' boxSize={[3,4,5,6]} mr={1} ></Image>
                    </Link>
                </Flex>
                <Flex fontSize={[8, 11, 14, 17]}>
                    <Link href="https://t.me/Atrofarm" isExternal>
                        <Image src={telegram} alt='dex' boxSize={[3,4,6,8]} ></Image>
                    </Link>
                </Flex>
                <Button fontSize={[null, 11, 14, 17]} height={[null,31,null,42]} paddingTop={2} paddingBottom={2} bgColor='gray.900' color='gray.300' onClick={() => open()}> 
                    {isConnected ? address.substring(0,7) + '...' : "Connect" }
                </Button>
            </HStack>
        </Flex>
    )
}

export default Profile;