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

/**
 * 高度模拟人类的滑块滑动函数 
 */
async function slideSliderV2(
  page: Page, 
  startPosition: { x: number, y: number }, 
  endPosition: { x: number, y: number },
  speedFactor: number = 1.0): Promise<boolean> {
  try {
    console.log(`执行滑块滑动: 从(${startPosition.x}, ${startPosition.y}) 滑动到 (${endPosition.x}, ${endPosition.y}), 速度因子: ${speedFactor}`);
    
    // 计算滑动距离
    const totalDistance = endPosition.x - startPosition.x;
    
    if (totalDistance <= 0) {
      console.error('滑动距离必须为正值');
      return false;
    }
    
    // 记录实际滑动轨迹
    const actualTrack: {x: number, y: number, t: number}[] = [];
    const startTime = Date.now();
    
    // 首先移动到滑块位置
    await moveToSlider(page, startPosition);
    
    // 记录起始点
    actualTrack.push({
      x: Math.round(startPosition.x),
      y: Math.round(startPosition.y),
      t: 0
    });
    
    // 阶段划分
    const phases = [
      {type: 'delay', duration: 800 + Math.random() * 1000}, // 初始延迟
      {type: 'accelerate', ratio: 0.6}, 
      {type: 'decelerate', ratio: 0.35},
      {type: 'adjust', count: 2 + Math.floor(Math.random() * 3)}
    ];
    
    // 鼠标按下
    await page.mouse.down();
    
    actualTrack.push({
      x: Math.round(startPosition.x),
      y: Math.round(startPosition.y),
      t: Date.now() - startTime
    });
    
    let currentX = startPosition.x;
    let currentY = startPosition.y;
    let currentTime = Date.now() - startTime;
    
    // 生成轨迹核心逻辑
    let plannedTrack: {x: number, y: number, t: number}[] = [];
    
    for (const phase of phases) {
      switch(phase.type) {
        case 'delay':
          // 延迟阶段
          const delayPoints = generateDelayPoints(
            currentX, 
            currentY, 
            currentTime, 
            phase.duration as number
          );
          plannedTrack.push(...delayPoints);
          break;
          
        case 'accelerate':
          // 加速阶段 - 使用Sigmoid曲线前半部分
          const accelPoints = generateSigmoidCurve(
            currentX,
            currentY,
            totalDistance * (phase.ratio as number),
            currentTime,
            'accelerate',
            speedFactor
          );
          plannedTrack.push(...accelPoints);
          break;
          
        case 'decelerate':
          // 减速阶段 - 使用Sigmoid曲线后半部分
          const lastAccelPoint = plannedTrack[plannedTrack.length - 1];
          const decelPoints = generateSigmoidCurve(
            lastAccelPoint.x,
            lastAccelPoint.y,
            totalDistance * (phase.ratio as number),
            lastAccelPoint.t,
            'decelerate',
            speedFactor
          );
          plannedTrack.push(...decelPoints);
          break;
          
        case 'adjust':
          // 微调阶段 - 模拟手抖动
          const lastPoint = plannedTrack[plannedTrack.length - 1];
          const adjustPoints = simulateHandTremor(
            lastPoint.x,
            lastPoint.y,
            endPosition.x,
            startPosition.y,
            lastPoint.t,
            phase.count as number
          );
          plannedTrack.push(...adjustPoints);
          break;
      }
      
      // 更新当前状态
      if (plannedTrack.length > 0) {
        const lastTrackPoint = plannedTrack[plannedTrack.length - 1];
        currentX = lastTrackPoint.x;
        currentY = lastTrackPoint.y;
        currentTime = lastTrackPoint.t;
      }
    }
    
    // 确保最后一个点是目标位置
    plannedTrack.push({
      x: endPosition.x,
      y: startPosition.y + (Math.random() * 1 - 0.5),
      t: currentTime + 50 + Math.random() * 100
    });
    
    // 添加浏览器同步和执行
    await executeTrack(page, plannedTrack, startTime, actualTrack);
    
    // 释放鼠标
    await releaseSlider(page, endPosition, startPosition);
    
    // 记录最终点
    actualTrack.push({
      x: Math.round(endPosition.x),
      y: Math.round(startPosition.y),
      t: Date.now() - startTime
    });
    
    // 打印实际轨迹数据
    console.log(`\n=== 自动滑动实际轨迹 (${actualTrack.length}个点) ===`);
    console.log(JSON.stringify(actualTrack));
    
    // 打印轨迹统计信息
    const totalTime = actualTrack[actualTrack.length-1].t - actualTrack[0].t;
    const totalXDistance = actualTrack[actualTrack.length-1].x - actualTrack[0].x;
    console.log(`\n轨迹统计信息:`);
    console.log(`- 总点数: ${actualTrack.length}`);
    console.log(`- 总时间: ${totalTime}ms`);
    console.log(`- 滑动距离: ${totalXDistance}px`);
    console.log(`- 平均速度: ${(totalXDistance / (totalTime / 1000)).toFixed(2)}px/s`);
    
    // 保存轨迹到文件
    // saveTrackToFile(actualTrack);
    
    return true;
  } catch (error) {
    console.error('滑动操作失败:', error);
    return false;
  }
}

