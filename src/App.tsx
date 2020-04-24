import { Box, Main } from "grommet";
import NetlifyIdentityWidget from "netlify-identity-widget";
import React from "react";
import { useIdentityContext } from "react-netlify-identity";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Calculators from "./pages/Calculators";
import Home from "./pages/Home";
import { LogIn } from "./pages/Login";
import Profile from "./pages/Profile";

const AppContainer = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
`;
function App() {
  const { isLoggedIn } = useIdentityContext();
  if (
    !isLoggedIn &&
    window.location.hostname !== "superpowercalculator.com" && window.location.hostname !== "localhost"
  ) {
    return <LogIn />;
  } else {
    NetlifyIdentityWidget.close();
  }
  return (
    <Main>
      <Router>
        <AppContainer>
          <Header />
          <Box pad={{ horizontal: "medium", bottom: "medium " }}>
            <Switch>
              <Route path="/profile" component={Profile} />
              <Route path="/calculators" component={Calculators} />
              <Route path="/" component={Home} />
            </Switch>
          </Box>
          <Footer />
        </AppContainer>
      </Router>
    </Main>
  );
}

export default App;
