import IUserTokensRepository from '@modules/users/repositories/IUserTokenRepository';
import { v4 as uuid } from 'uuid';
import UserToken from '@modules/users/infra/typeorm/entities/UserToken';

class FakeUserTokensRepository
implements IUserTokensRepository {
  private userTokens: UserToken[] = []

  public async generate(user_id: string): Promise<UserToken> {
    const userToken = new UserToken();

    Object.assign(userToken, {
      id: uuid(),
      token: uuid(),
      user_id,
    })

    this.userTokens.push(userToken);

    return userToken
  }
}

export default FakeUserTokensRepository;