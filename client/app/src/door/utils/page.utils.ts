import { Page } from "playwright-core";

interface Point {
  x: number;
  y: number;
}

/**
 * Generates a Bezier curve control points for human-like movement
 * @param start Starting point
 * @param end Ending point
 * @returns Array of control points for Bezier curve
 */
function generateBezierControlPoints(start: Point, end: Point): Point[] {
  const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  
  // Randomize control points to make movement more natural
  const controlPoint1 = {
    x: start.x + (end.x - start.x) * (0.2 + Math.random() * 0.3),
    y: start.y + (end.y - start.y) * (0.2 + Math.random() * 0.3)
  };
  
  const controlPoint2 = {
    x: start.x + (end.x - start.x) * (0.7 + Math.random() * 0.2),
    y: start.y + (end.y - start.y) * (0.7 + Math.random() * 0.2)
  };
  
  return [controlPoint1, controlPoint2];
}

/**
 * Calculates a point on a Bezier curve
 * @param t Parameter between 0 and 1
 * @param points Array of control points
 * @returns Point on the curve
 */
function bezierPoint(t: number, points: Point[]): Point {
  const n = points.length - 1;
  let x = 0;
  let y = 0;
  
  for (let i = 0; i <= n; i++) {
    const binomial = binomialCoefficient(n, i);
    const tPow = Math.pow(t, i);
    const oneMinusTPow = Math.pow(1 - t, n - i);
    
    x += points[i].x * binomial * tPow * oneMinusTPow;
    y += points[i].y * binomial * tPow * oneMinusTPow;
  }
  
  return { x, y };
}

/**
 * Calculates binomial coefficient
 */
function binomialCoefficient(n: number, k: number): number {
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - k + i) / i;
  }
  return result;
}

/**
 * Simulates human-like mouse movement using Bezier curves
 * @param page Playwright Page object
 * @param startX Starting X coordinate
 * @param startY Starting Y coordinate
 * @param endX Ending X coordinate
 * @param endY Ending Y coordinate
 * @param duration Duration of movement in milliseconds (default: 500-1000ms)
 * @param steps Number of steps for smooth movement (default: 50)
 */
export async function humanLikeMouseMove(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  duration: number = 500 + Math.random() * 500,
  steps: number = 50
): Promise<void> {
  const start = { x: startX, y: startY };
  const end = { x: endX, y: endY };
  
  // Generate control points for Bezier curve
  const controlPoints = generateBezierControlPoints(start, end);
  const points = [start, ...controlPoints, end];
  
  // Calculate delay between steps
  const stepDelay = duration / steps;
  
  // Move mouse in steps
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const point = bezierPoint(t, points);
    
    // Add small random delay to make movement more human-like
    await page.mouse.move(point.x, point.y);
    await page.waitForTimeout(stepDelay + (Math.random() * 5));
  }
}

/**
 * Simulates human-like drag operation
 * @param page Playwright Page object
 * @param startX Starting X coordinate
 * @param startY Starting Y coordinate
 * @param endX Ending X coordinate
 * @param endY Ending Y coordinate
 * @param duration Duration of drag operation in milliseconds (default: 800-1500ms)
 * @param steps Number of steps for smooth movement (default: 50)
 */
export async function humanLikeDrag(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  duration: number = 800 + Math.random() * 700,
  steps: number = 50
): Promise<void> {
  // Move to start position
  await page.mouse.move(startX, startY);
  await page.waitForTimeout(100 + Math.random() * 100);
  
  // Start dragging
  await page.mouse.down();
  await page.waitForTimeout(50 + Math.random() * 50);
  
  // Perform human-like movement
  await humanLikeMouseMove(page, startX, startY, endX, endY, duration, steps);
  
  // Add small random delay before releasing
  await page.waitForTimeout(50 + Math.random() * 50);
  
  // Release mouse
  await page.mouse.up();
}
