/**
 * Tests for calculators.js
 * Run with: npm test
 * Coverage: npx jest --coverage
 */

// Mock DOM for browser-based functions
global.document = {
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  addEventListener: jest.fn(),
  readyState: 'complete'
};
global.window = {
  adsbygoogle: []
};

// Load the calculators
require('./calculators.js');

describe('ToolsHubUtils', () => {
  describe('fmt', () => {
    test('formats numbers with default 2 decimals', () => {
      expect(window.ToolsHubUtils.fmt(1234.567)).toBe('1,234.57');
    });

    test('formats numbers with custom decimals', () => {
      expect(window.ToolsHubUtils.fmt(1234.567, 4)).toBe('1,234.5670');
    });

    test('returns N/A for NaN', () => {
      expect(window.ToolsHubUtils.fmt(NaN)).toBe('N/A');
    });

    test('returns N/A for Infinity', () => {
      expect(window.ToolsHubUtils.fmt(Infinity)).toBe('N/A');
    });

    test('returns N/A for -Infinity', () => {
      expect(window.ToolsHubUtils.fmt(-Infinity)).toBe('N/A');
    });

    test('formats zero correctly', () => {
      expect(window.ToolsHubUtils.fmt(0)).toBe('0.00');
    });

    test('formats negative numbers', () => {
      expect(window.ToolsHubUtils.fmt(-1234.5)).toBe('-1,234.50');
    });
  });

  describe('fmtUnit', () => {
    test('trims trailing zeros — round number shows no decimals', () => {
      expect(window.ToolsHubUtils.fmtUnit(100)).toBe('100');
    });

    test('trims trailing zeros — 62.1371 shows as-is', () => {
      expect(window.ToolsHubUtils.fmtUnit(62.1371)).toBe('62.1371');
    });

    test('does not exceed maxDec decimal places', () => {
      expect(window.ToolsHubUtils.fmtUnit(62.13710000001, 4)).toBe('62.1371');
    });

    test('respects custom maxDec of 2 and trims zeros', () => {
      expect(window.ToolsHubUtils.fmtUnit(32, 2)).toBe('32');
    });

    test('respects custom maxDec of 2 with decimals', () => {
      expect(window.ToolsHubUtils.fmtUnit(37.78, 2)).toBe('37.78');
    });

    test('returns N/A for NaN', () => {
      expect(window.ToolsHubUtils.fmtUnit(NaN)).toBe('N/A');
    });

    test('returns N/A for Infinity', () => {
      expect(window.ToolsHubUtils.fmtUnit(Infinity)).toBe('N/A');
    });
  });

  describe('fmtCurrency', () => {
    test('formats currency with $', () => {
      expect(window.ToolsHubUtils.fmtCurrency(1234.567)).toBe('$1,234.57');
    });

    test('returns N/A for NaN', () => {
      expect(window.ToolsHubUtils.fmtCurrency(NaN)).toBe('N/A');
    });

    test('returns N/A for Infinity', () => {
      expect(window.ToolsHubUtils.fmtCurrency(Infinity)).toBe('N/A');
    });

    test('formats zero as $0.00', () => {
      expect(window.ToolsHubUtils.fmtCurrency(0)).toBe('$0.00');
    });
  });
});

describe('calculateLoan', () => {
  test('calculates loan correctly for standard inputs', () => {
    const result = window.calculateLoan(100000, 5, 30);
    expect(result).not.toBeNull();
    expect(result.monthly).toBeCloseTo(536.82, 2);
    expect(result.totalPayment).toBeCloseTo(193255.78, 2);
    expect(result.totalInterest).toBeCloseTo(93255.78, 2);
    expect(result.months).toBe(360);
  });

  test('returns null for zero principal', () => {
    expect(window.calculateLoan(0, 5, 30)).toBeNull();
  });

  test('returns null for zero rate', () => {
    expect(window.calculateLoan(100000, 0, 30)).toBeNull();
  });

  test('returns null for zero years', () => {
    expect(window.calculateLoan(100000, 5, 0)).toBeNull();
  });

  test('returns null for negative principal', () => {
    expect(window.calculateLoan(-1000, 5, 30)).toBeNull();
  });

  test('returns null for null inputs', () => {
    expect(window.calculateLoan(null, 5, 30)).toBeNull();
  });

  test('calculates 15-year loan correctly', () => {
    const result = window.calculateLoan(200000, 4, 15);
    expect(result).not.toBeNull();
    expect(result.months).toBe(180);
    expect(result.monthly).toBeCloseTo(1479.38, 2);
  });

  test('principal percentage plus interest percentage equals 100', () => {
    const result = window.calculateLoan(100000, 5, 30);
    expect(result.principalPct + result.interestPct).toBe(100);
  });
});

