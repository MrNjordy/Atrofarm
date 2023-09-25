import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Flex, Spinner, Box, Center, Text, SimpleGrid} from "@chakra-ui/react";
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
                setPools(farmingPools);
                setIsLoading(false);
            }
          }
          wait();
        // async function getToken() {
        //     const allPools = await fetchData();
        //     const farmingPools = allPools.farmingPools;

        //     setIsLoading(false)
        //     setPools(farmingPools)
        // }   
        // getToken();
    }, [address, allPools]);

return(
    <Box minHeight='100vh'>
        <Center fontWeight='bold' borderBottom='6px' borderBottomStyle='groove' borderColor='black' ml={[10, null, null, 40]} mr={[10, null, null, 40]}>
            <Flex fontSize={[17, 24, 30, 40]} mt={5} paddingBottom={5}>
                <Text bgGradient='linear(to-bl, yellow.400, yellow.600)' bgClip='text' fontFamily='heading' >
                Farming Pools
                </Text>
            </Flex>
        </Center>
        <Flex>
        {isLoading ?    <Spinner
                    thickness='4px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='blue.500'
                    size='xl'
                    ml='auto' mr='auto' mt={20} />
                :
                <SimpleGrid columns={[1, null, 3]} spacing={[null, 15, 20]} ml='auto' mr='auto' mt={5} mb={10}>         
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