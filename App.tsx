import { ExpoRoot } from 'expo-router';

export function App() {
  // @ts-expect-error — require.context lo provee Metro en runtime; TS no lo tipa
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

export default App;
