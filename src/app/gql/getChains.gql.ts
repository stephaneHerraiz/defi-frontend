import { gql } from 'apollo-angular';

export const GET_CHAINS = gql`
  query Chains($filter: ChainsFilter!) {
    chains(filter: $filter) {
        name
        chainId
        icon
    }
  }`;