describe('calculateCreditCard', () => {
  test('calculates credit card payoff correctly', () => {
    const result = window.calculateCreditCard(5000, 18, 200);
    expect(result.monthlyInterest).toBeCloseTo(75, 2);
    expect(result.months).toBeGreaterThan(0);
    expect(result.principalPaid).toBeCloseTo(125, 2);
  });

  test('returns zero values for zero balance', () => {
    const result = window.calculateCreditCard(0, 18, 200);
    expect(result.monthlyInterest).toBe(0);
    expect(result.months).toBe(0);
  });

  test('returns Infinity for insufficient payment', () => {
    const result = window.calculateCreditCard(5000, 18, 50);
    expect(result.error).toBe('insufficient_payment');
    expect(result.months).toBe(Infinity);
  });

  test('handles single payment payoff', () => {
    const result = window.calculateCreditCard(500, 18, 600);
    expect(result.months).toBe(1);
    expect(result.principalPaid).toBe(500);
  });

  test('returns payoff date as Date object', () => {
    const result = window.calculateCreditCard(1000, 15, 100);
    expect(result.payoffDate).toBeInstanceOf(Date);
  });

  test('handles 0% APR', () => {
    const result = window.calculateCreditCard(1000, 0, 100);
    expect(result.monthlyInterest).toBe(0);
  });
});

describe('calculateCompoundInterest', () => {
  test('calculates compound interest correctly', () => {
    const result = window.calculateCompoundInterest(1000, 5, 12, 10);
    expect(result.finalAmount).toBeCloseTo(1647.01, 2);
    expect(result.interestEarned).toBeCloseTo(647.01, 2);
  });

  test('returns null for invalid principal', () => {
    expect(window.calculateCompoundInterest(-100, 5, 12, 10)).toBeNull();
  });

  test('returns null for invalid rate', () => {
    expect(window.calculateCompoundInterest(1000, -5, 12, 10)).toBeNull();
  });

  test('returns null for zero frequency', () => {
    expect(window.calculateCompoundInterest(1000, 5, 0, 10)).toBeNull();
  });

  test('returns null for zero years', () => {
    expect(window.calculateCompoundInterest(1000, 5, 12, 0)).toBeNull();
  });

  test('calculates Rule of 72 correctly', () => {
    const result = window.calculateCompoundInterest(1000, 6, 1, 12);
    expect(result.rule72).toBe('12.0');
  });

  test('returns null rule72 for 0% rate', () => {
    const result = window.calculateCompoundInterest(1000, 0, 12, 10);
    expect(result.rule72).toBeNull();
  });

  test('percentages sum to 100', () => {
    const result = window.calculateCompoundInterest(1000, 5, 12, 10);
    expect(result.principalPct + result.interestPct).toBe(100);
  });

  test('handles annual compounding', () => {
    const annual = window.calculateCompoundInterest(1000, 10, 1, 1);
    const monthly = window.calculateCompoundInterest(1000, 10, 12, 1);
    expect(monthly.finalAmount).toBeGreaterThan(annual.finalAmount);
  });
});

describe('calculateSalary', () => {
  test('calculates salary breakdown correctly with defaults', () => {
    const result = window.calculateSalary(52000);
    expect(result.hourly).toBe(25); // 52000 / 2080
    expect(result.monthly).toBeCloseTo(4333.33, 2);
    expect(result.weekly).toBe(1000);
    expect(result.daily).toBe(200); // 52000 / 260
    expect(result.totalHours).toBe(2080);
  });

  test('calculates with custom hours and weeks', () => {
    const result = window.calculateSalary(60000, 37.5, 50);
    expect(result.totalHours).toBe(1875);
    expect(result.hourly).toBe(32);
  });

  test('returns null for invalid annual salary', () => {
    expect(window.calculateSalary(-50000)).toBeNull();
  });

  test('returns null for NaN salary', () => {
    expect(window.calculateSalary(NaN)).toBeNull();
  });

  test('handles part-time work', () => {
    const result = window.calculateSalary(26000, 20, 52);
    expect(result.hourly).toBe(25);
    expect(result.totalHours).toBe(1040);
  });
});

