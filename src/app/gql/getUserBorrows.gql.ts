import  { gql } from 'apollo-angular';

export const GET_USER_BORROWS = gql`
  query UserBorrows($request: UserBorrowsRequest!) {
    userBorrows(request: $request) {
      balance {
        usd
        amount {
          value
        }
      }
      canBeCollateral
      isCollateral
      currency {
        imageUrl
        address
        name
        symbol
      }
      apy {
        value
      }
    }
  }
`;