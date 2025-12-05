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
        category: category.code,
        categoryName: category.name,
        budgetAmount: budgetsByCategory[category.code]
          ? parseFloat(String(budgetsByCategory[category.code].budgetAmount))
          : 0,
        actualAmount: expensesByCategory[category.code] || 0,
        calculated: budgetsByCategory[category.code]?.calculated || false,
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
          budgetAmount: amount,
          calculated: false,
        },
        create: {
          userId,
          categoryId,
          year: parseInt(year),
          month: parseInt(month),
          budgetAmount: amount,
          calculated: false,
        },
        include: { category: true },
      });

      return successResponse(budget);
    }

    // POST /budgets/auto-adjust - Auto-adjust budgets for target month based on current month spending
    if (method === 'POST' && pathParts.length === 2 && pathParts[1] === 'auto-adjust') {
      const body = JSON.parse(event.body || '{}');
      const { year, month } = body;

      if (!year || !month) {
        return errorResponse('VALIDATION_ERROR', 'year and month are required', 400);
      }

      // Calculate previous month
      let prevYear = year;
      let prevMonth = month - 1;
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear = year - 1;
      }

      // Get current month budgets
      const currentBudgets = await prisma.budget.findMany({
        where: { userId, year: prevYear, month: prevMonth },
        include: { category: true },
      });

      // Get current month actual expenses
      const currentExpenses = await prisma.expenseItem.findMany({
        where: { userId, year: prevYear, month: prevMonth },
      });

      // Group expenses by category
      const expensesByCategory = currentExpenses.reduce((acc: Record<string, number>, expense) => {
        acc[expense.categoryId] = (acc[expense.categoryId] || 0) + parseFloat(String(expense.amount));
        return acc;
      }, {});

      // Apply formula: next_budget = current_budget + (current_budget - actual_spending)
      const adjustments: any[] = [];

      for (const currentBudget of currentBudgets) {
        const budgetAmount = parseFloat(String(currentBudget.budgetAmount));
        const actualSpending = expensesByCategory[currentBudget.categoryId] || 0;

        // Formula: next = current + (current - actual)
        // Equivalent to: next = 2 * current - actual
        const adjustedBudget = budgetAmount + (budgetAmount - actualSpending);

        // Ensure budget doesn't go negative
        const finalBudget = Math.max(adjustedBudget, 0);

        // Create or update budget for target month
        const newBudget = await prisma.budget.upsert({
          where: {
            userId_categoryId_year_month: {
              userId,
              categoryId: currentBudget.categoryId,
              year: parseInt(year),
              month: parseInt(month),
            },
          },
          update: {
            budgetAmount: finalBudget,
            calculated: true,
          },
          create: {
            userId,
            categoryId: currentBudget.categoryId,
            year: parseInt(year),
            month: parseInt(month),
            budgetAmount: finalBudget,
            calculated: true,
          },
          include: { category: true },
        });

        adjustments.push({
          category: currentBudget.category.name,
          previousBudget: budgetAmount,
          actualSpending,
          newBudget: finalBudget,
          change: finalBudget - budgetAmount,
        });
      }

      return successResponse({
        message: 'Budgets adjusted successfully',
        targetMonth: `${year}-${String(month).padStart(2, '0')}`,
        adjustments,
      });
    }

    return errorResponse('ROUTE_NOT_FOUND', 'Route not found', 404);
  } catch (error) {
    console.error('Budgets route error:', error);
    return errorResponse('INTERNAL_ERROR', error instanceof Error ? error.message : 'Internal error', 500);
  }
}
