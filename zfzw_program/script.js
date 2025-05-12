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
    let isWaitingForResponse = false;
    
    // 后端API URL
    const API_BASE_URL = 'http://localhost:3000';
    
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
            sendButton.disabled = !chatInput.value.trim() || isWaitingForResponse;
        });

        // 聊天输入框回车事件
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !sendButton.disabled) {
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
    async function handleSendMessage() {
        const text = chatInput.value.trim();
        
        if (text && !isWaitingForResponse) {
            // 设置等待状态
            isWaitingForResponse = true;
            sendButton.disabled = true;
            
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
            
            // 添加骨架屏
            addSkeletonLoader();
            
            try {
                if (userType === 'business') {
                    // 企业用户咨询API
                    const response = await fetch(`${API_BASE_URL}/api/business-consult`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ input: text })
                    });
                    
                    const data = await response.json();
                    
                    // 移除骨架屏
                    removeSkeletonLoader();
                    
                    if (data.success) {
                        // 创建机器人回复消息
                        const botResponse = {
                            text: data.data,
                            sender: 'bot',
                            timestamp: new Date().toLocaleTimeString(),
                            isMarkdown: true
                        };
                        
                        // 添加机器人回复到聊天历史
                        addMessage(botResponse);
                    } else {
                        // 处理错误
                        addErrorMessage(data.message || '获取回复失败');
                    }
                } else {
                    // 个人用户咨询 - 目前只提供模拟回复
                    // 延迟模拟网络请求
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // 移除骨架屏
                    removeSkeletonLoader();
                    
                    const botResponse = {
                        text: "您好！您的个人咨询已收到，我们将尽快为您处理。\n\n目前个人用户咨询功能正在完善中，敬请期待。",
                        sender: 'bot',
                        timestamp: new Date().toLocaleTimeString()
                    };
                    
                    addMessage(botResponse);
                }
            } catch (error) {
                console.error('API请求失败:', error);
                
                // 移除骨架屏
                removeSkeletonLoader();
                
                // 添加错误消息
                addErrorMessage('网络错误，请稍后重试');
            } finally {
                // 重置等待状态
                isWaitingForResponse = false;
                sendButton.disabled = false;
            }
        }
    }

    // 添加骨架屏加载动画
    function addSkeletonLoader() {
        const skeletonElement = document.createElement('div');
        skeletonElement.className = 'message bot-message message-skeleton';
        skeletonElement.id = 'skeleton-loader';
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble skeleton';
        
        // 添加多行骨架线
        for (let i = 0; i < 3; i++) {
            const skeletonLine = document.createElement('div');
            skeletonLine.className = 'skeleton-line';
            messageBubble.appendChild(skeletonLine);
        }
        
        skeletonElement.appendChild(messageBubble);
        chatMessages.appendChild(skeletonElement);
        
        // 自动滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 移除骨架屏加载动画
    function removeSkeletonLoader() {
        const skeletonLoader = document.getElementById('skeleton-loader');
        if (skeletonLoader) {
            skeletonLoader.remove();
        }
    }

    // 添加错误消息
    function addErrorMessage(errorText) {
        const errorMessage = {
            text: `错误: ${errorText}`,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString(),
            isError: true
        };
        
        addMessage(errorMessage);
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
        
        // 如果是错误消息，添加错误样式
        if (message.isError) {
            messageBubble.style.backgroundColor = '#ffebee';
            messageBubble.style.color = '#b71c1c';
            messageBubble.style.borderLeft = '4px solid #b71c1c';
        }
        
        // 处理消息内容
        if (message.isMarkdown) {
            // 创建Markdown容器
            const markdownContainer = document.createElement('div');
            markdownContainer.className = 'markdown-content';
            
            // 使用marked.js渲染Markdown（如果可用）
            if (typeof marked !== 'undefined') {
                markdownContainer.innerHTML = marked.parse(message.text);
            } else {
                // 回退到简单的Markdown处理
                markdownContainer.innerHTML = simpleMarkdownToHtml(message.text);
            }
            
            messageBubble.appendChild(markdownContainer);
        } else {
            // 普通文本消息
            const messageText = document.createElement('p');
            messageText.textContent = message.text;
            messageBubble.appendChild(messageText);
        }
        
        const messageTimestamp = document.createElement('div');
        messageTimestamp.className = 'message-timestamp';
        messageTimestamp.textContent = message.timestamp;
        
        messageBubble.appendChild(messageTimestamp);
        messageElement.appendChild(messageBubble);
        
        // 添加消息元素到聊天窗口
        chatMessages.appendChild(messageElement);
        
        // 自动滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 简单的Markdown转HTML处理函数
    function simpleMarkdownToHtml(markdown) {
        if (!markdown) return '';
        
        let html = markdown;
        
        // 处理标题
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // 处理粗体
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 处理斜体
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // 处理列表
        html = html.replace(/^\s*- (.*$)/gm, '<ul><li>$1</li></ul>').replace(/<\/ul><ul>/g, '');
        
        // 处理换行符
        html = html.replace(/\n/g, '<br>');
        
        return html;
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

    // 添加marked.js库用于Markdown渲染
    function loadMarkedLibrary() {
        if (typeof marked === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            script.onload = function() {
                console.log('Marked.js library loaded');
                // 配置marked选项
                if (typeof marked !== 'undefined') {
                    marked.setOptions({
                        breaks: true,
                        gfm: true
                    });
                }
            };
            document.head.appendChild(script);
        }
    }

    // 加载Markdown渲染库
    loadMarkedLibrary();
});