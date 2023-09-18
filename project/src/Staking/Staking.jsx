import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Flex, Wrap, WrapItem, Spinner, Box, Center} from "@chakra-ui/react";
import StakePoolInfo from "./StakePoolInfo";
import { fetchData } from "../FetchData";

function Staking() {
    const [isLoading, setIsLoading] =useState(true)
    const [poolsInfo, setPools] = useState([]);
    const { address } = useAccount();

    useEffect(() => {
        async function getToken() {
            const allPools = await fetchData();
            const stakingPools = allPools.stakingPools;

            setIsLoading(false)
            setPools(stakingPools)
        }   
        getToken();
    }, [address, poolsInfo]);

    return(
        <Box>
            <Center borderBottom='2px' borderBottomStyle='groove' ml={40} mr={40}>
                <Flex fontSize='3xl' mt={5} paddingBottom={5}>
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
                            
                            :   <Wrap ml='auto' mr='auto' mt={10}>
                                    <WrapItem>          
                                        {poolsInfo.map((item) => {
                                            return (
                                                <StakePoolInfo key={item.name} {...item} />
                                            )
                                        })}
                                    </WrapItem>
                                </Wrap>
                }
            </Flex>
        </Box>       
    )
}

export default Staking;
