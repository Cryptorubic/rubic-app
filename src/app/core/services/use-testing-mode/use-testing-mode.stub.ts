import { BehaviorSubject } from 'rxjs';

export const useTestingModeStub = () => ({
  isTestingMode: new BehaviorSubject<boolean>(true)
});
