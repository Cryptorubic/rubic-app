import { BehaviorSubject } from 'rxjs';

export const useTestingModeStub = () => ({
  // eslint-disable-next-line rxjs/finnish
  isTestingMode: new BehaviorSubject<boolean>(true)
});
