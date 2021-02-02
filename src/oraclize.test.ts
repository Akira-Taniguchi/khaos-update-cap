import test from 'ava'
import { oraclize } from './oraclize'

test('oraclize is executed.', async (t) => {
	// eslint-disable-next-line functional/immutable-data
	process.env[`KHAOS_MAINNET_GRAPHQL`] = 'https://api.devprtcl.com/v1/graphql'
	const res = await oraclize({
		signatureOptions: { address: 'account', id: 'signature', message: 'data' },
		query: { allData: '{}', publicSignature: 'dummy-public-signature' } as any,
		network: 'mainnet',
	})
	t.is(res!.message, 'data')
	t.is(res!.status, 0)
	t.is(res!.statusMessage, 'mainnet dummy-public-signature')
})
