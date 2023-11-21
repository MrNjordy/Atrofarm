import {  parseAbiItem, decodeEventLog, decodeFunctionData, transactionType } from 'viem';
import { fetchBlockNumber } from '@wagmi/core'
import { useState, useEffect } from 'react'
import { pulsechain } from 'wagmi/chains'
import { createPublicClient, http } from 'viem';
import { Box, Center, Flex, Link, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import { masterAbi, timelockAbi } from './data';
import TimeLockInfo from './TimeLockInfo';
import { readContract } from 'wagmi/actions';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const  publicClient = createPublicClient({
    chain: pulsechain,
    transport: http()
})

export default function TimelockEvents() {
    const [previousLogs, setPreviousLogs] = useState([]);
    const [executed, setExecuted] = useState([]);

    useEffect(() => {
        async function getPreviousLogs() {
            let transactionsInfo = [];
            let executedTransactionInfo = [];

            const logs = await publicClient.getLogs({
                address: "0xDadD562f3EEFE9a880990c57c11E3544B4734c1C",
                event: parseAbiItem('event CallScheduled(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data, bytes32 predecessor, uint256 delay)'),
                fromBlock: 'earliest',
                toBlock: 'latest'
            })
            const blockN = await fetchBlockNumber();

            console.log(blockN)
                

            for(let i=0; i<logs.length; i++) {
                const scheduledTx = {};
               
                const { functionName, args } = decodeFunctionData({
                    abi: masterAbi,
                    data: logs[i].args.data,
                })

                //====== To Find all the timing info =====
                const blockCalled = logs[i].blockNumber;
                const blockInfo = await publicClient.getBlock({
                    blockNumber: blockCalled
                });
                const blockTimestamp = blockInfo.timestamp;
                const  timestampToExec = blockTimestamp + logs[i].args.delay;

                const currentBlockInfo = await publicClient.getBlock({
                    });
                const currentBlockTimestamp = currentBlockInfo.timestamp;

                const timerSec = parseInt((timestampToExec - currentBlockTimestamp).toString());
                const timerHour = Math.floor(timerSec/3600);
                const timerMin = Math.floor((timerSec%3600)/60);
                const timerSecRemain = Math.floor((timerSec%3600)%60);
                const timer = [timerHour, timerMin, timerSecRemain];
                    
                //============== FUNCTION TRANSLATION=========
                let translation = ""
                if(functionName == 'add') {
                    translation = `Add a pool for ${(args[1].toString()).substring(0,5)+"..."+ (args[1].toString()).substring(args[1].length -5)} with initial reward allocation
                    of ${parseInt(args[0].toString())/10000*100}% and ${args[2].toString()}% deposit fee.`
                }
                else if(functionName == 'set') {
                    translation = `Change reward allocation of pool with ID ${args[0].toString()} to ${(parseInt(args[1].toString())/10000*100).toFixed(2)}%`
                }

                //=========== Check if executed ===============
                const isExecuted = await readContract({
                    address: '0xDadD562f3EEFE9a880990c57c11E3544B4734c1C',
                    abi: timelockAbi,
                    functionName: 'isOperationDone',
                    args: [logs[i].args.id]
                })


                scheduledTx.ca = logs[i].transactionHash;;
                scheduledTx.functionName = functionName;
                scheduledTx.args = args;
                scheduledTx.timer = timer;
                scheduledTx.id = i;
                scheduledTx.translation = translation;

                if(!isExecuted) {
                    transactionsInfo.push(scheduledTx);
                }
                else { executedTransactionInfo.push(scheduledTx)}
                
            }
            setPreviousLogs(transactionsInfo);
            setExecuted(executedTransactionInfo);
        }
        getPreviousLogs()

    }, [])

    return (
        <Box minHeight='100vh'>
            <Box bgGradient='linear(to-bl, yellow.400, yellow.700)' width='100%' height={[120, 130, 150,200]}>
                <Center height={[120, 130, 150,200]}>
                    <Box>
                        <Text fontFamily='heading' fontWeight='bold' fontSize={[20, 20, 30, 40]} color='black' ml={[10,20,30,40]} mr={[10,20,30,40]} mn='auto' align='center'>
                            Timelock
                        </Text>  
                        <Text fontSize={[11, 11,13, 15, 20]} fontFamily='fantasy' align='center'>
                            <Link isExternal href='https://scan.pulsechain.com/address/0xDadD562f3EEFE9a880990c57c11E3544B4734c1C'>
                                0xDadD562f3EEFE9a880990c57c11E3544B4734c1C
                            </Link>
                            <ExternalLinkIcon ml={1} mb={1}></ExternalLinkIcon>
                        </Text> 
                    </Box>                   
                </Center>                  
            </Box>
            <Box ml='auto' mr='auto'>
                <Center>
                    <Tabs mt={5} align='center' mb={5} size={'md'} color={'gray.300'} colorScheme='yellow' variant={'solid-rounded'}>
                        <TabList>
                            <Tab>
                                Scheduled
                            </Tab>
                            <Tab>
                                Executed
                            </Tab>
                        </TabList>
                            <TabPanels>
                                <TabPanel>
                                    {previousLogs.length == 0 ? <Text mt={5} color={'gray.300'}>Nothing to Display</Text>
                                        : <SimpleGrid columns={[1, 2, 3, 3]} spacing={[null, 15, 20]} ml='auto' mr='auto' mt={5}>
                                                {previousLogs.map((item) => {
                                                    return (
                                                        <TimeLockInfo key={item.id} {...item}>
                                                        </TimeLockInfo>
                                                    )
                                                })}
                                           </SimpleGrid>
                                        // : <Text mt={5} color={'gray.300'}>Nothing to Display.</Text>
                                    }
                                </TabPanel>
                                <TabPanel>
                                    <SimpleGrid columns={[1, 2, 3, 3]} spacing={[null, 15, 20]} ml='auto' mr='auto' mt={5}>
                                        {executed.map((item) => {
                                            return (
                                                <TimeLockInfo key={item.id} {...item}>
                                                </TimeLockInfo>
                                                                )
                                        })}
                                    </SimpleGrid>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                </Center>
            </Box>
        </Box>
    )

}

