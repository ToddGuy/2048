import React from 'react';

import Layout from "./hoc/Layout/Layout";
import Game from "./containers/Game/Game";

function App() {
  return (
      <Layout>
        <Game />
      </Layout>
  );
}

export default App;
