import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Flex, Spinner, Box, Center, Text, SimpleGrid, VStack, Switch, FormControl, FormLabel, HStack, Input, Wrap, WrapItem, InputRightAddon, InputGroup} from "@chakra-ui/react";
import PoolInfo from "./PoolInfo";
import { useContext } from "react";
import { InfoContext } from "../App";

function Farm() {
    const allPools = useContext(InfoContext);
    const [isLoading, setIsLoading] = useState(true)
    const [poolsInfo, setPools] = useState([]);
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
                if(searchValue) {
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
                    let onlySearchedPools = [];
                        for(let i=0; i< farmingPools.length; i++) {
                            if((farmingPools[i].name).toLowerCase().includes((searchValue))){
                                onlySearchedPools.push(farmingPools[i])
                            }
                        }
                        setPools(onlySearchedPools);
                }
                else if(!onlyStaked && !onlyNative) {                    
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
                else if (onlyStaked && !onlyNative) {
                    let onlyStakedPools = [];
                    for(let i=0; i< farmingPools.length; i++) {
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
                        if(farmingPools[i].userStaked > 0){
                            onlyStakedPools.push(farmingPools[i])
                        }
                    }
                    setPools(onlyStakedPools);
                }
                else if (!onlyStaked && onlyNative) {
                    let onlyNativePools = [];
                    for(let i=0; i< farmingPools.length; i++) {
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
                        if(farmingPools[i].isAtrofa){
                            onlyNativePools.push(farmingPools[i])
                        }
                    }
                    setPools(onlyNativePools);
                }
                else if (onlyStaked && onlyNative) {
                    let bothStakedNativePools = [];
                    for(let i=0; i< farmingPools.length; i++) {
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
                        if(farmingPools[i].isAtrofa && farmingPools[i].userStaked > 0){
                            bothStakedNativePools.push(farmingPools[i])
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

        let onlyStakedPools = [];
            for(let i=0; i< farmingPools.length; i++) {
                if(farmingPools[i].userStaked > 0){
                    onlyStakedPools.push(farmingPools[i])
                }
            }
            setOnlyStaked(true);
            setPools(onlyStakedPools);
        }

    function onlyNativeDisplayed() {
        const farmingPools = allPools.farmingPools;

        let onlyNativePools = [];
            for(let i=0; i< farmingPools.length; i++) {
                if(farmingPools[i].isAtrofa){
                    onlyNativePools.push(farmingPools[i])
                }
            }
            setOnlyNative(true);
            setPools(onlyNativePools);
    } 
    function allDiplayedStaked() {         
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
            if(onlyNative) {
                let onlyNativePools = [];
                for(let i=0; i< farmingPools.length; i++) {
                    if(farmingPools[i].isAtrofa){
                        onlyNativePools.push(farmingPools[i])
                    }
                }
                setPools(onlyNativePools);
            } 
            else {
            setPools(farmingPools);
            }
            setOnlyStaked(false);
    }

    function allDiplayedNative() {         
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
        if(onlyStaked) {
            let onlyStakedPools = [];
            for(let i=0; i< farmingPools.length; i++) {
                if(farmingPools[i].userStaked > 0){
                    onlyStakedPools.push(farmingPools[i])
                }
            }
            setPools(onlyStakedPools);
        } 
        else {
        setPools(farmingPools);
        }
        setOnlyNative(false);
    }
    const handleChange = (e) => {
        e.preventDefault();
        const farmingPools = allPools.farmingPools;
        let onlySearchedPools = [];
            for(let i=0; i< farmingPools.length; i++) {
                if((farmingPools[i].name).toLowerCase().includes((e.target.value).toLowerCase())){
                    onlySearchedPools.push(farmingPools[i])
                }
            }
            setPools(onlySearchedPools);
            setSearchValue((e.target.value).toLowerCase());
        
        
    }

return(
    <Box minHeight='100vh'>
            <VStack>
            <Box height={[120, 130, 150,200]} bgGradient='linear(to-bl, yellow.400, yellow.700)' width='100%' padding={[5, null, null, 10]}>
                <Center>
                <Text fontFamily='heading' fontWeight='bold' fontSize={[20, 20, 30, 40]} color='black' ml={[10,20,30,40]} mr={[10,20,30,40]} align='center'>
                Farming Pools
                </Text>
                </Center>
                <Center>
                    <Text ml='auto' mr='auto' Text fontSize={[15, 15,20, 25, 30]} fontFamily='fantasy' >
                        All pools are PulseX V2 unless indicated otherwise
                    </Text>
                </Center>
                <Center>
                    <Text ml='auto' mr='auto' Text fontSize={[15, 15,20, 25, 30]} fontFamily='fantasy' >
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
                    color='yellow.500'
                    size='xl'
                    ml='auto' mr='auto' mt={20} />
                :
                
                <Box ml='auto' mr='auto'>
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
                </Box>
        }
        </Flex>
    </Box>       
)
}

export default Farm;