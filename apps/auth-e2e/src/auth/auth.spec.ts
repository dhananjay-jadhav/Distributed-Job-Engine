import axios from 'axios';

interface AxiosErrorResponse {
  response?: {
    status: number;
    data: {
      errors?: unknown;
      data?: unknown;
    };
    headers?: Record<string, unknown>;
  };
}

describe('Auth E2E Tests', () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/graphql`;

  describe('GraphQL Mutations', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'password123';

    it('should create a user', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(createUserInput: $input) {
            id
            email
          }
        }
      `;

      try {
        const res = await axios.post(apiUrl, {
          query: mutation,
          variables: {
            input: {
              email: testEmail,
              password: testPassword,
            },
          },
        });

        console.log('Create user response status:', res.status);
        console.log('Create user response data:', JSON.stringify(res.data, null, 2));

        expect(res.status).toBe(200);
        
        if (res.data.errors) {
          console.error('GraphQL errors:', JSON.stringify(res.data.errors, null, 2));
          throw new Error(`GraphQL errors: ${JSON.stringify(res.data.errors)}`);
        }

        expect(res.data.data).toBeDefined();
        expect(res.data.data.createUser).toBeDefined();
        expect(res.data.data.createUser.email).toBe(testEmail);
        expect(res.data.data.createUser.id).toBeDefined();
      } catch (error) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as AxiosErrorResponse;
          console.error('HTTP Error Status:', axiosError.response?.status);
          console.error('HTTP Error Data:', JSON.stringify(axiosError.response?.data, null, 2));
          console.error('HTTP Error Headers:', JSON.stringify(axiosError.response?.headers, null, 2));
        }
        console.error('Full error:', error);
        throw error;
      }
    });

    it('should login with created user', async () => {
      const mutation = `
        mutation Login($input: LoginInput!) {
          login(loginInput: $input) {
            id
            email
          }
        }
      `;

      try {
        const res = await axios.post(apiUrl, {
          query: mutation,
          variables: {
            input: {
              email: testEmail,
              password: testPassword,
            },
          },
        });

        console.log('Login response status:', res.status);
        console.log('Login response data:', JSON.stringify(res.data, null, 2));

        expect(res.status).toBe(200);
        
        if (res.data.errors) {
          console.error('GraphQL errors:', JSON.stringify(res.data.errors, null, 2));
          throw new Error(`GraphQL errors: ${JSON.stringify(res.data.errors)}`);
        }

        expect(res.data.data).toBeDefined();
        expect(res.data.data.login).toBeDefined();
        expect(res.data.data.login.email).toBe(testEmail);
        expect(res.headers['set-cookie']).toBeDefined();
      } catch (error) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as AxiosErrorResponse;
          console.error('HTTP Error Status:', axiosError.response?.status);
          console.error('HTTP Error Data:', JSON.stringify(axiosError.response?.data, null, 2));
          console.error('HTTP Error Headers:', JSON.stringify(axiosError.response?.headers, null, 2));
        }
        console.error('Full error:', error);
        throw error;
      }
    });

    it('should fail login with wrong password', async () => {
      const mutation = `
        mutation Login($input: LoginInput!) {
          login(loginInput: $input) {
            id
            email
          }
        }
      `;

      try {
        const res = await axios.post(apiUrl, {
          query: mutation,
          variables: {
            input: {
              email: testEmail,
              password: 'wrongpassword',
            },
          },
        });
        
        console.log('Wrong password response status:', res.status);
        console.log('Wrong password response data:', JSON.stringify(res.data, null, 2));
        
        // GraphQL returns 200 even for errors, so check for errors in response
        expect(res.status).toBe(200);
        expect(res.data.errors).toBeDefined();
        console.log('GraphQL errors (expected):', JSON.stringify(res.data.errors, null, 2));
      } catch (error) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { status: number; data: { errors: unknown } } };
          console.log('Caught HTTP error (checking for GraphQL errors)');
          console.error('HTTP Error Status:', axiosError.response?.status);
          console.error('HTTP Error Data:', JSON.stringify(axiosError.response?.data, null, 2));
          
          expect(axiosError.response.status).toBe(200);
          expect(axiosError.response.data.errors).toBeDefined();
        } else {
          console.error('Unexpected error type:', error);
          throw error;
        }
      }
    });
  });

  describe('GraphQL Queries', () => {
    let authCookie: string;
    let testUserId: string;
    const testEmail = `test-query-${Date.now()}@example.com`;
    const testPassword = 'password123';

    beforeAll(async () => {
      try {
        // Create a test user
        const createMutation = `
          mutation CreateUser($input: CreateUserInput!) {
            createUser(createUserInput: $input) {
              id
              email
            }
          }
        `;

        const createRes = await axios.post(apiUrl, {
          query: createMutation,
          variables: {
            input: {
              email: testEmail,
              password: testPassword,
            },
          },
        });

        console.log('BeforeAll - Create user response:', JSON.stringify(createRes.data, null, 2));
        
        if (createRes.data.errors) {
          console.error('BeforeAll - GraphQL errors on create:', JSON.stringify(createRes.data.errors, null, 2));
          throw new Error(`Failed to create user: ${JSON.stringify(createRes.data.errors)}`);
        }

        if (!createRes.data.data || !createRes.data.data.createUser) {
          console.error('BeforeAll - No user data in response:', JSON.stringify(createRes.data, null, 2));
          throw new Error('Failed to create user: No data in response');
        }

        testUserId = createRes.data.data.createUser.id;
        console.log('BeforeAll - Created user with ID:', testUserId);

        // Login to get auth cookie
        const loginMutation = `
          mutation Login($input: LoginInput!) {
            login(loginInput: $input) {
              id
              email
            }
          }
        `;

        const loginRes = await axios.post(apiUrl, {
          query: loginMutation,
          variables: {
            input: {
              email: testEmail,
              password: testPassword,
            },
          },
        });

        console.log('BeforeAll - Login response:', JSON.stringify(loginRes.data, null, 2));
        
        if (loginRes.data.errors) {
          console.error('BeforeAll - GraphQL errors on login:', JSON.stringify(loginRes.data.errors, null, 2));
          throw new Error(`Failed to login: ${JSON.stringify(loginRes.data.errors)}`);
        }

        authCookie = loginRes.headers['set-cookie']?.[0] || '';
        console.log('BeforeAll - Auth cookie obtained:', authCookie ? 'Yes' : 'No');
      } catch (error) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as AxiosErrorResponse;
          console.error('BeforeAll - HTTP Error Status:', axiosError.response?.status);
          console.error('BeforeAll - HTTP Error Data:', JSON.stringify(axiosError.response?.data, null, 2));
        }
        console.error('BeforeAll - Full error:', error);
        throw error;
      }
    });

    it('should get user by id when authenticated', async () => {
      const query = `
        query GetUser($userId: String!) {
          user(userId: $userId) {
            id
            email
          }
        }
      `;

      try {
        const res = await axios.post(
          apiUrl,
          {
            query,
            variables: {
              userId: testUserId,
            },
          },
          {
            headers: {
              Cookie: authCookie,
            },
          }
        );

        console.log('Get user response status:', res.status);
        console.log('Get user response data:', JSON.stringify(res.data, null, 2));

        expect(res.status).toBe(200);
        
        if (res.data.errors) {
          console.error('GraphQL errors:', JSON.stringify(res.data.errors, null, 2));
          throw new Error(`GraphQL errors: ${JSON.stringify(res.data.errors)}`);
        }

        expect(res.data.data).toBeDefined();
        expect(res.data.data.user).toBeDefined();
        expect(res.data.data.user.id).toBe(testUserId);
        expect(res.data.data.user.email).toBe(testEmail);
      } catch (error) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as AxiosErrorResponse;
          console.error('HTTP Error Status:', axiosError.response?.status);
          console.error('HTTP Error Data:', JSON.stringify(axiosError.response?.data, null, 2));
        }
        console.error('Full error:', error);
        throw error;
      }
    });

    it('should fail to get user without authentication', async () => {
      const query = `
        query GetUser($userId: String!) {
          user(userId: $userId) {
            id
            email
          }
        }
      `;

      try {
        const res = await axios.post(apiUrl, {
          query,
          variables: {
            userId: testUserId,
          },
        });
        
        console.log('Unauthenticated get user response status:', res.status);
        console.log('Unauthenticated get user response data:', JSON.stringify(res.data, null, 2));
        
        // GraphQL returns 200 even for errors, so check for errors in response
        expect(res.status).toBe(200);
        expect(res.data.errors).toBeDefined();
        console.log('GraphQL errors (expected):', JSON.stringify(res.data.errors, null, 2));
      } catch (error) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { status: number; data: { errors: unknown } } };
          console.log('Caught HTTP error (checking for GraphQL errors)');
          console.error('HTTP Error Status:', axiosError.response?.status);
          console.error('HTTP Error Data:', JSON.stringify(axiosError.response?.data, null, 2));
          
          expect(axiosError.response.status).toBe(200);
          expect(axiosError.response.data.errors).toBeDefined();
        } else {
          console.error('Unexpected error type:', error);
          throw error;
        }
      }
    });
  });
});
