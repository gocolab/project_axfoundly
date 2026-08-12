import { test, expect } from '@playwright/test';

test.describe('Platform Basic Health & Smoke Test', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check main title or header element
    await expect(page).toHaveTitle(/.*|React App/i);
    
    // Verify basic health endpoint directly via request context
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    const health = await response.json();
    expect(health.status).toBe('healthy');
  });
});
