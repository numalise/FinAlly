import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';

export async function handleAllocation(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  const path = event.path;
  const pathParts = path.split('/').filter(Boolean);
  const queryParams = event.queryStringParameters || {};

  try {
    // GET /allocation?year=2024&month=11
    if (method === 'GET' && pathParts.length === 1) {
      const now = new Date();
      const year = parseInt(queryParams.year || String(now.getFullYear()));
      const month = parseInt(queryParams.month || String(now.getMonth() + 1));

      const currentInputs = await prisma.assetInput.findMany({
        where: { userId, year, month },
        include: { asset: { include: { category: true } } },
      });

      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;

      const previousInputs = await prisma.assetInput.findMany({
        where: { userId, year: prevYear, month: prevMonth },
      });

      const targets = await prisma.categoryAllocationTarget.findMany({
        where: { userId },
      });

      const currentTotal = currentInputs.reduce((sum, input) => sum + parseFloat(String(input.total)), 0);
      const previousTotal = previousInputs.reduce((sum, input) => sum + parseFloat(String(input.total)), 0);

      const categories: Record<string, any> = {};

      currentInputs.forEach(input => {
        const catId = input.asset.categoryId;
        if (!categories[catId]) {
          categories[catId] = {
            category: catId,
            categoryName: input.asset.category.name,
            color: '#2196f3',
            hasMarketCapTargets: false,
            currentValue: 0,
            previousValue: 0,
            assets: [],
          };
        }
        categories[catId].currentValue += parseFloat(String(input.total));
        categories[catId].assets.push({
          id: input.asset.id,
          name: input.asset.assetName,
          ticker: input.asset.ticker,
          category: input.asset.categoryId,
          categoryName: input.asset.category.name,
          currentValue: parseFloat(String(input.total)),
          previousValue: 0,
          marketCap: input.asset.marketCap ? parseFloat(String(input.asset.marketCap)) : null,
        });
      });

      previousInputs.forEach(input => {
        const catId = input.asset.categoryId;
        if (categories[catId]) {
          categories[catId].previousValue += parseFloat(String(input.total));
          const asset = categories[catId].assets.find((a: any) => a.id === input.assetId);
          if (asset) {
            asset.previousValue = parseFloat(String(input.total));
          }
        }
      });

      const result = Object.values(categories).map(cat => {
        const target = targets.find(t => t.categoryId === cat.category);
        const targetPct = target ? parseFloat(String(target.targetPct)) : 0;
        const targetValue = (targetPct / 100) * currentTotal;
        const currentPct = currentTotal > 0 ? (cat.currentValue / currentTotal) * 100 : 0;
        const previousPct = previousTotal > 0 ? (cat.previousValue / previousTotal) * 100 : 0;

        return {
          ...cat,
          currentPercentage: currentPct,
          previousPercentage: previousPct,
          targetPercentage: targetPct,
          targetValue,
          delta: cat.currentValue - targetValue,
          deltaPercentage: currentPct - targetPct,
        };
      });

      return successResponse({
        categories: result,
        totalValue: currentTotal,
        previousTotalValue: previousTotal,
        totalChange: currentTotal - previousTotal,
      });
    }

    // GET /category-allocation-targets
    if (method === 'GET' && path.includes('category-allocation-targets') && pathParts.length === 1) {
      const targets = await prisma.categoryAllocationTarget.findMany({
        where: { userId },
        include: { category: true },
      });
      return successResponse(targets);
    }

    // PATCH /category-allocation-targets/:category
    if (method === 'PATCH' && path.includes('category-allocation-targets') && pathParts.length === 2) {
      const categoryId = pathParts[1];
      const body = JSON.parse(event.body || '{}');
      const { target_pct } = body;

      const target = await prisma.categoryAllocationTarget.upsert({
        where: {
          userId_categoryId: {
            userId,
            categoryId,
          },
        },
        update: {
          targetPct: String(target_pct),
        },
        create: {
          userId,
          categoryId,
          targetPct: String(target_pct),
        },
        include: { category: true },
      });

      return successResponse(target);
    }

    return errorResponse('Route not found', 404);
  } catch (error) {
    console.error('Allocation route error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Internal error', 500);
  }
}
