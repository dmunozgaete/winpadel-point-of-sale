import React from 'react';
import { Card, Row, Col } from 'antd';
import UsersClient, { IUser } from 'renderer/clients/UsersClient';
import moment from 'moment';
import IJwtEntity from 'renderer/models/IJwtEntity';
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
    await AuthenticationClient.authenticate(provider, jwt);
    const { onAuthenticated } = this.props;
    onAuthenticated(jwt);
  };

  onAuthenticateHandler = async (user: IUser) => {
    // Simulate Jwt Payload
    const payload = [
      Buffer.from(
        JSON.stringify({
          alg: 'RS256',
          typ: 'JWT',
        })
      ).toString('base64url'),
      Buffer.from(
        JSON.stringify({
          primarysid: user.id,
          avatar: user.image,
          unique_name: user.name,
          country: 'CL',
        } as IJwtEntity)
      ).toString('base64url'),
      Buffer.from('signature_dummy').toString('base64url'),
    ].join('.');

    // Simulate Jwt
    const jwt: IJwt = {
      access_token: payload,
      expires_in: moment(new Date()).add(1, 'y').toDate().getTime(),
      token_type: 'Bearer',
    };

    // Simulate "external url Callback"
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
                onClick={() => this.onAuthenticateHandler(user)}
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
