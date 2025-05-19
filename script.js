const progressBar = document.getElementById('progressBar');
const progressBarText = document.getElementById('progressBarText'); // This ID does not exist in HTML yet
const calendarContainer = document.getElementById('calendarContainer');
const currentDateText = document.getElementById('currentDateText');
const langEnBtn = document.getElementById('langEn');
const langZhBtn = document.getElementById('langZh');
const copyProgressBtn = document.getElementById('copyProgressBtn');
const exportImageBtn = document.getElementById('exportImageBtn'); // Make sure this ID exists in HTML
const mainTitle = document.getElementById('mainTitle');

// Language and Translations
let currentLanguage = localStorage.getItem('preferredLanguage') || 'zh-CN';

const translations = {
    'en': {
        pageTitle: "Year Progress",
        mainTitle: "The year {year} is {percentage}% over",
        dateTodayFormat: "MMMM D, YYYY",
        progressText: "{percentage}% of the year has passed ({dayOfYear}/{daysInYear} days)",
        dayProgressText: "{dayOfYear}/{daysInYear} days",
        copyProgressBtn: "Copy Text",
        copySuccessBtn: "Copied!",
        copyErrorBtn: "Copy Failed!",
        exportImageBtn: "Export Image",
        exportingBtn: "Exporting...",
        exportedBtn: "Exported!",
        exportErrorBtn: "Export Failed!",
        // Assuming social button texts were added like this, based on summary
        twitterButtonText: "Share on X",
        weiboButtonText: "Share on Weibo",
        socialShareAriaLabel: "Share on {platform}",
        calendarDayTooltip: "Month {month}, Day {day} (Day {dayOfYear} of year, {dailyPercentage}% of day)",
        copiedContentTitle: "Year Progress",
        exportFeedback: {
            success: "Image downloaded!",
            error: "Export failed. Please try again."
        },
        socialSharePrompt: "Content copied! Please paste it into your social media.",
        toolName: "Year Progress Visualization Tool", // Added
        shareHashTag: "#YearProgress" // Added
    },
    'zh-CN': {
        pageTitle: "年度进度",
        mainTitle: "{year} 年已过 {percentage}%",
        dateTodayFormat: "YYYY 年 M 月 D 日",
        progressText: "今年已过 {percentage}% (第 {dayOfYear} 天 / 共 {daysInYear} 天)",
        dayProgressText: "第 {dayOfYear} 天 / 共 {daysInYear} 天",
        copyProgressBtn: "复制纯文本",
        copySuccessBtn: "复制成功!",
        copyErrorBtn: "复制失败!",
        exportImageBtn: "导出为图片",
        exportingBtn: "正在导出...",
        exportedBtn: "已导出!",
        exportErrorBtn: "导出失败!",
        twitterButtonText: "分享到 X",
        weiboButtonText: "分享到微博",
        socialShareAriaLabel: "分享到 {platform}",
        calendarDayTooltip: "{month} 月 {day} 日 (年度第 {dayOfYear} 天, 当日进度 {dailyPercentage}%)",
        copiedContentTitle: "年度进度",
        exportFeedback: {
            success: "图片已下载！",
            error: "导出失败，请重试。"
        },
        socialSharePrompt: "内容已复制！请将其粘贴到您的社交媒体。",
        toolName: "年度进度可视化工具", // Added
        shareHashTag: "#年度进度" // Added (or could use #YearProgress for wider reach)
    }
};

// Core Data
const yearData = {
    dayOfYear: 0,
    daysInYear: 0,
    percentage: 0,
    year: 0,
    month: 0,
    day: 0
};

