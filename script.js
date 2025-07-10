document.addEventListener('DOMContentLoaded', () => {
    initializeCone();
    initializeAudio();
});

// --- 音频处理 ---
let audioContext;
let popBuffer;
const popSoundVariations = [
    {"start": 0.11, "duration": 0.02},
    {"start": 0.81, "duration": 0.03},
    {"start": 1.57, "duration": 0.02},
    {"start": 2.08, "duration": 0.03},
    {"start": 2.82, "duration": 0.01}
];
let lastPopIndex = -1;

const undoSound = new Audio('sounds/undo.mp3');
const checkoutSound = new Audio('sounds/checkout.mp3');
const newOrderSound = new Audio('sounds/newOrder.mp3');

function initializeAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        fetch('sounds/pop.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(decodedData => {
                popBuffer = decodedData;
            })
            .catch(error => console.error('Error loading pop sound:', error));
    } catch (e) {
        console.error('Web Audio API is not supported in this browser', e);
    }
}

function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.error("Error playing sound:", e));
    }
}

function playPopSound() {
    if (!popBuffer || !audioContext) return;

    // 随机选择一个与上次不同的音效片段
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * popSoundVariations.length);
    } while (popSoundVariations.length > 1 && randomIndex === lastPopIndex);
    lastPopIndex = randomIndex;

    const { start, duration } = popSoundVariations[randomIndex];

    const source = audioContext.createBufferSource();
    source.buffer = popBuffer;
    source.connect(audioContext.destination);
    source.start(0, start, duration);
}


// 初始化甜筒
function initializeCone() {
    const iceCreamStack = document.getElementById('ice-cream-stack');
    iceCreamStack.innerHTML = ''; // 清空
    const coneElement = document.createElement('div');
    coneElement.classList.add('stack-item', 'cone-style');
    iceCreamStack.appendChild(coneElement);
}

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
    playPopSound(); // 播放添加音效
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
    // 重新初始化甜筒
    initializeCone();
    
    // 渲染订单中的所有项目
    order.forEach(item => {
        const stackItem = document.createElement('div');
        if (item.type === 'scoop') {
            stackItem.classList.add('stack-item', item.flavor);
        } else if (item.type === 'topping') {
            stackItem.classList.add('stack-item', 'topping', item.flavor);
        }
        iceCreamStack.appendChild(stackItem);
    });
    
    // 更新总价显示
    totalPriceElement.textContent = `¥${totalPrice.toFixed(2)}`;

    // 滚动到底部
    const coneContainer = document.querySelector('.cone-container');
    coneContainer.scrollTop = coneContainer.scrollHeight;
}

// 撤销按钮点击事件
undoButton.addEventListener('click', () => {
    if (order.length > 0) {
        playSound(undoSound); // 播放撤销音效
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
    
    playSound(checkoutSound); // 播放结算音效
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
    playSound(newOrderSound); // 播放新订单音效
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