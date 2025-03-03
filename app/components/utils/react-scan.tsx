import { scan } from 'react-scan';

export const reactScan = () =>
  import.meta.env.PROD
    ? undefined
    : scan({
        enabled: import.meta.env.VITE_ENABLE_REACT_SCAN === 'true',
      });
