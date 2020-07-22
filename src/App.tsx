import * as querystring from 'querystring';
import * as React from 'react';
import { render } from 'react-dom';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { Header, Menu, Modal, Popover, Breadcrumbs } from './components';
import {
  MenuContextProvider,
  ModalContextProvider,
  PageContextProvider,
  PopoverContextProvider,
  BreadcrumbsContextProvider
} from './contexts';

import { decodeToken } from './utils';
import { DocumentsRoute, HomeRoute, LogoutRoute, UploadRoute } from './routes';
import { redirectToLogin } from './utils';

import styles from './App.scss';

const App: React.FunctionComponent = () => {
  const query: {
    token?: string;
    blockstackSession?: string;
    uPortSession?: string;
  } = querystring.parse(location.search.substr(1));

  if (query.blockstackSession) {
    localStorage.setItem('blockstack-session', atob(query.blockstackSession));
  }
  if (query.uPortSession) {
    localStorage.setItem('connectState', atob(query.uPortSession));
  }
  if (query.token) {
    sessionStorage.setItem('token', query.token);
  }
  
  if (
    !localStorage.getItem('blockstack-session')
    &&
    !localStorage.getItem('connectState')
    &&
    !sessionStorage.getItem('token')
  ) {
    redirectToLogin();
    return;
  }

  if (!localStorage.getItem('blockstack-session') && !localStorage.getItem('connectState')) {
    const decodedToken = decodeToken(sessionStorage.getItem('token'));

    if (
      !decodedToken.capabilities.find(
        c =>
          (c.name === 'admin' && c.target === null) ||
          (c.name === 'use' && c.target === process.env.CLIENT_ID)
      )
        && !localStorage.getItem('uport-session')
    ) {
      window.location.href = `${process.env.AUTH_UI_GATEWAY_URL}/unauthorized`;
      return;
    }
  }

  return (
    <>
      <Helmet
        title="Home"
        titleTemplate={`%s | ${process.env.DOC_UI_UPLOADER_TITLE}`}
      />
      <Router basename={process.env.PUBLIC_URL}>
        <Header />
        <div className={styles.container}>
          <Menu />
          <div className={styles.content}>
            <Breadcrumbs />
            <Switch>
              <Route path="/" component={HomeRoute} exact />
              <Route path="/documents" component={DocumentsRoute} exact />
              <Route path="/logout" component={LogoutRoute} exact />
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
