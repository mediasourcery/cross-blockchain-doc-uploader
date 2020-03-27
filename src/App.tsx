import * as querystring from 'querystring';
import * as React from 'react';
import { render } from 'react-dom';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import { Header, Menu, Modal, Popover, Breadcrumbs } from './components';
import {
  MenuContextProvider,
  ModalContextProvider,
  PageContextProvider,
  PopoverContextProvider,
  BreadcrumbsContextProvider
} from './contexts';

import { DocumentsRoute, HomeRoute, UploadRoute } from './routes';

import { decodeToken } from './utils';

import styles from './App.scss';

const App: React.FunctionComponent = () => {
  const query: {
    token?: string;
  } = querystring.parse(location.search.substr(1));

  if (query.token) {
    sessionStorage.setItem('token', query.token);
  } else if (!sessionStorage.getItem('token')) {
    window.location.href = `${process.env.AUTH_UI_AUTHORIZE_URL}?client_id=${process.env.DOC_UI_UPLOADER_CLIENT_ID}&redirect_uri=${location.pathname}${location.search}`;
  }

  const decodedToken = decodeToken(sessionStorage.getItem('token'));
  if (!decodedToken.capabilities.find(c => c.name === 'admin')) {
    window.location.href = `${process.env.AUTH_UI_AUTHORIZE_URL}/unauthorized`;
    return;
  }

  return (
    <>
      <Router basename={process.env.PUBLIC_URL}>
        <Header />
        <div className={styles.container}>
          <Menu />
          <div className={styles.content}>
            <Breadcrumbs />

            <Switch>
              <Route path="/" component={HomeRoute} exact />
              <Route path="/documents" component={DocumentsRoute} exact />
              <Route path="/upload" component={UploadRoute} exact />
            </Switch>
          </div>
        </div>
        <Popover />
      </Router>
      <Modal />
    </>
  );
};

export const AppProviders: React.SFC = ({ children }) => (
  <MenuContextProvider>
    <ModalContextProvider>
      <PageContextProvider>
        <BreadcrumbsContextProvider>
          <PopoverContextProvider>{children}</PopoverContextProvider>
        </BreadcrumbsContextProvider>
      </PageContextProvider>
    </ModalContextProvider>
  </MenuContextProvider>
);

render(
  <AppProviders>
    <App />
  </AppProviders>,
  document.getElementById('root')
);
