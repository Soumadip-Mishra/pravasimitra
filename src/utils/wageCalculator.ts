import type { DisputeDetails, StatutoryClaim } from '../types';
import { HOST_STATES } from '../constants/languages';

export function calculateStatutoryClaim(details: DisputeDetails): StatutoryClaim {
  const hostState = HOST_STATES.find(s => s.id === details.hostState) || HOST_STATES[0];
  const statutoryMinWage = hostState.statutoryMinWagePerDay;

  const daysWorked = Math.max(0, details.daysWorked || 0);
  const agreedDailyWage = Math.max(0, details.agreedDailyWage || 0);
  const advancesPaid = Math.max(0, details.advancesReceived || 0);
  const overtimeHours = Math.max(0, details.overtimeHours || 0);

  const totalAgreedWages = daysWorked * agreedDailyWage;
  const unpaidPrincipal = Math.max(0, totalAgreedWages - advancesPaid);

  // Minimum Wage Shortfall: If agreed rate is lower than statutory minimum wage
  const minWageShortfall = agreedDailyWage < statutoryMinWage
    ? (statutoryMinWage - agreedDailyWage) * daysWorked
    : 0;

  // Overtime Pay: 2x hourly wage for hours worked beyond 8 hours per day
  const hourlyRate = (agreedDailyWage > 0 ? agreedDailyWage : statutoryMinWage) / 8;
  const overtimePay = Math.round(overtimeHours * (hourlyRate * 2));

  // Displacement Allowance (Section 14 of Inter-State Migrant Workmen Act, 1979)
  // Mandates 50% of monthly wages or Rs 75, whichever is higher, payable at recruitment
  const estimatedMonthlyWage = (agreedDailyWage > 0 ? agreedDailyWage : statutoryMinWage) * 26;
  const displacementAllowance = Math.round(estimatedMonthlyWage * 0.5);

  // Journey Allowance (Section 15 of Inter-State Migrant Workmen Act, 1979)
  // Mandates fare from home state to host state and return, plus wages during travel
  const journeyAllowance = 3500; // Standard inter-state train sleeper transit + 3 days travel wages

  // Statutory Compensation Multiplier under Section 15(3) of Payment of Wages Act, 1936
  const statutoryCompensationMultiplier = 1; // 1x principal claim for standard petition

  const totalStatutoryClaim = unpaidPrincipal + minWageShortfall + overtimePay + displacementAllowance + journeyAllowance;

  const violatedActs = [
    {
      act: 'Payment of Wages Act, 1936',
      section: 'Section 5 & Section 15(2)',
      description: 'Failure to disburse earned wages within 7 to 10 days of wage period completion and unlawful withholding.',
    },
    {
      act: 'Inter-State Migrant Workmen (RECS) Act, 1979',
      section: 'Section 14 & Section 15',
      description: 'Non-payment of mandatory Displacement Allowance (50% monthly wage) and Journey Allowance with transit wages.',
    },
    {
      act: 'Inter-State Migrant Workmen (RECS) Act, 1979',
      section: 'Section 16 & Section 21',
      description: 'Liability of Principal Employer to disburse unpaid wages in case contractor fails or absconds.',
    },
    {
      act: 'Minimum Wages Act, 1948',
      section: 'Section 12 & Section 20',
      description: `Payment below statutory floor rate of Rs ${statutoryMinWage}/day prescribed for scheduled employment in ${hostState.name}.`,
    },
    {
      act: 'Building and Other Construction Workers (BOCW) Act, 1996',
      section: 'Section 44 & Section 45',
      description: 'Failure to maintain formal register of employment, overtime records, and welfare cess provisions.',
    },
  ];

  return {
    daysWorked,
    agreedDailyWage,
    totalAgreedWages,
    advancesPaid,
    unpaidPrincipal,
    statutoryMinWage,
    minWageShortfall,
    overtimeHours,
    overtimePay,
    displacementAllowance,
    journeyAllowance,
    statutoryCompensationMultiplier,
    totalStatutoryClaim,
    violatedActs,
  };
}
