import { Box, Button, Center, Flex, HStack, SimpleGrid, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { useAccount, useConnect } from "wagmi";
import { useEffect, useState } from "react";

import {fetchData} from "./FetchData";

function Home() {
    const [totalRewards, setTotalRewards] = useState();
    const [totalRewardsUsd, setTotalRewardsUsd] = useState();
    const [tvl, setTvl] = useState();

    const { isConnected } = useAccount();

    useEffect(() => {

        async function displayData() {
            const allPools = await fetchData();
            let protocolPools = [];
            let tvl = 0;
            let totalRewards = 0;
            let totalRewardsUsd = 0;

            for(let i=0; i<(allPools.farmingPools).length; i++) { 
            protocolPools.push(allPools.farmingPools[i])
            }
            for(let i=0; i<(allPools.stakingPools).length; i++) { 
                protocolPools.push(allPools.stakingPools[i])
            }
            for(let i=0; i<protocolPools.length; i++) {
                tvl += parseFloat(protocolPools[i].totalStakedUsd);
                totalRewards += parseFloat(protocolPools[i].rewards);
                totalRewardsUsd += parseFloat((protocolPools[i].rewardsUsd));
            }
            setTotalRewards(totalRewards);
            setTotalRewardsUsd(totalRewardsUsd);
            setTvl(tvl.toFixed(2));
        }
        displayData()

    }, [])
     
         if(isConnected) {
         return(
            <Box>
            <Box mt={5} border='2px'padding={2} width='-webkit-fit-content' borderRadius='2xl'>
                <VStack spacing={5}>
                    <Flex ml={1} mr='auto'>
                        Your rewards: 
                    </Flex>
                    <Flex ml='auto' mr={1}>
                        {totalRewards}
                    </Flex>
                </VStack>
                <VStack>
                    <Flex ml='auto' mr={1}>
                        ${totalRewardsUsd}
                    </Flex>
                </VStack>
                    <Center>
                        <Button>
                            Claim All
                        </Button>
                    </Center>
             </Box>
             <Box mt={5} border='2px'padding={2} width='-webkit-fit-content' borderRadius='2xl'>
                TVL: ${tvl}
             </Box>
           
             </Box>
        ) 
    }
}

export default Home;