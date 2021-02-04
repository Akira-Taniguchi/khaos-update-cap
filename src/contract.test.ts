/* eslint-disable functional/immutable-data */
import test from 'ava'
import { ethers } from 'ethers'
import {
	lockupAbi,
	getProvider,
	getLockupContract,
	getTransactionBlockNumber,
} from './contract'
import { getLockupAddress } from './test-utils'

// lockupAbi
test('lockupのABIが取得できる.', (t) => {
	t.is(lockupAbi[0], 'event Lockedup(address, address, uint256)')
	t.is(lockupAbi[1], 'function updateCap(uint256) external')
})

// getProvider
test('mainnet providerが生成される.', async (t) => {
	process.env[`KHAOS_MAINNET_JSON_RPC`] = 'https://testdomain:1234'
	const provider = getProvider('mainnet')
	const converted = <ethers.providers.JsonRpcProvider>provider
	t.is(converted.connection.url, 'https://testdomain:1234')
})

test('ropsten providerが生成される.', async (t) => {
	process.env[`KHAOS_ROPSTEN_JSON_RPC`] = 'https://testdomainropsten:1234'
	const provider = getProvider('ropsten')
	const converted = <ethers.providers.JsonRpcProvider>provider
	t.is(converted.connection.url, 'https://testdomainropsten:1234')
})

// getLockupContract
test('ropstenのLockupコントラクトオブジェクトが取得できる', async (t) => {
	const provider = ethers.getDefaultProvider('ropsten')
	const lockup = await getLockupContract(provider)
	const lockupAddress = await getLockupAddress(
		'0xD6D07f1c048bDF2B3d5d9B6c25eD1FC5348D0A70',
		provider
	)
	t.is(lockupAddress, lockup.address)
})

test('mainnetのLockupコントラクトオブジェクトが取得できる', async (t) => {
	const provider = ethers.getDefaultProvider('homestead')
	const lockup = await getLockupContract(provider)
	const lockupAddress = await getLockupAddress(
		'0x1D415aa39D647834786EB9B5a333A50e9935b796',
		provider
	)
	t.is(lockupAddress, lockup.address)
})

// getTransactionBlockNumber
test('トランザクションのブロック番号が取得できる', async (t) => {
	const provider = ethers.getDefaultProvider('ropsten')
	const number = await getTransactionBlockNumber(
		provider,
		'0xfa052419311d16810602fadc56cf9bf20d4a575e0a6c08d25e17ca1ed245632a'
	)
	t.is(number, 9270014)
})
