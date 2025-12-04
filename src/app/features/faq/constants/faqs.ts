export interface FaqItem {
  title: string;
  body: string;
}

export const FAQS: FaqItem[] = [
  {
    title: 'What makes ClearSwap a simple way to swap private tokens and other assets?',
    body: 'ClearSwap simplifies routing by aggregating multiple paths and selecting optimal routes. The interface stays clean and minimal – you choose the assets, confirm the swap, and the system handles the process.'
  },
  {
    title: 'What makes ClearSwap “clean” and safer compared to other exchanges?',
    body: '“Clean” means no extra layers, no data collection, and no unnecessary control. We do not hold funds, collect personal information, or track wallet addresses – routes stay transparent, direct, and safe.'
  },
  {
    title:
      'Why are ClearSwap’s algorithms more accurate and more transparent than those on other platforms?',
    body: 'We evaluate multiple liquidity sources, remove inefficient or risky paths, and keep only reliable routes. This provides a predictable, transparent swap experience without hidden steps or fees.'
  },
  {
    title: 'How does ClearSwap achieve optimal rates for private tokens?',
    body: 'ClearSwap compares routes across DEXs, bridges, exchanges, and private networks, evaluating liquidity, fees, and execution speed. We find better prices even when they are not visible on individual platforms.'
  },
  {
    title: 'Does ClearSwap store my funds or data?',
    body: 'No. ClearSwap is fully non-custodial – we do not hold assets, require KYC, or record user activity. Even our technical analytics uses no identifiers, so swaps leave no data traces.'
  }
];
