import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse } from '../utils/response';

export async function handleHealth(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  return successResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FinAlly API',
  });
}
