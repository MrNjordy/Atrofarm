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
    <Box>
        <HStack spacing={0}>
        <Box bgColor={'gray.900'} height={70} width={400}>
            <Center h={70} justifyContent='left'>
            <Text ml={5}>
                {name}
            </Text>
            <Tooltip label="Copy Address">
                    <IconButton variant='unstyled' color='gray.300' mr={-2} icon={hasCopiedContract ? <CheckIcon /> : <CopyIcon />} onClick={onCopyContract}></IconButton>
            </Tooltip>
            <Tooltip label="View on PulseScan">
                <Link mb={-1} href={`https://scan.pulsechain.com/address/${contractAddress}`} isExternal>
                    <Image src={pulseChain} alt='dex' boxSize={[4,5,6,7]}></Image>
                </Link>
            </Tooltip>
                <Tooltip label="Sell on Piteas">
                    <Link  mb={-1} href={`https://app.piteas.io/#/swap?exactField=input&exactAmount=0&inputCurrency=${contractAddress}&outputCurrency=ETH`} isExternal>
                        <Image src={piteas} alt='Piteas' boxSize={[1,2,3,4]} ></Image>
                    </Link>
                </Tooltip>
            </Center>
        </Box>

        {/* <Box bgColor={'gray.900'} height={70} width={400}>
            <Text>
                {contractAddress}
            </Text>
        </Box> */}
        <Box bgColor={'gray.900'} height={70} width={200}>
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
            <Box bgColor={'gray.900'} height={70} width={200}>
            <Center h={70} justifyContent='left'>
            <Text>
                ${(parseFloat(priceInUsd.toString())) < 0.001 ? (parseFloat(priceInUsd.toString())).toExponential(2)
                : (parseFloat(priceInUsd.toString())).toFixed(4)}  
            </Text>
            </Center>
            </Box>
            <Box bgColor={'gray.900'} height={70} width={200}>
            <Center h={70} justifyContent='left'>
            <Text>
                ${(parseFloat(balanceValueUsd.toString())) < 0.001 ? (parseFloat(balanceValueUsd.toString())).toExponential(2)
                : (parseFloat(balanceValueUsd.toString())).toFixed(2)} 
            </Text>
            </Center>
            </Box>
            </HStack>
        </Box>
    )
}
