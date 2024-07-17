import { db } from '@/lib/prisma';
import { makeWebhookHandler } from '@whop-apps/sdk';
import { type NextRequest } from 'next/server';

const handleWebhook = makeWebhookHandler();

export async function POST(req: NextRequest) {
  return await handleWebhook(req, {
    async membershipWentValid({ action, data }) {},

    async appMembershipWentValid({ data }) {
      const companyId = data.company_buyer_id;
      if (companyId) {
        const whopConnection = await db.whopConnection.findUnique({
          where: {
            id: companyId,
          },
          include: {
            Company: true,
          },
        });

        if (whopConnection) {
          await db.company.update({
            where: {
              id: whopConnection.Company?.id,
            },
            data: {
              active: true,
            },
          });
        } else {
          await db.$transaction([
            db.whopConnection.create({
              data: {
                id: companyId,
              },
            }),
            db.company.create({
              data: {
                active: true,
                WhopConnection: {
                  connect: {
                    id: companyId,
                  },
                },
              },
            }),
          ]);
        }
      }
    },

    async appMembershipWentInvalid({ action, data }) {
      const companyId = data.company_buyer_id;
      if (companyId) {
        await db.company.update({
          where: {
            whopId: companyId,
          },
          data: {
            active: false,
          },
        });
      }
    },

    membershipWentInvalid({ action, data }) {},

    paymentFailed({ action, data }) {},

    paymentSucceeded({ action, data }) {},
  });
}
