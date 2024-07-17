type Pricing = Record<string, number>;

const pricingToProductLimit: Pricing = {
  '': 2,
};

export const getPricingToProductLimit = (pricingId: string) => {
  const productLimit = pricingToProductLimit[pricingId];
  if (!productLimit) {
    return 3;
  }

  return productLimit;
};
