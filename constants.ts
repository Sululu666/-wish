export const WISHES_LIST = [
  "新的一年", // Index 0 reserved for center
  "不再焦虑", "开开心心", "幸福每天", "阳光灿烂", "发财赚钱",
  "永远美丽", "永远青春", "永远活力", "心想事成", "好运连连",
  "万事胜意", "岁岁平安", "前程似锦", "平安喜乐", "光芒万丈",
  "拒绝内耗", "清醒独立", "自由漫游", "暴美暴富",
  "平安", "喜乐", "暴富", "自由", "可爱", "被爱", "好运", "健康", "勇敢",
  "温柔", "坚定", "浪漫", "发财", "顺利", "开心", "漂亮", "自信", "独立",
  "清醒", "热烈", "美好", "无畏", "上岸", "加薪", "瘦身", "脱单",
  "长乐", "无忧", "顺遂", "闪耀", "快乐", "知足", "好眠",
  "富有", "才华", "智慧", "优雅", "松弛", "幸运", "灿烂", "明媚",
  "好好睡觉", "好好吃饭", "想哭就哭", "想笑就笑", "做自己", "不被定义"
];

// 3D Point Interface
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Generate a 3D point on/in a heart shape
export const getHeartPosition3D = (index: number, total: number, radius: number): Point3D => {
  // If it's the first item (Index 0), put it exactly in the center
  if (index === 0) return { x: 0, y: 0, z: 0 };

  // Adjust total to account for the reserved center
  const adjustedIndex = index - 1;
  const adjustedTotal = total - 1;

  // We want a "full" heart. 
  // We'll distribute points in multiple layers (shells).
  // Layer 0: Outer shell (Definition) - 50% of points
  // Layer 1: Middle shell - 30% of points
  // Layer 2: Inner shell - 20% of points

  let layerProgress = adjustedIndex / adjustedTotal;
  let scale = 1;
  let tOffset = 0;

  if (layerProgress < 0.5) {
    // Outer Shell
    scale = 1;
    // Map 0..0.5 to 0..1 for angle
    tOffset = (layerProgress / 0.5) * Math.PI * 2;
  } else if (layerProgress < 0.8) {
    // Middle Shell
    scale = 0.7;
    // Map 0.5..0.8 to 0..1
    tOffset = ((layerProgress - 0.5) / 0.3) * Math.PI * 2;
  } else {
    // Inner Shell (Core)
    scale = 0.4;
    // Map 0.8..1.0 to 0..1
    tOffset = ((layerProgress - 0.8) / 0.2) * Math.PI * 2;
  }

  // Heart Formula
  // x = 16 sin^3(t)
  // y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
  const xBase = 16 * Math.pow(Math.sin(tOffset), 3);
  const yBase = -(13 * Math.cos(tOffset) - 5 * Math.cos(2 * tOffset) - 2 * Math.cos(3 * tOffset) - Math.cos(4 * tOffset));

  // Add some randomness to Z to create a 3D "Cloud" volume
  // The z-depth is thicker in the middle and thinner at the edges to look like a puffy heart
  const zBase = (Math.random() - 0.5) * 10;

  return {
    x: xBase * scale * (radius / 16), // Normalize roughly
    y: yBase * scale * (radius / 16),
    z: zBase * (radius / 10)
  };
};

export const ANIMATION_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
