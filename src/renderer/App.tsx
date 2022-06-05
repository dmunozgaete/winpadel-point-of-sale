import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import 'tailwindcss/tailwind.css';

/* Components */
import BootLoader from './components/boot-loader';

/* Clients */
import AuthenticationClient from './clients/AuthenticationClient';
import SettingsClient from './clients/SettingsClient';

/* Core Pages */

import SignInPage from './pages/sign-in';

interface PageState {
  booting: boolean;
  authenticated: boolean;
  is_first_time: boolean;
  app_booting: boolean;
  sidebar_collapsed: boolean;
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

    sidebar_collapsed: false,
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
      sidebar_collapsed: SettingsClient.get('SIDEBAR_COLLAPSED', false),
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

  onToggleSidebarHandler = () => {
    const { sidebar_collapsed } = this.state;
    this.setState({
      sidebar_collapsed: !sidebar_collapsed,
    });

    SettingsClient.set('SIDEBAR_COLLAPSED', !sidebar_collapsed);
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

    // const { sidebar_collapsed } = this.state;
    return (
      <div>
        <div>dwdwdwd</div>
        <Router>
          {/*  <Switch>
          <Route path="/" component={RootHomePage} exact />
          <Route path="/flows" component={FlowReadPage} exact />
          <Route path="/flows/create" component={FlowCreatePage} exact />
          <Route path="/flows/update/:id" component={FlowUpdatePage} exact />
          <Route path="/users" component={UsersReadPage} exact />
        </Switch> */}
        </Router>
      </div>
    );
  }
}
