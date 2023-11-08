import { Flex, HStack, Box, Center, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, useNumberInput, Spinner, Text, Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, VStack, Image } from "@chakra-ui/react"
import { useAccount, useWaitForTransaction } from "wagmi";
import { writeContract, prepareWriteContract } from "wagmi/actions";
import { masterContract, tokenAbi, vaultAbi } from "../data";
import { useState } from "react";
import dai from '../assets/FarmIcons/Dai.png'
import pls from '../assets/FarmIcons/PLS.png'
import plsx from '../assets/FarmIcons/plsx.png'

export default function VaultInfo({
    id,
    name, 
    userStaked,
    userStakedUsd, 
    apr, 
    totalStakedUsd,
    actualRewards,
    actualRewardsUsd,
    burnRewards,
    burnRewardsUsd,
    deposit,
    userBalance,
    depositFee,
    allowance,
    address,
    token,
    vaultAddress,
    maxStake,
    maxStakeUsd,
    price,
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
        step: parseInt(userBalance)/10**18 <= (parseFloat(maxStakeUsd)/parseFloat(price)) ? parseInt(userBalance) / 10**18
                : (parseFloat(maxStakeUsd)/parseFloat(price)),
        min:0,
        max: parseInt(userBalance)/10**18 <= (parseFloat(maxStakeUsd)/parseFloat(price)) ? parseInt(userBalance) / 10**18
                : (parseFloat(maxStakeUsd)/parseFloat(price)),
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
            address: vaultAddress,
            abi: vaultAbi,
            functionName: 'deposit',
            args: [depositInput],
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
            address: vaultAddress,
            abi: vaultAbi,
            functionName: 'withdraw',
            args: [withdrawInput],
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
            args: [vaultAddress.toString(), 999999999999999*(10**18)],
        })
        const { hash } = await writeContract(config);
        setApprovalTxData(hash); 
    }
    const { data: approvalWaitTx, isError: approvalError, isLoading: approvalLoading, isSuccess: approvalSuccess } = useWaitForTransaction({
        hash: approvalTxData,
    })

    async function claim() {
        await writeContract({
           address: vaultAddress,
           abi: vaultAbi,
           functionName:'deposit',
           args: [0]
       })
   }
    return(
        <Box>
<Box fontFamily='heading' mt={5} padding={3} paddingBottom={1} width={250} bgColor='gray.900' fontWeight='semibold' color='gray.300' borderBottom='none'>                
    <HStack>
        <Image src={address == '0xefd766ccb38eaf1dfd701853bfce31359239f305' ? dai 
                    : address == '0xa1077a294dde1b09bb078844df40758a5d0f9a27' ? pls
                    : plsx}
                mb={3}>
        </Image>    
        <Flex mb={3} mr={1} ml='auto'>
            <Text color='gray.300'>{name}</Text>
        </Flex>  
    </HStack>
    <Center borderBottom='2px' borderColor='yellow.500'></Center>
                <HStack mb={1} mt={3}> 
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        Deposit Fee: 
                    </Flex>
                    <Flex ml='auto' mr={1}>
                        {depositFee}%
                    </Flex>
                </HStack>
                <HStack mb={1} mt={3}> 
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
                    ${(userStakedUsd /10**18 * apr/100 /365).toFixed(2)}
                </Flex>
                <HStack >
                    <Flex ml={1} fontSize='medium'>
                        Your Deposit: 
                    </Flex>
                    <Flex ml='auto' mr={1} fontSize='large'>
                        {(parseFloat(userStaked) / 10**18).toFixed(2)}
                    </Flex>
                </HStack> 
                <Flex justify='right' mr={1} mb={1} mt={-1} fontSize='smaller' fontWeight='light'>
                    ${((parseFloat(userStakedUsd))/10**18).toFixed(2)}
                </Flex>
                <HStack color='gray.400' >
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        Your Pool Share: 
                    </Flex>
                    <Flex ml='auto' mr={1} fontSize='smaller'>
                        {((userStakedUsd / totalStakedUsd * 100) /10**18).toFixed(2)}% 
                    </Flex>
                </HStack> 
                <HStack mt={3}>
                    <Flex ml={1} fontSize='smaller'>
                        Remaining: 
                    </Flex>
                    <Flex ml='auto' mr={1} fontSize='smaller'>
                        {(parseFloat(maxStakeUsd)/parseFloat(price)) < 1000000 ? `${(parseFloat(maxStakeUsd)/parseFloat(price)).toFixed(2)} ${name}`
                                                                                : `${(parseFloat(maxStakeUsd)/parseFloat(price)).toExponential(2)} ${name}`
                        }
                    </Flex>
                </HStack> 
                <Flex justify='right' mr={1} mb={1} fontSize='smaller' fontWeight='light'>
                    ${(parseFloat(maxStakeUsd)).toFixed(2)}
                </Flex>
                <HStack>
                    <Flex ml={1} mr='auto' fontSize='medium'>
                        To Claim:
                    </Flex>
                    <Flex ml='auto' mr={1} fontSize='large'>
                        {(parseInt(actualRewards) /10**18).toFixed(2)}
                    </Flex>
                </HStack>
                <Flex justify='right' mr={1} mt={-1} fontSize='smaller' fontWeight='light'>
                    ${(parseInt(actualRewardsUsd) /10**18).toFixed(2)}
                </Flex>
                <HStack color='gray.400'>
                    <Flex ml={1} mr='auto' fontSize='smaller'>
                        To Burn:
                    </Flex>
                    <Flex ml='auto' mr={1} fontSize='smaller'>
                        {(parseInt(burnRewards)/10**18).toFixed(2)}
                    </Flex>
                </HStack>
                <Flex justify='right' mr={1} mt={-1} fontSize='smaller' fontWeight='light'>
                    ${(parseInt(burnRewardsUsd)/10**18).toFixed(2)}
                </Flex>
                </Box>
                <Box fontFamily='heading' padding={3} paddingTop={0} width={250} bgColor='gray.900' fontWeight='semibold' color='gray.300' borderTop='none'>
                <Accordion defaultIndex={[]} allowMultiple>
                    <AccordionItem border='none'>
                        <AccordionButton justifyContent='center'>   
                            <AccordionIcon></AccordionIcon>  
                        </AccordionButton>
                        <AccordionPanel>
                <Center mb={3}>
                    <Button fontSize='smaller' mr={2} bgGradient='linear(to-bl, yellow.400, yellow.700)' color='black' isDisbaled={!isConnected} onClick={onDepositOpen}>Deposit</Button>
                        {userStakedUsd >= maxStakeUsd 
                            ? <Modal isOpen={isDepositOpen} onClose={onDepositClose} isCentered>
                                <ModalOverlay />
                                    <ModalContent bgColor='gray.900'>
                                        <ModalHeader mb={1} borderBottom='1px' borderColor='yellow.500'>
                                            <Text color='gray.300' >
                                                Not Enough $Atrofa Staked
                                            </Text>
                                            <ModalCloseButton color={"gray.300"} />
                                        </ModalHeader>
                                        <ModalBody color={"gray.300"} fontFamily={'heading'} fontSize={'large'}>
                                            <Text mb={5} align={'center'}>
                                                It looks like you need to stake more $Atrofa to deposit in this pool.
                                            </Text>
                                            <Box>
                                                <Center>
                                                    <HStack>
                                                        <Flex>
                                                            {`${name} available to stake:`}
                                                        </Flex>
                                                        <Flex>
                                                            {(parseFloat(maxStakeUsd)/parseFloat(price)).toFixed(2)}
                                                        </Flex>
                                                        <Flex>
                                                            {`($${(parseFloat(maxStakeUsd)).toFixed(2)})`}
                                                        </Flex>
                                                    </HStack>
                                                </Center>         
                                            </Box>
                                        </ModalBody>
                                    </ModalContent>
                            </Modal>
                            
                            : <Modal isOpen={isDepositOpen} onClose={onDepositClose} isCentered >
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
                                                            <Text mr={3} color='gray.300' >
                                                                Balance: {parseInt(userBalance) / 10**18 < 1000000 ? `${(parseInt(userBalance) / 10**18)} ${name}`
                                                                            : `${(parseInt(userBalance) / 10**18).toExponential(2)} ${name}`
                                                                }
                                                            </Text>
                                                        </Flex>
                                                        <Button bgGradient='linear(to-bl, yellow.400, yellow.700)' {...maxDeposit} onClick={setMaxDeposit} size='xs'>MAX</Button>
                                                    </HStack>
                                                    <Text color='gray.300' ml={1} >
                                                                Remaining: {(parseFloat(maxStakeUsd)/parseFloat(price)) < 1000000 ? `${(parseFloat(maxStakeUsd)/parseFloat(price)).toFixed(2)} ${name}`
                                                                                : `${(parseFloat(maxStakeUsd)/parseFloat(price)).toExponential(2)} ${name}`
                                                                }
                                                    </Text>
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
                                                            <ModalHeader borderBottom='1px' borderColor='yellow.500' bgColor='gray.900' color='gray.300'>
                                                                { depositLoading ? "Processing Transaction..."
                                                                            : depositSuccess ? 'Transaction Successful'
                                                                            : depositError ? 'Transaction Reverted'
                                                                            : "Waiting Approval"}
                                                                <ModalCloseButton />
                                                            </ModalHeader>
                                                            <ModalBody bgColor='gray.900' color= 'gray.300'>
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
                    }
                    <Button fontSize='smaller' ml={2} bgGradient='linear(to-bl, yellow.400, yellow.700)' color='black' isDisabled={!isConnected} onClick={onWithdrawOpen}>Withdraw</Button>
                        <Modal isOpen={isWithdrawOpen} onClose={onWithdrawClose} isCentered>
                            <ModalOverlay />
                            <ModalContent bgColor='gray.900'>
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
                                                        <ModalHeader borderBottom='1px' borderColor='yellow.500' bgColor='gray.900' color='gray.300'>
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
                        ${(parseInt(totalStakedUsd)).toFixed(2)}
                    </Flex>
                </HStack>
                </AccordionPanel>
                </AccordionItem>
                </Accordion>
                </Box>
              </Box>
         
    )
}