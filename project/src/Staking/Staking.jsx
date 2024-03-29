import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Flex, Spinner, Box, Center, SimpleGrid, Text, Link} from "@chakra-ui/react";
import StakePoolInfo from "./StakePoolInfo";
import { useContext } from "react";
import { InfoContext } from "../App";
import VaultStaking from "../VaultStaking/VaultStaking";
import { ExternalLinkIcon } from "@chakra-ui/icons";

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
    // }, [address, allPools]);
}, []);

    return(
        <Box minHeight='100vh'>
            <Box bgGradient='linear(to-bl, yellow.400, yellow.700)' width='100%' height={[120, 130, 150,200]}>
                <Center height={[120, 130, 150,200]}>
                    <Box>
                        <Text fontFamily='heading' fontWeight='bold' fontSize={[20, 20, 30, 40]} color='black' ml={[10,20,30,40]} mr={[10,20,30,40]} mn='auto' align='center'>
                            Staking Pools
                        </Text> 
                        <Text ml='auto' mr='auto' Text fontSize={[15, 15,20, 25, 30]} fontFamily='fantasy' align='center' >
                            Stake $Atrofa to Access DAI, PLS and PLSX Single Sided Staking
                        </Text>
                        <Text ml='auto' mr='auto' Text fontSize={[15, 15,20, 25, 30]} fontFamily='fantasy' align='center' >
                            <Link isExternal href='https://app.gitbook.com/o/eBOkoGVdGQScbHnCOQqi/s/Wfeyg9h1gXFqfoXakI6K/single-sided-staking'>
                                Docs
                            </Link>
                            <ExternalLinkIcon fontSize={15} ml={1}></ExternalLinkIcon>
                        </Text> 
                    </Box>                   
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
            <Center>
            <Flex>
                <VaultStaking/>
            </Flex>
            </Center>
        </Box>       
    )
}

export default Staking;
