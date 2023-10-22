import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Flex, Spinner, Box, Center, Text, SimpleGrid, VStack, Switch, FormControl, FormLabel, HStack, Input, Wrap, WrapItem, InputRightAddon, InputGroup, Tabs, Tab, TabList, TabPanel, TabPanels} from "@chakra-ui/react";
import PoolInfo from "./PoolInfo";
import { useContext } from "react";
import { InfoContext } from "../App";

function Farm() {
    const allPools = useContext(InfoContext);
    const [isLoading, setIsLoading] = useState(true)
    const [poolsInfo, setPools] = useState([]);
    const [inactivePools, setInactivePools] = useState([]);
    const [onlyStaked, setOnlyStaked] = useState(false);
    const [onlyNative, setOnlyNative] = useState(false);
    const [searchValue, setSearchValue] = useState();
    const{ address } = useAccount();

    useEffect(() => {
        function wait() {
            if (!allPools) {
              setTimeout(wait, 100)
            } else {
                const farmingPools = allPools.farmingPools;
                const activePools = [];
                const inactivePools = [];

                for(let i=0; i<farmingPools.length; i++) {
                    if(farmingPools[i].rewardAlloc == 0) {
                        inactivePools.push(farmingPools[i])
                    }
                    else {
                        activePools.push(farmingPools[i])
                    };
                }
                setInactivePools(inactivePools);
                if(searchValue) {
                    activePools.sort((a, b) => {
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
                    let onlySearchedPools = [];
                        for(let i=0; i< activePools.length; i++) {
                            if((activePools[i].name).toLowerCase().includes((searchValue))){
                                onlySearchedPools.push(activePools[i])
                            }
                        }
                        setPools(onlySearchedPools);
                }
                else if(!onlyStaked && !onlyNative) {                    
                    activePools.sort((a, b) => {
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
                    setPools(activePools);
                    setIsLoading(false);
                }
                else if (onlyStaked && !onlyNative) {
                    let onlyStakedPools = [];
                    for(let i=0; i< activePools.length; i++) {
                        activePools.sort((a, b) => {
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
                        if(activePools[i].userStaked > 0){
                            onlyStakedPools.push(activePools[i])
                        }
                    }
                    setPools(onlyStakedPools);
                }
                else if (!onlyStaked && onlyNative) {
                    let onlyNativePools = [];
                    for(let i=0; i< activePools.length; i++) {
                        activePools.sort((a, b) => {
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
                        if(activePools[i].isAtrofa){
                            onlyNativePools.push(activePools[i])
                        }
                    }
                    setPools(onlyNativePools);
                }
                else if (onlyStaked && onlyNative) {
                    let bothStakedNativePools = [];
                    for(let i=0; i< activePools.length; i++) {
                        activePools.sort((a, b) => {
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
                        if(activePools[i].isAtrofa && activePools[i].userStaked > 0){
                            bothStakedNativePools.push(activePools[i])
                        }
                    }
                    setPools(bothStakedNativePools);
                }
            }
          }
          wait();
    }, [address, allPools]);

    function onlyStakedDiplayed() {
        const farmingPools = allPools.farmingPools;
        const activePools = [];

        for(let i=0; i<farmingPools.length; i++) {
            if(farmingPools[i].rewardAlloc != 0) {
                activePools.push(farmingPools[i])
            };
        }

        let onlyStakedPools = [];
            for(let i=0; i< activePools.length; i++) {
                if(activePools[i].userStaked > 0){
                    onlyStakedPools.push(activePools[i])
                }
            }
            setOnlyStaked(true);
            setPools(onlyStakedPools);
        }

    function onlyNativeDisplayed() {
        const farmingPools = allPools.farmingPools;
        const activePools = [];

        for(let i=0; i<farmingPools.length; i++) {
            if(farmingPools[i].rewardAlloc != 0) {
                activePools.push(farmingPools[i])
            };
        }

        let onlyNativePools = [];
            for(let i=0; i< activePools.length; i++) {
                if(activePools[i].isAtrofa){
                    onlyNativePools.push(activePools[i])
                }
            }
            setOnlyNative(true);
            setPools(onlyNativePools);
    } 
    function allDiplayedStaked() {         
            const farmingPools = allPools.farmingPools;
            const activePools = [];

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

            for(let i=0; i<farmingPools.length; i++) {
                if(farmingPools[i].rewardAlloc != 0) {
                    activePools.push(farmingPools[i])
                };
            }

            if(onlyNative) {
                let onlyNativePools = [];
                for(let i=0; i< activePools.length; i++) {
                    if(activePools[i].isAtrofa){
                        onlyNativePools.push(activePools[i])
                    }
                }
                setPools(onlyNativePools);
            } 
            else {
            setPools(activePools);
            }
            setOnlyStaked(false);
    }

    function allDiplayedNative() {         
        const farmingPools = allPools.farmingPools;
        const activePools = [];

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

        for(let i=0; i<farmingPools.length; i++) {
            if(farmingPools[i].rewardAlloc != 0) {
                activePools.push(farmingPools[i])
            };
        }
        
        if(onlyStaked) {
            let onlyStakedPools = [];
            for(let i=0; i< activePools.length; i++) {
                if(activePools[i].userStaked > 0){
                    onlyStakedPools.push(activePools[i])
                }
            }
            setPools(onlyStakedPools);
        } 
        else {
        setPools(activePools);
        }
        setOnlyNative(false);
    }
    const handleChange = (e) => {
        e.preventDefault();
        const farmingPools = allPools.farmingPools;
        const activePools = [];

        for(let i=0; i<farmingPools.length; i++) {
            if(farmingPools[i].rewardAlloc != 0) {
                activePools.push(farmingPools[i])
            };
        }
        let onlySearchedPools = [];
            for(let i=0; i< activePools.length; i++) {
                if((activePools[i].name).toLowerCase().includes((e.target.value).toLowerCase())){
                    onlySearchedPools.push(activePools[i])
                }
            }
            setPools(onlySearchedPools);
            setSearchValue((e.target.value).toLowerCase());   
    }

return(
    <Box minHeight='100vh'>
            <VStack>
            <Center bgGradient='linear(to-bl, yellow.400, yellow.700)' width='full' >
            <Box height={[120, 130, 150,200]} bgGradient='linear(to-bl, yellow.400, yellow.700)' width='100%' padding={[5, null, null, 10]}>
                <Text fontFamily='heading' fontWeight='bold' fontSize={[20, 20, 30, 40]} color='black' ml={[10,20,30,40]} mr={[10,20,30,40]} align='center'>
                    Farming Pools
                </Text>
                <Text ml='auto' mr='auto' Text fontSize={[15, 15,20, 25, 30]} fontFamily='fantasy' align='center' >
                    All pools are PulseX V2 unless indicated otherwise
                </Text>
                <Text ml='auto' mr='auto' Text fontSize={[15, 15,20, 25, 30]} fontFamily='fantasy' align='center' >
                    Deposit fee of 2% on non-native pools
                </Text>
            </Box>
            </Center>
            <Flex fontSize={[7, 10, 15, 20]} paddingBottom={5}>
            </Flex>
            </VStack>
            <Flex>
        {isLoading ?    <Spinner
                    thickness='4px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='yellow.500'
                    size='xl'
                    ml='auto' mr='auto' mt={20} />
                :
                
                <Box ml='auto' mr='auto'>
                    <Center>
                        <Tabs align='center' mb={5} size={'md'} color={'gray.300'} colorScheme='yellow' variant={'solid-rounded'}>
                            <TabList>
                                <Tab>
                                    Active
                                </Tab>
                                <Tab>
                                    Inactive
                                </Tab>
                            </TabList>
                            <TabPanels>
                            <TabPanel>
                    <Center>
                        <HStack spacing={10}>
                            <Flex>
                                <FormControl display='flex' mr={0} alignItems='center'>
                                    <FormLabel color='gray.300' mb={0} ml='auto' mr={1}>
                                        Staked Only
                                    </FormLabel>
                                    <Switch onChange={!onlyStaked ? onlyStakedDiplayed : allDiplayedStaked} ml={1} mr='auto' colorScheme="yellow"></Switch>
                                </FormControl>
                            </Flex>
                            <Flex>
                                <FormControl display='flex' mr={0} alignItems='center'>
                                    <FormLabel color='gray.300' mb={0} ml='auto' mr={1}>
                                        Fee Free
                                    </FormLabel>
                                    <Switch onChange={!onlyNative ? onlyNativeDisplayed : allDiplayedNative} ml={1} mr='auto' colorScheme="yellow"></Switch>
                                </FormControl>
                            </Flex>
                            <Flex hideBelow={'md'}>
                                <Input type='text' onChange={handleChange} textColor='gray.300' focusBorderColor='yellow.500' placeholder="Search Pools" _placeholder={{ color: 'gray.300' }} width={300}></Input>             
                            </Flex>
                        </HStack>
                    </Center>
                    <Center>
                        <Flex>
                        <Input display={{ base: "flex", md: "none" }} mt={3} type='text' onChange={handleChange} textColor='gray.300' focusBorderColor='yellow.500' placeholder="Search Pools" _placeholder={{ color: 'gray.300' }} width={250} ></Input>
                        </Flex>
                    </Center>
                    <Flex>
                        <SimpleGrid columns={[1, 2, 3, 3]} spacing={[null, 15, 20]} ml='auto' mr='auto' mt={5}>         
                            {poolsInfo.map((item) => {
                                return (
                                    <PoolInfo key={item.id} {...item} />
                                )
                            })}
                        </SimpleGrid>
                        </Flex>
                            </TabPanel>
                            <TabPanel>
                            <Flex>
                        <SimpleGrid columns={[1, 2, 3, 3]} spacing={[null, 15, 20]} ml='auto' mr='auto' mt={5}>         
                            {inactivePools.map((item) => {
                                return (
                                    <PoolInfo key={item.id} {...item} />
                                )
                            })}
                        </SimpleGrid>
                        </Flex>
                            </TabPanel>
                        </TabPanels>

                    </Tabs>
                    </Center>
                </Box>
        }
        </Flex>
    </Box>       
)
}

export default Farm;