import axios from 'axios';

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

      const res = await axios.post(apiUrl, {
        query: mutation,
        variables: {
          input: {
            email: testEmail,
            password: testPassword,
          },
        },
      });

      expect(res.status).toBe(200);
      expect(res.data.data.createUser).toBeDefined();
      expect(res.data.data.createUser.email).toBe(testEmail);
      expect(res.data.data.createUser.id).toBeDefined();
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

      const res = await axios.post(apiUrl, {
        query: mutation,
        variables: {
          input: {
            email: testEmail,
            password: testPassword,
          },
        },
      });

      expect(res.status).toBe(200);
      expect(res.data.data.login).toBeDefined();
      expect(res.data.data.login.email).toBe(testEmail);
      expect(res.headers['set-cookie']).toBeDefined();
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
        await axios.post(apiUrl, {
          query: mutation,
          variables: {
            input: {
              email: testEmail,
              password: 'wrongpassword',
            },
          },
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { status: number; data: { errors: unknown } } };
          expect(axiosError.response.status).toBe(200);
          expect(axiosError.response.data.errors).toBeDefined();
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

      testUserId = createRes.data.data.createUser.id;

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

      authCookie = loginRes.headers['set-cookie']?.[0] || '';
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

      expect(res.status).toBe(200);
      expect(res.data.data.user).toBeDefined();
      expect(res.data.data.user.id).toBe(testUserId);
      expect(res.data.data.user.email).toBe(testEmail);
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
        await axios.post(apiUrl, {
          query,
          variables: {
            userId: testUserId,
          },
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { status: number; data: { errors: unknown } } };
          expect(axiosError.response.status).toBe(200);
          expect(axiosError.response.data.errors).toBeDefined();
        }
      }
    });
  });
});
