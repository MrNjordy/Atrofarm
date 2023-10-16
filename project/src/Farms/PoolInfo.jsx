import { Flex, HStack, Box, Center, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, useNumberInput, Spinner, Text, VStack, Link, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Image} from "@chakra-ui/react"
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { useAccount, useWaitForTransaction } from "wagmi";
import { writeContract, prepareWriteContract } from "wagmi/actions";
import { masterContract, tokenAbi } from "../data";
import { useState } from "react";
import { redirect } from "react-router-dom";
import atrofa from '../assets/FarmIcons/0x303f764A9c9511c12837cD2D1ECF13d4a6F99E17.png'
import afc from '../assets/FarmIcons/0xc83b18FafFC78c73f3aB0EA2Ae1a1bF333C1A549.png'
import atropa from '../assets/FarmIcons/0xCc78A0acDF847A2C1714D2A925bB4477df5d48a6.png'
import bear from '../assets/FarmIcons/0xd6c31bA0754C4383A41c0e9DF042C62b5e918f6d.png'
import tsfi from '../assets/FarmIcons/0x4243568Fa2bbad327ee36e06c16824cAd8B37819.png'
import pls from '../assets/FarmIcons/PLS.png'
import dai from '../assets/FarmIcons/0x6B175474E89094C44Da98b954EedeAC495271d0F.png'
import monat from '../assets/FarmIcons/0xf8AB3393b1f5CD6184Fb6800A1fC802043C4063e.png'
import cia from '../assets/FarmIcons/0x2e5898b2e107a3cAf4f0597aCFE5D2e6d73F2196.png'
import sens from '../assets/FarmIcons/0x415AD92C5Ae913217B05fcC3D529ED8c77d4D0B8.png'
import wbtc from '../assets/FarmIcons/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599.png'
import trs from '../assets/FarmIcons/0x359C29e88992A7F4De7C0a00f78E3373d1A710Cb.png'
import mega from '../assets/FarmIcons/0x8eDb13CE75562056DFf2221D193557Fb4A05770D.png';
import eth from '../assets/FarmIcons/0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C.png';
import bytc from '../assets/FarmIcons/BYTC.png'

