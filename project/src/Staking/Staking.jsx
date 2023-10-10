import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Flex, Spinner, Box, Center, SimpleGrid, Text} from "@chakra-ui/react";
import StakePoolInfo from "./StakePoolInfo";
import { useContext } from "react";
import { InfoContext } from "../App";

function Staking() {
    const allPools = useContext(InfoContext);
    const [isLoading, setIsLoading] =useState(true)
    const [poolsInfo, setPools] = useState([]);
    const { address } = useAccount();

    useEffect(() => {
        function wait() {
            if (!allPools) {
              setTimeout(wait, 100)
            } else {
                const stakingPools = allPools.stakingPools;
                setPools(stakingPools);
                setIsLoading(false);
            }
          }
          wait();
        // async function getToken() {
        //     const allPools = await fetchData();
        //     const stakingPools = allPools.stakingPools;

        //     setIsLoading(false)
        //     setPools(stakingPools)
        // }   
        // getToken();
    }, [address, allPools]);

    return(
        <Box minHeight='100vh'>
            <Box height={220} bgGradient='linear(to-bl, yellow.400, yellow.700)' width='100%' padding={[5, null, null, 10]}>
                <Center>
                <Text fontFamily='heading' fontWeight='bold' fontSize={[null, 20, 30, 40]} color='black' ml={[10,20,30,40]} mr={[10,20,30,40]} align='center' mt={2}>
                Staking Pools
                </Text>
                </Center>
                <Center>
                    <Text ml='auto' mr='auto' fontSize={[9, 13, 17, 25]} fontFamily='fantasy' fontWeight='hairline' mb={7} >
                        No deposit fee
                    </Text>
                </Center>
            </Box>
            <Flex>
                {isLoading ?    <Spinner
                                thickness='4px'
                                speed='0.65s'
                                emptyColor='gray.200'
                                color='yellow.500'
                                size='xl'
                                ml='auto' mr='auto' mt={20} />
                            
                            :   <SimpleGrid columns={[1, null, 3]} spacing={[null, 15, 20]} ml='auto' mr='auto' mt= {5} mb={10}>       
                                        {poolsInfo.map((item) => {
                                            return (
                                                <StakePoolInfo key={item.name} {...item} />
                                            )
                                        })}
                                </SimpleGrid>
                }
            </Flex>
        </Box>       
    )
}

export default Staking;
