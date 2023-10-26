import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Center, Flex, HStack, Link, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";

export default function TimeLockInfo({
    ca,
    functionName,
    args,
    timer,
    id,
    translation,
}) {

    return(
        <Box>
            <Box fontFamily='heading' mt={5} padding={3} paddingBottom={1} width={250} bgColor='gray.900' fontWeight='semibold' color='gray.300'>
                <Center>
                    <Link href={`https://scan.pulsechain.com/tx/${ca}`} isExternal>
                        {ca.substring(0,5)+ "..."+ ca.substring(ca.length -5)}
                        <ExternalLinkIcon ml={1} mb={1}></ExternalLinkIcon>
                    </Link>
                </Center>
                <Center borderBottom='1px' borderColor={'yellow.500'} mb={4}></Center>
                <VStack mb={4}>
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        Function: 
                    </Flex>
                    <Flex mt={-1} ml={1} mr='auto' fontSize='sm' fontWeight={'light'}>
                        {functionName}
                    </Flex>
                </VStack>
                <VStack mb={4}>
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        Arguments: 
                    </Flex>
                        <HStack mt={-1} ml={1} mr='auto' fontSize='sm' spacing={5} fontWeight={'light'}>
                            {args.map((item) => {
                                return (
                                        <HStack>
                                            <Flex>
                                                {item.length>10 ? item.toString().substring(0,10)+"..." : item.toString()}
                                            </Flex>
                                        </HStack>
                                )})}
                        </HStack>
                </VStack>
                <Center borderBottom='1px' borderColor={'yellow.500'} mb={4}></Center>
                <Wrap mb={4}>
                    <WrapItem>
                        <Link fontSize={12} href={`https://scan.pulsechain.com/address/${args[1]}`} isExternal>
                        {translation.toString()}
                        <ExternalLinkIcon ml={1} mb={1}></ExternalLinkIcon>
                        </Link>
                    </WrapItem>
                </Wrap>
                <VStack>
                    <Flex ml='auto' mr='auto' fontSize='smaller'>
                        Time remaining:
                    </Flex>
                    <Flex mt={-1} ml='auto' mr='auto' fontSize='sm'>    
                        {timer[0]<0 ? "0H 0M 0S" : timer[0].toString()+"H "+timer[1].toString()+"M " +timer[2].toString()+"S"}
                    </Flex>
                </VStack>


            </Box>
        </Box>
    )
}
