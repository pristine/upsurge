'use client';

import { type ApiResponse } from '@/types/response';
import { fetcher } from '@/util/swr';
import useSWR from 'swr';
import Spinner from '@/components/Spinner';
import { type Company } from '@prisma/client';
import CreateNewServiceModal from '@/components/CreateNewServiceModal';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CompanyPage({
  params,
}: {
  params: { accessType: 'whop' | 'web'; companyId: string; productId: string };
}) {
  const router = useRouter();
  // const { data: services, mutate: refreshServices } = useSWR<
  //   ApiResponse<Service[]>
  // >(`/${params.accessType}/api/company/${params.companyId}/services`, fetcher);

  // const { data: limit, isLoading: isLimitLoading } = useSWR<ApiResponse<Limit>>(
  //   `/${params.accessType}/api/company/${params.companyId}/limit`,
  //   fetcher
  // );

  const {
    data: company,
    isLoading: isCompanyLoading,
    mutate: refreshComapny,
  } = useSWR<ApiResponse<Company>>(
    `/${params.accessType}/api/company/${params.companyId}`,
    fetcher
  );

  useEffect(() => {
    if (
      company?.data?.mainServiceId?.length &&
      company?.data?.mainServiceType?.length
    ) {
      router.push(
        `/${params.accessType}/company/${params.companyId}/${company.data.mainServiceType}/${company.data.mainServiceId}`
      );
    }
  }, [company?.data]);

  return (
    <>
      {isCompanyLoading ? (
        <div className="w-full h-full flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <CreateNewServiceModal
          accessType={params.accessType}
          companyId={params.companyId}
          refreshServices={refreshComapny}
        />
      )}
    </>
  );

  // return (
  //   // {isLoading ? (<div className="w-full h-full flex justify-center items-center">
  //   //         <Spinner /> </div>)
  //   //        :     <CreateNewServiceModal
  //   //       accessType={params.accessType}
  //   //       companyId={params.companyId}
  //   //       refreshServices={refreshServices}
  //   //     />}
  //   {isCompanyLoading ? <div>}
  // );

  // return (
  //   <>
  //     <h1 className="text-2xl font-bold my-6">Upsurge Services</h1>
  //     {!isLoading ? (
  //       <div className="flex flex-col gap-5">
  //         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  //           {services?.data?.map((service: Service) => (
  //             <Link
  //               key={service.id}
  //               href={`/${params.accessType}/company/${params.companyId}/${service.type}/${service.id}`}
  //             >
  //               <div className="bg-gray-2 transform transition duration-500 hover:scale-105 rounded-lg border border-gray-5 shadow-md hover:shadow-xl overflow-hidden">
  //                 <div className="flex p-5 flex-col">
  //                   <h2 className="text-lg font-bold mb-2">
  //                     {service.nickname}
  //                   </h2>
  //                   <Text size="1" className="capitalize">
  //                     {service.type}
  //                   </Text>
  //                   <Text size="1">{service.id}</Text>
  //                 </div>
  //               </div>
  //             </Link>
  //           ))}
  //         </div>
  //         {limit?.data &&
  //         services?.data &&
  //         services.data.length < limit?.data.limit ? (
  //           <CreateNewServiceModal
  //             accessType={params.accessType}
  //             companyId={params.companyId}
  //             refreshServices={refreshServices}
  //           />
  //         ) : null}
  //       </div>
  //     ) : (
  //       <div className="w-full h-full flex justify-center items-center">
  //         <Spinner />
  //       </div>
  //     )}
  //   </>
  // );
}
