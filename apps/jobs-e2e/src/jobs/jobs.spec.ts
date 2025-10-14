import axios from 'axios';

describe('Jobs E2E Tests', () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  const apiUrl = `${baseUrl}/api/graphql`;
  
  // For auth, we'll need to get a token from auth service
  const authBaseUrl = process.env.AUTH_BASE_URL || 'http://localhost:3000';
  const authApiUrl = `${authBaseUrl}/api/graphql`;

  let authCookie: string;

  beforeAll(async () => {
    // Create a test user and login to get auth cookie
    const testEmail = `test-jobs-${Date.now()}@example.com`;
    const testPassword = 'password123';

    // Create user
    const createMutation = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(createUserInput: $input) {
          id
          email
        }
      }
    `;

    await axios.post(authApiUrl, {
      query: createMutation,
      variables: {
        input: {
          email: testEmail,
          password: testPassword,
        },
      },
    });

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

    authCookie = loginRes.headers['set-cookie']?.[0] || '';
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

      expect(res.status).toBe(200);
      expect(res.data.data.jobs).toBeDefined();
      expect(Array.isArray(res.data.data.jobs)).toBe(true);
      expect(res.data.data.jobs.length).toBeGreaterThan(0);
      expect(res.data.data.jobs[0]).toHaveProperty('name');
      expect(res.data.data.jobs[0]).toHaveProperty('description');
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

      expect(res.status).toBe(200);
      expect(res.data.data.jobs).toBeDefined();
      expect(res.data.data.jobs.length).toBe(1);
      expect(res.data.data.jobs[0].name).toBe('Fibonacci');
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
        await axios.post(apiUrl, {
          query,
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(200);
        expect(error.response.data.errors).toBeDefined();
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

      expect(res.status).toBe(200);
      expect(res.data.data.executeJob).toBeDefined();
      expect(res.data.data.executeJob.name).toBe('Fibonacci');
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
        await axios.post(apiUrl, {
          query: mutation,
          variables: {
            jobName: 'Fibonacci',
          },
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(200);
        expect(error.response.data.errors).toBeDefined();
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
        await axios.post(
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
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(200);
        expect(error.response.data.errors).toBeDefined();
      }
    });
  });
});
