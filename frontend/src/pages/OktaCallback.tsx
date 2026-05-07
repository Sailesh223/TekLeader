import { LoginCallback } from '@okta/okta-react';

const OktaCallback = () => {
  return <LoginCallback loadingElement={<div>Loading...</div>} />;
};

export default OktaCallback;
