import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';

export async function handleBudgets(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  const pathParts = event.path.split('/').filter(Boolean);
  const queryParams = event.queryStringParameters || {};

  try {
    // GET /budgets?year=2024&month=11
    if (method === 'GET' && pathParts.length === 1) {
      const year = parseInt(queryParams.year || '');
      const month = parseInt(queryParams.month || '');

      if (!year || !month) {
        return errorResponse('year and month are required', 400);
      }

      const budgets = await prisma.budget.findMany({
        where: { userId, year, month },
        include: { category: true },
      });

      const expenses = await prisma.expenseItem.findMany({
        where: { userId, year, month },
      });

      const expensesByCategory = expenses.reduce((acc: Record<string, number>, expense) => {
        acc[expense.categoryId] = (acc[expense.categoryId] || 0) + parseFloat(String(expense.amount));
        return acc;
      }, {});

      const result = budgets.map(budget => ({
        category: budget.categoryId,
        categoryName: budget.category.name,
        budgetAmount: parseFloat(String(budget.budgetAmount)),
        actualAmount: expensesByCategory[budget.categoryId] || 0,
        calculated: budget.calculated,
      }));

      return successResponse(result);
    }

    // PATCH /budgets/:category
    if (method === 'PATCH' && pathParts.length === 2) {
      const categoryId = pathParts[1];
      const body = JSON.parse(event.body || '{}');
      const { amount, year, month } = body;

      const budget = await prisma.budget.upsert({
        where: {
          userId_categoryId_year_month: {
            userId,
            categoryId,
            year: parseInt(year),
            month: parseInt(month),
          },
        },
        update: {
          budgetAmount: String(amount),
          calculated: false,
        },
        create: {
          userId,
          categoryId,
          year: parseInt(year),
          month: parseInt(month),
          budgetAmount: String(amount),
          calculated: false,
        },
        include: { category: true },
      });

      return successResponse(budget);
    }

    return errorResponse('Route not found', 404);
  } catch (error) {
    console.error('Budgets route error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Internal error', 500);
  }
}
