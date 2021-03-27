import { AppProps } from 'next/app';

// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

// local styles
import '@/styles/index.css';
import '@/styles/array-element.css';

function App({ Component, pageProps }: AppProps): React.ReactNode {
  return <Component {...pageProps} />
}

export default App;