function calculateAndDisplayProgress() {
    const now = new Date();
    yearData.year = now.getFullYear();
    yearData.month = now.getMonth() + 1;
    yearData.day = now.getDate();

    const startOfYear = new Date(yearData.year, 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    yearData.dayOfYear = Math.floor(diff / oneDay);

    yearData.daysInYear = isLeapYear(yearData.year) ? 366 : 365;
    yearData.percentage = ((yearData.dayOfYear / yearData.daysInYear) * 100).toFixed(1);

    updateUIDisplay();
    renderCalendar();
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function updateUIDisplay() {
    const T = translations[currentLanguage] || translations['zh-CN']; // Fallback to Chinese

    document.title = T.pageTitle;
    if (mainTitle) {
        mainTitle.textContent = T.mainTitle
            .replace('{year}', yearData.year)
            .replace('{percentage}', yearData.percentage);
    }

    let formattedDate;
    if (currentLanguage === 'zh-CN') {
        formattedDate = `${yearData.year} 年 ${yearData.month} 月 ${yearData.day} 日`;
    } else {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        formattedDate = `${monthNames[yearData.month - 1]} ${yearData.day}, ${yearData.year}`;
    }

    if (currentDateText) currentDateText.textContent = formattedDate;

    if (progressBar) {
        progressBar.style.width = `${yearData.percentage}%`;
        progressBar.textContent = `${yearData.percentage}%`;
    }
    // if (progressBarText) progressBarText.textContent = `${yearData.percentage}%`; // Comment out or remove as progressBarText element doesn't exist

    // Update button texts (only if not in a temporary feedback state)
    if (copyProgressBtn && !copyProgressBtn.dataset.feedback) {
        copyProgressBtn.textContent = T.copyProgressBtn;
    }
    if (exportImageBtn && !exportImageBtn.dataset.feedback) { // Check for export button feedback state
        exportImageBtn.textContent = T.exportImageBtn;
    }

    // Update social media button texts and aria-labels
    document.querySelectorAll('.social-button').forEach(button => {
        const platform = button.dataset.platform;
        if (platform) {
            const buttonTextKey = `${platform}ButtonText`;
            const ariaLabelKey = `share${platform.charAt(0).toUpperCase() + platform.slice(1)}AriaLabel`;

            if (T[buttonTextKey]) {
                button.textContent = T[buttonTextKey];
            }
            if (T[ariaLabelKey]) {
                button.setAttribute('aria-label', T[ariaLabelKey]);
            }
        }
    });

    // Update active language button
    if (currentLanguage === 'en') {
        if (langEnBtn) langEnBtn.classList.add('active');
        if (langZhBtn) langZhBtn.classList.remove('active');
    } else {
        if (langEnBtn) langEnBtn.classList.remove('active');
        if (langZhBtn) langZhBtn.classList.add('active');
    }
}

function getDaysInMonth(year, month) { // month is 0-indexed (0 for Jan, 11 for Dec)
    return new Date(year, month + 1, 0).getDate();
}

function renderCalendar() {
    if (!calendarContainer) return;
    calendarContainer.innerHTML = ''; // Clear previous squares
    const T = translations[currentLanguage] || translations['zh-CN'];
    const year = yearData.year;
    let dayOfYearCounter = 1;
    // Pre-calculate percentage for each day to avoid repetitive calculation in loop
    const dailyPercentageIncrement = 100 / yearData.daysInYear;

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const daysInCurrentMonth = getDaysInMonth(year, monthIndex);
        const monthForDisplay = monthIndex + 1; // For display (1-12)

        for (let dayOfMonth = 1; dayOfMonth <= daysInCurrentMonth; dayOfMonth++) {
            if (dayOfYearCounter > yearData.daysInYear) break;

            const daySquare = document.createElement('div');
            daySquare.classList.add('day-square');
            daySquare.textContent = dayOfMonth;
            daySquare.classList.add(`month-idx-${monthIndex % 3}`);

            if (dayOfYearCounter < yearData.dayOfYear) {
                daySquare.classList.add('past');
            } else if (dayOfYearCounter === yearData.dayOfYear) {
                daySquare.classList.add('current');
            }

            // Calculate percentage for this specific day
            const currentDayPercentage = (dayOfYearCounter * dailyPercentageIncrement).toFixed(1);

            // Updated tooltip format
            if (currentLanguage === 'zh-CN') {
                daySquare.title = `${year} 年 ${monthForDisplay} 月 ${dayOfMonth} 日 (年度第 ${dayOfYearCounter} 天, 当日进度 ${currentDayPercentage}%)`;
            } else {
                daySquare.title = `${monthForDisplay}/${dayOfMonth}/${year} (Day ${dayOfYearCounter}, ${currentDayPercentage}%)`;
            }

            calendarContainer.appendChild(daySquare);
            dayOfYearCounter++;
        }
    }
}

function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
    } else {
        console.warn(`Language "${lang}" not found. Defaulting to 'zh-CN'.`);
        currentLanguage = 'zh-CN'; // Default to Chinese if specified lang doesn't exist
        localStorage.setItem('preferredLanguage', 'zh-CN');
    }
    calculateAndDisplayProgress(); // Re-render UI with new language
}

