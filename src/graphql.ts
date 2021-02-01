import bent from 'bent'

export const createGraphQLPropertyLockupSumValuesFetcher = (
	fetcher: bent.RequestFunction<bent.ValidResponse>
	// eslint-disable-next-line functional/functional-parameters
) => async (): Promise<GraphQLPropertyLockupSumValuesResponse> =>
		fetcher('/', {
			query: `{
				property_lockup_sum_values(
				) {
					sum_values
				}
			}`,
		}).then((r) => (r as unknown) as GraphQLPropertyLockupSumValuesResponse)

export const graphql = (
	network: string
): bent.RequestFunction<bent.ValidResponse> => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const endpoint = process.env[`KHAOS_${network.toUpperCase()}_GRAPHQL`]!
	return bent(endpoint, 'POST', 'json')
}

export type GraphQLPropertyLockupSumValuesResponse = {
	readonly data: {
		readonly property_lockup_sum_values: ReadonlyArray<{
			readonly sum_values: string
		}>
	}
}
