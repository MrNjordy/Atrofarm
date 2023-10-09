import { Flex, HStack, Box, Center, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, useNumberInput, Spinner, Text, Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, VStack } from "@chakra-ui/react"
import { useAccount, useWaitForTransaction } from "wagmi";
import { writeContract, prepareWriteContract } from "wagmi/actions";
import { masterContract, tokenAbi } from "../data";
import { useState } from "react";

export default function StakePoolInfo({
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
    depositFee,
    allowance,
    address,
}) {

// ============================ HOOKS =============================================
    const { isConnected } = useAccount();

    const [depositInput, setDepositInput] = useState();
    const [withdrawInput, setWithdrawInput] = useState();
    const [depositTxData, setDepositTxData] = useState();
    const [withdrawTxData, setWithdrawTxData] = useState();
    const [approvalTxData, setApprovalTxData] = useState();
    const [waitingApproval, setWaitingApproval] = useState(false)

            //============ MODAL HOOKS ================
            const { isOpen: isDepositOpen, onOpen: onDepositOpen, onClose: onDepositClose } = useDisclosure();
            const { isOpen: isWithdrawOpen, onOpen: onWithdrawOpen, onClose: onWithdrawClose } = useDisclosure();
            const {isOpen: isDepositProcessingOpen, onOpen: onDepositProcessingOpen, onClose: onDepositProcessingClose } = useDisclosure();
            const {isOpen: isWithdrawProcessingOpen, onOpen: onWithdrawProcessingOpen, onClose: onWithdrawProcessingClose } = useDisclosure();
    
            //============ DEPOSIT FORM HOOK (INPUT NUMBER AND MAX BUTTON) ==========
    const { getInputProps: depositInputProps, getIncrementButtonProps: depositIncrementButtonProps } = useNumberInput({
        defaultValue:0,
        step: parseInt(userBalance) / 10**18,
        min:0,
        max: parseInt(userBalance) / 10**18,
        onChange: (e) => setDepositInput(e * 10**18),
    })
    const maxDeposit = depositIncrementButtonProps();
    const inputDeposit = depositInputProps();
    function setMaxDeposit() {
        setDepositInput(userBalance)
    }

        //============ WITHDRAWAL FORM HOOK (INPUT NUMBER AND MAX BUTTON) ==========
    const { getInputProps: withdrawInputProps, getIncrementButtonProps: withdrawIncrementButtonProps } = useNumberInput({
        defaultValue:0,
        step: parseInt(userStaked) / 10**18,
        min:0,
        max: parseInt(userStaked) / 10**18,
        onChange: (e) => setWithdrawInput(e * 10**18),
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
            <Box fontFamily='heading' mt={10} padding={3} paddingBottom={1} width='full' bgColor='gray.900' fontWeight='semibold' color='gray.300' border={userStaked>0 ? '2px' : 'none'} borderBottom='none' borderColor='yellow.500'>
                <Center borderBottom='2px' borderColor='yellow.500'>
                    <Box mb={3}>
                        <Text marginLeft={20} marginRight={20}>
                        {name}
                        </Text>
                    </Box>
                </Center>
                <HStack mb={1} mt={3}> 
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        APR: 
                    </Flex>
                    <Flex ml='auto' mr={1}>
                        {apr}%
                    </Flex>
                </HStack>
                <HStack >
                    <Flex ml={1} fontSize='smaller'>
                        Your Deposit: 
                    </Flex>
                    <Flex ml='auto' mr={1} fontSize='large'>
                        {(parseFloat(userStaked) / 10**18).toFixed(2)} 
                    </Flex>
                </HStack> 
                <Flex justify='right' mr={1} mb={1} mt={-1} fontSize='smaller' fontWeight='light'>
                    ${userStakedUsd}
                </Flex>
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
                <Box fontFamily='heading' padding={3} paddingTop={0} width='full' bgColor='gray.900' fontWeight='semibold' color='gray.300' border={userStaked>0 ? '2px' : 'none'} borderTop='none' borderColor='yellow.500'>
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
                                <ModalContent bgColor='blue.900'>
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
                                                            Balance: {parseInt(userBalance) / 10**18} {name}
                                                        </Text>
                                                    </Flex>
                                                    <Button bgGradient='linear(to-bl, yellow.400, yellow.700)' {...maxDeposit} onClick={setMaxDeposit} size='xs'>MAX</Button>
                                                </HStack>
                                            </FormLabel>
                                            <Input {...inputDeposit} focusBorderColor='yellow.500' color='gray.300' />
                                        </FormControl>
                                    </ModalBody>
                                    <Center>
                                    <ModalFooter>
                                        {allowance == 0 || allowance < depositInput ? <Button bgGradient='linear(to-bl, yellow.400, yellow.700)' mr={5} isLoading={approvalLoading} onClick={approval}>                                                                                                                  
                                                                        {"Approve"} 
                                                                    </Button> 
                                                                  : <Button bgGradient='linear(to-bl, yellow.400, yellow.700)' mr={5} isDisabled={userBalance==0 || depositInput==0} isLoading={depositLoading} onClick={deposit}>                                                                                                                  
                                                                        {"Deposit" }                           
                                                                    </Button> }
                                            <Modal isOpen={isDepositProcessingOpen} onClose={onDepositProcessingClose} isCentered>
                                                <ModalOverlay>
                                                    <ModalContent>
                                                        <ModalHeader borderBottom='1px' borderColor='yellow.500' bgColor='blue.900' color='gray.300'>
                                                            { depositLoading ? "Processing Transaction..."
                                                                        : depositSuccess ? 'Transaction Successful'
                                                                        : depositError ? 'Transaction Reverted'
                                                                        : "Waiting Approval"}
                                                            <ModalCloseButton />
                                                        </ModalHeader>
                                                        <ModalBody bgColor='blue.900' color= 'gray.300'>
                                                            {depositLoading? <Flex ><Spinner
                                                                               thickness='4px'
                                                                               speed='0.65s'
                                                                               emptyColor='gray.300'
                                                                               color='yellow.500'
                                                                               size='xl'
                                                                               ml='auto' mr='auto' mt={5} mb={5}
                                                                             /></Flex>
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
                            <ModalContent bgColor='blue.900'>
                                    <ModalHeader mb={1} borderBottom='1px' borderColor='yellow.500'>
                                        <Text color='gray.300' >
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
                                                            Total Staked: {(parseFloat(userStaked) / 10**18).toFixed(2)} {name}
                                                        </Text>
                                                    </Flex>
                                                    <Button bgGradient='linear(to-bl, yellow.400, yellow.700)' {...maxWithdraw} onClick={setMaxWithdraw} size='xs'>MAX</Button>
                                                </HStack>
                                            </FormLabel>
                                            <Input {...inputWithdraw}  focusBorderColor='yellow.500' color='gray.300' />
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
                                                        <ModalHeader borderBottom='1px' borderColor='yellow.500' bgColor='blue.900' color='gray.300'>
                                                            { withdrawLoading ? "Processing Transaction..."
                                                                        : withdrawSuccess ? 'Transaction Successful'
                                                                        : withdrawError ? 'Transaction Reverted'
                                                                        : "Waiting Approval"}
                                                            <ModalCloseButton />
                                                        </ModalHeader>
                                                        <ModalBody bgColor='blue.900' color= 'gray.300'>
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