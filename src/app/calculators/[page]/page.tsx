import BusinessLoanCalculator from '@/components/calculators/business-cal';
import CAGRCalculator from '@/components/calculators/cagr-cal';
import CapitalGainsCalculator from '@/components/calculators/cp-gain';
import DiscountCalculator from '@/components/calculators/discount-cal';
import EMICalculatorGlobal from '@/components/calculators/emi-calculator';
import FDCalculator from '@/components/calculators/fd-cal';
import InflationCalculator from '@/components/calculators/Inflation-cal';
import LoanPrepaymentCalculator from '@/components/calculators/loan-repayment';
import NPSCalculator from '@/components/calculators/nps-cal';
import PPFCalculator from '@/components/calculators/ppf-cal';
import ProfitMarginCalculator from '@/components/calculators/profit-margin';
import RDCalculator from '@/components/calculators/rd-cal';
import ReceiptGenerator from '@/components/calculators/receipt-generator';
import SIPCalculator from '@/components/calculators/sip-cal';
import SWPCalculator from '@/components/calculators/swp-cal';
import VendorPaymentTracker from '@/components/calculators/vender-payment';
import MutualFundCalculator from '@/components/calculators/mutual-fund';
import ProfitLossCalculator from '@/components/calculators/profit-loss';
import ROICalculator from '@/components/calculators/roi-cal';
import TaxSavingCalculator from '@/components/calculators/tax-saving';
import BrokerageCalculator from '@/components/calculators/brokerage';
import InventoryManagementTool from '@/components/calculators/inventory-management';
import { ComponentType } from 'react';
import SimpleInterestCalculator from '@/components/calculators/simple-cal';
import BreakEvenCalculator from '@/components/calculators/Break-even';
import CompoundInterestCalculator from '@/components/calculators/compound-interest';
import StockAverageCalculator from '@/components/calculators/stock-avg';
import IntradayPnLCalculator from '@/components/calculators/intraday-cal';
import { getMetaCached } from '@/actions/dbAction';
import { Metadata } from 'next';
const componentMap: Record<string, ComponentType> = {
  'emi-calculator': EMICalculatorGlobal,
  'simple-interest': SimpleInterestCalculator,
  'compound-interest': CompoundInterestCalculator,
  'sip-calculator': SIPCalculator,
  'swp-calculator': SWPCalculator,
  'fd-calculator': FDCalculator,
  'rd-calculator': RDCalculator,
  'ppf-calculator': PPFCalculator,
  'nps-calculator': NPSCalculator,
  'inflation-calculator': InflationCalculator,
  'roi-calculator': ROICalculator,
  'cagr-calculator': CAGRCalculator,
  'discount-calculator': DiscountCalculator,
  'profit-loss': ProfitLossCalculator,
  'break-even': BreakEvenCalculator,
  'loan-prepayment': LoanPrepaymentCalculator,
  'tax-saving': TaxSavingCalculator,
  'capital-gains': CapitalGainsCalculator,
  brokerage: BrokerageCalculator,
  'intraday-profit': IntradayPnLCalculator,
  'stock-average': StockAverageCalculator,
  'mutual-fund': MutualFundCalculator,
  inventory: InventoryManagementTool,
  'receipt-generator': ReceiptGenerator,
  'sales-tax': TaxSavingCalculator,
  'profit-margin': ProfitMarginCalculator,
  'business-loan': BusinessLoanCalculator,
  'vendor-payment': VendorPaymentTracker,
};
interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;

  const data = await getMetaCached(page);

  return {
    title: data?.title || 'Ai Calculator Tool Online',
    description:
      data?.description ||
      'Free online Ai Calculator tool to convert and transform data instantly.',
    keywords: data?.keywords || 'ai calculator , ai tools , ai online tools',
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${page}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;

  const Component = componentMap[page];

  if (!Component) {
    return (
      <div className="text-center p-10 text-red-500">
        Tool Not Found ❌ <br />
        <span className="text-sm text-gray-400">Slug: {page}</span>
      </div>
    );
  }

  return <Component />;
}