function generateProgressTextForCopy() {
    const T = translations[currentLanguage] || translations['zh-CN'];

    // 格式化日期，确保中文和数字之间有空格
    let dateInfo;
    if (currentLanguage === 'zh-CN') {
        dateInfo = `${yearData.year} 年 ${yearData.month} 月 ${yearData.day} 日`;
    } else {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        dateInfo = `${monthNames[yearData.month - 1]} ${yearData.day}, ${yearData.year}`;
    }

    // 简单的文本进度条（20个字符宽）
    const progressBarLength = 20;
    const filledBlocks = Math.round((yearData.percentage / 100) * progressBarLength);
    const emptyBlocks = progressBarLength - filledBlocks;
    const textProgressBar = '▓'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

    // 格式化进度文本，确保中文和数字之间有空格
    let coreProgressText;
    if (currentLanguage === 'zh-CN') {
        coreProgressText = `今年已过 ${yearData.percentage}%`;
    } else {
        coreProgressText = `Year is ${yearData.percentage}% past`;
    }

    // 添加网站URL
    const websiteUrl = 'www.yearpercent.xyz';

    // 返回完整的复制内容
    return `${textProgressBar} ${coreProgressText} ${websiteUrl}`;
}

function showCopyFeedback(success) {
    if (!copyProgressBtn) return;
    const T = translations[currentLanguage] || translations['zh-CN'];
    const originalText = T.copyProgressBtn;

    copyProgressBtn.textContent = success ? T.copySuccessBtn : T.copyErrorBtn;
    copyProgressBtn.dataset.feedback = "true"; // Mark that feedback is active

    setTimeout(() => {
        copyProgressBtn.textContent = originalText;
        delete copyProgressBtn.dataset.feedback; // Remove feedback mark
        // updateUIDisplay(); // This will also reset the button text correctly
    }, 2000);
}

// Event Listeners
if (langEnBtn) langEnBtn.addEventListener('click', () => setLanguage('en'));
if (langZhBtn) langZhBtn.addEventListener('click', () => setLanguage('zh-CN'));

if (copyProgressBtn) {
    copyProgressBtn.addEventListener('click', () => {
        const textToCopy = generateProgressTextForCopy();
        navigator.clipboard.writeText(textToCopy).then(() => {
            showCopyFeedback(true);
        }).catch(err => {
            console.warn('Async clipboard copy failed, trying fallback:', err);
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                showCopyFeedback(successful);
            } catch (fallbackErr) {
                console.error('Fallback copy method failed:', fallbackErr);
                showCopyFeedback(false);
            }
            document.body.removeChild(textArea);
        });
    });
}

