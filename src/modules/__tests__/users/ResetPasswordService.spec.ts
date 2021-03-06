import AppError from '@shared/errors/AppError';
import FakeUserRepository from '@modules/users/repositories/fakes/FakeUserRepository'
import FakeUserTokensRepository from '@modules/users/repositories/fakes/FakeUserTokensRepository';
import ResetPasswordService from '@modules/users/services/ResetPasswordService';
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';

let fakeUserRepository: FakeUserRepository;
let fakeUserTokenRepository: FakeUserTokensRepository;
let fakeHashProvider: FakeHashProvider;
let resetPassword: ResetPasswordService;

describe('ResetPasswordService', () => {
  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeUserTokenRepository = new FakeUserTokensRepository();
    fakeHashProvider = new FakeHashProvider();

    resetPassword = new ResetPasswordService(
      fakeUserRepository,
      fakeUserTokenRepository,
      fakeHashProvider,
    );
  })

  it('should be able to reset password', async () => {
    const user = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'teste@email.com',
      password: '123456',
    })

    const generateHash = jest.spyOn(fakeHashProvider, 'generateHash')

    const { token } = await fakeUserTokenRepository.generate(user.id)

    await resetPassword.execute({
      token,
      password: '123123',
    })

    const updatedUser = await fakeUserRepository.findById(user.id)

    expect(generateHash).toHaveBeenCalledWith('123123')
    expect(updatedUser?.password).toBe('123123')
  })
  it('should not be able to reset the password with an non-existing token', async () => {
    await expect(resetPassword.execute({
      token: 'non-existing-token',
      password: '123123',
    })).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to reset the password with an non-existing user', async () => {
    const { token } = await fakeUserTokenRepository.generate('non-existing-user')

    await expect(resetPassword.execute({
      token,
      password: '123123',
    })).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to reset the password after 2 hours of creating the request', async () => {
    const user = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'teste@email.com',
      password: '123456',
    })

    const { token } = await fakeUserTokenRepository.generate(user.id)

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      const customDate = new Date()

      return customDate.setHours(customDate.getHours() + 3)
    })

    await expect(resetPassword.execute({
      token,
      password: '123123',
    })).rejects.toBeInstanceOf(AppError)
  })
})
