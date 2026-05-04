# Testing Guide for ToolsHub Calculators

## Setup

```bash
# Install dependencies
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

## Test Structure

Tests are located in `theme/assets/js/calculators.test.js`

### Test Coverage

| Function | Description | Test Cases |
|----------|-------------|------------|
| `ToolsHubUtils.fmt` | Number formatting | 6 tests |
| `ToolsHubUtils.fmtCurrency` | Currency formatting | 4 tests |
| `calculateLoan` | Loan payment calculations | 8 tests |
| `calculateCreditCard` | Credit card payoff | 7 tests |
| `calculateCompoundInterest` | Compound interest | 9 tests |
| `calculateSalary` | Salary converter | 6 tests |
| `calculateTip` | Tip calculator | 8 tests |
| `calculatePercentage` | Percentage operations | 10 tests |
| `calculateDiscount` | Discount calculator | 7 tests |
| `calculateFuelCost` | Fuel cost calculator | 6 tests |
| `convertUnit` | Unit conversions | 10 tests |
| **Edge Cases** | Boundary conditions | 4 tests |

**Total: ~85 test cases**

## Coverage Thresholds

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Adding New Tests

When adding a new calculator:

1. Export the calculation function to `window` object
2. Add corresponding tests in `calculators.test.js`
3. Follow the existing test structure (describe blocks with input/output assertions)
4. Include edge cases (zeros, negatives, invalid inputs)

## Example Test Pattern

```javascript
describe('calculateMyNewCalculator', () => {
  test('calculates correctly with standard inputs', () => {
    const result = window.calculateMyNewCalculator(100, 5);
    expect(result.value).toBe(expectedValue);
  });

  test('handles edge case', () => {
    const result = window.calculateMyNewCalculator(0, 5);
    expect(result).toBeNull(); // or appropriate error
  });
});
```