if (exportImageBtn) {
    exportImageBtn.addEventListener('click', () => {
        const captureArea = document.getElementById('captureArea');
        const T = translations[currentLanguage] || translations['zh-CN'];

        if (!captureArea) {
            console.error('Capture area #captureArea not found!');
            exportImageBtn.textContent = T.exportErrorBtn;
            exportImageBtn.dataset.feedback = "true";
            setTimeout(() => {
                delete exportImageBtn.dataset.feedback;
                updateUIDisplay();
            }, 2000);
            return;
        }

        exportImageBtn.textContent = T.exportingBtn;
        exportImageBtn.disabled = true;
        exportImageBtn.dataset.feedback = "true";

        const originalContainerBoxShadow = captureArea.style.boxShadow;
        const originalDaySquareBoxShadow = {}; // To store multiple original shadows if needed for :hover

        // Temporarily remove shadows that might cause issues
        captureArea.style.boxShadow = 'none';
        // Consider if day-square hover shadows need to be addressed, though less likely for capture

        const progressBarElement = document.getElementById('progressBar');
        let originalProgressBarTextContent = null; // Store textContent
        if (progressBarElement) {
            originalProgressBarTextContent = progressBarElement.textContent;
            progressBarElement.textContent = ''; // Remove text content during capture
        }

        // If background is transparent, html2canvas might make it black or have issues.
        // Set a temporary white background for capture if it's transparent.
        const originalBackgroundColor = captureArea.style.backgroundColor;
        if (window.getComputedStyle(captureArea).backgroundColor === 'rgba(0, 0, 0, 0)') {
            captureArea.style.backgroundColor = 'white';
        }

        html2canvas(captureArea, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: 'white',
            logging: true, // Enable logging for more info
            // scale: window.devicePixelRatio || 2, 
        }).then(canvas => {
            const imageURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imageURL;
            link.download = 'year_progress.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            exportImageBtn.textContent = T.exportedBtn; // Corrected to success text
        }).catch(err => {
            console.error('Error exporting image:', err);
            exportImageBtn.textContent = T.exportErrorBtn;
        }).finally(() => {
            captureArea.style.backgroundColor = originalBackgroundColor;
            captureArea.style.boxShadow = originalContainerBoxShadow;
            if (progressBarElement) {
                progressBarElement.textContent = originalProgressBarTextContent; // Restore text content
            }
            exportImageBtn.disabled = false;
            setTimeout(() => {
                delete exportImageBtn.dataset.feedback;
                updateUIDisplay(); // Reset button text via UI update
            }, 2000); // Keep success/error message for 2 seconds
        });
    });
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    calculateAndDisplayProgress();

    // 重新实现社交分享按钮的事件监听
    const weiboButton = document.querySelector('.social-button[data-platform="weibo"]');
    const twitterButton = document.querySelector('.social-button[data-platform="twitter"]');

    if (weiboButton) {
        weiboButton.addEventListener('click', () => {
            console.log('微博按钮被点击'); // 调试信息
            handleSocialShare('weibo');
        });
    } else {
        console.warn('未找到微博分享按钮');
    }

    if (twitterButton) {
        twitterButton.addEventListener('click', () => {
            console.log('X按钮被点击'); // 调试信息
            handleSocialShare('twitter');
        });
    } else {
        console.warn('未找到X分享按钮');
    }

    // 更新语言按钮和其他元素的事件监听器...
    if (langEnBtn) langEnBtn.addEventListener('click', () => setLanguage('en'));
    if (langZhBtn) langZhBtn.addEventListener('click', () => setLanguage('zh-CN'));

    if (copyProgressBtn) {
        copyProgressBtn.addEventListener('click', () => {
            const textToCopy = generateProgressTextForCopy();
            navigator.clipboard.writeText(textToCopy).then(() => {
                showCopyFeedback(true);
            }).catch(err => {
                console.warn('Async clipboard copy failed, trying fallback:', err);
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    const successful = document.execCommand('copy');
                    showCopyFeedback(successful);
                } catch (fallbackErr) {
                    console.error('Fallback copy method failed:', fallbackErr);
                    showCopyFeedback(false);
                }
                document.body.removeChild(textArea);
            });
        });
    }
});

function handleSocialShare(platform) {
    // 确保字符串中所有数字和中文之间都有空格
    let currentMainTitle;
    if (currentLanguage === 'zh-CN') {
        // 处理中文标题，确保数字和中文之间有空格
        currentMainTitle = translations[currentLanguage].mainTitle
            .replace('{year}', yearData.year)
            .replace('{percentage}', yearData.percentage.toFixed(1));
    } else {
        // 英文标题无需特殊处理
        currentMainTitle = translations[currentLanguage].mainTitle
            .replace('{year}', yearData.year)
            .replace('{percentage}', yearData.percentage.toFixed(1));
    }

    // 使用固定网址而不是当前页面URL
    const fixedUrl = 'www.yearpercent.xyz';

    // 简化分享文本，只包含主标题和网址
    const shareText = `${currentMainTitle} ${fixedUrl}`;

    console.log(`正在分享到${platform}: ${shareText}`); // 调试信息

    if (platform === 'twitter') {
        // 打开Twitter分享链接
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');
    } else if (platform === 'weibo') {
        // 打开微博分享链接
        const weiboUrl = `http://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}`;
        window.open(weiboUrl, '_blank');
    } else if (platform === 'navigator') {
        // Web Share API (仅在移动设备上)
        if (navigator.share) {
            navigator.share({
                    title: document.title,
                    text: shareText,
                })
                .then(() => console.log('成功分享'))
                .catch((error) => console.log('分享出错', error));
        }
    }
}

