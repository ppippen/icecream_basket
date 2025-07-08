const { test, expect } = require('@playwright/test');

test.describe('冰激凌小店测试', () => {
  test.beforeEach(async ({ page }) => {
    // 在每个测试前访问冰激凌小店页面
    await page.goto('http://localhost:64909');
  });

  test('测试添加冰激凌球后可以添加淋酱', async ({ page }) => {
    // 添加一个巧克力冰激凌球
    await page.click('.flavor[data-flavor="chocolate"]');
    
    // 验证订单中有一个巧克力冰激凌球
    await expect(page.locator('#ice-cream-stack .stack-item.chocolate')).toHaveCount(1);
    // 验证总元素数量：1个甜筒 + 1个冰激凌球 = 2个
    await expect(page.locator('#ice-cream-stack .stack-item')).toHaveCount(2);
    
    // 验证总价已更新
    await expect(page.locator('#total-price')).toHaveText('¥7.00');
    
    // 添加一个樱桃淋酱
    await page.click('.topping[data-flavor="cherry"]');
    
    // 验证订单中有一个樱桃淋酱
    await expect(page.locator('#ice-cream-stack .stack-item.topping.cherry')).toHaveCount(1);
    // 验证总元素数量：1个甜筒 + 1个冰激凌球 + 1个淋酱 = 3个
    await expect(page.locator('#ice-cream-stack .stack-item')).toHaveCount(3);
    
    // 验证总价已更新
    await expect(page.locator('#total-price')).toHaveText('¥9.00');
  });

  test('测试没有冰激凌球时无法添加淋酱并显示提示', async ({ page }) => {
    // 验证初始状态只有甜筒
    await expect(page.locator('#ice-cream-stack .stack-item')).toHaveCount(1);
    await expect(page.locator('#ice-cream-stack .stack-item.cone-style')).toHaveCount(1);
    
    // 尝试添加一个淋酱（此时没有冰激凌球）
    await page.click('.topping[data-flavor="cream"]');
    
    // 验证提示信息显示
    await expect(page.locator('#topping-alert.show')).toBeVisible();
    
    // 验证提示信息内容
    await expect(page.locator('#topping-alert')).toHaveText('请先选择冰激凌球');
    
    // 验证订单中除了甜筒没有其他商品
    await expect(page.locator('#ice-cream-stack .stack-item')).toHaveCount(1);
    
    // 验证总价仍为0
    await expect(page.locator('#total-price')).toHaveText('¥0.00');
  });

  test('测试添加淋酱后可以继续添加其他商品', async ({ page }) => {
    // 添加一个香草冰激凌球
    await page.click('.flavor[data-flavor="vanilla"]');
    
    // 添加一个焦糖淋酱
    await page.click('.topping[data-flavor="caramel"]');
    
    // 添加另一个薄荷冰激凌球
    await page.click('.flavor[data-flavor="mint"]');
    
    // 添加另一个樱桃淋酱
    await page.click('.topping[data-flavor="cherry"]');
    
    // 验证订单中有两个冰激凌球和两个淋酱，加上甜筒共5个元素
    await expect(page.locator('#ice-cream-stack .stack-item')).toHaveCount(1 + 4);
    
    // 验证总价正确
    await expect(page.locator('#total-price')).toHaveText('¥12.50');
  });

  test('测试添加多个相同类型的商品', async ({ page }) => {
    // 添加两个相同的草莓冰激凌球
    await page.click('.flavor[data-flavor="strawberry"]');
    await page.click('.flavor[data-flavor="strawberry"]');
    
    // 添加两个相同的淡奶油淋酱
    await page.click('.topping[data-flavor="cream"]');
    await page.click('.topping[data-flavor="cream"]');
    
    // 验证订单中有两个草莓冰激凌球和两个淡奶油淋酱
    await expect(page.locator('#ice-cream-stack .stack-item.strawberry')).toHaveCount(2);
    await expect(page.locator('#ice-cream-stack .stack-item.topping.cream')).toHaveCount(2);
    
    // 验证总元素数量：1个甜筒 + 2个草莓 + 2个淡奶油 = 5个
    await expect(page.locator('#ice-cream-stack .stack-item')).toHaveCount(1 + 2 + 2);
    
    // 验证总价正确
    await expect(page.locator('#total-price')).toHaveText('¥12.00');
    
    // 结算并检查模态框中的数量显示
    await page.click('#checkout-btn');
    await expect(page.locator('.count[data-flavor="strawberry"]')).toHaveText('x2');
    await expect(page.locator('.count[data-flavor="cream"]')).toHaveText('x2');
  });

  test('测试撤销按钮功能', async ({ page }) => {
    // 添加多个商品
    await page.click('.flavor[data-flavor="chocolate"]');
    await page.click('.topping[data-flavor="cherry"]');
    await page.click('.flavor[data-flavor="vanilla"]');
    
    // 验证总价
    await expect(page.locator('#total-price')).toHaveText('¥12.00');
    
    // 点击撤销按钮移除最后添加的香草冰激凌球
    await page.click('#undo-btn');
    
    // 验证香草冰激凌球已被移除
    await expect(page.locator('#ice-cream-stack .stack-item.vanilla')).toHaveCount(0);
    
    // 验证总价已更新
    await expect(page.locator('#total-price')).toHaveText('¥9.00');
    
    // 再次点击撤销按钮移除樱桃淋酱
    await page.click('#undo-btn');
    
    // 验证樱桃淋酱已被移除
    await expect(page.locator('#ice-cream-stack .stack-item.topping.cherry')).toHaveCount(0);
    
    // 验证总价已更新
    await expect(page.locator('#total-price')).toHaveText('¥7.00');
  });

  test('测试结算按钮功能 - 有商品', async ({ page }) => {
    // 添加商品
    await page.click('.flavor[data-flavor="mint"]');
    await page.click('.topping[data-flavor="caramel"]');
    
    // 验证总价
    await expect(page.locator('#total-price')).toHaveText('¥7.50');
    
    // 点击结算按钮
    await page.click('#checkout-btn');
    
    // 验证模态框已显示
    await expect(page.locator('#checkout-modal')).toBeVisible();
    
    // 验证最终价格正确
    await expect(page.locator('#final-price')).toHaveText('¥7.50');
    
    // 验证订单明细正确
    await expect(page.locator('.count[data-flavor="mint"]')).toHaveText('x1');
    await expect(page.locator('.count[data-flavor="caramel"]')).toHaveText('x1');
    
    // 点击开始新订单按钮
    await page.click('#new-order-btn');
    
    // 验证订单已重置, 只有甜筒在订单中
    await expect(page.locator('#ice-cream-stack .stack-item.cone-style')).toHaveCount(1);
    await expect(page.locator('#ice-cream-stack .stack-item')).toHaveCount(1);
    await expect(page.locator('#total-price')).toHaveText('¥0.00');
  });

  test('测试结算按钮功能 - 无商品', async ({ page }) => {
    // 验证初始状态只有甜筒
    await expect(page.locator('#ice-cream-stack .stack-item')).toHaveCount(1);
    await expect(page.locator('#ice-cream-stack .stack-item.cone-style')).toHaveCount(1);

    // 不添加任何商品，直接点击结算按钮
    await page.click('#checkout-btn');
    
    // 验证提示信息显示
    await expect(page.locator('#topping-alert.show')).toBeVisible();
    
    // 验证提示信息内容
    await expect(page.locator('#topping-alert')).toHaveText('请先选择冰激凌！');
    
    // 验证模态框未显示
    await expect(page.locator('#checkout-modal')).not.toBeVisible();
  });

  test('测试响应式布局 - 模拟iPhone 6s横屏', async ({ page }) => {
    // 设置视口大小为iPhone 6s横屏
    await page.setViewportSize({ width: 667, height: 375 });
    
    // 验证布局已调整为横向排列
    const shopLayout = await page.evaluate(() => {
      const shop = document.querySelector('.ice-cream-shop');
      return window.getComputedStyle(shop).flexDirection;
    });
    
    expect(shopLayout).toBe('row');
    
    // 验证菜单区域和订单区域的宽度比例
    const menuFlex = await page.evaluate(() => {
      return window.getComputedStyle(document.querySelector('.menu-section')).flex;
    });
    
    const orderFlex = await page.evaluate(() => {
      return window.getComputedStyle(document.querySelector('.order-section')).flex;
    });
    
    // 确保菜单区域比订单区域宽
    expect(parseInt(menuFlex)).toBeGreaterThan(parseInt(orderFlex));
  });

  test('测试添加大量冰激凌球和淋酱，确保滚动和堆叠正确', async ({ page }) => {
    const scoopFlavors = ['strawberry', 'chocolate', 'vanilla', 'mint'];
    const toppingFlavors = ['cream', 'cherry', 'caramel'];

    // 确保所有口味都至少出现一次，然后随机添加剩余的
    let scoopsToAdd = [...scoopFlavors]; // 包含所有4种口味
    for (let i = 0; i < 4; i++) { // 再添加4个随机口味，总共8个
      scoopsToAdd.push(scoopFlavors[Math.floor(Math.random() * scoopFlavors.length)]);
    }
    // 打乱冰激凌球的添加顺序
    for (let i = scoopsToAdd.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scoopsToAdd[i], scoopsToAdd[j]] = [scoopsToAdd[j], scoopsToAdd[i]];
    }

    // 随机选择3个淋酱
    let toppingsToAdd = [];
    for (let i = 0; i < 3; i++) {
      toppingsToAdd.push(toppingFlavors[Math.floor(Math.random() * toppingFlavors.length)]);
    }
    // 打乱淋酱的添加顺序
    for (let i = toppingsToAdd.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [toppingsToAdd[i], toppingsToAdd[j]] = [toppingsToAdd[j], toppingsToAdd[i]];
    }

    // 模拟添加冰激凌球
    for (const flavor of scoopsToAdd) {
      await page.click(`.flavor[data-flavor="${flavor}"]`);
    }

    // 模拟添加淋酱
    for (const topping of toppingsToAdd) {
      await page.click(`.topping[data-flavor="${topping}"]`);
    }

    // 验证总元素数量：1个甜筒 + 8个冰激凌球 + 3个淋酱 = 12个
    await expect(page.locator('#ice-cream-stack .stack-item')).toHaveCount(1 + 8 + 3);

    // 验证滚动条是否在底部
    const coneContainer = page.locator('.cone-container');
    await expect(coneContainer).toBeVisible();

    const isScrolledToBottom = await page.evaluate(() => {
      const container = document.querySelector('.cone-container');
      if (!container) return false;
      // 允许少量误差，因为渲染或子像素可能导致微小差异
      const tolerance = 2;
      return container.scrollHeight - container.scrollTop <= container.clientHeight + tolerance;
    });
    expect(isScrolledToBottom).toBeTruthy();

    // 验证甜筒在最下方且可见 (通过检查其类和可见性)
    const coneElement = page.locator('#ice-cream-stack .stack-item.cone-style');
    await expect(coneElement).toBeVisible();
  });
});
