import React from 'react';
import { Card, Row, Col } from 'antd';
import UsersClient, { IUser } from 'renderer/clients/UsersClient';
import styles from './index.module.scss';
import IJwt from '../../models/IJwt';
import EventStreamer from '../../lib/EventStreamer';
import i18n from '../../lib/i18n';
import locales from './locales';
import AuthenticationClient from '../../clients/AuthenticationClient';

const localize = i18n(locales);

interface IProps {
  onAuthenticated: (jwt: IJwt) => void;
}
interface IState {
  version: string;
  view_mode: 'LOADING' | 'USERS_LIST';
  users?: IUser[];
}

export default class SignInPage extends React.Component<IProps, IState> {
  state: IState = {
    version: process.env.npm_package_version || 'x.x.x',
    view_mode: 'LOADING',
    users: undefined,
  };

  componentDidMount() {
    EventStreamer.on(
      'DEEPLINK:SSO_CALLBACK',
      this.onDeepLinkSSOCallbackHandler
    );

    this.getUsers();
  }

  getUsers = async () => {
    try {
      const users = await UsersClient.getUsers();
      this.setState({
        view_mode: 'USERS_LIST',
        users,
      });
    } catch (ex) {
      console.error(ex);
    }
  };

  onDeepLinkSSOCallbackHandler = async (provider: string, jwt: IJwt) => {
    await AuthenticationClient.authenticate(provider, {
      access_token: jwt.access_token,
      expires_in: jwt.expires_in,
      token_type: jwt.token_type,
    });

    const { onAuthenticated } = this.props;
    onAuthenticated(jwt);
  };

  onAuthenticateHandler = async () => {
    const jwt = {
      access_token:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcmltYXJ5c2lkIjoiNGE0NDEzMTg1NGM4YWU3ZmI3ZTRhNjkxZWRlNmEyMmUiLCJ1bmlxdWVfbmFtZSI6IkRhdmlkIE11w7FveiIsImVtYWlsIjoiZG11bm96Z2FldGVAZ21haWwuY29tIiwiY291bnRyeSI6IkNMIiwiYXZhdGFyIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FBdUU3bUNDalFEQmVJeXFtWkdWS19BMlZMcjZyS2dUdzlnSFRTMk0wTjg0R0E9czk2LWMiLCJncm91cHNpZCI6IlVTRVIiLCJpc3MiOiJTaW5nbGVTaWduT24iLCJ0eXBlIjoiQmVhcmVyIiwiYXVkIjoiV2ViIiwic2NvcGUiOiI3MjU3MjcxOTE1NzE3MjAzNDM3MzQ6b3duZXIgMTUzMTc2NDYxNTczNTcwNTUyMDAwOm93bmVyIDE1MzE3NjQ2MTU3MzU3MDU1MTg0Njpvd25lciA3MjU3MjcxOTE1NzE3MjAzNDM3MzU6b3duZXIgNzE1ODkwODgxNTg0ODE5NjkzNjkyOm93bmVyIDEwMTAxMDEwMTAxMDEwMTAxMDEwMTpvd25lciAxMDEwMTAxMDEwMTAxMDEwMTAxMDE6ZGV2ZWxvcGVyIDEwMTAxMDEwMTAxMDEwMTAxMDEwMTpzaG9wcGVyIDEwMTAxMDEwMTAxMDEwMTAxMDEwMTphcCAxMDEwMTAxMDEwMTAxMDEwMTAxMDE6bGF0IDkxNzI3ODEwMTU4NTc1NjcwMTg2MTpvd25lciA1Nzk3NzY5MjE1ODc1NzU0MTgzOTk6b3duZXIgMTQxNzg5NjQxNTg1NzU2ODY3Mjc5Om93bmVyIDc4ODA4MDQ1MTU4NzU3NTUwMjAyNzpvd25lciA3NzM2OTkzNDE1ODc1NzU1NjE4OTQ6b3duZXIgMjc1MTcwODExNTg3NTc1NjI1NDcwOm93bmVyIDYzNzYxNjA1MTU4NzU3NTY3MDk0MDpvd25lciA1NTIzODMzNzE1ODc1NzUzMTY0NzQ6b3duZXIgMTUzMTc2NDYxNTczNTcwNTUxODEwOm93bmVyIDIwMjAyMDIwMjAyMDIwMjAyMDIwMjpvd25lciIsImlhdCI6MTYwOTg3NjU2NSwiZXhwIjoxNjE3NjUyNTY1fQ.DuvoS5CODHezmOaG2wX10k1Cjt1HBGDCXyqwgn_2jchbQ-SNeTJAP56d-xxRXlNEFx1TW2hnFqFAGs7HHa-rlSg9i939dNiEfCFbJrICdMNdHgk6R5Zd2HD-HiJw1ADImPD1h1_77JyXmaEKE5Cx0hFu1M4yluC09shKqWJW2c4',
      expires_in: 1111,
      token_type: 'Bearer',
    };
    this.onDeepLinkSSOCallbackHandler('local', jwt);
  };

  render_LOADING = () => {
    return (
      <>
        <span>{localize('loading_users')}</span>
      </>
    );
  };

  render_USERS_LIST = () => {
    const { users } = this.state;
    return (
      <>
        {users!.map((user) => {
          return (
            <Col span={4} key={user.id}>
              <Card
                hoverable
                style={{ borderRadius: '10px' }}
                cover={
                  <img
                    alt={user.name}
                    src={user.image}
                    style={{
                      padding: '20px',
                      height: '250px',
                    }}
                  />
                }
              >
                <Card.Meta title={user.name} style={{ textAlign: 'center' }} />
              </Card>
            </Col>
          );
        })}
      </>
    );
  };

  render() {
    const { version, view_mode } = this.state;

    return (
      <div className={styles.page}>
        <Row
          style={{ height: '20%' }}
          className={styles.who_is_there}
          justify="center"
        >
          <span>{localize('who_is_there')}</span>
        </Row>
        <Row style={{ height: '60%' }} justify="space-evenly" align="middle">
          {(() => {
            const customRender: Function = (this as any)[`render_${view_mode}`];
            if (!customRender) {
              return <div>{view_mode}</div>;
            }
            return customRender();
          })()}
        </Row>
        <Row style={{ height: '20%' }}>
          {/* Version */}
          <div className={styles.app_version}>
            <span>v{version}</span>
          </div>
        </Row>
      </div>
    );
  }
}
