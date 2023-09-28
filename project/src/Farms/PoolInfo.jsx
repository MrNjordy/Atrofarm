import { Flex, HStack, Box, Center, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, useNumberInput, Spinner, Text, VStack, Link} from "@chakra-ui/react"
import { useAccount, useWaitForTransaction } from "wagmi";
import { writeContract, prepareWriteContract } from "wagmi/actions";
import { masterContract, tokenAbi } from "../data";
import { useState } from "react";
import { redirect } from "react-router-dom";

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
        step: userBalance,
        min:0,
        max: userBalance,
        precision: depositInput == 0 ? 0 : depositInput == userBalance * 10**18 ? null : 4,
        onChange: (e) => setDepositInput(e * 10**18),
    })
    const maxDeposit = depositIncrementButtonProps();
    const inputDeposit = depositInputProps();
    function setMaxDeposit() {
        setDepositInput((userBalance * 10**18))
    }

        //============ WITHDRAWAL FORM HOOK (INPUT NUMBER AND MAX BUTTON) ==========
    const { getInputProps: withdrawInputProps, getIncrementButtonProps: withdrawIncrementButtonProps } = useNumberInput({
        defaultValue: 0,
        step: userStaked,
        min:0,
        max: userStaked,
        onChange: (e) => setWithdrawInput(e * 10**18),
    })
    const maxWithdraw = withdrawIncrementButtonProps();
    const inputWithdraw = withdrawInputProps();
    function setMaxWithdraw() {
        setWithdrawInput((userStaked * 10**18))
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
            <Box fontFamily='heading' mt={5} padding={2} width='full' borderRadius='2xl' bgGradient='linear(to-bl, yellow.400, yellow.600)' fontWeight='semibold'>
                
                <Center borderBottom='2px'>
                <VStack spacing='1px'>
                    <Flex fontSize={[13, null, null, 17]}>
                        {name}
                    </Flex>
                    <Flex mb="3" fontSize='small' fontWeight='light'>
                        <Link href={`https://dexscreener.com/pulsechain/${address}`}>
                        {address.substring(0,12) + '...'}
                        </Link>
                    </Flex>
                    </VStack>
                </Center>
                <HStack mb='3' mt={3}> 
                    <Flex ml={1} mr='auto'>
                        Deposit Fee: 
                    </Flex>
                    <Flex ml='auto' mr={1}>
                        {depositFee}%
                    </Flex>
                </HStack>
                <HStack mb='3' mt={3}> 
                    <Flex ml={1} mr='auto'>
                        APR: 
                    </Flex>
                    <Flex ml='auto' mr={1}>
                        {apr}%
                    </Flex>
                </HStack>
                <HStack>
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        Deposited: 
                    </Flex>
                    <Flex ml='auto' mr={1} fontSize='large'>
                        {parseFloat(userStaked).toFixed(2)} 
                    </Flex>
                </HStack> 
                <Flex justify='right' mr={1} mb={3} mt={-2} fontSize='smaller' fontWeight='light'>
                    ${userStakedUsd}
                </Flex>
                <Center mb={3}>
                    <Button mr={2} ml={2} bgColor='blackAlpha.800' color='wheat' _hover={{ bgColor: 'gray.600'}} isDisabled={!isConnected} onClick={onDepositOpen}>Deposit</Button>
                        <Modal isOpen={isDepositOpen} onClose={onDepositClose} isCentered >
                            <ModalOverlay />
                                <ModalContent bgGradient='linear(to-b, gray.700, gray.900)'>
                                    <ModalHeader mb={1} borderBottom='1px' borderColor='yellow.600'>
                                        <Text bgGradient='linear(to-bl, yellow.400, yellow.600)' bgClip='text' >
                                            Deposit {name}
                                        </Text>
                                    </ModalHeader>
                                        <ModalCloseButton />
                                    <ModalBody>
                                        <FormControl>
                                            <FormLabel fontSize='small' mt={2}>
                                                <HStack>
                                                    <Flex ml={1} mr='auto'>
                                                        <Text bgGradient='linear(to-bl, yellow.400, yellow.600)' bgClip='text' >
                                                            Balance: {userBalance} {name}
                                                        </Text>
                                                    </Flex>
                                                    <Button {...maxDeposit} onClick={setMaxDeposit} size='xs'>MAX</Button>
                                                </HStack>
                                            </FormLabel>
                                            <Input {...inputDeposit} bgGradient='linear(to-bl, yellow.400, yellow.600)' bgClip='text' focusBorderColor='yellow.600' color='yellow.500' />
                                        </FormControl>
                                    </ModalBody>
                                    <Center>
                                    <ModalFooter>
                                        {allowance == 0 || allowance < depositInput ? <Button mr={5} isLoading={approvalLoading} onClick={approval}>                                                                                                                  
                                                                        {"Approve"} 
                                                                    </Button> 
                                                                  : <Button mr={5} isDisabled={userBalance==0 || depositInput==0} isLoading={depositLoading} onClick={deposit}>                                                                                                                  
                                                                        {"Deposit" }                           
                                                                    </Button> }
                                            <Modal isOpen={isDepositProcessingOpen} onClose={onDepositProcessingClose} isCentered>
                                                <ModalOverlay>
                                                    <ModalContent border='4px' borderColor={depositSuccess ? 'green.600'
                                                                                                           : depositError ? 'red.200'
                                                                                                           : 'yellow.700'}>
                                                        <ModalHeader borderTopRadius='md' borderBottom='1px' color='yellow.600' bgGradient='linear(to-b, gray.700, gray.900)'>
                                                            { depositLoading ? "Processing Transaction..."
                                                                        : depositSuccess ? 'Transaction Successful'
                                                                        : depositError ? 'Transaction Reverted'
                                                                        : "Waiting Approval"}
                                                            <ModalCloseButton />
                                                        </ModalHeader>
                                                        <ModalBody bgGradient='linear(to-b, gray.700, gray.900)' color= 'yellow.600'>
                                                            {depositLoading? <Flex ><Spinner
                                                                               thickness='4px'
                                                                               speed='0.65s'
                                                                               emptyColor='gray.200'
                                                                               color='blue.500'
                                                                               size='xl'
                                                                               ml='auto' mr='auto' mt={5} mb={5}
                                                                             /></Flex>
                                                                           : depositSuccess? `Deposited ${name}: ${depositTxData}`
                                                                           : depositError? depositTxData
                                                                           :<Flex><Spinner
                                                                           thickness='4px'
                                                                           speed='0.65s'
                                                                           emptyColor='gray.200'
                                                                           color='blue.500'
                                                                           size='xl'
                                                                           ml='auto' mr='auto' mt={5} mb={5}
                                                                         /></Flex>}
                                                                            
                                                        </ModalBody>
                                                    </ModalContent>
                                                </ModalOverlay>
                                            </Modal>
                                            <Button ml={5} onClick={onDepositClose}>
                                                {"Cancel"}
                                            </Button>
                                        </ModalFooter>
                                    </Center>
                                </ModalContent>
                        </Modal>
                    <Button mr={2} ml={2} bgColor='blackAlpha.800' color='wheat' _hover={{ bgColor: 'gray.600'}} isDisabled={!isConnected} onClick={onWithdrawOpen}>Withdraw</Button>
                        <Modal isOpen={isWithdrawOpen} onClose={onWithdrawClose} isCentered>
                            <ModalOverlay />
                            <ModalContent bgGradient='linear(to-b, gray.700, gray.900)'>
                                    <ModalHeader mb={1} borderBottom='1px' borderColor='yellow.600'>
                                        <Text bgGradient='linear(to-bl, yellow.400, yellow.600)' bgClip='text' >
                                            Withdraw {name}
                                        </Text>
                                    </ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        <FormControl>
                                            <FormLabel fontSize='small' mt={2}>
                                                <HStack>
                                                    <Flex ml={1} mr='auto'>
                                                        <Text bgGradient='linear(to-bl, yellow.400, yellow.600)' bgClip='text' >
                                                            Total Staked: {userStaked} {name}
                                                        </Text>
                                                    </Flex>
                                                    <Button {...maxWithdraw} onClick={setMaxWithdraw} size='xs'>MAX</Button>
                                                </HStack>
                                            </FormLabel>
                                            <Input {...inputWithdraw} bgGradient='linear(to-bl, yellow.400, yellow.600)' bgClip='text' focusBorderColor='yellow.600' color='yellow.500' />
                                        </FormControl>
                                    </ModalBody>
                                    <Center>
                                        <ModalFooter>                   
                                            <Button isDisabled={userStaked==0 || withdrawInput==0} isLoading={withdrawLoading} onClick={withdraw}>
                                                {"Withdraw"}
                                            </Button>
                                                <Modal isOpen={isWithdrawProcessingOpen} onClose={onWithdrawProcessingClose} isCentered>
                                                    <ModalOverlay>
                                                    <ModalContent border='4px' borderColor={withdrawSuccess ? 'green.600'
                                                                                                           : withdrawError ? 'red.500'
                                                                                                           : 'yellow.700'}>
                                                        <ModalHeader borderTopRadius='md' borderBottom='1px' color='yellow.600' bgGradient='linear(to-b, gray.700, gray.900)'>
                                                            { withdrawLoading ? "Processing Transaction..."
                                                                        : withdrawSuccess ? 'Transaction Successful'
                                                                        : withdrawError ? 'Transaction Reverted'
                                                                        : "Waiting Approval"}
                                                            <ModalCloseButton />
                                                        </ModalHeader>
                                                        <ModalBody bgGradient='linear(to-b, gray.700, gray.900)' color= 'yellow.600'>
                                                            {withdrawLoading? <Flex ><Spinner
                                                                               thickness='4px'
                                                                               speed='0.65s'
                                                                               emptyColor='gray.200'
                                                                               color='blue.500'
                                                                               size='xl'
                                                                               ml='auto' mr='auto' mt={5} mb={5}
                                                                             /></Flex>
                                                                           : withdrawSuccess? `Withdrew ${name}: ${withdrawTxData}`
                                                                           : withdrawError? withdrawTxData
                                                                           :<Flex><Spinner
                                                                           thickness='4px'
                                                                           speed='0.65s'
                                                                           emptyColor='gray.200'
                                                                           color='blue.500'
                                                                           size='xl'
                                                                           ml='auto' mr='auto' mt={5} mb={5}
                                                                         /></Flex>}       
                                                        </ModalBody>
                                                    </ModalContent>
                                                    </ModalOverlay>
                                                </Modal>
                                            <Button onClick={onWithdrawClose}>
                                                {"Cancel"}
                                            </Button>
                                        </ModalFooter>
                                    </Center>
                                </ModalContent>
                        </Modal>
                </Center>
                <HStack>
                    <Flex ml={1} mr='auto'>
                        Rewards:
                    </Flex>
                    <Flex ml='auto' mr={1} fontSize='large'>
                        {rewards}
                    </Flex>
                </HStack>
                <Flex justify='right' mr={1} mb={3} mt={-2} fontSize='smaller' fontWeight='light'>
                    ${rewardsUsd}
                </Flex>
                <Button width='full' mb={5} bgColor='blackAlpha.800' color='wheat' _hover={{ bgColor: 'gray.600'}} isDisabled={!isConnected} onClick={claim}>Claim</Button>
                <HStack>
                    <Flex ml={1} mr='auto'>
                        Pool TVL:
                    </Flex>
                    <Flex ml='auto' mr={1}>
                        ${totalStakedUsd}
                    </Flex>
                </HStack>
             </Box>
             
    )
}