import { Box, Center, Flex, HStack, Image, SimpleGrid, Text, Tooltip, VStack, Link, useClipboard, IconButton } from "@chakra-ui/react";
import { RepeatIcon, CopyIcon, CheckIcon } from '@chakra-ui/icons'
import pulseChain from './assets/PulseChain.jpeg'
import piteas from './assets/Piteas.png'



export default function PortInfo({
    contractAddress,
    name,
    symbol,
    balance,
    priceInPulse,
    priceInUsd,
    balanceValueUsd,
    decimals,
}) {

    const { onCopy: onCopyContract, value: contractValue, setValue: setContractValue, hasCopied: hasCopiedContract } = useClipboard(contractAddress);

    return(
        <Box width={[300, 500, 750, 1000]}>
    <Box hideBelow={'sm'} width={[300, 500, 750, 1000]}>
        <HStack paddingTop={3} spacing={0}>
        <Box bgColor={'gray.900'} height={70} width={[120, 200, 300, 400]}>
            <Center h={70} justifyContent='left'>
            <Text hideBelow='sm' ml={5}>
                {name}
            </Text>
            
            <Tooltip hideBelow={'sm'} label="Copy Address">
                    <IconButton variant='unstyled' color='gray.300' mr={-2} icon={hasCopiedContract ? <CheckIcon /> : <CopyIcon />} onClick={onCopyContract}></IconButton>
            </Tooltip>
            <Tooltip hideBelow={'sm'} label="View on PulseScan">
                <Link mb={-1} href={`https://scan.pulsechain.com/address/${contractAddress}`} isExternal>
                    <Image src={pulseChain} alt='dex' boxSize={[4,5,6,7]}></Image>
                </Link>
            </Tooltip>
                <Tooltip hideBelow={'sm'} label="Sell on Piteas">
                    <Link  mb={-1} href={`https://app.piteas.io/#/swap?exactField=input&exactAmount=0&inputCurrency=${contractAddress}&outputCurrency=ETH`} isExternal>
                        <Image src={piteas} alt='Piteas' boxSize={[1,2,3,4]} ></Image>
                    </Link>
                </Tooltip>
            </Center>
        </Box>
        <Box bgColor={'gray.900'} height={70} width={[60, 100, 150, 200]}>
            <VStack align='left'>
            <Center h={70} justifyContent='left'>
            <Box>
            <Text>
                {(parseInt(balance.toString())/10**decimals) < 0.001 ? (parseInt(balance.toString())/10**decimals).toExponential(2)
                : (parseInt(balance.toString())/10**decimals).toFixed(2)}
            </Text>
            <Text fontFamily='fantasy'>
                {symbol}
            </Text>
            </Box>
            </Center>
            </VStack>
        </Box>
        <Box bgColor={'gray.900'} height={70} width={[60, 100, 150, 200]}>
            <Center h={70} justifyContent='left'>
            <Text>
                ${(parseFloat(priceInUsd.toString())) < 0.001 ? (parseFloat(priceInUsd.toString())).toExponential(2)
                : (parseFloat(priceInUsd.toString())).toFixed(4)}  
            </Text>
            </Center>
        </Box>
        <Box bgColor={'gray.900'} height={70} width={[60, 100, 150, 200]}>
            <Center h={70} justifyContent='left'>
            <Text>
                ${(parseFloat(balanceValueUsd.toString())) < 0.001 ? (parseFloat(balanceValueUsd.toString())).toExponential(2)
                : (parseFloat(balanceValueUsd.toString())).toFixed(2)} 
            </Text>
            </Center>
        </Box>
        </HStack>
    </Box>
    <Box display={{ base: "flex", sm: "none" }} width={300} fontSize={13}>
        <HStack width={300} display={{ base: "flex", sm: "none" }} paddingTop={3} spacing={0} height={20}>
        <Center height={20} justifyContent='left'>
            <Box  bgColor={'gray.900'} width={90}>
            <Text mb={0} ml={5}>
                {symbol}
            </Text>
            <HStack  ml={5} spacing={0}>
            <Tooltip  label="View on PulseScan">
                <Link  href={`https://scan.pulsechain.com/address/${contractAddress}`} isExternal>
                    <Image mb={-1} src={pulseChain} alt='dex' boxSize={5}></Image>
                </Link>
            </Tooltip>
                <Tooltip label="Sell on Piteas">
                    <Link  mb={-1} href={`https://app.piteas.io/#/swap?exactField=input&exactAmount=0&inputCurrency=${contractAddress}&outputCurrency=ETH`} isExternal>
                        <Image src={piteas} alt='Piteas' boxSize={3} ></Image>
                    </Link>
                </Tooltip>
            </HStack>
            
            </Box>
            </Center>
            <Center height={20} justifyContent='left'>
        <Box bgColor={'gray.900'} width={20}>
            <VStack align='left'>
            <Center h={20} justifyContent='left'>
            <Box>
            <Text>
                {(parseInt(balance.toString())/10**decimals) < 0.001 ? (parseInt(balance.toString())/10**decimals).toExponential(2)
                : (parseInt(balance.toString())/10**decimals).toFixed(2)}
            </Text>
            <Text fontFamily='fantasy'>
                {symbol}
            </Text>
            </Box>
            </Center>
            </VStack>
            </Box>
            </Center>
            <Center height={20} justifyContent='left'>
        <Box bgColor={'gray.900'} width={20}>
            <Center h={20} justifyContent='left'>
            <Text>
                ${(parseFloat(priceInUsd.toString())) < 0.001 ? (parseFloat(priceInUsd.toString())).toExponential(2)
                : (parseFloat(priceInUsd.toString())).toFixed(4)}  
            </Text>
            </Center>
        </Box>
        </Center>
        <Box bgColor={'gray.900'} height={20} width={60}>
            <Center h={20} justifyContent='left'>
            <Text>
                ${(parseFloat(balanceValueUsd.toString())) < 0.001 ? (parseFloat(balanceValueUsd.toString())).toExponential(2)
                : (parseFloat(balanceValueUsd.toString())).toFixed(2)} 
            </Text>
            </Center>
            </Box>
            </HStack>
            </Box>
        </Box>
    )
}