export default function FarmPoolInfo({
    id,
    name, 
    userStaked,
    userStakedUsd, 
    apr, 
    totalStakedUsd,
    rewards,
    rewardsUsd,
    deposit,
    userBalance,
    allowance,
    address,
    depositFee,
    isAtrofa,
    isV1,
    token0,
    token1,
}) {

// ============================ HOOKS =============================================
    const { isConnected } = useAccount();

    const [depositInput, setDepositInput] = useState(0);
    const [withdrawInput, setWithdrawInput] = useState(0);
    const [depositTxData, setDepositTxData] = useState();
    const [withdrawTxData, setWithdrawTxData] = useState();
    const [approvalTxData, setApprovalTxData] = useState();

            //============ MODAL HOOKS ================
    const { isOpen: isDepositOpen, onOpen: onDepositOpen, onClose: onDepositClose } = useDisclosure();
    const { isOpen: isWithdrawOpen, onOpen: onWithdrawOpen, onClose: onWithdrawClose } = useDisclosure();
    const {isOpen: isDepositProcessingOpen, onOpen: onDepositProcessingOpen, onClose: onDepositProcessingClose } = useDisclosure();
    const {isOpen: isWithdrawProcessingOpen, onOpen: onWithdrawProcessingOpen, onClose: onWithdrawProcessingClose } = useDisclosure();
            //============ DEPOSIT FORM HOOK (INPUT NUMBER AND MAX BUTTON) ==========
    const { getInputProps: depositInputProps, getIncrementButtonProps: depositIncrementButtonProps } = useNumberInput({
        defaultValue: 0,
        step: parseInt(userBalance)/10**18,
        min:0,
        max: parseInt(userBalance)/10**18,
        onChange: (e) => setDepositInput((e * 10**18)),
    })
    const maxDeposit = depositIncrementButtonProps();
    const inputDeposit = depositInputProps();
    function setMaxDeposit() {
        setDepositInput((userBalance))
    }

        //============ WITHDRAWAL FORM HOOK (INPUT NUMBER AND MAX BUTTON) ==========
    const { getInputProps: withdrawInputProps, getIncrementButtonProps: withdrawIncrementButtonProps } = useNumberInput({
        defaultValue: 0,
        step: parseInt(userStaked)/10**18,
        min:0,
        max: parseInt(userStaked)/10**18,
        onChange: (e) => setWithdrawInput((e * 10**18)),
    })
    const maxWithdraw = withdrawIncrementButtonProps();
    const inputWithdraw = withdrawInputProps();
    function setMaxWithdraw() {
        setWithdrawInput((userStaked)) 
    }

//============================== CONTRACTS FUNCTIONS =====================
    async function deposit() {
        setDepositTxData('');
        onDepositProcessingOpen();
        const config = await prepareWriteContract({
            address: masterContract.address,
            abi: masterContract.abi,
            functionName: 'deposit',
            args: [id, depositInput],
        })
        const { hash } = await writeContract(config);
        setDepositTxData(hash); 
    }
    const { data: depositWaitTx, isError: depositError, isLoading: depositLoading, isSuccess: depositSuccess, status } = useWaitForTransaction({
        hash: depositTxData,
    })

    async function withdraw() {
        setWithdrawTxData('');
        onWithdrawProcessingOpen();
        const config = await prepareWriteContract({
            address: masterContract.address,
            abi: masterContract.abi,
            functionName: 'withdraw',
            args: [id, withdrawInput],
        })
        const { hash } = await writeContract(config);
        setWithdrawTxData(hash); 
    }
    const { data: withdrawWaitTx, isError: withdrawError, isLoading: withdrawLoading, isSuccess: withdrawSuccess } = useWaitForTransaction({
        hash: withdrawTxData,
    })

    async function approval() {
        setApprovalTxData('');
        const config = await prepareWriteContract({
            address: address,
            abi: tokenAbi,
            functionName: 'approve',
            args: [import.meta.env.VITE_MASTER, 999999999999999*(10**18)],
        })
        const { hash } = await writeContract(config);
        setApprovalTxData(hash); 
    }
    const { data: approvalWaitTx, isError: approvalError, isLoading: approvalLoading, isSuccess: approvalSuccess } = useWaitForTransaction({
        hash: approvalTxData,
    })

    async function claim() {
        await writeContract({
           ...masterContract,
           functionName:'deposit',
           args: [id, 0]
       })
   }

    return(
        <Box>
            <Box fontFamily='heading' mt={5} padding={3} paddingBottom={1} width={250} bgColor='gray.900' fontWeight='semibold' color='gray.300'>
                <HStack>
                    <Image src={token0 == '0x303f764A9c9511c12837cD2D1ECF13d4a6F99E17' ? atrofa 
                                : token0 == '0xCc78A0acDF847A2C1714D2A925bB4477df5d48a6' ? atropa 
                                : token0 == '0xd6c31bA0754C4383A41c0e9DF042C62b5e918f6d' ? bear 
                                : token0 == '0x4243568Fa2bbad327ee36e06c16824cAd8B37819' ? tsfi 
                                : token0 == 'PLS' ? pls 
                                : token0 == '0x6B175474E89094C44Da98b954EedeAC495271d0F' ? dai 
                                : token0 == '0xf8AB3393b1f5CD6184Fb6800A1fC802043C4063e' ? monat 
                                : token0 == '0x2e5898b2e107a3cAf4f0597aCFE5D2e6d73F2196' ? cia 
                                : token0 == '0x415AD92C5Ae913217B05fcC3D529ED8c77d4D0B8' ? sens 
                                : token0 == '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' ? wbtc 
                                : token0 == '0x359C29e88992A7F4De7C0a00f78E3373d1A710Cb' ? trs
                                : token0 == '0x8eDb13CE75562056DFf2221D193557Fb4A05770D' ? mega
                                : token0 == '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C' ? eth
                                : token0 == '0x2D30Bec5cD5511E426A09F5AfbA475e682ACc73F' ? bytc
                                : afc} 
                            mb={3}>
                    </Image>  
                    <Image src={token1 == '0x303f764A9c9511c12837cD2D1ECF13d4a6F99E17' ? atrofa 
                                : token1 == '0xCc78A0acDF847A2C1714D2A925bB4477df5d48a6' ? atropa 
                                : token1 == '0xd6c31bA0754C4383A41c0e9DF042C62b5e918f6d' ? bear 
                                : token1 == '0x4243568Fa2bbad327ee36e06c16824cAd8B37819' ? tsfi 
                                : token1 == 'PLS' ? pls 
                                : token1 == '0x6B175474E89094C44Da98b954EedeAC495271d0F' ? dai 
                                : token1 == '0xf8AB3393b1f5CD6184Fb6800A1fC802043C4063e' ? monat 
                                : token1 == '0x2e5898b2e107a3cAf4f0597aCFE5D2e6d73F2196' ? cia 
                                : token1 == '0x415AD92C5Ae913217B05fcC3D529ED8c77d4D0B8' ? sens 
                                : token1 == '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' ? wbtc 
                                : token1 == '0x359C29e88992A7F4De7C0a00f78E3373d1A710Cb' ? trs
                                : token1 == '0x8eDb13CE75562056DFf2221D193557Fb4A05770D' ? mega
                                : token1 == '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C' ? eth
                                : token1 == '0x2D30Bec5cD5511E426A09F5AfbA475e682ACc73F' ? bytc
                                : afc}  
                            mb={3}>
                    </Image>    
                    <Flex mb={3} mr={1} ml='auto'>
                        <Text color='gray.300' align='right'>{name}</Text>
                    </Flex>   
                </HStack>                  
                <Center borderBottom='2px' borderColor='yellow.500'></Center>
                <Flex fontSize='small' fontWeight='light'>
                    <Link ml='auto' mr='auto' isExternal href={isV1 ? `https://app.pulsex.com/add/V1/${token0}/${token1}` : `https://app.pulsex.com/add/V2/${token0}/${token1}`} alt='Pulsex LP' >
                        Get LP tokens on PulseX 
                        <ExternalLinkIcon ml={1}></ExternalLinkIcon>
                    </Link>
                </Flex>
                <HStack mb={-3} mt={3}> 
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        APR: 
                    </Flex>
                    <Flex ml='auto' mr={1}>
                        {apr}%
                    </Flex>
                </HStack>
                <HStack color='gray.400' mb={1} mt={3}> 
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        Daily: 
                    </Flex>
                    <Flex ml='auto' mr={1} fontSize='sm'>
                        {(apr/365).toFixed(2)}%
                    </Flex>
                </HStack>
                <Flex color='gray.400' justify='right' mr={1} mb={1} mt={-2} fontSize='smaller' fontWeight='light'>
                    ${(userStakedUsd * apr/100 /365).toFixed(2)}
                </Flex>
                <HStack >
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        Your Deposit: 
                    </Flex>
                    <Flex ml='auto' mr={1} fontSize='large'>
                    ${parseFloat(userStakedUsd).toFixed(2)}
                    </Flex>
                </HStack> 
                <Flex justify='right' mr={1} mb={1} mt={-1} fontSize='smaller' fontWeight='light'>
                    {(parseFloat(userStaked)/10**18).toFixed(2)} LP     
                </Flex>
                <HStack color='gray.400'>
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        Your Pool Share: 
                    </Flex>
                    <Flex ml='auto' mr={1} fontSize='smaller'>
                        {(userStakedUsd / totalStakedUsd * 100).toFixed(2)}% 
                    </Flex>
                </HStack> 
                <HStack>
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        To Claim:
                    </Flex>
                    <Flex ml='auto' mr={1} fontSize='large'>
                        {rewards}
                    </Flex>
                </HStack>
                <Flex justify='right' mr={1} mt={-1} fontSize='smaller' fontWeight='light'>
                    ${rewardsUsd}
                </Flex>
                </Box>
                <Box fontFamily='heading' padding={2} paddingTop={0} width={250} bgColor='gray.900' fontWeight='semibold' color={'gray.300'}>
                <Accordion defaultIndex={[]} allowMultiple>
                    <AccordionItem border='none'>
                        <AccordionButton justifyContent='center'>   
                            <AccordionIcon></AccordionIcon>  
                        </AccordionButton>
                        <AccordionPanel>
                <Center mb={3}>
                    <Button fontSize='smaller' mr={2} bgGradient='linear(to-bl, yellow.400, yellow.700)' color='black' isDisabled={!isConnected} onClick={onDepositOpen}>Deposit</Button>
                        <Modal isOpen={isDepositOpen} onClose={onDepositClose} isCentered >
                            <ModalOverlay />
                                <ModalContent bgColor='gray.900'>
                                    <ModalHeader mb={1} borderBottom='1px' borderColor='yellow.500'>
                                        <Text color='gray.300' >
                                            Deposit {name}
                                        </Text>
                                    </ModalHeader>
                                        <ModalCloseButton />
                                    <ModalBody>
                                        <FormControl>
                                            <FormLabel fontSize='small' mt={2}>
                                                <HStack>
                                                    <Flex ml={1} mr='auto'>
                                                        <Text color='gray.300' >
                                                            Balance: {parseInt(userBalance)/10**18} {name}
                                                        </Text>
                                                    </Flex>
                                                    <Button {...maxDeposit} bgGradient='linear(to-bl, yellow.400, yellow.700)' onClick={setMaxDeposit} size='xs'>MAX</Button>
                                                </HStack>
                                            </FormLabel>
                                            <Input {...inputDeposit} color='gray.300' focusBorderColor='yellow.500' />
                                        </FormControl>
                                    </ModalBody>
                                    <Center>
                                    <ModalFooter>
                                        {allowance == 0 || allowance < depositInput ? <Button bgGradient='linear(to-bl, yellow.400, yellow.700)'  mr={5} isLoading={approvalLoading} onClick={approval}>                                                                                                                  
                                                                        {"Approve"} 
                                                                    </Button> 
                                                                  : <Button bgGradient='linear(to-bl, yellow.400, yellow.700)' mr={5} isDisabled={userBalance==0 || depositInput==0} isLoading={depositLoading} onClick={deposit}>                                                                                                                  
                                                                        {"Deposit" }                           
                                                                    </Button> }
                                            <Modal isOpen={isDepositProcessingOpen} onClose={onDepositProcessingClose} isCentered>
                                                <ModalOverlay>
                                                    <ModalContent>
                                                        <ModalHeader borderBottom='1px' color='gray.300' bgColor='gray.900' borderColor='yellow.500'>
                                                            { depositLoading ? "Processing Transaction..."
                                                                        : depositSuccess ? 'Transaction Successful'
                                                                        : depositError ? 'Transaction Reverted'
                                                                        : "Waiting Approval"}
                                                            <ModalCloseButton />
                                                        </ModalHeader>
                                                        <ModalBody bgColor='gray.900' color= 'gray.300'>
                                                            {depositLoading? <Flex >
                                                                                <Spinner
                                                                               thickness='4px'
                                                                               speed='0.65s'
                                                                               emptyColor='gray.200'
                                                                               color='yellow.500'
                                                                               size='xl'
                                                                               ml='auto' mr='auto' mt={5} mb={5}
                                                                             />
                                                                             </Flex>
                                                                           : depositSuccess? `Deposited ${name}: ${depositTxData}`
                                                                           : depositError? depositTxData
                                                                           :<VStack>
                                                                                <Text align='center'>
                                                                                    If stuck on this window remove the last 2 decimals from deposit/withdrawal amount
                                                                                </Text>
                                                                            <Flex>
                                                                            <Spinner
                                                                           thickness='4px'
                                                                           speed='0.65s'
                                                                           emptyColor='gray.200'
                                                                           color='yellow.500'
                                                                           size='xl'
                                                                           ml='auto' mr='auto' mt={5} mb={5}
                                                                         /></Flex>
                                                                         </VStack>}
                                                                            
                                                        </ModalBody>
                                                    </ModalContent>
                                                </ModalOverlay>
                                            </Modal>
                                            <Button bgGradient='linear(to-bl, yellow.400, yellow.700)' ml={5} onClick={onDepositClose}>
                                                {"Cancel"}
                                            </Button>
                                        </ModalFooter>
                                    </Center>
                                </ModalContent>
                        </Modal>
                    <Button fontSize='smaller' ml={2} bgGradient='linear(to-bl, yellow.400, yellow.700)' color='black' isDisabled={!isConnected} onClick={onWithdrawOpen}>Withdraw</Button>
                        <Modal isOpen={isWithdrawOpen} onClose={onWithdrawClose} isCentered>
                            <ModalOverlay />
                            <ModalContent bgColor='gray.900'>
                                    <ModalHeader mb={1} borderBottom='1px' borderColor='yellow.500'>
                                        <Text color='gray.300'>
                                            Withdraw {name}
                                        </Text>
                                    </ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        <FormControl>
                                            <FormLabel fontSize='small' mt={2}>
                                                <HStack>
                                                    <Flex ml={1} mr='auto'>
                                                        <Text color='gray.300' >
                                                            Total Staked: {parseInt(userStaked)/10**18} {name}
                                                        </Text>
                                                    </Flex>
                                                    <Button bgGradient='linear(to-bl, yellow.400, yellow.700)' {...maxWithdraw} onClick={setMaxWithdraw} size='xs'>MAX</Button>
                                                </HStack>
                                            </FormLabel>
                                            <Input {...inputWithdraw} color='gray.300' focusBorderColor='yellow.500' />
                                        </FormControl>
                                    </ModalBody>
                                    <Center>
                                        <ModalFooter>                   
                                            <Button bgGradient='linear(to-bl, yellow.400, yellow.700)' mr={5} isDisabled={userStaked==0 || withdrawInput==0} isLoading={withdrawLoading} onClick={withdraw}>
                                                {"Withdraw"}
                                            </Button>
                                                <Modal isOpen={isWithdrawProcessingOpen} onClose={onWithdrawProcessingClose} isCentered>
                                                    <ModalOverlay>
                                                    <ModalContent>
                                                        <ModalHeader borderBottom='1px' color='gray.300' bgColor='gray.900' borderColor='yellow.500'>
                                                            { withdrawLoading ? "Processing Transaction..."
                                                                        : withdrawSuccess ? 'Transaction Successful'
                                                                        : withdrawError ? 'Transaction Reverted'
                                                                        : "Waiting Approval"}
                                                            <ModalCloseButton />
                                                        </ModalHeader>
                                                        <ModalBody bgColor='gray.900' color= 'gray.300'>
                                                            {withdrawLoading? <Flex ><Spinner
                                                                               thickness='4px'
                                                                               speed='0.65s'
                                                                               emptyColor='gray.300'
                                                                               color='yellow.500'
                                                                               size='xl'
                                                                               ml='auto' mr='auto' mt={5} mb={5}
                                                                             /></Flex>
                                                                           : withdrawSuccess? `Withdrew ${name}: ${withdrawTxData}`
                                                                           : withdrawError? withdrawTxData
                                                                           :<VStack>
                                                                           <Text align='center'>
                                                                               If stuck on this window remove the last 2 decimals from deposit/withdrawal amount
                                                                           </Text>
                                                                       <Flex>
                                                                       <Spinner
                                                                      thickness='4px'
                                                                      speed='0.65s'
                                                                      emptyColor='gray.300'
                                                                      color='yellow.500'
                                                                      size='xl'
                                                                      ml='auto' mr='auto' mt={5} mb={5}
                                                                    /></Flex>
                                                                    </VStack>}       
                                                        </ModalBody>
                                                    </ModalContent>
                                                    </ModalOverlay>
                                                </Modal>
                                            <Button bgGradient='linear(to-bl, yellow.400, yellow.700)' ml={5} onClick={onWithdrawClose}>
                                                {"Cancel"}
                                            </Button>
                                        </ModalFooter>
                                    </Center>
                                </ModalContent>
                        </Modal>
                </Center>
                <Button fontSize='smaller' width='full' mb={5} bgGradient='linear(to-bl, yellow.400, yellow.700)' color='black' isDisabled={!isConnected} onClick={claim}>Claim</Button>
                <HStack>
                    <Flex mr='auto' fontSize='smaller'>
                        Pool TVL:
                    </Flex>
                    <Flex ml='auto'>
                        ${totalStakedUsd}
                    </Flex>
                </HStack>
                </AccordionPanel>
                </AccordionItem>
                </Accordion>
                </Box>
              </Box>

             
    )
}