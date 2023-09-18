import { useAccount,
    usePublicClient,
    useContractRead,
    useContractWrite,  
    useConnect,
    } from "wagmi";

import { tokenAbi, masterAbi } from "../../data";
import { useEffect, useState } from "react";

import { ethers } from "ethers";
import { Flex } from "@chakra-ui/react";

export default function TheFarms() {



        async function getName() {
            const { address, isConnected, connector } = useAccount();
            const [name, setName] = useState();
            const publicClient = usePublicClient();
             const masterContract = new ethers.Contract(import.meta.env.VITE_MASTER, masterAbi, publicClient);
             const pools = await masterContract.connect(publicClient).poolLength();
             const poolCa = pools;

            // const tokenContract = new ethers.Contract(poolCa, tokenAbi, publicClient);
            // const tokenName = tokenContract.name();
            console.log("YO")
            // console.log(poolCa);
            // console.log(tokenName);

        }
        getName();


    return(
        <Flex>
            YO YO YO
        </Flex>
    )
}
TheFarms();