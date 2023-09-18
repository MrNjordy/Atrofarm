import { Box, Button, Flex, HStack, StackDivider } from "@chakra-ui/react";
import { Connector, useAccount,
         useConnect,
         useDisconnect,
         useEnsAvatar,
         useEnsName
        } from "wagmi";
import {
    Link as RouteLink
     } from "react-router-dom";
import { etherPrice } from "./priceData";

function Profile() {
    const { address, connector, isConnected } = useAccount()
    const { data: ensAvatar } = useEnsAvatar({ address })
    const { data: ensName } = useEnsName({ address })
    const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()
    const { disconnect } = useDisconnect()

    if (isConnected) {
        return(
            <Flex background='blackAlpha.600' borderBottom='1px' borderBottomColor="black">
                <HStack ml={5} spacing={3} divider={<StackDivider />} height={45}>
                <Flex>
                    <RouteLink to='/' >Home</RouteLink>
                </Flex>
                <Flex>
                    <RouteLink to='/Farms' >Farm</RouteLink>
                </Flex>
                <Flex>
                    <RouteLink to='/Staking' >Stake</RouteLink>
                </Flex>
            </HStack>
                <Flex ml='auto' mr={5} mt={2} mb={2} >
                <Button onClick={disconnect}>{ensName ? `${ensName} (${address})` : address.substring(0,7) + '...'}</Button>
                </Flex>
            </Flex>
        )
    }

    return (
        <Flex background='blackAlpha.600' borderBottom='1px' borderBottomColor="black">
            {connectors.map((connector) => (
                <Button ml='auto' mr={5} mt={2} mb={2}
                    disabled={!connector.ready}
                    key={connector.id}
                    onClick={() => connect({ connector })}
                >
                    Connect
                    {!connector.ready && ' (unsupported) '}
                    {isLoading &&
                        connector.id === pendingConnector?.id &&
                        ' (connecting) '}
                </Button>
            ))}

            {error && <div>{error.message}</div>}
        </Flex>
    )
}

export default Profile;