function copyTextToClipboardAndPrompt(text, promptMessage) {
    navigator.clipboard.writeText(text).then(() => {
        alert(promptMessage); // Simple alert, can be replaced with a custom modal
    }).catch(err => {
        console.error('Failed to copy text for sharing:', err);
        // Fallback copy method if navigator.clipboard fails (e.g., on HTTP or older browsers)
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert(promptMessage);
        } catch (fallbackErr) {
            alert('复制失败，请手动复制内容。'); // Generic error for fallback
            console.error('Fallback copy method failed:', fallbackErr);
        }
        document.body.removeChild(textArea);
    });
}

// Auto-update every minute to keep the progress fresh if the page is left open
setInterval(calculateAndDisplayProgress, 60000);

// 在文件最顶部加入调试函数
function logDebug(message) {
    console.log(`[DEBUG] ${message}`);
    // 也可以考虑在页面上显示调试信息
    const debugInfo = document.createElement('div');
    debugInfo.style.position = 'fixed';
    debugInfo.style.top = '10px';
    debugInfo.style.right = '10px';
    debugInfo.style.background = 'rgba(255,0,0,0.8)';
    debugInfo.style.color = 'white';
    debugInfo.style.padding = '5px';
    debugInfo.style.zIndex = '9999';
    debugInfo.style.maxWidth = '80%';
    debugInfo.textContent = message;
    document.body.appendChild(debugInfo);

    // 3秒后自动移除
    setTimeout(() => {
        if (document.body.contains(debugInfo)) {
            document.body.removeChild(debugInfo);
        }
    }, 3000);
}

// 更新window.load事件中的分享文本生成逻辑
window.addEventListener('load', function() {
    logDebug('页面完全加载，尝试绑定分享按钮事件');

    // 尝试查找按钮
    const weiboButton = document.querySelector('button[data-platform="weibo"]');
    const twitterButton = document.querySelector('button[data-platform="twitter"]');

    logDebug(`找到微博按钮: ${weiboButton !== null}, 找到X按钮: ${twitterButton !== null}`);

    // 使用内联函数直接处理微博分享
    if (weiboButton) {
        weiboButton.onclick = function() {
            logDebug('微博按钮被点击');
            try {
                // 使用与复制功能完全相同的文本生成函数
                const shareText = generateProgressTextForCopy();
                const weiboUrl = `http://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}`;
                logDebug(`尝试打开微博分享链接: ${weiboUrl}`);
                const newWindow = window.open(weiboUrl, '_blank');

                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    logDebug('弹窗被阻止！请允许浏览器弹窗或尝试使用复制功能。');
                    alert('弹窗被阻止！请允许浏览器弹窗或尝试使用复制功能。');
                }
            } catch (error) {
                logDebug(`微博分享出错: ${error.message}`);
                alert(`分享出错: ${error.message}`);
            }
            return false; // 阻止默认行为
        };
    }

    // 使用内联函数直接处理X分享
    if (twitterButton) {
        twitterButton.onclick = function() {
            logDebug('X按钮被点击');
            try {
                // 使用与复制功能完全相同的文本生成函数
                const shareText = generateProgressTextForCopy();
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
                logDebug(`尝试打开X分享链接: ${twitterUrl}`);
                const newWindow = window.open(twitterUrl, '_blank');

                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    logDebug('弹窗被阻止！请允许浏览器弹窗或尝试使用复制功能。');
                    alert('弹窗被阻止！请允许浏览器弹窗或尝试使用复制功能。');
                }
            } catch (error) {
                logDebug(`X分享出错: ${error.message}`);
                alert(`分享出错: ${error.message}`);
            }
            return false; // 阻止默认行为
        };
    }

    // 添加备用方案：通过复制链接的方式
    const buttons = document.querySelectorAll('.social-button');
    buttons.forEach(button => {
        button.addEventListener('contextmenu', function(e) {
            e.preventDefault(); // 阻止默认右键菜单
            const platform = this.dataset.platform;
            // 使用与复制功能完全相同的文本生成函数
            const shareText = generateProgressTextForCopy();

            logDebug(`尝试复制分享文本 (${platform}): ${shareText}`);
            navigator.clipboard.writeText(shareText).then(() => {
                alert(`分享内容已复制到剪贴板！您可以手动粘贴到${platform}。`);
            }).catch(err => {
                logDebug(`复制失败: ${err.message}`);
                alert(`复制失败: ${err.message}，请手动复制内容。`);
            });
        });
    });
});