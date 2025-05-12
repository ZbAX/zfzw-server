document.addEventListener('DOMContentLoaded', function() {
    // 页面元素
    const homePage = document.getElementById('home-page');
    const chatPage = document.getElementById('chat-page');
    const chatTitle = document.getElementById('chat-title');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const backButton = document.getElementById('back-button');
    const serviceButtons = document.querySelectorAll('.service-button');
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    // 状态变量
    let currentPage = 'home';
    let userType = '';
    let currentSlide = 0;
    let chatHistory = [];
    
    // 初始化轮播图
    initCarousel();

    // 初始化事件监听器
    initEventListeners();

    // 轮播图初始化函数
    function initCarousel() {
        // 设置定时器，每5秒自动切换轮播图
        setInterval(() => {
            nextSlide();
        }, 5000);

        // 为轮播图指示器添加点击事件
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
            });
        });
    }

    // 下一张轮播图
    function nextSlide() {
        goToSlide((currentSlide + 1) % carouselSlides.length);
    }

    // 切换到指定轮播图
    function goToSlide(index) {
        // 移除所有轮播图和指示器的active类
        carouselSlides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // 为当前轮播图和指示器添加active类
        carouselSlides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        // 更新当前轮播图索引
        currentSlide = index;
    }

    // 初始化事件监听器
    function initEventListeners() {
        // 服务按钮点击事件
        serviceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const type = button.getAttribute('data-type');
                startChat(type);
            });
        });

        // 返回按钮点击事件
        backButton.addEventListener('click', () => {
            setCurrentPage('home');
        });

        // 发送按钮点击事件
        sendButton.addEventListener('click', handleSendMessage);

        // 聊天输入框输入事件
        chatInput.addEventListener('input', () => {
            sendButton.disabled = !chatInput.value.trim();
        });

        // 聊天输入框回车事件
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }

    // 开始聊天
    function startChat(type) {
        userType = type;
        setCurrentPage('chat');
        
        // 清空聊天历史
        chatHistory = [];
        chatMessages.innerHTML = '';
        
        // 更新聊天标题
        chatTitle.textContent = type === 'business' ? '企业用户咨询' : '个人用户咨询';
        
        // 添加欢迎消息
        const welcomeMessage = {
            text: `欢迎${type === 'business' ? '企业用户' : '个人用户'}！请提出您的政务相关问题`,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString()
        };
        
        addMessage(welcomeMessage);
    }

    // 处理发送消息
    function handleSendMessage() {
        const text = chatInput.value.trim();
        
        if (text) {
            // 创建用户消息对象
            const userMessage = {
                text: text,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString()
            };
            
            // 添加用户消息到聊天历史
            addMessage(userMessage);
            
            // 清空输入框
            chatInput.value = '';
            sendButton.disabled = true;
            
            // 模拟AI回复
            setTimeout(() => {
                const botResponse = {
                    text: "您好！您的咨询已收到，我们将尽快为您处理。",
                    sender: 'bot',
                    timestamp: new Date().toLocaleTimeString()
                };
                
                addMessage(botResponse);
                
                // 自动滚动到底部
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        }
    }

    // 添加消息到聊天窗口
    function addMessage(message) {
        // 添加消息到聊天历史
        chatHistory.push(message);
        
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}-message`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble';
        
        const messageText = document.createElement('p');
        messageText.textContent = message.text;
        
        const messageTimestamp = document.createElement('div');
        messageTimestamp.className = 'message-timestamp';
        messageTimestamp.textContent = message.timestamp;
        
        messageBubble.appendChild(messageText);
        messageBubble.appendChild(messageTimestamp);
        messageElement.appendChild(messageBubble);
        
        // 添加消息元素到聊天窗口
        chatMessages.appendChild(messageElement);
        
        // 自动滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 设置当前页面
    function setCurrentPage(page) {
        currentPage = page;
        
        if (page === 'home') {
            homePage.classList.remove('hidden');
            chatPage.classList.add('hidden');
        } else {
            homePage.classList.add('hidden');
            chatPage.classList.remove('hidden');
        }
    }
});