import {  parseAbiItem, decodeEventLog, decodeFunctionData, transactionType } from 'viem';
import { useState, useEffect } from 'react'
import { pulsechain } from 'wagmi/chains'
import { createPublicClient, http } from 'viem';
import { Box, Center, Flex, Link, SimpleGrid, Text } from '@chakra-ui/react';
import { masterAbi, timelockAbi } from './data';
import TimeLockInfo from './TimeLockInfo';

const  publicClient = createPublicClient({
    chain: pulsechain,
    transport: http()
})

export default function TimelockEvents() {
    const [previousLogs, setPreviousLogs] = useState([]);

    useEffect(() => {
        async function getPreviousLogs() {
            let transactionsInfo = [];

            const logs = await publicClient.getLogs({
                address: "0xDadD562f3EEFE9a880990c57c11E3544B4734c1C",
                event: parseAbiItem('event CallScheduled(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data, bytes32 predecessor, uint256 delay)'),
                fromBlock: 'earliest',
                toBlock: 'latest'
            })

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
                console.log(timer)

                scheduledTx.ca = logs[i].transactionHash;;
                scheduledTx.functionName = functionName;
                scheduledTx.args = args;
                scheduledTx.timer = timer;
                scheduledTx.id = i;
                transactionsInfo.push(scheduledTx);
            }
            setPreviousLogs(transactionsInfo);
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
                        </Text> 
                    </Box>                   
                </Center>                  
            </Box>
            <Flex>
                <SimpleGrid columns={[1, 2, 3, 3]} spacing={[null, 15, 20]} ml='auto' mr='auto' mt={5}>
                    {previousLogs.map((item) => {
                        return (
                            <TimeLockInfo key={item.id} {...item}>

                            </TimeLockInfo>
                                            )
                    })}
                </SimpleGrid>
            </Flex>
        </Box>
    )

}

