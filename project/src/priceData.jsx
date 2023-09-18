import axios from "axios"

export const etherApi = await axios.get('https://api.dexscreener.com/latest/dex/pairs/goerli/0x88124Ef4A9EC47e691F254F2E8e348fd1e341e9B')
export const etherPrice = etherApi.data.pair.priceUsd;
