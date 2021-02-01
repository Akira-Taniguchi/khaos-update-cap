import { FunctionAddresses } from '@devprotocol/khaos-core'
import { getLockupContract, getProvider } from './common'

export const addresses: FunctionAddresses = async ({ network }) => {
	const provider = getProvider(network)
	const lockup = await getLockupContract(network, provider)
	return lockup.address
}
