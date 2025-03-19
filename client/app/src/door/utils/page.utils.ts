import { Frame, Page } from "playwright-core";

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

/**
 * 随机延迟函数
 * @param min 最小延迟(ms)
 * @param max 最大延迟(ms)
 */
async function randomDelay(min: number, max: number) {
  const delay = Math.floor(min + Math.random() * (max - min));
  await new Promise(resolve => setTimeout(resolve, delay));
  return delay;
}

/**
 * 封装的滑块滑动函数 - 从起始位置滑动到目标位置
 * @param page Playwright页面对象
 * @param startPosition 起始位置坐标 {x, y}
 * @param endPosition 目标位置坐标 {x, y}
 * @returns 滑动操作是否成功完成
 */
export async function slideSlider(
  page: Page, 
  startPosition: { x: number, y: number }, 
  endPosition: { x: number, y: number }
): Promise<boolean> {
  try {
    console.log(`执行滑块滑动: 从(${startPosition.x}, ${startPosition.y}) 滑动到 (${endPosition.x}, ${endPosition.y})`);
    
    // 计算滑动距离
    const distance = endPosition.x - startPosition.x;
    
    if (distance <= 0) {
      console.error('滑动距离必须为正值');
      return false;
    }
    
    // 使用简化版轨迹生成算法
    const moveTrack = generateSimpleTrack(distance);
    console.log(`生成了 ${moveTrack.length} 个移动点`);
    
    // 开始滑动操作
    console.log('开始执行滑动操作...');
    
    // 直接移动到滑块位置
    await page.mouse.move(startPosition.x, startPosition.y, { steps: 5 });
    await randomDelay(300, 500);
    await page.mouse.down();
    await randomDelay(100, 200);
    
    // 执行移动轨迹
    let currentX = startPosition.x;
    let currentY = startPosition.y;
    let totalDelay = 0;
    
    for (const [index, point] of moveTrack.entries()) {
      // 移动到新位置
      currentX += point.xOffset;
      currentY += point.yOffset;
      
      // 确保只有正向移动
      currentX = Math.max(startPosition.x, currentX);
      
      // 检查范围，确保不会移出屏幕
      currentX = Math.min(page.viewportSize()!.width - 1, currentX);
      currentY = Math.max(0, Math.min(page.viewportSize()!.height - 1, currentY));
      
      const options = index === 0 ? { steps: 1 } : {};
      await page.mouse.move(currentX, currentY, options);
      
      // 确保最后几步的延迟更长，以展示减速效果
      let delay;
      if (index > moveTrack.length * 0.8) {
        delay = 30 + Math.random() * 20;
      } else {
        delay = point.delay;
      }
      
      await page.waitForTimeout(delay);
      totalDelay += delay;
    }
    
    console.log(`滑动轨迹执行完成，总耗时: ${totalDelay}ms`);
    
    // 确保最终位置接近目标但不过头
    const finalPosition = Math.min(endPosition.x - 2, currentX);
    await page.mouse.move(finalPosition, currentY, { steps: 3 });
    await randomDelay(200, 300);
    
    // 松开鼠标
    await page.mouse.up();
    
    return true;
  } catch (error) {
    console.error('滑动操作失败:', error);
    return false;
  }
}

/**
 * 简化版人类行为模拟 - 减少可能被识别为机器人的行为
 */
export async function simulateHumanPresenceSimple(page: Page, xStart: number, yStart: number) {
  
  // 在滑块附近随机移动鼠标 - 只做基本操作
  for (let i = 0; i < 2; i++) {
    const x = xStart + Math.random() * 200;
    const y = yStart + Math.random() * 100;
    await page.mouse.move(x, y);
    await randomDelay(100, 200);
  }
  
  // 随机等待一段时间，模拟人类阅读
  await randomDelay(500, 1000);
}

/**
 * 生成简化的滑动轨迹，专注于平滑自然的移动，无回拉
 * @param distance 总滑动距离
 * @returns 移动轨迹点数组
 */
function generateSimpleTrack(distance: number) {
  // 使用更简单的轨迹生成算法，确保滑动平滑且不回拉
  const track = [];
  const totalSteps = 40 + Math.floor(Math.random() * 10); // 40-50步
  
  // 使用正弦加速度模型
  for (let i = 0; i < totalSteps; i++) {
    const ratio = i / totalSteps;
    
    // 使用正弦函数创建加速-减速曲线
    const acceleration = Math.sin(ratio * Math.PI);
    const stepDistance = (distance / totalSteps) * acceleration * 1.5;
    
    // 确保步进值始终为正（向前移动）
    const xOffset = Math.max(0.5, stepDistance);
    
    // 添加很小的垂直抖动
    const yOffset = (Math.random() * 2 - 1) * 0.8;
    
    // 计算合适的延迟 - 开始和结束时较慢，中间较快
    let delay;
    if (ratio < 0.2 || ratio > 0.8) {
      delay = 25 + Math.random() * 15; // 较慢
    } else {
      delay = 15 + Math.random() * 10; // 较快
    }
    
    track.push({
      xOffset,
      yOffset,
      delay
    });
  }
  
  // 确保末尾没有回拉操作，最后几步都是向前的小步移动
  for (let i = 0; i < 4; i++) {
    track.push({
      xOffset: 1.0 + Math.random() * 0.5, // 小幅向前移动
      yOffset: (Math.random() * 2 - 1) * 0.3, // 几乎不做垂直移动
      delay: 40 + Math.random() * 30 // 较长的延迟，模拟减速
    });
  }
  
  return track;
}