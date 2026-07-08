import { RouterProvider } from 'react-router-dom';
import { Providers } from './app/providers';
import { router } from './app/routes';
import { validateConfig } from './config/env';

// Validate settings at startup
validateConfig();

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}

export default App;
