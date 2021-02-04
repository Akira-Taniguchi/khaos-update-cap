/* eslint-disable functional/no-let */
/* eslint-disable functional/prefer-readonly-type */
import test from 'ava'
import sinon from 'sinon'
import { ethers } from 'ethers'
import { oraclize } from './oraclize'
import * as contractModules from './contract'

let stub: sinon.SinonStub<[network: string], ethers.providers.BaseProvider>
let stub2: sinon.SinonStub<
	[provider: ethers.providers.BaseProvider, transactionHash: string],
	Promise<number>
>
let stub3: sinon.SinonStub<
	[provider: ethers.providers.BaseProvider],
	Promise<ethers.Contract>
>
const mainnetProvider = ethers.getDefaultProvider('homestead')
const ropstenProvider = ethers.getDefaultProvider('ropsten')
test.before(() => {
	stub = sinon.stub(contractModules, 'getProvider')
	stub.withArgs('mainnet').returns(mainnetProvider)
	stub.withArgs('ropsten').returns(ropstenProvider)
	stub2 = sinon.stub(contractModules, 'getTransactionBlockNumber')
	stub2.withArgs(mainnetProvider, 'toransaction-hash').resolves(198700)
	stub3 = sinon.stub(contractModules, 'getLockupContract')
	stub3.withArgs(mainnetProvider).resolves({
		filters: {
			Lockedup: function () {
				return {} as any
			},
		},
		queryFilter: function (a: any, b: any, c: any) {
			return []
		},
	} as any)
})

test('oraclize is executed.', async (t) => {
	// eslint-disable-next-line functional/immutable-data
	process.env[`KHAOS_MAINNET_GRAPHQL`] = 'https://api.devprtcl.com/v1/graphql'
	const res = await oraclize({
		signatureOptions: { address: 'account', id: 'signature', message: 'data' },
		query: {
			allData: '{}',
			publicSignature: 'dummy-public-signature',
			transactionhash: 'toransaction-hash',
		} as any,
		network: 'mainnet',
	})
	t.is(res!.message, 'data')
	t.is(res!.status, 0)
	t.is(res!.statusMessage, 'mainnet dummy-public-signature')
})
test.after(() => {
	stub.restore()
	stub2.restore()
	stub3.restore()
})
