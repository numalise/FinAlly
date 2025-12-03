import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';
import { getPath, getMethod, getPathParts, getBody } from '../utils/eventHelpers';

export async function handleBudgets(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const path = getPath(event);
  const method = getMethod(event);
  const pathParts = getPathParts(event);
  const queryParams = event.queryStringParameters || {};

  try {
    // GET /budgets?year=2024&month=11
    if (method === 'GET' && pathParts.length === 1) {
      const year = parseInt(queryParams.year || '');
      const month = parseInt(queryParams.month || '');

      if (!year || !month) {
        return errorResponse('VALIDATION_ERROR', 'year and month are required', 400);
      }

      // Fetch ALL expense categories
      const allExpenseCategories = await prisma.expenseCategory.findMany({
        orderBy: { name: 'asc' },
      });

      // Fetch existing budgets for this user/year/month
      const budgets = await prisma.budget.findMany({
        where: { userId, year, month },
        include: { category: true },
      });

      // Fetch actual expenses for this user/year/month
      const expenses = await prisma.expenseItem.findMany({
        where: { userId, year, month },
      });

      // Group expenses by category
      const expensesByCategory = expenses.reduce((acc: Record<string, number>, expense) => {
        acc[expense.categoryId] = (acc[expense.categoryId] || 0) + parseFloat(String(expense.amount));
        return acc;
      }, {});

      // Map budgets by category for quick lookup
      const budgetsByCategory = budgets.reduce((acc: Record<string, any>, budget) => {
        acc[budget.categoryId] = budget;
        return acc;
      }, {});

      // Return ALL expense categories with their budget/actual amounts (or 0 if none)
      const result = allExpenseCategories.map(category => ({
        category: category.id,
        categoryName: category.name,
        budgetAmount: budgetsByCategory[category.id]
          ? parseFloat(String(budgetsByCategory[category.id].budgetAmount))
          : 0,
        actualAmount: expensesByCategory[category.id] || 0,
        calculated: budgetsByCategory[category.id]?.calculated || false,
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

    return errorResponse('ROUTE_NOT_FOUND', 'Route not found', 404);
  } catch (error) {
    console.error('Budgets route error:', error);
    return errorResponse('INTERNAL_ERROR', error instanceof Error ? error.message : 'Internal error', 500);
  }
}
