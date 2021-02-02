import { providers } from 'ethers'
import BigNumber from 'bignumber.js'
import { pow, bignumber, floor } from 'mathjs'
import { FunctionOraclizer } from '@devprotocol/khaos-core'
import { getLockupContract, getProvider } from './contract'
import {
	createGraphQLPropertyLockupSumValuesFetcher,
	graphql,
	GraphQLPropertyLockupSumValuesResponse,
	createGraphQLPropertyAuthenticationFetcher,
	GraphQLPropertyPropertyAuthenticationResponse,
} from './graphql'

export const oraclize: FunctionOraclizer = async ({ query, network }) => {
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
	const valueMap = await getLockupValuesMap(network)
	const authinticatedProperties = await getAuthinticatedProperty(network)
	const values = authinticatedProperties.map((property) => {
		const value = valueMap.get(property)
		const tmp = typeof value === 'undefined' ? 1 : value
		return new BigNumber(tmp)
	})
	const result = values.reduce((data1, data2) => {
		return data1.times(data2)
	})
	return floor(
		bignumber(pow(bignumber(result.toString()), values.length).toString())
	).toString()
}

const getAuthinticatedProperty = async (
	network: string
): Promise<readonly string[]> => {
	const fetchGraphQL = createGraphQLPropertyAuthenticationFetcher(
		graphql(network)
	)
	type R = GraphQLPropertyPropertyAuthenticationResponse['data']['property_authentication']
	const authinticatedPropertoes = await (async () => {
		const f = async (i = 0, prev: R = []): Promise<R> => {
			const { data } = await fetchGraphQL()
			const { property_authentication: items } = data
			const next = [...prev, ...items]
			return items.length > 0 ? f(i + items.length, next) : next
		}
		return f()
	})()

	const properties = authinticatedPropertoes.map((data) => {
		return data.property
	})
	return properties
}

const getLockupValuesMap = async (
	network: string
): Promise<ReadonlyMap<string, string>> => {
	const fetchGraphQL = createGraphQLPropertyLockupSumValuesFetcher(
		graphql(network)
	)
	type R = GraphQLPropertyLockupSumValuesResponse['data']['property_lockup_sum_values']
	const lockupSumValues = await (async () => {
		const f = async (i = 0, prev: R = []): Promise<R> => {
			const { data } = await fetchGraphQL()
			const { property_lockup_sum_values: items } = data
			const next = [...prev, ...items]
			return items.length > 0 ? f(i + items.length, next) : next
		}
		return f()
	})()

	const values = lockupSumValues.map<readonly [string, string]>(
		({ property_address, sum_values }) => [property_address, sum_values]
	)
	return new Map<string, string>(values)
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
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return transaction.blockNumber!
}