/**
 * 移动到滑块位置
 */
async function moveToSlider(page: Page, startPosition: { x: number, y: number }) {
  // 不是直接定位到滑块中心，而是先移动到附近，然后再精确定位 - 更真实
  
  // 先随机移动到滑块附近
  const approachX = startPosition.x - 15 + Math.random() * 30;
  const approachY = startPosition.y - 10 + Math.random() * 20;
  await page.mouse.move(approachX, approachY, { steps: 8 + Math.floor(Math.random() * 5) });
  await page.waitForTimeout(50 + Math.random() * 150);
  
  // 然后移动到滑块区域，但有轻微偏移
  const closeX = startPosition.x - 5 + Math.random() * 10;
  const closeY = startPosition.y - 3 + Math.random() * 6;
  await page.mouse.move(closeX, closeY, { steps: 3 + Math.floor(Math.random() * 3) });
  await page.waitForTimeout(30 + Math.random() * 100);
  
  // 最后精确移动到滑块位置
  await page.mouse.move(startPosition.x, startPosition.y, { steps: 2 });
}

/**
 * 生成延迟阶段的轨迹点
 */
function generateDelayPoints(
  currentX: number,
  currentY: number,
  currentTime: number,
  delayDuration: number
): {x: number, y: number, t: number}[] {
  const delayPoints = [];
  
  // 初始思考延迟
  delayPoints.push({
    x: currentX,
    y: currentY,
    t: currentTime + delayDuration
  });
  
  // 可能的微小移动（手指紧张抖动）
  if (Math.random() < 0.4) {
    const jitterCount = 1 + Math.floor(Math.random() * 2);
    let jitterTime = currentTime;
    
    for (let i = 0; i < jitterCount; i++) {
      jitterTime += 50 + Math.random() * 150;
      delayPoints.push({
        x: currentX + (Math.random() * 2 - 1),
        y: currentY + (Math.random() * 2 - 1),
        t: jitterTime
      });
    }
    
    // 回到原位置
    delayPoints.push({
      x: currentX,
      y: currentY,
      t: jitterTime + 30 + Math.random() * 70
    });
  }
  
  return delayPoints;
}

/**
 * 执行轨迹移动
 */
async function executeTrack(
  page: Page,
  plannedTrack: {x: number, y: number, t: number}[],
  startTime: number,
  actualTrack: {x: number, y: number, t: number}[]
) {
  const moveStart = Date.now();
  
  // 打印轨迹规划
  console.log(`--- 规划的轨迹点 (${plannedTrack.length}个) ---`);
  console.log(JSON.stringify(plannedTrack.map(p => ({
    x: Math.round(p.x), 
    y: Math.round(p.y), 
    t: Math.round(p.t)
  }))));
  
  // 执行轨迹移动
  for (let i = 0; i < plannedTrack.length; i++) {
    const point = plannedTrack[i];
    const elapsed = Date.now() - moveStart;
    const targetTime = point.t;
    
    // 等待到指定时间点
    if (elapsed < targetTime) {
      await page.waitForTimeout(targetTime - elapsed);
    }
    
    // 移动到当前点
    await page.mouse.move(point.x, point.y);
    
    // 记录实际点
    actualTrack.push({
      x: Math.round(point.x),
      y: Math.round(point.y),
      t: Date.now() - startTime
    });
  }
}

/**
 * 生成基于Sigmoid函数的加速或减速曲线
 */
function generateSigmoidCurve(
  startX: number,
  startY: number,
  distance: number,
  baseTime: number,
  type: 'accelerate' | 'decelerate',
  speedFactor: number
): {x: number, y: number, t: number}[] {
  const points: {x: number, y: number, t: number}[] = [];
  
  // 定义sigmoid函数参数
  const L = distance; // 最大位移
  const beta = 0.8 + Math.random() * 0.4; // 曲线陡度随机化
  
  // 时间间隔根据速度因子调整
  const timeSpan = type === 'accelerate' 
    ? (800 + Math.random() * 400) / speedFactor 
    : (600 + Math.random() * 400) / speedFactor;
  
  // sigmoid函数起止点调整
  const tStart = type === 'accelerate' ? 0 : 5;
  const tEnd = type === 'accelerate' ? 5 : 10;
  
  // 生成轨迹点
  const pointCount = 25 + Math.floor(Math.random() * 15);
  const step = (tEnd - tStart) / pointCount;
  
  // 随机添加一个停顿点（只在加速阶段）
  let hasPause = type === 'accelerate' && Math.random() < 0.3;
  let pauseIndex = hasPause ? Math.floor(pointCount * (0.3 + Math.random() * 0.4)) : -1;
  let pauseDuration = hasPause ? 100 + Math.random() * 200 : 0;
  
  let cumulativeTime = 0;
  
  for (let i = 0; i <= pointCount; i++) {
    const t = tStart + step * i;
    
    // sigmoid函数: L / (1 + e^(-beta*(t-mid)))
    // 对于加速: t从0到5，对应函数上升段
    // 对于减速: t从5到10，对应函数上升后的平缓段
    const sigmoid = L / (1 + Math.exp(-beta * (t - 5)));
    
    // 计算实际x位移
    const x = startX + sigmoid;
    
    // 添加Y轴波动
    const waveAmplitude = Math.min(3, distance * 0.02); // Y波动幅度与距离相关
    const yOffset = (Math.random() * 2 - 1) * waveAmplitude;
    const y = startY + yOffset;
    
    // 计算时间
    const pointTimeShare = timeSpan / pointCount;
    const timeVariation = pointTimeShare * 0.3; // 30%的时间随机变化
    let pointDuration = pointTimeShare + (Math.random() * 2 - 1) * timeVariation;
    
    // 添加暂停时间（如果是暂停点）
    if (i === pauseIndex) {
      pointDuration += pauseDuration;
    }
    
    cumulativeTime += pointDuration;
    
    // 添加轨迹点
    points.push({
      x: x,
      y: y,
      t: baseTime + cumulativeTime
    });
  }
  
  return points;
}

