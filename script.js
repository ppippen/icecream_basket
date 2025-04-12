// 初始化订单数组和总价
let order = [];
let totalPrice = 0;

// 获取DOM元素
const flavorElements = document.querySelectorAll('.flavor');
const toppingElements = document.querySelectorAll('.topping');
const iceCreamStack = document.getElementById('ice-cream-stack');
const totalPriceElement = document.getElementById('total-price');
const undoButton = document.getElementById('undo-btn');
const checkoutButton = document.getElementById('checkout-btn');
const modal = document.getElementById('checkout-modal');
const closeModal = document.querySelector('.close');
const finalPriceElement = document.getElementById('final-price');
const newOrderButton = document.getElementById('new-order-btn');

// 获取提示窗口元素
const alertMessage = document.getElementById('topping-alert');

// 添加冰激凌球点击事件
flavorElements.forEach(flavor => {
    flavor.addEventListener('click', () => {
        const type = flavor.dataset.type;
        const flavorName = flavor.dataset.flavor;
        const price = parseFloat(flavor.dataset.price);
        
        addItemToOrder(type, flavorName, price);
    });
});

// 显示提示信息的通用函数
function showAlert(message) {
    alertMessage.textContent = message;
    alertMessage.classList.add('show');
    setTimeout(() => {
        alertMessage.classList.remove('show');
    }, 2000);
}

// 添加淋酱点击事件
toppingElements.forEach(topping => {
    topping.addEventListener('click', () => {
        if (!hasScoops()) {
            showAlert('请先选择冰激凌球');
            return;
        }
        
        const type = topping.dataset.type;
        const flavorName = topping.dataset.flavor;
        const price = parseFloat(topping.dataset.price);
        
        addItemToOrder(type, flavorName, price);
    });
});

// 检查订单中是否有冰激凌球
function hasScoops() {
    return order.some(item => item.type === 'scoop');
}

// 添加商品到订单
function addItemToOrder(type, flavor, price) {
    // 创建新商品对象
    const item = {
        type: type,
        flavor: flavor,
        price: price
    };
    
    // 添加到订单数组
    order.push(item);
    
    // 更新总价
    totalPrice += price;
    
    // 更新UI
    updateOrderDisplay();
}

// 更新订单显示
function updateOrderDisplay() {
    // 清空当前堆叠区域
    iceCreamStack.innerHTML = '';
    
    // 分离冰激凌球和淋酱
    const scoops = order.filter(item => item.type === 'scoop');
    const toppings = order.filter(item => item.type === 'topping');
    
    // 先添加冰激凌球（从底部到顶部）
    scoops.forEach(scoop => {
        const stackItem = document.createElement('div');
        stackItem.classList.add('stack-item', scoop.flavor);
        iceCreamStack.appendChild(stackItem);
    });
    
    // 再添加淋酱（从底部到顶部）
    toppings.forEach(topping => {
        const stackItem = document.createElement('div');
        stackItem.classList.add('stack-item', 'topping', topping.flavor);
        iceCreamStack.appendChild(stackItem);
    });
    
    // 更新总价显示
    totalPriceElement.textContent = `¥${totalPrice.toFixed(2)}`;
}

// 撤销按钮点击事件
undoButton.addEventListener('click', () => {
    if (order.length > 0) {
        // 移除最后一个商品
        const removedItem = order.pop();
        
        // 更新总价
        totalPrice -= removedItem.price;
        
        // 更新UI
        updateOrderDisplay();
    }
});

// 结算按钮点击事件
checkoutButton.addEventListener('click', () => {
    if (order.length === 0) {
        showAlert('请先选择冰激凌！');
        return;
    }
    
    // 更新模态框中的数量显示
    updateModalCounts();
    
    // 更新最终价格
    document.getElementById('final-price').textContent = `¥${calculateTotal()}`;
    
    // 显示模态框
    modal.style.display = 'block';
});

// 关闭模态框
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// 点击模态框外部关闭
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// 开始新订单
newOrderButton.addEventListener('click', () => {
    // 重置所有数量显示为0
    document.querySelectorAll('.count').forEach(element => {
        element.textContent = 'x0';
    });
    
    // 清空订单并关闭模态框
    order = [];
    totalPrice = 0;
    updateOrderDisplay();
    modal.style.display = 'none';
});

function updateModalCounts() {
    // 获取所有商品的数量统计
    const flavorCounts = {
        strawberry: 0,
        chocolate: 0,
        vanilla: 0,
        mint: 0
    };
    
    const toppingCounts = {
        cream: 0,
        cherry: 0,
        caramel: 0
    };
    
    // 统计订单中每种商品的数量
    order.forEach(item => {
        if (item.type === 'scoop') {
            flavorCounts[item.flavor]++;
        } else if (item.type === 'topping') {
            toppingCounts[item.flavor]++;
        }
    });
    
    // 更新冰激凌球数量显示
    Object.keys(flavorCounts).forEach(flavor => {
        const countElement = document.querySelector(`.count[data-flavor="${flavor}"]`);
        if (countElement) {
            countElement.textContent = `x${flavorCounts[flavor]}`;
        }
    });
    
    // 更新淋酱数量显示
    Object.keys(toppingCounts).forEach(topping => {
        const countElement = document.querySelector(`.count[data-flavor="${topping}"]`);
        if (countElement) {
            countElement.textContent = `x${toppingCounts[topping]}`;
        }
    });
}

function calculateTotal() {
    // 返回当前总价
    return totalPrice.toFixed(2);
}

// 点击提示窗口时关闭
alertMessage.addEventListener('click', () => {
    alertMessage.classList.remove('show');
});

// 点击页面任意位置关闭提示窗口
document.addEventListener('click', (event) => {
    if (event.target !== alertMessage && 
        !event.target.closest('.topping') && 
        !event.target.closest('.checkout-btn')) {
        alertMessage.classList.remove('show');
    }
});

// 检测设备方向并优化布局
function checkOrientation() {
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    
    if (isLandscape && isMobile) {
        // 可以在这里添加特定于横屏手机的交互优化
        document.body.classList.add('landscape-mobile');
    } else {
        document.body.classList.remove('landscape-mobile');
    }
}

// 初始检查和监听方向变化
window.addEventListener('load', checkOrientation);
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation); 