import { CalculationStatus } from '@features/trade/models/calculation-status';

export const defaultCalculationStatus: CalculationStatus = {
  noRoutes: false,
  showSidebar: false,
  activeCalculation: false,
  calculationProgress: {
    total: 0,
    current: 0
  }
};
