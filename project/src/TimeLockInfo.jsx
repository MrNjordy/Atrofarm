import { Box, Center, Flex, HStack, Text, VStack } from "@chakra-ui/react";

export default function TimeLockInfo({
    ca,
    functionName,
    args,
    timer,
    id,
}) {

    return(
        <Box>
            <Box fontFamily='heading' mt={5} padding={3} paddingBottom={1} width={250} bgColor='gray.900' fontWeight='semibold' color='gray.300'>
                <Center>
                    <Text>
                        {ca.substring(0,5)+ "..."+ ca.substring(ca.length -5)}
                    </Text>
                </Center>
                <VStack mb={4}>
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        Function: 
                    </Flex>
                    <Flex mt={-1} ml={1} mr='auto' fontSize='sm'>
                        {functionName}
                    </Flex>
                </VStack>
                <VStack mb={4}>
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        Arguments: 
                    </Flex>
                        <HStack mt={-1} ml={1} mr='auto' fontSize='sm' spacing={5}>
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
                <VStack>
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        Time remaining:
                    </Flex>
                    <Flex mt={-1} ml={1} mr='auto' fontSize='sm'>    
                        {timer[0]<0 ? "0H 0M 0S" : timer[0].toString()+"H "+timer[1].toString()+"M " +timer[2].toString()+"S"}
                    </Flex>
                </VStack>


            </Box>
        </Box>
    )
}
