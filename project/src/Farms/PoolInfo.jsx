import { Flex, HStack, Box, Center, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, useNumberInput, Spinner, Skeleton } from "@chakra-ui/react"
import { useAccount, useWaitForTransaction, useContractRead } from "wagmi";
import { writeContract, prepareWriteContract } from "wagmi/actions";
import { masterContract } from "../../../data";
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
}) {

// ============================ HOOKS =============================================
    const { isConnected } = useAccount();

    const [depositInput, setDepositInput] = useState();
    const [withdrawInput, setWithdrawInput] = useState();
    const [depositTxData, setDepositTxData] = useState();
    const [withdrawTxData, setWithdrawTxData] = useState();
    const [waitingApproval, setWaitingApproval] = useState(false)

            //============ MODAL HOOKS ================
    const { isOpen: isDepositOpen, onOpen: onDepositOpen, onClose: onDepositClose } = useDisclosure();
    const { isOpen: isWithdrawOpen, onOpen: onWithdrawOpen, onClose: onWithdrawClose } = useDisclosure();
    const {isOpen: isProcessingOpen, onOpen: onProcessingOpen, onClose: onProcessingClose } = useDisclosure();
    
            //============ DEPOSIT FORM HOOK (INPUT NUMBER AND MAX BUTTON) ==========
    const { getInputProps: depositInputProps, getIncrementButtonProps: depositIncrementButtonProps } = useNumberInput({
        step: userBalance,
        min:0,
        max: userBalance,
        precision: 0,
        onChange: (e) => setDepositInput(e * 10**18),
    })
    const maxDeposit = depositIncrementButtonProps();
    const inputDeposit = depositInputProps();
    function setMaxDeposit() {
        setDepositInput((userBalance * 10**18))
    }

        //============ WITHDRAWAL FORM HOOK (INPUT NUMBER AND MAX BUTTON) ==========
    const { getInputProps: withdrawInputProps, getIncrementButtonProps: withdrawIncrementButtonProps } = useNumberInput({
        step: userStaked,
        min:0,
        precision: 2,
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
        onProcessingOpen();
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
        onProcessingOpen();
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
    async function claim() {
        await writeContract({
           ...masterContract,
           functionName:'deposit',
           args: [id, 0]
       })
   }

    return(
            <Box ml={10} mt={5} border='2px'padding={2} width='full' borderRadius='2xl'>
                <Center>
                    <Flex mb="3">
                        {name}
                    </Flex>
                </Center>
                <HStack mb='3'> 
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
                        {userStaked}   
                    </Flex>
                </HStack> 
                <Flex justify='right' mr={1} mb={3} mt={-2} fontSize='smaller' fontWeight='light'>
                    ${userStakedUsd}
                </Flex>
                <Center mb={3}>
                    <Button mr={2} ml={2} isDisabled={!isConnected} onClick={onDepositOpen}>Deposit</Button>
                        <Modal isOpen={isDepositOpen} onClose={onDepositClose} isCentered>
                            <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader mb={1} borderBottom='1px'>
                                        Deposit {name}
                                    </ModalHeader>
                                        <ModalCloseButton />
                                    <ModalBody>
                                        <FormControl>
                                            <FormLabel fontSize='small' mt={2}>
                                                <HStack>
                                                    <Flex ml={1} mr='auto'>Balance: {userBalance} {name}</Flex>
                                                    <Button {...maxDeposit} onClick={setMaxDeposit} size='xs'>MAX</Button>
                                                </HStack>
                                            </FormLabel>
                                            <Input {...inputDeposit} />
                                        </FormControl>
                                    </ModalBody>
                                    <Center>
                                    <ModalFooter>
                                            <Button isDisabled={userBalance==0 || depositInput==0} isLoading={depositLoading} onClick={deposit}>                                                                                                                  
                                                {"Deposit" }                            
                                            </Button>
                                            <Modal isOpen={isProcessingOpen} onClose={onProcessingClose} isCentered>
                                                <ModalOverlay>
                                                    <ModalContent border='1px'>
                                                        <ModalHeader borderTopRadius='md' borderBottom='1px' bgColor={depositSuccess ? 'green.200' 
                                                                                          : depositError ? 'red.200'
                                                                                          : 'blue.200'}>
                                                            { depositLoading ? "Processing Transaction..."
                                                                        : depositSuccess ? 'Transaction Successful'
                                                                        : depositError ? 'Transaction Reverted'
                                                                        : "Waiting Approval"}
                                                            <ModalCloseButton />
                                                        </ModalHeader>
                                                        <ModalBody>
                                                            {depositLoading? <Flex ><Spinner
                                                                               thickness='4px'
                                                                               speed='0.65s'
                                                                               emptyColor='gray.200'
                                                                               color='blue.500'
                                                                               size='xl'
                                                                               ml='auto' mr='auto' mt={5}
                                                                             /></Flex>
                                                                           : depositSuccess? depositTxData
                                                                           : depositError? depositTxData
                                                                           :<Flex><Spinner
                                                                           thickness='4px'
                                                                           speed='0.65s'
                                                                           emptyColor='gray.200'
                                                                           color='blue.500'
                                                                           size='xl'
                                                                           ml='auto' mr='auto' mt={5}
                                                                         /></Flex>}
                                                                            
                                                        </ModalBody>
                                                        <ModalFooter>                                  
                                                        </ModalFooter>
                                                    </ModalContent>
                                                </ModalOverlay>
                                            </Modal>
                                            <Button onClick={onDepositClose}>
                                                {"Cancel"}
                                            </Button>
                                        </ModalFooter>
                                    </Center>
                                </ModalContent>
                        </Modal>
                    <Button mr={2} ml={2} isDisabled={!isConnected} onClick={onWithdrawOpen}>Withdraw</Button>
                        <Modal isOpen={isWithdrawOpen} onClose={onWithdrawClose} isCentered>
                            <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader mb={1} borderBottom='1px'>
                                        Withdraw {name}
                                    </ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        <FormControl>
                                            <FormLabel fontSize='small' mt={2}>
                                                <HStack>
                                                    <Flex ml={1} mr='auto'>Total Staked: {userStaked} {name}</Flex>
                                                    <Button {...maxWithdraw} onClick={setMaxWithdraw} size='xs'>MAX</Button>
                                                </HStack>
                                            </FormLabel>
                                            <Input {...inputWithdraw} />
                                        </FormControl>
                                    </ModalBody>
                                    <Center>
                                        <ModalFooter>                   
                                            <Button isDisabled={userStaked==0 || withdrawInput==0} isLoading={withdrawLoading} onClick={withdraw}>
                                                {"Withdraw"}
                                            </Button>
                                                <Modal isOpen={isProcessingOpen} onClose={onProcessingClose} isCentered>
                                                    <ModalOverlay>
                                                        <ModalContent>
                                                            <ModalHeader>
                                                                <ModalCloseButton />
                                                            </ModalHeader>
                                                            <ModalBody>
                                                                {withdrawLoading ? 'Processing Transaction...'
                                                                            : withdrawSuccess ? `Transaction Successful ${depositTxData}`
                                                                            : withdrawError ? `Transaction Reverted ${depositTxData}`
                                                                            : "Waiting Approval..."}
                                                            </ModalBody>
                                                            <ModalFooter>                                  
                                                            </ModalFooter>
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
                <Button width='full' mb={5} onClick={claim}>Claim</Button>
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