import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Flex, Spinner, Box, Center, SimpleGrid} from "@chakra-ui/react";
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
            <Center fontWeight='bold' borderBottom='6px' borderBottomStyle='groove' borderColor='black' ml={40} mr={40}>
                <Flex fontFamily='heading' fontSize={[17, 24, 30, 40]} mt={5} paddingBottom={5} bgGradient='linear(to-bl, yellow.400, yellow.600)' bgClip='text'>
                    Staking Pools
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
