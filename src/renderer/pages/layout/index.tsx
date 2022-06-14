import React from 'react';
import { Popover, Layout } from 'antd';
import {
  ShopOutlined,
  LogoutOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import ConfigLoaderJob from 'renderer/jobs/ConfigLoaderJob';

/* Core Pages */
import PointOfSalePage from 'renderer/pages/point-of-sale';
import AnalyticsPage from 'renderer/pages/analytics';

import i18n from 'renderer/lib/i18n';
import AuthenticationClient from 'renderer/clients/AuthenticationClient';
import styles from './index.module.css';

import locales from './locales';

const localize = i18n(locales);

interface IRoute {
  icon: React.ReactElement;
  route: string;
  label: string;
  selected: boolean;
}

interface IState {
  routes: IRoute[];
}

export default class LayoutPage extends React.Component<{}, IState> {
  state: IState = {
    routes: [
      {
        icon: <ShopOutlined />,
        route: '',
        label: 'checkout',
        selected: true,
      },
      {
        icon: <PieChartOutlined />,
        route: '/analytics',
        label: 'analytics',
        selected: false,
      },
    ],
  };

  componentDidMount() {}

  onNavigateToHandler = async (selectedRoute: IRoute) => {
    const { routes } = this.state;

    routes.forEach((route) => {
      route.selected = route === selectedRoute;
    });

    this.setState({
      routes,
    });
  };

  onCloseSessionHandler = async () => {
    AuthenticationClient.signOut();

    const url = window.location.href;
    window.location.href = url.substring(0, url.indexOf('.html') + 5);
  };

  render() {
    const { routes } = this.state;
    return (
      <Router>
        <Layout style={{ height: '100%' }}>
          <Layout.Sider className={styles.layout__sider} width={72}>
            <Layout.Content className={styles.layout_sider__content}>
              <div className={styles.layout__sider__header}>
                <img
                  src={ConfigLoaderJob.resolveUrl('assets/logo.png')}
                  alt="logo"
                />
              </div>
              <div className={styles.layout__sider__buttons}>
                {routes.map((route) => {
                  const classesToAdd = [styles.layout__sider__buttons__button];

                  if (route.selected) {
                    classesToAdd.push(
                      styles['layout__sider__buttons__button--selected']
                    );
                  }

                  return (
                    <Popover
                      key={route.label}
                      placement="right"
                      content={localize(route.label)}
                      trigger="hover"
                    >
                      <NavLink
                        onClick={() => this.onNavigateToHandler(route)}
                        to={route.route}
                        className={classesToAdd.join(' ')}
                      >
                        {route.icon}
                      </NavLink>
                    </Popover>
                  );
                })}
              </div>
            </Layout.Content>
            <Layout.Footer className={styles.layout__sider__footer}>
              <Popover
                placement="right"
                content={localize('close_session')}
                trigger="hover"
              >
                <LogoutOutlined onClick={() => this.onCloseSessionHandler()} />
              </Popover>
            </Layout.Footer>
          </Layout.Sider>
          <Layout>
            <Layout.Content>
              <Routes>
                <Route path="" element={<PointOfSalePage />}>
                  <Route path="test/:id" element={<div>test</div>} />
                </Route>
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Routes>
              {/*  <Switch>
                    <Route path="/" component={RootHomePage} exact />
                    <Route path="/flows" component={FlowReadPage} exact />
                    <Route path="/flows/create" component={FlowCreatePage} exact />
                    <Route path="/flows/update/:id" component={FlowUpdatePage} exact />
                    <Route path="/users" component={UsersReadPage} exact />
                  </Switch> */}
            </Layout.Content>
          </Layout>
        </Layout>
      </Router>
    );
  }
}
