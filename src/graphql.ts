/* eslint-disable functional/functional-parameters */
import bent from 'bent'

export const createGraphQLPropertyLockupSumValuesFetcher = (
	fetcher: bent.RequestFunction<bent.ValidResponse>
) => async (): Promise<GraphQLPropertyLockupSumValuesResponse> =>
	fetcher('/', {
		query: `{
				property_lockup_sum_values(
				) {
					property_address
					sum_values
				}
			}`,
	}).then((r) => (r as unknown) as GraphQLPropertyLockupSumValuesResponse)

export const createGraphQLPropertyAuthenticationFetcher = (
	fetcher: bent.RequestFunction<bent.ValidResponse>
) => async (): Promise<GraphQLPropertyPropertyAuthenticationResponse> =>
	fetcher('/', {
		query: `{
				property_authentication(
				) {
					property
				}
			}`,
	}).then(
		(r) => (r as unknown) as GraphQLPropertyPropertyAuthenticationResponse
	)

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
			readonly property_address: string
			readonly sum_values: string
		}>
	}
}

export type GraphQLPropertyPropertyAuthenticationResponse = {
	readonly data: {
		readonly property_authentication: ReadonlyArray<{
			readonly property: string
		}>
	}
}
