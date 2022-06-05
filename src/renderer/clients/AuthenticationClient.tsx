import WithBootedClient from '../lib/WithBootedClient';
import IJwt from '../models/IJwt';
import IJwtEntity from '../models/IJwtEntity';

const storageName = '@user';
let decodedJwt: any;
let rawJwt: IJwt;

interface IState {
  isAuthenticated: boolean;
  user?: IJwt;
  provider: string;
}

class AuthenticationClient extends WithBootedClient {
  state: IState = {
    isAuthenticated: false,
    provider: '',
  };

  async boot() {}

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

    localStorage.setItem(storageName, JSON.stringify(this.state));
  }

  hasRole(rolesToFind: Array<String> | String) {
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