/**
 * 模拟手抖动，实现精细调整
 */
function simulateHandTremor(
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
  lastTime: number,
  adjustCount: number
): {x: number, y: number, t: number}[] {
  const tremorPoints: {x: number, y: number, t: number}[] = [];
  let time = lastTime;
  
  // 计算到目标的距离
  const remainingDistance = targetX - currentX;
  
  // 如果已经接近目标，减少调整次数
  const actualCount = Math.abs(remainingDistance) < 5 
    ? Math.min(2, adjustCount) 
    : adjustCount;
  
  // 生成抖动点
  for (let i = 0; i < actualCount; i++) {
    const ratio = (i + 1) / actualCount;
    
    // 逐渐接近目标x
    const nextX = currentX + remainingDistance * ratio;
    
    // 添加随机抖动
    const tremor = i === actualCount - 1 
      ? 0.5 // 最后一步抖动更小
      : 1.5 + Math.random() * 1.5;
    
    // 生成抖动轨迹
    const trembleFactor = Math.sin(i * Math.PI) * tremor;
    const x = nextX + trembleFactor;
    
    // Y轴也有轻微抖动
    const y = targetY + (Math.random() * 2 - 1) * Math.min(1.5, tremor);
    
    // 时间间隔
    time += 40 + Math.random() * 120;
    
    tremorPoints.push({
      x,
      y,
      t: time
    });
    
    // 最后一个点后可能有微小暂停
    if (i === actualCount - 1 && Math.random() < 0.5) {
      time += 50 + Math.random() * 100;
      tremorPoints.push({
        x: x + (Math.random() * 0.6 - 0.3),
        y: y + (Math.random() * 0.6 - 0.3),
        t: time
      });
    }
  }
  
  return tremorPoints;
}

/**
 * 释放滑块
 */
async function releaseSlider(
  page: Page,
  endPosition: { x: number, y: number },
  startPosition: { x: number, y: number }
) {
  // 到达终点后可能有的行为类型
  const endBehaviorType = Math.random();
  
  if (endBehaviorType < 0.6) {
    // 60%的概率：达到终点后短暂停留再松开
    const endingDelay = 100 + Math.random() * 400;
    await page.waitForTimeout(endingDelay);
  } else if (endBehaviorType < 0.9) {
    // 30%的概率：到达后做小范围调整再松开
    const adjustX = endPosition.x + (Math.random() * 3 - 1.5);
    const adjustY = startPosition.y + (Math.random() * 3 - 1.5);
    await page.mouse.move(adjustX, adjustY);
    await page.waitForTimeout(50 + Math.random() * 150);
    
    // 最后回到准确位置
    if (Math.random() < 0.5) {
      await page.mouse.move(endPosition.x, startPosition.y);
      await page.waitForTimeout(30 + Math.random() * 70);
    }
  } else {
    // 10%的概率：滑过了再回来
    const overX = endPosition.x + 3 + Math.random() * 5;
    await page.mouse.move(overX, startPosition.y);
    await page.waitForTimeout(50 + Math.random() * 100);
    await page.mouse.move(endPosition.x, startPosition.y);
    await page.waitForTimeout(30 + Math.random() * 70);
  }
  
  // 松开鼠标
  await page.mouse.up();
  
  // 释放鼠标后的行为
  if (Math.random() < 0.7) {
    // 70%的概率会移开鼠标
    await page.waitForTimeout(50 + Math.random() * 300);
    
    // 移开距离和方向有较大随机性
    const moveAwayX = endPosition.x + (Math.random() < 0.7 ? 1 : -1) * (10 + Math.random() * 100);
    const moveAwayY = startPosition.y + (Math.random() * 160 - 80);
    await page.mouse.move(moveAwayX, moveAwayY, { steps: 3 + Math.floor(Math.random() * 4) });
  }
}
