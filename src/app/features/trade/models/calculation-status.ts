import { CalculationProgress } from '@features/trade/models/calculationProgress';

export interface CalculationStatus {
  noRoutes: boolean;
  showSidebar: boolean;
  activeCalculation: boolean;
  calculationProgress: CalculationProgress;
}
