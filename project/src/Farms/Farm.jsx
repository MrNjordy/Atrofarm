import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Flex, Spinner, Box, Center, Text, SimpleGrid, VStack} from "@chakra-ui/react";
import PoolInfo from "./PoolInfo";
import { useContext } from "react";
import { InfoContext } from "../App";

function Farm() {
    const allPools = useContext(InfoContext);
    const [isLoading, setIsLoading] =useState(true)
    const [poolsInfo, setPools] = useState([]);
    const{ address } = useAccount();

    useEffect(() => {
        function wait() {
            if (!allPools) {
              setTimeout(wait, 100)
            } else {
                const farmingPools = allPools.farmingPools;
                farmingPools.sort((a, b) => {
                    let fa = a.name.toLowerCase();
                    let fb = b.name.toLowerCase(); 
                    if(fa<fb) {
                        return -1
                    }
                    if (fa > fb) {
                        return 1;
                    }
                    return 0;
                })
                setPools(farmingPools);
                setIsLoading(false);
            }
          }
          wait();
    }, [address, allPools]);

return(
    <Box minHeight='100vh'>
            <VStack>
            <Box bgGradient='linear(to-bl, yellow.300, yellow.700)' width='100%' padding={[5, null, null, 10]}>
                <Center>
                <Text fontFamily='heading' fontWeight='bold' fontSize={[null, 20, 30, 40]} color='black' ml={[10,20,30,40]} mr={[10,20,30,40]} align='center'>
                Farming Pools
                </Text>
                </Center>
                <Center>
                    <Text ml='auto' mr='auto' fontSize={[9, 13, 17, 25]} fontFamily='fantasy' fontWeight='hairline' >
                        All pools are PulseX V2 unless indicated otherwise
                    </Text>
                </Center>
                <Center>
                    <Text ml='auto' mr='auto' fontSize={[9, 13, 17, 25]} fontFamily='fantasy' fontWeight='hairline' >
                        Deposit fee of 2% on non-native pools
                    </Text>
                </Center>
            </Box>
            <Flex fontSize={[7, 10, 15, 20]} paddingBottom={5}>
            </Flex>
            </VStack>
            <Flex>
        {isLoading ?    <Spinner
                    thickness='4px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='blue.500'
                    size='xl'
                    ml='auto' mr='auto' mt={20} />
                :
                <SimpleGrid columns={[1, 2, 3, 4]} spacing={[null, 15, 20]} ml='auto' mr='auto' mt={5}>         
                            {poolsInfo.map((item) => {
                                return (
                                    <PoolInfo key={item.id} {...item} />
                                )
                            })}
                </SimpleGrid>
        }
        </Flex>
    </Box>       
)
}

export default Farm;