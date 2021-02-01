/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ethers, providers } from 'ethers'


export const getLockupContract = async (network: string, provider: providers.BaseProvider): Promise<ethers.Contract> => {
	const addressConfigContraCt = getAddressConfigContract(network, provider)
	const lockupAddress = await addressConfigContraCt.lockup()
	const lockupContract = new ethers.Contract(lockupAddress, lockupAbi, provider);
	return lockupContract;
}

export const getProvider = (network: string): providers.BaseProvider => {
	const endpoint = process.env[`KHAOS_${network.toUpperCase()}_JSON_RPC`]
	return new ethers.providers.JsonRpcProvider(endpoint);
}

export const lockupAbi = ['event Lockedup(address, address, uint256)', 'function updateCap(uint256) external']

const getAddressConfigContract = (network: string, provider: providers.BaseProvider): ethers.Contract => {
	const addressConfigAddress = network === 'mainnet'
		? '0x1D415aa39D647834786EB9B5a333A50e9935b796'
		: '0xD6D07f1c048bDF2B3d5d9B6c25eD1FC5348D0A70'
	const abi = [
		"function lockup() external view returns (address)",
		"function metricsGroup() external view returns (address)"
	];
	return new ethers.Contract(addressConfigAddress, abi, provider);
}
