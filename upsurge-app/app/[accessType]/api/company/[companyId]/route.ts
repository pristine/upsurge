import { db } from '@/lib/prisma';
import { getCompanyWhereFromType } from '@/util/company';
import { type NextRequest, NextResponse } from 'next/server';

export async function DELETE(
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
        error: 'Company does not exist within database.',
      },
      {
        status: 400,
      }
    );
  }

  await db.company.update({
    where: {
      id: company.id,
    },
    data: {
      mainServiceId: null,
      mainServiceType: null,
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}

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
        error: 'Company does not exist within database.',
      },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json({ success: true, data: company }, { status: 200 });
}
