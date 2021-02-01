/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/functional-parameters */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { providers } from 'ethers'
import BigNumber from 'bignumber.js'
import { pow, bignumber, floor } from 'mathjs'
import { FunctionOraclizer } from '@devprotocol/khaos-core'
import { getLockupContract, getProvider } from './common'
import {
	createGraphQLPropertyLockupSumValuesFetcher,
	graphql,
	GraphQLPropertyLockupSumValuesResponse,
} from './graphql'

export const oraclize: FunctionOraclizer = async ({
	signatureOptions,
	query,
	network,
}) => {
	const geometricMean = await calculateGeometricMean(network)
	const result = isLatestLockedupEvent(network, query.transactionhash)
		? {
				message: geometricMean,
				status: 0,
				statusMessage: `${network} ${query.publicSignature}`,
		  }
		: undefined
	return result
}

const calculateGeometricMean = async (network: string): Promise<string> => {
	const fetchGraphQL = createGraphQLPropertyLockupSumValuesFetcher(
		graphql(network)
	)
	const all = await (async () =>
		new Promise<
			GraphQLPropertyLockupSumValuesResponse['data']['property_lockup_sum_values']
		>((resolve) => {
			const f = async (
				prev: GraphQLPropertyLockupSumValuesResponse['data']['property_lockup_sum_values'] = []
			): Promise<void> => {
				const { data } = await fetchGraphQL()
				const { property_lockup_sum_values: items } = data
				const next = [...prev, ...items]
				resolve(next)
			}
			f().catch(console.error)
		}))()
	// eslint-disable-next-line functional/no-let
	let mod = new BigNumber(0)
	const result = all.map((data) => () => {
		mod = mod.times(data.sum_values)
	})
	return floor(
		bignumber(pow(bignumber(mod.toString()), all.length).toString())
	).toString()
}

const isLatestLockedupEvent = async (
	network: string,
	transactionHash: string
): Promise<boolean> => {
	const provider = getProvider(network)
	const blockNumber = await getTransactionBlockNumber(provider, transactionHash)
	const lockupContract = await getLockupContract(network, provider)
	const query = lockupContract.filters.query()
	const events = await lockupContract.queryFilter(query, blockNumber + 1)
	return events.length === 0
}

const getTransactionBlockNumber = async (
	provider: providers.BaseProvider,
	transactionHash: string
): Promise<number> => {
	const transaction = await provider.getTransaction(transactionHash)
	return transaction.blockNumber!
}