describe('calculateTip', () => {
  test('calculates tip correctly', () => {
    const result = window.calculateTip(100, 15, 1);
    expect(result.tip).toBe(15);
    expect(result.total).toBe(115);
    expect(result.perPerson).toBe(115);
  });

  test('calculates tip split among people', () => {
    const result = window.calculateTip(200, 20, 4);
    expect(result.tip).toBe(40);
    expect(result.total).toBe(240);
    expect(result.perPerson).toBe(60);
    expect(result.tipPerPerson).toBe(10);
  });

  test('returns error for invalid bill', () => {
    expect(window.calculateTip(-50, 15, 1).error).toBe('invalid_bill');
  });

  test('returns error for invalid tip percentage', () => {
    expect(window.calculateTip(100, -5, 1).error).toBe('invalid_tip');
  });

  test('returns error for invalid people count', () => {
    expect(window.calculateTip(100, 15, 0).error).toBe('invalid_people');
  });

  test('defaults to 1 person when not specified', () => {
    const result = window.calculateTip(100, 15);
    expect(result.perPerson).toBe(115);
  });

  test('handles 0% tip', () => {
    const result = window.calculateTip(100, 0, 1);
    expect(result.tip).toBe(0);
    expect(result.total).toBe(100);
  });

  test('handles large groups', () => {
    const result = window.calculateTip(500, 18, 10);
    expect(result.tipPerPerson).toBe(9);
  });
});

describe('calculatePercentage', () => {
  describe('mode: of (what is X% of Y)', () => {
    test('calculates 10% of 100', () => {
      const result = window.calculatePercentage('of', 10, 100);
      expect(result.result).toBe(10);
    });

    test('calculates 50% of 80', () => {
      const result = window.calculatePercentage('of', 50, 80);
      expect(result.result).toBe(40);
    });
  });

  describe('mode: what (X is what % of Y)', () => {
    test('calculates 25 is what % of 100', () => {
      const result = window.calculatePercentage('what', 25, 100);
      expect(result.result).toBe(25);
    });

    test('calculates 75 is what % of 50', () => {
      const result = window.calculatePercentage('what', 75, 50);
      expect(result.result).toBe(150);
    });

    test('returns error for division by zero', () => {
      expect(window.calculatePercentage('what', 50, 0).error).toBe('division_by_zero');
    });
  });

  describe('mode: change (% change from X to Y)', () => {
    test('calculates increase from 50 to 75', () => {
      const result = window.calculatePercentage('change', 50, 75);
      expect(result.result).toBe(50);
    });

    test('calculates decrease from 100 to 75', () => {
      const result = window.calculatePercentage('change', 100, 75);
      expect(result.result).toBe(-25);
    });

    test('calculates no change', () => {
      const result = window.calculatePercentage('change', 100, 100);
      expect(result.result).toBe(0);
    });

    test('returns error for division by zero', () => {
      expect(window.calculatePercentage('change', 0, 50).error).toBe('division_by_zero');
    });
  });

  test('returns error for invalid mode', () => {
    expect(window.calculatePercentage('invalid', 10, 100).error).toBe('invalid_mode');
  });

  test('returns error for NaN inputs', () => {
    expect(window.calculatePercentage('of', NaN, 100).error).toBe('invalid_input');
  });
});

describe('calculateDiscount', () => {
  test('calculates discount correctly', () => {
    const result = window.calculateDiscount(100, 20);
    expect(result.savings).toBe(20);
    expect(result.finalPrice).toBe(80);
  });

  test('calculates 100% discount', () => {
    const result = window.calculateDiscount(100, 100);
    expect(result.savings).toBe(100);
    expect(result.finalPrice).toBe(0);
  });

  test('calculates 0% discount', () => {
    const result = window.calculateDiscount(100, 0);
    expect(result.savings).toBe(0);
    expect(result.finalPrice).toBe(100);
  });

  test('returns error for invalid price', () => {
    expect(window.calculateDiscount(-50, 20).error).toBe('invalid_price');
  });

  test('returns error for negative discount', () => {
    expect(window.calculateDiscount(100, -10).error).toBe('invalid_discount');
  });

  test('returns error for discount over 100%', () => {
    expect(window.calculateDiscount(100, 110).error).toBe('invalid_discount');
  });

  test('handles decimal prices and discounts', () => {
    const result = window.calculateDiscount(49.99, 15.5);
    expect(result.savings).toBeCloseTo(7.75, 2);
  });
});

describe('calculateFuelCost', () => {
  test('calculates fuel cost correctly', () => {
    const result = window.calculateFuelCost(300, 25, 3.5);
    expect(result.gallons).toBe(12);
    expect(result.totalCost).toBe(42);
    expect(result.costPerMile).toBeCloseTo(0.14, 2);
    expect(result.roundTrip).toBe(84);
  });

  test('returns null for zero distance', () => {
    expect(window.calculateFuelCost(0, 25, 3.5)).toBeNull();
  });

  test('returns null for zero mpg', () => {
    expect(window.calculateFuelCost(300, 0, 3.5)).toBeNull();
  });

  test('returns null for zero price', () => {
    expect(window.calculateFuelCost(300, 25, 0)).toBeNull();
  });

  test('calculates for high efficiency vehicle', () => {
    const result = window.calculateFuelCost(500, 50, 4);
    expect(result.gallons).toBe(10);
  });

  test('calculates for low efficiency vehicle', () => {
    const result = window.calculateFuelCost(100, 10, 3);
    expect(result.gallons).toBe(10);
    expect(result.totalCost).toBe(30);
  });
});

