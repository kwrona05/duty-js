import { useState } from "react";
import DutyScheduler from "./components/AppCopy";
import LogginScreen from "./components/Loggin";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return isLoggedIn ? (
    <DutyScheduler />
  ) : (
    <LogginScreen onLogin={() => setIsLoggedIn(true)} />
  );
};

export default App;
