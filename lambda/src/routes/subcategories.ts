import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/response';
import { getPath, getMethod, getPathParts, getBody } from '../utils/eventHelpers';

export async function handleSubcategories(
  event: APIGatewayProxyEvent,
  prisma: PrismaClient,
  userId: string
): Promise<APIGatewayProxyResult> {
  const path = getPath(event);
  const method = getMethod(event);
  const pathParts = getPathParts(event);
  const queryParams = event.queryStringParameters || {};

  try {
    // GET /subcategories?category_id=RENT
    if (method === 'GET' && pathParts.length === 1) {
      const categoryId = queryParams.category_id;

      if (!categoryId) {
        return errorResponse('VALIDATION_ERROR', 'category_id is required', 400);
      }

      // Get all subcategories for the category (both default and user-specific)
      const subcategories = await prisma.expenseSubcategory.findMany({
        where: {
          parentCategoryId: categoryId,
          OR: [
            { userId: null }, // System default subcategories
            { userId: userId }, // User-specific subcategories
          ],
        },
        orderBy: { sortOrder: 'asc' },
      });

      return successResponse(subcategories);
    }

    // POST /subcategories - Create custom subcategory
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { parent_category_id, name } = body;

      if (!parent_category_id || !name) {
        return errorResponse(
          'VALIDATION_ERROR',
          'parent_category_id and name are required',
          400
        );
      }

      // Verify parent category exists
      const parentCategory = await prisma.expenseCategory.findUnique({
        where: { code: parent_category_id },
      });

      if (!parentCategory) {
        return errorResponse('NOT_FOUND', 'Parent category not found', 404);
      }

      // Get the next sort order for this category and user
      const maxSortOrder = await prisma.expenseSubcategory.findFirst({
        where: {
          parentCategoryId: parent_category_id,
          userId: userId,
        },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });

      const nextSortOrder = maxSortOrder ? maxSortOrder.sortOrder + 1 : 100;

      // Generate code from name (e.g., "My Rent" -> "RENT_MY_RENT")
      const sanitizedName = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      const code = `${parent_category_id}_${sanitizedName}_${Date.now()}`;

      const subcategory = await prisma.expenseSubcategory.create({
        data: {
          code,
          parentCategoryId: parent_category_id,
          name,
          isDefault: false,
          sortOrder: nextSortOrder,
          userId: userId,
        },
        include: { parentCategory: true },
      });

      return successResponse(subcategory, 201);
    }

    // PATCH /subcategories/:id - Update custom subcategory
    if (method === 'PATCH' && pathParts.length === 2) {
      const subcategoryId = pathParts[1];
      const body = JSON.parse(event.body || '{}');
      const { name } = body;

      if (!name) {
        return errorResponse('VALIDATION_ERROR', 'name is required', 400);
      }

      // Verify subcategory exists and belongs to user
      const existing = await prisma.expenseSubcategory.findFirst({
        where: {
          id: subcategoryId,
          userId: userId, // Only allow updating user-created subcategories
        },
      });

      if (!existing) {
        return errorResponse(
          'NOT_FOUND',
          'Subcategory not found or you do not have permission to edit it',
          404
        );
      }

      // Cannot edit default subcategories
      if (existing.isDefault) {
        return errorResponse(
          'FORBIDDEN',
          'Cannot edit default subcategories',
          403
        );
      }

      const updated = await prisma.expenseSubcategory.update({
        where: { id: subcategoryId },
        data: { name },
        include: { parentCategory: true },
      });

      return successResponse(updated);
    }

    // DELETE /subcategories/:id - Delete custom subcategory
    if (method === 'DELETE' && pathParts.length === 2) {
      const subcategoryId = pathParts[1];

      // Verify subcategory exists and belongs to user
      const existing = await prisma.expenseSubcategory.findFirst({
        where: {
          id: subcategoryId,
          userId: userId,
        },
      });

      if (!existing) {
        return errorResponse(
          'NOT_FOUND',
          'Subcategory not found or you do not have permission to delete it',
          404
        );
      }

      // Cannot delete default subcategories
      if (existing.isDefault) {
        return errorResponse(
          'FORBIDDEN',
          'Cannot delete default subcategories',
          403
        );
      }

      // Check if subcategory is in use
      const expensesUsingSubcategory = await prisma.expenseItem.count({
        where: { subcategoryId },
      });

      if (expensesUsingSubcategory > 0) {
        return errorResponse(
          'CONFLICT',
          `Cannot delete subcategory: it is used by ${expensesUsingSubcategory} expense(s)`,
          409
        );
      }

      await prisma.expenseSubcategory.delete({
        where: { id: subcategoryId },
      });

      return successResponse({ message: 'Subcategory deleted successfully' });
    }

    return errorResponse('ROUTE_NOT_FOUND', 'Route not found', 404);
  } catch (error) {
    console.error('Subcategories route error:', error);
    return errorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Internal error',
      500
    );
  }
}
