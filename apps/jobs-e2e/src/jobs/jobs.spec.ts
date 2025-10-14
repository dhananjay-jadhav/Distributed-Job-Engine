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

describe('Jobs E2E Tests', () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  const apiUrl = `${baseUrl}/api/graphql`;
  
  // For auth, we'll need to get a token from auth service
  const authBaseUrl = process.env.AUTH_BASE_URL || 'http://localhost:3000';
  const authApiUrl = `${authBaseUrl}/api/graphql`;

  let authCookie: string;

  beforeAll(async () => {
    try {
      // Create a test user and login to get auth cookie
      const testEmail = `test-jobs-${Date.now()}@example.com`;
      const testPassword = 'Test@Pass123';

      // Create user
      const createMutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(createUserInput: $input) {
            id
            email
          }
        }
      `;

      const createRes = await axios.post(authApiUrl, {
        query: createMutation,
        variables: {
          input: {
            email: testEmail,
            password: testPassword,
          },
        },
      });

      console.log('Jobs E2E - Create user response:', JSON.stringify(createRes.data, null, 2));
      
      if (createRes.data.errors) {
        console.error('Jobs E2E - GraphQL errors on create:', JSON.stringify(createRes.data.errors, null, 2));
        throw new Error(`Failed to create user: ${JSON.stringify(createRes.data.errors)}`);
      }

      // Login
      const loginMutation = `
        mutation Login($input: LoginInput!) {
          login(loginInput: $input) {
            id
            email
          }
        }
      `;

      const loginRes = await axios.post(authApiUrl, {
        query: loginMutation,
        variables: {
          input: {
            email: testEmail,
            password: testPassword,
          },
        },
      });

      console.log('Jobs E2E - Login response:', JSON.stringify(loginRes.data, null, 2));
      
      if (loginRes.data.errors) {
        console.error('Jobs E2E - GraphQL errors on login:', JSON.stringify(loginRes.data.errors, null, 2));
        throw new Error(`Failed to login: ${JSON.stringify(loginRes.data.errors)}`);
      }

      authCookie = loginRes.headers['set-cookie']?.[0] || '';
      console.log('Jobs E2E - Auth cookie obtained:', authCookie ? 'Yes' : 'No');
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        console.error('Jobs E2E - BeforeAll HTTP Error Status:', axiosError.response?.status);
        console.error('Jobs E2E - BeforeAll HTTP Error Data:', JSON.stringify(axiosError.response?.data, null, 2));
      }
      console.error('Jobs E2E - BeforeAll Full error:', error);
      throw error;
    }
  });

  describe('GraphQL Queries', () => {
    it('should get all jobs when authenticated', async () => {
      const query = `
        query GetJobs {
          jobs {
            name
            description
          }
        }
      `;

      try {
        const res = await axios.post(
          apiUrl,
          {
            query,
          },
          {
            headers: {
              Cookie: authCookie,
            },
          }
        );

        console.log('Get jobs response status:', res.status);
        console.log('Get jobs response data:', JSON.stringify(res.data, null, 2));

        expect(res.status).toBe(200);
        
        if (res.data.errors) {
          console.error('GraphQL errors:', JSON.stringify(res.data.errors, null, 2));
          throw new Error(`GraphQL errors: ${JSON.stringify(res.data.errors)}`);
        }

        expect(res.data.data).toBeDefined();
        expect(res.data.data.jobs).toBeDefined();
        expect(Array.isArray(res.data.data.jobs)).toBe(true);
        expect(res.data.data.jobs.length).toBeGreaterThan(0);
        expect(res.data.data.jobs[0]).toHaveProperty('name');
        expect(res.data.data.jobs[0]).toHaveProperty('description');
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

    it('should filter jobs by name when authenticated', async () => {
      const query = `
        query GetJobs($filter: JobsFilter) {
          jobs(jobsFilter: $filter) {
            name
            description
          }
        }
      `;

      try {
        const res = await axios.post(
          apiUrl,
          {
            query,
            variables: {
              filter: {
                name: 'Fibonacci',
              },
            },
          },
          {
            headers: {
              Cookie: authCookie,
            },
          }
        );

        console.log('Filter jobs response status:', res.status);
        console.log('Filter jobs response data:', JSON.stringify(res.data, null, 2));

        expect(res.status).toBe(200);
        
        if (res.data.errors) {
          console.error('GraphQL errors:', JSON.stringify(res.data.errors, null, 2));
          throw new Error(`GraphQL errors: ${JSON.stringify(res.data.errors)}`);
        }

        expect(res.data.data).toBeDefined();
        expect(res.data.data.jobs).toBeDefined();
        expect(res.data.data.jobs.length).toBe(1);
        expect(res.data.data.jobs[0].name).toBe('Fibonacci');
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

    it('should fail to get jobs without authentication', async () => {
      const query = `
        query GetJobs {
          jobs {
            name
            description
          }
        }
      `;

      try {
        const res = await axios.post(apiUrl, {
          query,
        });
        
        console.log('Unauthenticated get jobs response status:', res.status);
        console.log('Unauthenticated get jobs response data:', JSON.stringify(res.data, null, 2));
        
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

  describe('GraphQL Mutations', () => {
    it('should execute a job when authenticated', async () => {
      const mutation = `
        mutation ExecuteJob($jobName: String!) {
          executeJob(jobName: $jobName) {
            name
            description
          }
        }
      `;

      try {
        const res = await axios.post(
          apiUrl,
          {
            query: mutation,
            variables: {
              jobName: 'Fibonacci',
            },
          },
          {
            headers: {
              Cookie: authCookie,
            },
          }
        );

        console.log('Execute job response status:', res.status);
        console.log('Execute job response data:', JSON.stringify(res.data, null, 2));

        expect(res.status).toBe(200);
        
        if (res.data.errors) {
          console.error('GraphQL errors:', JSON.stringify(res.data.errors, null, 2));
          throw new Error(`GraphQL errors: ${JSON.stringify(res.data.errors)}`);
        }

        expect(res.data.data).toBeDefined();
        expect(res.data.data.executeJob).toBeDefined();
        expect(res.data.data.executeJob.name).toBe('Fibonacci');
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

    it('should fail to execute job without authentication', async () => {
      const mutation = `
        mutation ExecuteJob($jobName: String!) {
          executeJob(jobName: $jobName) {
            name
            description
          }
        }
      `;

      try {
        const res = await axios.post(apiUrl, {
          query: mutation,
          variables: {
            jobName: 'Fibonacci',
          },
        });
        
        console.log('Unauthenticated execute job response status:', res.status);
        console.log('Unauthenticated execute job response data:', JSON.stringify(res.data, null, 2));
        
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

    it('should fail to execute non-existent job', async () => {
      const mutation = `
        mutation ExecuteJob($jobName: String!) {
          executeJob(jobName: $jobName) {
            name
            description
          }
        }
      `;

      try {
        const res = await axios.post(
          apiUrl,
          {
            query: mutation,
            variables: {
              jobName: 'NonExistentJob',
            },
          },
          {
            headers: {
              Cookie: authCookie,
            },
          }
        );
        
        console.log('Non-existent job response status:', res.status);
        console.log('Non-existent job response data:', JSON.stringify(res.data, null, 2));
        
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
