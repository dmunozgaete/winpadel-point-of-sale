import WithBootedClient from '../lib/WithBootedClient';
import IJwt from '../models/IJwt';
import IJwtEntity from '../models/IJwtEntity';

const storageName = '@user';
let decodedJwt: IJwtEntity;
let rawJwt: IJwt;

export async function getAuthFromCache() {
  const cacheAuth = await localStorage.getItem(storageName);
  if (cacheAuth) {
    return JSON.parse(cacheAuth!);
  }
  return null;
}

interface IState {
  isAuthenticated: boolean;
  user?: IJwt;
  provider: string;
}

export class AuthenticationClient extends WithBootedClient {
  state: IState = {
    isAuthenticated: false,
    provider: '',
  };

  async boot() {
    const newState = await getAuthFromCache();
    if (newState) {
      this.setState(newState);
      rawJwt = newState.user;
      // decodedJwt = jwt.decode(rawJwt.access_token);

      // Simulate decoding
      const payload = Buffer.from(
        rawJwt.access_token.split('.')[1],
        'base64url'
      ).toString('utf8');
      decodedJwt = JSON.parse(payload);
    }
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  getInfo(): IJwtEntity {
    return decodedJwt;
  }

  getAuth(): IJwt {
    return rawJwt;
  }

  async authenticate(provider: string, jwt: IJwt) {
    // Set User Login OK!
    await this.setState({
      isAuthenticated: true,
      user: jwt,
      provider,
    });

    // Simulate decoding
    const payload = Buffer.from(
      jwt.access_token.split('.')[1],
      'base64url'
    ).toString('utf8');
    decodedJwt = JSON.parse(payload);

    // Persist
    // localStorage.setItem(storageName, JSON.stringify(this.state));
  }

  hasRole(rolesToFind: Array<string> | string) {
    const rolesForCheck = Array.isArray(rolesToFind)
      ? rolesToFind
      : [rolesToFind];
    for (let index = 0; index < rolesForCheck.length; index += 1) {
      const roleToCheck = rolesForCheck[index];
      if (decodedJwt.scope.indexOf(roleToCheck) >= 0) {
        return true;
      }
    }
    return false;
  }

  async signOut() {
    await this.setState({
      isAuthenticated: false,
      user: undefined,
      provider: '',
    });
    localStorage.removeItem(storageName);
  }

  async setState(newState: IState): Promise<void> {
    this.state = newState;
  }
}

export default new AuthenticationClient();
