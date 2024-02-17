import { fetchBlockNumber, fetchToken, readContract, readContracts } from 'wagmi/actions'
import { getAccount } from "wagmi/actions";
import { tokenAbi, masterContract, lpAbi, vaultAbi, distributorAbi } from "../data";

export const someInfo = async (address, currentBlockInt) => {
    const data = await readContracts({
        contracts: [
         {
            address: import.meta.env.VITE_LP,
            abi: lpAbi,
            functionName: 'getReserves',
         },
         {
            ...masterContract,
            functionName: 'poolLength',
         },
         {
            ...masterContract,
            functionName: 'rewardsPerBlock',
         },
         {
            ...masterContract,
            functionName: 'getMultiplier',
            args: [currentBlockInt-1, currentBlockInt]
         },
         {
            ...masterContract,
            functionName: 'totalAllocPoint',
         },
         {//Getting wPLS / DAI reserves to calculate Pulse price
            address: import.meta.env.VITE_PULSE_LP,
            abi: lpAbi,
            functionName: 'getReserves',
         },
        {//Getting Atropa/wPLS reserves to calculate Atropa price
            address: import.meta.env.VITE_ATROPA_LP,
            abi: lpAbi,
            functionName: 'getReserves',
        },
        {//Getting wBTC/wPL reserves to calculate wBTC price
            address: '0x46E27Ea3A035FfC9e6d6D56702CE3D208FF1e58c',
            abi: lpAbi,
            functionName: 'getReserves',
    
        },
        {//Getting wETH/wPL reserves to calculate wETH price
            address: '0x42AbdFDB63f3282033C766E72Cc4810738571609',
            abi: lpAbi,
            functionName: 'getReserves',
        
        },
        {//Getting burn address balance
            address: import.meta.env.VITE_TOKEN,
            abi: tokenAbi,
            functionName: 'balanceOf',
            args: ['0x0000000000000000000000000000000000000369'],
        },
        {//Getting PLSB/wpls reserves to calculate PLSB price
                address: '0x894167362577Ea6ec0aC01aB56A7B2d3946EAD55',
                abi: lpAbi,
                functionName: 'getReserves',
            
        },
            {//Getting DAI/wPLS reserves to calculate DAI price
                address: '0xE56043671df55dE5CDf8459710433C10324DE0aE',
                abi: lpAbi,
                functionName: 'getReserves',
            
            },
            {//Getting PLSX/wPLS reserves to calculate DAI price
                address: '0x1b45b9148791d3a104184Cd5DFE5CE57193a3ee9',
                abi: lpAbi,
                functionName: 'getReserves',
            
            },
            {//Getting Minu/DAI reserves to calculate Minu price (highest liquidity pair)
                address: '0xB26a7c3C02f73369B75C321565138dE9D51A0b3F',
                abi: lpAbi,
                functionName: 'getReserves',
            
            },  
            {//Getting GGC.PLS reserves to calculate GGC price
                address: '0xa995397733D2a6D5a51ec5D0Cc378c63E486CbD1',
                abi: lpAbi,
                functionName: 'getReserves',
            
            }, 
            {//Getting burn address GGC balance
                address: '0x393672F3D09E7fC18E90b6113DCe8958e8B3A13b',
                abi: tokenAbi,
                functionName: 'balanceOf',
                args: ['0x0000000000000000000000000000000000000369'],
            },
            {//Getting total reflection distributed
                address: '0xa58dD79C1051e5FF5C9045E8Aa58bBC12a6b5364',
                abi: distributorAbi,
                functionName: 'totalDistributed',
            },  
            {//Getting Goat/PLS reserves to calculate Goat price
                address: '0x64A34EFfab883d001eB006F3EAd1c90AC1D6Fb54',
                abi: lpAbi,
                functionName: 'getReserves',
            
            }, 
            {//Getting total reflection distributed
                address: '0xa58dD79C1051e5FF5C9045E8Aa58bBC12a6b5364',
                abi: distributorAbi,
                functionName: 'shares',
                args: [address],
            },
            {//Getting Anon/PLS reserves to calculate Anon price
                address: '0x9Dc200603860Ef1Ce33943920796139B470C6018',
                abi: lpAbi,
                functionName: 'getReserves',
            
            }, 
            {//Getting DegenG/PLS reserves to calculate Anon price
                address: '0x65B9fDbcB865522Cc036A9298331d77f628977A2',
                abi: lpAbi,
                functionName: 'getReserves',
            
            },  
        ]
    });
    return data
}