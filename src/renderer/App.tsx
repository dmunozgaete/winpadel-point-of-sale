import React from 'react';

import 'antd/dist/antd.css';

/* Components */
import BootLoader from './components/boot-loader';

/* Clients */
import AuthenticationClient from './clients/AuthenticationClient';
import SettingsClient from './clients/SettingsClient';

/* Core Pages */
import SignInPage from './pages/sign-in';
import LayoutPage from './pages/layout';

interface PageState {
  booting: boolean;
  authenticated: boolean;
  is_first_time: boolean;
  app_booting: boolean;
}

export default class App extends React.Component<{}, PageState> {
  state: PageState = {
    booting: true,
    authenticated: false,
    // If is the first time, we need to launch the onboarding page
    is_first_time: false,
    // Just for pre-boot SettingsClient that we really need
    // before other clients
    app_booting: true,
  };

  componentDidMount() {
    this.startHandler();
  }

  startHandler = async () => {
    // We need this client booted before the main boot loader
    await SettingsClient.boot();
    await AuthenticationClient.boot();

    this.setState({
      app_booting: false,
      is_first_time: SettingsClient.get('FIRST_TIME', false),
      authenticated: AuthenticationClient.isAuthenticated(),
    });
  };

  onBootCompleteHandler = () => {
    this.setState({
      booting: false,
    });
  };

  onAuthenticatedHandler = () => {
    this.setState({
      authenticated: true,
    });
  };

  onBoardingCompletedHandler = () => {
    this.setState({
      is_first_time: SettingsClient.get('FIRST_TIME', true),
    });
  };

  render() {
    const { app_booting, booting, authenticated, is_first_time } = this.state;

    if (app_booting) {
      return <div />;
    }

    if (is_first_time) {
      return <div />;
    }

    if (booting) {
      return <BootLoader onLoadComplete={this.onBootCompleteHandler} />;
    }

    if (!authenticated) {
      return <SignInPage onAuthenticated={this.onAuthenticatedHandler} />;
    }

    return <LayoutPage />;
  }
}
