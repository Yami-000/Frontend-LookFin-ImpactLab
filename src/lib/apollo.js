import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const isProduction = String(import.meta.env.VITE_PRODUCTION ?? 'false').toLowerCase() === 'true';
const graphqlUri = isProduction
  ? (import.meta.env.VITE_GRAPHQL ?? import.meta.env.VITE_GRAPHQL_URL ?? 'https://backend-lookfin-impactlab.onrender.com/graphql')
  : 'http://localhost:4000/graphql';

const httpLink = new HttpLink({
  uri: graphqlUri,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('lf_firebase_token');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default apolloClient;