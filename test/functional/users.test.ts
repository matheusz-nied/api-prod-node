import { User } from '@src/models/user';

describe('Users functional tests', () => {
    beforeEach(async () => {
        await User.deleteMany();
    });
    describe('When creating a new user', () => {
        it('should successfully create a new user', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234',
            };
            const response = await global.testRequest
                .post('/users')
                .send(newUser);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining(newUser));
        });

        it('should return 400 when there is a validation error', async () => {
            const newUser = {
                // name field is missing here
                email: 'john@mail.com',
                password: '1234',
            };
            const response = await global.testRequest
                .post('/users')
                .send(newUser);
            expect(response.status).toBe(422);
            // you can also check for specific error message if your API returns it
            expect(response.body).toEqual({
                code: 422,
                error: 'User validation failed: name: Path `name` is required.',
            });
        });

        it('should return 409 when the email alread exists', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234',
            };
            await global.testRequest
                .post('/users')
                .send(newUser);
            const response = await global.testRequest
                .post('/users')
                .send(newUser);
            expect(response.status).toBe(409);
            // you can also check for specific error message if your API returns it
            expect(response.body).toEqual({
                code: 409,
                error: 'User validation failed: email: already exists in the database.',
            });
        });
    });
});
