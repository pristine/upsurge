export const getCompanyWhereFromType = (
  type: 'whop' | 'web',
  id: string,
  serviceId?: string,
  serviceType?: string
) => {
  let result: any;
  switch (type) {
    case 'whop':
      result = { whopId: id };
      break;
    case 'web':
      result = { id };
      break;
  }

  if (serviceId && serviceType) {
    result.mainServiceId = serviceId;
    result.mainServiceType = serviceType;
  }

  return result;
};
