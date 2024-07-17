import { db } from '@/lib/prisma';
import { getCompanyWhereFromType } from '@/util/company';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { accessType: 'whop'; companyId: string } }
) {
  const company = await db.company.findUnique({
    where: getCompanyWhereFromType(params.accessType, params.companyId),
  });
  if (!company) {
    return NextResponse.json(
      {
        success: false,
        error: 'Company does not exist.',
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(
    { success: true, data: { limit: company.limit } },
    { status: 200 }
  );
}
