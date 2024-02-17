import { Button, Center, Flex, HStack, Image, Link, Menu, MenuButton, MenuGroup, MenuItem, MenuList, Text, VStack } from "@chakra-ui/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {  useAccount } from "wagmi";
import { Link as RouteLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { InfoContext } from "./App";
import {FaSquareXTwitter} from 'react-icons/fa6'
import X from './assets/XLogo.png'
import telegram from './assets/telegram.png'
import atroc from './assets/Atrofarm.png'
import piteas from './assets/Piteas.png'
import { ExternalLinkIcon, HamburgerIcon } from "@chakra-ui/icons";
import { ConnectButton } from '@rainbow-me/rainbowkit';


function Profile() {
    const allPools = useContext(InfoContext);

    // const { open } = useWeb3Modal()
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
    // },[address,allPools])
},[address, allPools])

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
        <Flex bgColor='gray.800' color='gray.300' fontWeight='bold' fontSize={[11, 12, 16, 17]}>
            <HStack hideBelow='sm' ml={[5, null, null, 10]} spacing={[2, null, null, 9]} height={75} mr={2}>
                <Flex>
                    <RouteLink to='/' >
                        <Image src={atroc} boxSize={[6,8,10,12]}></Image>
                    </RouteLink>
                </Flex>
                <Flex>
                    <RouteLink to='/Farms' >Farm</RouteLink>
                </Flex>
                <Flex>
                    <RouteLink to='/DualRewards' >Dual Rewards</RouteLink>
                </Flex>
                <Flex>
                    <RouteLink to='/Staking' >Stake</RouteLink>
                </Flex>
                <Flex>
                    <RouteLink to='/dePulse' >dePulse</RouteLink>
                </Flex>
                {/* <Flex>
                    <RouteLink to='/Timelock' >Timelock</RouteLink>
                </Flex> */}
            </HStack>
            <HStack hideBelow='sm' ml='auto' spacing={[1, 3, 4, 5]} height={45} mt={4} mr={[5, null, null, 10]} mb={2}>
                <Flex fontSize={[8, 11, 14, 17]}>
                    <Text>${nativeTokenPrice}</Text>
                </Flex>
                <Flex fontSize={[8, 11, 14, 16]}>
                    <Link href="https://app.piteas.io/#/swap?exactField=input&exactAmount=0&inputCurrency=ETH&outputCurrency=0x303f764A9c9511c12837cD2D1ECF13d4a6F99E17" isExternal>
                        <HStack spacing={1}>
                        <Text>Buy on</Text>
                        <Image src={piteas} alt='Piteas' boxSize={[3,4,5,6]} mr={1} ></Image>
                        </HStack>
                    </Link>
                </Flex>
                <Menu>
                    {({ isOpen }) => (
                        <>
                        <MenuButton isActive={isOpen} as={HamburgerIcon} boxSize={30} fontSize={25} fontWeight='bold'>
                        </MenuButton>
                            <MenuList bgColor='gray.900' borderRadius='none' border='none'>
                            <MenuItem bgColor='gray.900' fontSize={15} color='gray.300' mt={2}>
                                <Link href="https://atrofarm.gitbook.io/atrofarm/" isExternal>
                                    Docs
                                    <ExternalLinkIcon ml={1} mb={1}></ExternalLinkIcon>
                                </Link>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={15} color='gray.300'>
                                <Link href="https://twitter.com/Atrofarm17023" isExternal>
                                    Twitter
                                </Link>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={15} color='gray.300'>
                                <Link href="https://t.me/Atrofarm" isExternal>
                                    Telegram
                                </Link>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={15} color='gray.300'>
                                <Link href="https://impls.finance/vaults" isExternal>
                                    IMPLS
                                    <ExternalLinkIcon ml={1} mb={1}></ExternalLinkIcon>
                                </Link>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={15} color='gray.300'>
                                <RouteLink to="/Timelock">
                                    Timelock
                                </RouteLink>
                            </MenuItem>
                        </MenuList>
                        </>
                    )}
                </Menu>
                <ConnectButton fontSize={[null, 11, 14, 17]} height={[null,31,null,42]} paddingTop={2} paddingBottom={2} bgColor='gray.500' color='gray.200'> 
                    {isConnected ? address.substring(0,5) + '...' + address.substring(address.length - 5) : "Connect Wallet" }</ConnectButton>
                {/* <Button fontSize={[null, 11, 14, 17]} height={[null,31,null,42]} paddingTop={2} paddingBottom={2} bgColor='gray.500' color='gray.200' onClick={() => open()}> 
                    {isConnected ? address.substring(0,5) + '...' + address.substring(address.length - 5) : "Connect Wallet" }
                </Button> */}
            </HStack>
            <Center>
            <HStack ml={2} mr='auto' display={{ base: "flex", sm: "none" }} spacing={[1, 3, 4, 5]}>
                <Menu>
                    {({ isOpen }) => (
                        <>
                        <MenuButton isActive={isOpen} as={HamburgerIcon} boxSize={30} >
                            {isOpen ? 'Close' : 'Open'}
                        </MenuButton>
                        <MenuList bgColor='gray.900'  border='none' borderRadius='none'>
                            <MenuItem bgColor='gray.900' fontSize={20} color='gray.300'>
                                <RouteLink to='/' >
                                    HOME
                                </RouteLink>
                            </MenuItem >
                            <MenuItem bgColor='gray.900' fontSize={20} color='gray.300'>
                                <RouteLink to='/Farms' >
                                    FARM
                                </RouteLink>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={20} color='gray.300'>
                                <RouteLink to='/Staking'>
                                    STAKE
                                </RouteLink>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={20} color='gray.300'>
                                <RouteLink to='/dePulse' >
                                    dePulse
                                </RouteLink>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={20} color='gray.300'>
                                <RouteLink to='/DualRewards' >
                                    Dual Rewards
                                </RouteLink>
                            </MenuItem>
                            <MenuItem bgColor='gray.900'>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={15} color='gray.300' mt={2}>
                                <Link href="https://atrofarm.gitbook.io/atrofarm/" isExternal>
                                    Docs
                                    <ExternalLinkIcon ml={1} mb={1}></ExternalLinkIcon>
                                </Link>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={15} color='gray.300'>
                                <Link href="https://twitter.com/Atrofarm17023" isExternal>
                                    Twitter
                                </Link>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={15} color='gray.300'>
                                <Link href="https://t.me/Atrofarm" isExternal>
                                    Telegram
                                </Link>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={15} color='gray.300'>
                                <Link href="https://app.piteas.io/#/swap?exactField=input&exactAmount=0&inputCurrency=ETH&outputCurrency=0x303f764A9c9511c12837cD2D1ECF13d4a6F99E17" isExternal>
                                    Buy on Piteas
                                    <ExternalLinkIcon ml={1} mb={1}></ExternalLinkIcon>
                                </Link>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={15} color='gray.300'>
                                <Link href="https://impls.finance/vaults" isExternal>
                                    IMPLS
                                    <ExternalLinkIcon ml={1} mb={1}></ExternalLinkIcon>
                                </Link>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={20} color='gray.300'>
                                <RouteLink to='/Timelock' >
                                    Timelock
                                </RouteLink>
                            </MenuItem>
                        </MenuList>
                        </>
                    )}
                </Menu>
            </HStack>
            </Center>
            <HStack mr={2} ml='auto' display={{ base: "flex", sm: "none" }} spacing={3} mt={4} mb={4}>
            <Flex fontSize={[15]}>
                <Text>${parseFloat(nativeTokenPrice).toFixed(3)}</Text>
            </Flex>
            <Flex>
                <Button width={130} fontSize={15} paddingTop={2} paddingBottom={2} bgColor='gray.500' color='gray.200' onClick={() => open()}> 
                    {isConnected ? address.substring(0,5) + '...' + address.substring(address.length - 5) : "Connect Wallet" }
                </Button>
                </Flex>
            </HStack>
        </Flex>
    )
}

export default Profile;