describe('convertUnit', () => {
  describe('length conversions', () => {
    test('converts km to miles', () => {
      const result = window.convertUnit('length', 10, 'km-to-mi');
      expect(result.result).toBeCloseTo(6.21371, 5);
    });

    test('converts miles to km', () => {
      const result = window.convertUnit('length', 10, 'mi-to-km');
      expect(result.result).toBeCloseTo(16.0934, 4);
    });

    test('label does not contain raw floating-point decimals (km to mi)', () => {
      const result = window.convertUnit('length', 10, 'km-to-mi');
      expect(result.label).toBe('10 km = 6.2137 miles');
    });

    test('label does not contain raw floating-point decimals (mi to km)', () => {
      const result = window.convertUnit('length', 10, 'mi-to-km');
      expect(result.label).toBe('10 miles = 16.0934 km');
    });

    test('label for round result shows no trailing zeros (100 km)', () => {
      const result = window.convertUnit('length', 100, 'km-to-mi');
      expect(result.label).not.toMatch(/\.\d*0+\s/);
    });
  });

  describe('weight conversions', () => {
    test('converts kg to lbs', () => {
      const result = window.convertUnit('weight', 10, 'kg-to-lbs');
      expect(result.result).toBeCloseTo(22.0462, 4);
    });

    test('converts lbs to kg', () => {
      const result = window.convertUnit('weight', 10, 'lbs-to-kg');
      expect(result.result).toBeCloseTo(4.53592, 5);
    });

    test('label does not contain raw floating-point decimals (kg to lbs)', () => {
      const result = window.convertUnit('weight', 70, 'kg-to-lbs');
      expect(result.label).toBe('70 kg = 154.3234 lbs');
    });

    test('label does not contain raw floating-point decimals (lbs to kg)', () => {
      const result = window.convertUnit('weight', 100, 'lbs-to-kg');
      expect(result.label).toBe('100 lbs = 45.3592 kg');
    });
  });

  describe('temperature conversions', () => {
    test('converts C to F', () => {
      const result = window.convertUnit('temp', 0, 'c-to-f');
      expect(result.result).toBe(32);
    });

    test('converts 100C to 212F', () => {
      const result = window.convertUnit('temp', 100, 'c-to-f');
      expect(result.result).toBe(212);
    });

    test('converts F to C', () => {
      const result = window.convertUnit('temp', 32, 'f-to-c');
      expect(result.result).toBe(0);
    });

    test('converts 212F to 100C', () => {
      const result = window.convertUnit('temp', 212, 'f-to-c');
      expect(result.result).toBe(100);
    });

    test('converts negative temperatures', () => {
      const result = window.convertUnit('temp', -40, 'c-to-f');
      expect(result.result).toBe(-40);
    });

    test('label for 0C to 32F shows no trailing zeros', () => {
      const result = window.convertUnit('temp', 0, 'c-to-f');
      expect(result.label).toBe('0°C = 32°F');
    });

    test('label for 100F to C is rounded to 4 decimal places', () => {
      const result = window.convertUnit('temp', 100, 'f-to-c');
      expect(result.label).toBe('100°F = 37.7778°C');
    });

    test('label does not contain more than 4 decimal places', () => {
      const result = window.convertUnit('temp', 100, 'f-to-c');
      const match = result.label.match(/=(\s*[\d,]+\.?(\d*))/);
      if (match && match[2]) {
        expect(match[2].length).toBeLessThanOrEqual(4);
      }
    });
  });

  test('returns error for invalid value', () => {
    expect(window.convertUnit('length', NaN, 'km-to-mi').error).toBe('invalid_value');
  });

  test('returns error for invalid type', () => {
    expect(window.convertUnit('volume', 10, 'l-to-gal').error).toBe('invalid_type');
  });
});

describe('Edge Cases and Boundary Tests', () => {
  test('handles very small numbers in loan calculator', () => {
    const result = window.calculateLoan(1, 0.01, 1);
    expect(result).not.toBeNull();
  });

  test('handles very large numbers in compound interest', () => {
    const result = window.calculateCompoundInterest(1000000, 10, 12, 50);
    expect(result.finalAmount).toBeGreaterThan(1000000);
  });

  test('handles floating point precision in tip calculator', () => {
    const result = window.calculateTip(100.33, 15.5, 3);
    expect(result.tip).toBeCloseTo(15.55, 2);
  });

  test('handles extreme APR in credit card', () => {
    const result = window.calculateCreditCard(1000, 100, 200);
    expect(result.monthlyInterest).toBeCloseTo(83.33, 2);
  });
});
