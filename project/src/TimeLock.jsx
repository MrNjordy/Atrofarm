import {  parseAbiItem, decodeEventLog, decodeFunctionData } from 'viem';
import { useState, useEffect } from 'react'
import { pulsechain } from 'wagmi/chains'
import { createPublicClient, http } from 'viem';
import { Box, Center, Link, Text } from '@chakra-ui/react';
import { masterAbi, timelockAbi } from './data';

const  publicClient = createPublicClient({
    chain: pulsechain,
    transport: http()
})

export default function TimelockEvents() {
    const [previousLogs, setPreviousLogs] = useState();

    useEffect(() => {
        async function getPreviousLogs() {

            const blockNumber = await publicClient.getBlock({
                blockNumber: 18641642n
            });
            console.log(blockNumber)

            const logs = await publicClient.getLogs({
                address: import.meta.env.VITE_TIMELOCK,
                event: parseAbiItem('event CallScheduled(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data, bytes32 predecessor, uint256 delay)'),
                // args: { 
                //     degen: '0x938A03E67E0B7de5f060b88E028E8CA19fE9e731'
                // },
                fromBlock: 'earliest',
                toBlock: 'latest'
            })
            console.log(logs)

            // const topics = decodeEventLog({
            //     abi: timelockAbi,
            //     data: logs[0].data,
            //     topics: logs[0].topics,
            // })
            // const { functionName, args } = decodeFunctionData({
            //     abi: masterAbi,
            //     data: logs[0].args.data,
            // })
            // console.log(functionName, " ", args);
            // console.log(topics);
            setPreviousLogs(logs);
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
        </Box>
    )

}

