const GIF_URL = ""; // 可替換成你的 GIF 網址，留空時會直接使用內建動畫備援
const QUESTION_COUNT = 6; // 設定測驗總題數
const OPTION_COUNT = 6; // 設定每題選項數量
const PASS_PERCENT = 60; // 設定彩帶效果所需的嚴格及格門檻

let questions = []; // 儲存六道 p5.js 題目資料
let answers = []; // 儲存每一題目前選取的選項索引
let currentQuestion = 0; // 記錄目前顯示的題號索引
let submitted = false; // 記錄是否已經交卷
let score = 0; // 記錄交卷後的答對題數
let gifElement = null; // 儲存可替換的 GIF 網頁元素
let gifLoadState = "fallback"; // 記錄 GIF 載入狀態
let dragging = null; // 儲存目前正在拖曳的選項資料
let confetti = []; // 儲存彩帶粒子資料
let confettiActive = false; // 記錄是否啟用彩帶動畫
let hoverTarget = ""; // 記錄滑鼠目前移入的互動區域

function setup() { // 建立畫布與測驗初始狀態
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的響應式畫布
  pixelDensity(1); // 使用一致的像素密度以避免不同裝置尺寸差異
  textFont("Noto Sans TC, sans-serif"); // 優先使用適合繁體中文的字型
  textAlign(LEFT, TOP); // 設定文字預設為左上角對齊
  questions = createQuestions(); // 建立六道 p5.js 簡易程式設計題
  answers = Array(QUESTION_COUNT).fill(null); // 初始化每題答案為尚未選取
  setupGifElement(); // 建立可替換的 GIF 元素並設定失敗備援
  describe("p5.js 簡易程式設計拖曳測驗介面"); // 為畫布提供無障礙描述
} // 結束畫布初始化函式

function draw() { // 每一幀繪製完整的測驗畫面
  const layout = getLayout(); // 取得目前視窗尺寸對應的版面配置
  background(242, 247, 255); // 填入柔和的淺色背景
  drawBackgroundDecoration(layout); // 繪製背景裝飾圓形與網格
  drawConfetti(); // 在畫面上更新並繪製彩帶效果
  drawHeader(layout); // 繪製標題、進度與 GIF 網址提示
  drawMediaPanel(layout); // 繪製上方 GIF 顯示區與內建動畫
  drawQuestionPanel(layout); // 繪製題目文字與目前答案區
  drawOptionPanel(layout); // 繪製下方六個可拖曳文字選項
  drawNavigation(layout); // 繪製上一題、下一題與題號導覽
  drawSubmitArea(layout); // 繪製交卷、重新測驗與成績訊息
  drawDraggingOption(layout); // 繪製目前跟隨滑鼠的拖曳選項
  updateHoverTarget(layout); // 更新滑鼠所在互動區域與游標樣式
} // 結束畫面繪製函式

function createQuestions() { // 建立所有測驗題目與選項內容
  return [ // 回傳六道完整的題目資料
    { // 建立第一題資料物件
      question: "若要讓 p5.js 程式在畫布建立時執行一次，應使用哪個函式？", // 設定第一題題目
      answer: 0, // 設定第一題正確選項索引
      options: ["function setup() { }", "function draw() { }", "createCanvas(400, 400);", "background(220);", "mousePressed();", "start();"] // 設定第一題六個選項
    }, // 結束第一題資料物件
    { // 建立第二題資料物件
      question: "若要讓 p5.js 持續重複繪圖，通常應把程式寫在哪個函式？", // 設定第二題題目
      answer: 1, // 設定第二題正確選項索引
      options: ["setup()", "draw()", "loopOnce()", "repeatCanvas()", "frameStart()", "animate()"] // 設定第二題六個選項
    }, // 結束第二題資料物件
    { // 建立第三題資料物件
      question: "下列哪一行可以建立寬四百、高三百的 p5.js 畫布？", // 設定第三題題目
      answer: 2, // 設定第三題正確選項索引
      options: ["canvas(400, 300);", "size(400, 300);", "createCanvas(400, 300);", "makeCanvas(400, 300);", "newCanvas(400, 300);", "screen(400, 300);"] // 設定第三題六個選項
    }, // 結束第三題資料物件
    { // 建立第四題資料物件
      question: "哪一行會把畫布背景填成灰階值 220 的顏色？", // 設定第四題題目
      answer: 3, // 設定第四題正確選項索引
      options: ["fill(220);", "stroke(220);", "color(220);", "background(220);", "paint(220);", "clear(220);"] // 設定第四題六個選項
    }, // 結束第四題資料物件
    { // 建立第五題資料物件
      question: "若要在畫布畫出一個圓形，p5.js 最適合使用哪個函式？", // 設定第五題題目
      answer: 4, // 設定第五題正確選項索引
      options: ["circleShape();", "oval();", "roundRect();", "ellipseBox();", "ellipse();", "drawCircle();"] // 設定第五題六個選項
    }, // 結束第五題資料物件
    { // 建立第六題資料物件
      question: "哪個 p5.js 事件函式可在使用者按下滑鼠時執行一次？", // 設定第六題題目
      answer: 5, // 設定第六題正確選項索引
      options: ["mouseDownLoop()", "clickCanvas()", "onMouse()", "mouseAction()", "pressedMouse()", "mousePressed()"] // 設定第六題六個選項
    } // 結束第六題資料物件
  ]; // 結束題目陣列
} // 結束題目建立函式

function setupGifElement() { // 建立並設定 GIF 顯示元素
  if (GIF_URL.trim().length === 0) { // 判斷使用者是否尚未填入 GIF 網址
    gifLoadState = "fallback"; // 沒有網址時直接使用內建動畫
    return; // 結束 GIF 元素建立流程
  } // 結束空網址判斷
  gifLoadState = "loading"; // 將 GIF 狀態設定為載入中
  gifElement = createImg(GIF_URL, "自訂 GIF 動畫"); // 建立可替換的 GIF 圖片元素
  gifElement.hide(); // 載入完成前先隱藏圖片元素
  gifElement.elt.onload = handleGifLoad; // 設定 GIF 載入成功時的處理函式
  gifElement.elt.onerror = handleGifError; // 設定 GIF 載入失敗時的備援處理函式
  gifElement.style("border-radius", "18px"); // 設定 GIF 圖片的圓角樣式
  gifElement.style("object-fit", "cover"); // 讓 GIF 影像以填滿方式顯示
  gifElement.style("display", "block"); // 確保 GIF 元素以區塊方式呈現
} // 結束 GIF 元素設定函式

function handleGifLoad() { // 處理 GIF 成功載入事件
  gifLoadState = "loaded"; // 將 GIF 狀態更新為成功載入
  if (gifElement !== null) { // 確認 GIF 元素確實存在
    gifElement.show(); // 顯示成功載入的 GIF 圖片
  } // 結束 GIF 元素存在判斷
} // 結束 GIF 載入成功函式

function handleGifError() { // 處理 GIF 載入失敗事件
  gifLoadState = "fallback"; // 將狀態切換成內建動畫備援
  if (gifElement !== null) { // 確認 GIF 元素確實存在
    gifElement.hide(); // 隱藏無法載入的 GIF 圖片
  } // 結束 GIF 元素存在判斷
} // 結束 GIF 載入失敗函式

function getLayout() { // 計算不同螢幕尺寸適用的版面配置
  const margin = max(16, min(42, width * 0.045)); // 依畫布寬度計算左右留白
  const contentWidth = width - margin * 2; // 計算主要內容可用寬度
  const headerHeight = 72; // 設定頂端標題區高度
  const mediaY = headerHeight + 8; // 設定 GIF 媒體區的垂直位置
  const mediaHeight = max(138, min(230, height * 0.22)); // 依視窗高度限制媒體區高度
  const answerY = mediaY + mediaHeight + 14; // 設定答案區的垂直位置
  const answerHeight = 76; // 設定答案區高度
  const optionY = answerY + answerHeight + 14; // 設定選項區的垂直位置
  const navHeight = 58; // 設定導覽按鈕區高度
  const submitHeight = 64; // 設定交卷區高度
  const bottomReserve = navHeight + submitHeight + 28; // 保留底部導覽與交卷空間
  const optionHeight = max(42, min(62, (height - optionY - bottomReserve) / 3)); // 計算三列選項高度
  const optionGap = 10; // 設定選項卡片之間的間距
  const optionWidth = (contentWidth - optionGap) / 2; // 計算兩欄選項卡片寬度
  const navY = optionY + (optionHeight + optionGap) * 3 + 10; // 設定題號導覽垂直位置
  const submitY = max(navY + navHeight + 4, height - submitHeight - 8); // 設定交卷區垂直位置
  return { margin, contentWidth, headerHeight, mediaY, mediaHeight, answerY, answerHeight, optionY, optionHeight, optionGap, optionWidth, navY, navHeight, submitY, submitHeight }; // 回傳完整版面配置
} // 結束版面計算函式

function drawBackgroundDecoration(layout) { // 繪製背景的柔和裝飾元素
  noStroke(); // 關閉背景裝飾外框線
  fill(214, 231, 255, 115); // 設定左上裝飾圓的半透明顏色
  ellipse(width - 22, 28, 150, 150); // 繪製右上裝飾圓形
  fill(226, 246, 236, 150); // 設定左下裝飾圓的半透明顏色
  ellipse(18, height - 20, 190, 190); // 繪製左下裝飾圓形
  stroke(220, 231, 246, 110); // 設定細緻背景網格線顏色
  strokeWeight(1); // 設定背景網格線寬度
  for (let x = layout.margin; x < width; x += 32) { // 逐條繪製垂直背景網格
    line(x, layout.headerHeight, x, height); // 繪製一條垂直網格線
  } // 結束垂直背景網格迴圈
  for (let y = layout.headerHeight; y < height; y += 32) { // 逐條繪製水平背景網格
    line(0, y, width, y); // 繪製一條水平網格線
  } // 結束水平背景網格迴圈
} // 結束背景裝飾函式

function drawHeader(layout) { // 繪製測驗頁面頂端標題與進度
  noStroke(); // 關閉標題區外框線
  fill(25, 48, 83); // 設定主標題文字顏色
  textStyle(BOLD); // 設定主標題使用粗體
  textSize(min(28, max(20, width * 0.035))); // 依畫布寬度調整主標題大小
  text("p5.js 拖曳程式設計測驗", layout.margin, 16); // 顯示測驗主標題
  textStyle(NORMAL); // 還原一般文字樣式
  fill(80, 103, 135); // 設定副標題文字顏色
  textSize(13); // 設定副標題文字大小
  text("把正確的程式選項拖到圖片下方的答案區", layout.margin, 48); // 顯示操作提示文字
  textAlign(RIGHT, TOP); // 暫時將進度文字設定為右上對齊
  fill(55, 82, 119); // 設定進度文字顏色
  textSize(14); // 設定進度文字大小
  text(`第 ${currentQuestion + 1} / ${QUESTION_COUNT} 題`, width - layout.margin, 22); // 顯示目前題號進度
  text(GIF_URL.trim().length > 0 ? "GIF_URL 已設定，可替換" : "GIF_URL 尚未設定，使用內建動畫", width - layout.margin, 45); // 顯示 GIF 設定狀態
  textAlign(LEFT, TOP); // 還原一般左上角文字對齊
} // 結束頂端標題函式

function drawMediaPanel(layout) { // 繪製上方 GIF 或內建動畫顯示區
  const box = { x: layout.margin, y: layout.mediaY, w: layout.contentWidth, h: layout.mediaHeight }; // 建立媒體區矩形資料
  drawCard(box, 20, [255, 255, 255, 235], [205, 219, 239, 230]); // 繪製媒體區白色卡片
  push(); // 保存媒體區繪圖狀態
  clip(() => { // 將動畫內容限制在媒體卡片內
    fill(232, 242, 255); // 設定媒體內容背景顏色
    rect(box.x + 2, box.y + 2, box.w - 4, box.h - 4, 18); // 繪製媒體內容底色
    if (gifLoadState !== "loaded") { // 判斷是否需要使用內建動畫
      drawFallbackAnimation(box); // 繪製內建 p5.js 動畫備援
    } // 結束內建動畫判斷
  }); // 結束媒體區裁切
  pop(); // 還原媒體區繪圖狀態
  if (gifLoadState === "loading") { // 判斷 GIF 是否仍在載入中
    drawPill("GIF 載入中，暫時顯示內建動畫", box.x + 16, box.y + 14, [42, 81, 130]); // 顯示 GIF 載入中提示
  } else if (gifLoadState === "fallback") { // 判斷是否使用內建動畫備援
    drawPill("內建 p5.js 動畫備援", box.x + 16, box.y + 14, [42, 81, 130]); // 顯示內建動畫提示
  } else { // 處理 GIF 已成功載入的狀態
    drawPill("自訂 GIF 動畫", box.x + 16, box.y + 14, [42, 81, 130]); // 顯示自訂 GIF 提示
  } // 結束媒體狀態判斷
  if (gifLoadState === "loaded" && gifElement !== null) { // 判斷是否需要定位已載入 GIF
    gifElement.position(box.x + 4, box.y + 4); // 將 GIF 定位在媒體卡片內
    gifElement.size(max(40, box.w - 8), max(40, box.h - 8)); // 將 GIF 調整為響應式尺寸
  } // 結束 GIF 定位判斷
} // 結束媒體區繪製函式

function drawFallbackAnimation(box) { // 繪製不依賴外部檔案的 p5.js 動畫
  const centerX = box.x + box.w * 0.5; // 計算動畫中心水平位置
  const centerY = box.y + box.h * 0.58; // 計算動畫中心垂直位置
  const pulse = 1 + sin(frameCount * 0.06) * 0.08; // 計算動畫呼吸縮放效果
  const rotation = frameCount * 0.018; // 計算動畫旋轉角度
  push(); // 保存內建動畫繪圖狀態
  translate(centerX, centerY); // 將座標原點移到動畫中心
  rotate(rotation); // 讓動畫圖形持續旋轉
  noStroke(); // 關閉動畫圖形外框線
  fill(255, 182, 72, 220); // 設定中央圓形顏色
  ellipse(0, 0, 92 * pulse, 92 * pulse); // 繪製會呼吸的中央圓形
  fill(255, 255, 255, 210); // 設定程式符號顏色
  textAlign(CENTER, CENTER); // 設定程式符號置中對齊
  textStyle(BOLD); // 設定程式符號使用粗體
  textSize(34); // 設定程式符號大小
  text("<> ", 0, 0); // 繪製簡易程式設計符號
  textStyle(NORMAL); // 還原一般文字樣式
  for (let i = 0; i < 8; i += 1) { // 逐一繪製外圍旋轉小圓點
    const angle = TWO_PI * i / 8; // 計算目前小圓點的角度
    const radius = 82 + sin(frameCount * 0.04 + i) * 8; // 計算小圓點的動態半徑
    fill(82 + i * 18, 139, 218, 210); // 依索引設定小圓點顏色
    ellipse(cos(angle) * radius, sin(angle) * radius, 13, 13); // 繪製外圍小圓點
  } // 結束外圍小圓點迴圈
  pop(); // 還原內建動畫繪圖狀態
  textAlign(CENTER, TOP); // 設定動畫說明文字置中對齊
  noStroke(); // 關閉動畫說明文字外框
  fill(52, 83, 125); // 設定動畫說明文字顏色
  textSize(14); // 設定動畫說明文字大小
  text("可在程式碼上方替換 GIF_URL", centerX, box.y + box.h - 28); // 顯示 GIF 替換說明
  textAlign(LEFT, TOP); // 還原一般左上角文字對齊
} // 結束內建動畫函式

function drawQuestionPanel(layout) { // 繪製題目文字與答案放置區
  const question = questions[currentQuestion]; // 取得目前題目資料
  const answerBox = { x: layout.margin, y: layout.answerY, w: layout.contentWidth, h: layout.answerHeight }; // 建立答案區矩形資料
  noStroke(); // 關閉題目區外框線
  fill(25, 48, 83); // 設定題目文字顏色
  textStyle(BOLD); // 設定題目文字使用粗體
  textSize(min(19, max(15, width * 0.024))); // 依畫布寬度調整題目文字大小
  text(`第 ${currentQuestion + 1} 題　${question.question}`, layout.margin, layout.answerY - 2, layout.contentWidth, 48); // 顯示目前題目
  textStyle(NORMAL); // 還原一般文字樣式
  drawCard(answerBox, 16, [255, 255, 255, 245], [178, 201, 229, 240]); // 繪製答案區卡片
  fill(93, 117, 149); // 設定答案區標籤顏色
  textSize(13); // 設定答案區標籤大小
  text("答案區｜將選項拖曳到這裡，可再次拖曳其他選項替換", answerBox.x + 16, answerBox.y + 10); // 顯示答案區操作說明
  const selected = answers[currentQuestion]; // 取得目前題目已選取的選項索引
  if (selected === null) { // 判斷目前是否尚未選擇答案
    fill(137, 157, 184); // 設定空答案提示文字顏色
    textSize(16); // 設定空答案提示文字大小
    text("尚未選擇答案", answerBox.x + 16, answerBox.y + 36); // 顯示尚未選擇提示
  } else { // 處理目前已有答案的狀態
    drawAnswerChip(questions[currentQuestion].options[selected], answerBox); // 繪製已選取的答案文字卡
  } // 結束答案狀態判斷
} // 結束題目與答案區函式

function drawAnswerChip(label, box) { // 繪製答案區內的已選取選項
  const chipX = box.x + 16; // 計算答案卡水平位置
  const chipY = box.y + 34; // 計算答案卡垂直位置
  const chipW = min(box.w - 32, max(180, textWidth(label) + 38)); // 依答案文字計算答案卡寬度
  noStroke(); // 關閉答案卡外框線
  fill(225, 241, 232); // 設定答案卡背景顏色
  rect(chipX, chipY, chipW, 30, 10); // 繪製答案卡背景
  fill(35, 119, 75); // 設定答案卡文字顏色
  textSize(15); // 設定答案卡文字大小
  text(`✓ ${label}`, chipX + 12, chipY + 6); // 顯示已選取答案文字
} // 結束答案卡繪製函式

function drawOptionPanel(layout) { // 繪製六個可拖曳的文字選項
  fill(51, 76, 111); // 設定選項區標題文字顏色
  textStyle(BOLD); // 設定選項區標題使用粗體
  textSize(15); // 設定選項區標題文字大小
  text("可拖曳選項", layout.margin, layout.optionY - 6); // 顯示選項區標題
  textStyle(NORMAL); // 還原一般文字樣式
  for (let i = 0; i < OPTION_COUNT; i += 1) { // 逐一繪製六個選項卡
    const rectData = getOptionRect(layout, i); // 取得目前選項卡的矩形位置
    const isDragging = dragging !== null && dragging.source === "option" && dragging.index === i; // 判斷目前選項是否正在拖曳
    if (isDragging) { // 判斷是否要暫時淡化原本選項
      drawCard(rectData, 13, [226, 234, 245, 150], [185, 201, 222, 140]); // 繪製拖曳中的原位置提示
    } else { // 處理一般未拖曳選項
      const isHover = hoverTarget === `option-${i}`; // 判斷滑鼠是否移入目前選項
      const cardColor = isHover ? [236, 246, 255, 255] : [255, 255, 255, 245]; // 依滑鼠狀態決定選項背景色
      drawCard(rectData, 13, cardColor, [190, 210, 235, 230]); // 繪製一般選項卡片
    } // 結束選項卡狀態判斷
    fill(55, 86, 126); // 設定選項文字顏色
    textSize(14); // 設定選項文字大小
    textWrap(CHAR); // 讓中文選項以字元方式自動換行
    text(`${String.fromCharCode(65 + i)}　${questions[currentQuestion].options[i]}`, rectData.x + 13, rectData.y + 12, rectData.w - 26, rectData.h - 20); // 顯示選項文字
  } // 結束六個選項繪製迴圈
  textWrap(WORD); // 還原預設文字換行模式
} // 結束選項區函式

function getOptionRect(layout, index) { // 計算指定選項的矩形位置
  const column = index % 2; // 計算選項所在欄位
  const row = floor(index / 2); // 計算選項所在列位
  const x = layout.margin + column * (layout.optionWidth + layout.optionGap); // 計算選項水平座標
  const y = layout.optionY + row * (layout.optionHeight + layout.optionGap); // 計算選項垂直座標
  return { x, y, w: layout.optionWidth, h: layout.optionHeight }; // 回傳指定選項矩形資料
} // 結束選項矩形函式

function drawNavigation(layout) { // 繪製上一題、題號與下一題導覽
  const buttonY = layout.navY + 11; // 設定導覽按鈕垂直位置
  const buttonH = 36; // 設定導覽按鈕高度
  const sideW = min(100, max(72, layout.contentWidth * 0.12)); // 計算左右導覽按鈕寬度
  drawButton("上一題", layout.margin, buttonY, sideW, buttonH, currentQuestion > 0 && !submitted, "prev"); // 繪製上一題按鈕
  drawButton("下一題", width - layout.margin - sideW, buttonY, sideW, buttonH, currentQuestion < QUESTION_COUNT - 1 && !submitted, "next"); // 繪製下一題按鈕
  const numberGap = 8; // 設定題號按鈕間距
  const numberW = min(42, max(28, (layout.contentWidth - sideW * 2 - numberGap * 7) / 6)); // 計算題號按鈕寬度
  const groupW = numberW * QUESTION_COUNT + numberGap * (QUESTION_COUNT - 1); // 計算題號按鈕群總寬度
  const startX = width * 0.5 - groupW * 0.5; // 計算題號按鈕群起始水平位置
  for (let i = 0; i < QUESTION_COUNT; i += 1) { // 逐一繪製六個題號按鈕
    const numberX = startX + i * (numberW + numberGap); // 計算目前題號按鈕水平位置
    const active = i === currentQuestion; // 判斷目前題號是否為作用中
    drawNumberButton(i, numberX, buttonY, numberW, buttonH, active, !submitted); // 繪製目前題號按鈕
  } // 結束題號按鈕迴圈
} // 結束導覽列函式

function drawSubmitArea(layout) { // 繪製交卷按鈕與交卷後成績
  const y = layout.submitY; // 取得交卷區垂直位置
  const buttonW = submitted ? 126 : 154; // 依狀態計算主要按鈕寬度
  if (!submitted) { // 判斷是否尚未交卷
    drawButton("交卷看成績", layout.margin, y + 14, buttonW, 38, true, "submit"); // 繪製交卷按鈕
    fill(83, 105, 136); // 設定作答進度文字顏色
    textSize(13); // 設定作答進度文字大小
    text(`已完成 ${answers.filter((answer) => answer !== null).length} / ${QUESTION_COUNT} 題`, layout.margin + buttonW + 16, y + 25); // 顯示已作答題數
    return; // 尚未交卷時結束交卷區繪製
  } // 結束尚未交卷判斷
  const percent = score / QUESTION_COUNT * 100; // 計算交卷後百分比
  const resultText = percent > PASS_PERCENT ? "表現很棒！已超過 60%，畫布彩帶為你慶祝！" : "再接再厲！先整理觀念，再挑戰一次吧！"; // 依嚴格門檻產生鼓勵訊息
  fill(percent > PASS_PERCENT ? [34, 119, 76] : [173, 98, 37]); // 依成績設定結果文字顏色
  textStyle(BOLD); // 設定結果文字使用粗體
  textSize(16); // 設定結果文字大小
  text(`成績：答對 ${score} 題／共 ${QUESTION_COUNT} 題（${percent.toFixed(1)}%）`, layout.margin, y + 2); // 顯示答對題數、總題數與百分比
  textStyle(NORMAL); // 還原一般文字樣式
  fill(80, 103, 135); // 設定鼓勵訊息文字顏色
  textSize(13); // 設定鼓勵訊息文字大小
  text(resultText, layout.margin, y + 25); // 顯示交卷後鼓勵或慶祝訊息
  drawButton("重新測驗", width - layout.margin - buttonW, y + 10, buttonW, 38, true, "restart"); // 繪製重新測驗按鈕
} // 結束交卷區函式

function drawCard(rectData, radius, cardColor, borderColor) { // 繪製帶有圓角與邊框的卡片
  stroke(borderColor[0], borderColor[1], borderColor[2], borderColor[3]); // 設定卡片邊框顏色
  strokeWeight(1); // 設定卡片邊框寬度
  fill(cardColor[0], cardColor[1], cardColor[2], cardColor[3]); // 設定卡片填滿顏色
  rect(rectData.x, rectData.y, rectData.w, rectData.h, radius); // 繪製圓角卡片
  noStroke(); // 還原無外框繪圖狀態
} // 結束卡片繪製函式

function drawPill(label, x, y, colorValue) { // 繪製媒體狀態膠囊標籤
  const pillW = textWidth(label) + 24; // 依標籤文字計算膠囊寬度
  noStroke(); // 關閉膠囊外框線
  fill(255, 255, 255, 220); // 設定膠囊背景顏色
  rect(x, y, pillW, 28, 14); // 繪製膠囊背景
  fill(colorValue[0], colorValue[1], colorValue[2]); // 設定膠囊文字顏色
  textSize(12); // 設定膠囊文字大小
  text(label, x + 12, y + 7); // 繪製膠囊文字
} // 結束膠囊標籤函式

function drawButton(label, x, y, buttonW, buttonH, enabled, identifier) { // 繪製可互動按鈕
  const isHover = hoverTarget === identifier && enabled; // 判斷滑鼠是否移入啟用中的按鈕
  const baseColor = enabled ? [52, 105, 174] : [173, 188, 207]; // 依按鈕啟用狀態決定基礎顏色
  const displayColor = isHover ? [38, 83, 146] : baseColor; // 依滑鼠狀態決定顯示顏色
  noStroke(); // 關閉按鈕外框線
  fill(displayColor[0], displayColor[1], displayColor[2]); // 設定按鈕背景顏色
  rect(x, y, buttonW, buttonH, 12); // 繪製圓角按鈕
  fill(255); // 設定按鈕文字為白色
  textAlign(CENTER, CENTER); // 設定按鈕文字置中對齊
  textStyle(BOLD); // 設定按鈕文字使用粗體
  textSize(14); // 設定按鈕文字大小
  text(label, x + buttonW * 0.5, y + buttonH * 0.5); // 繪製按鈕文字
  textStyle(NORMAL); // 還原一般文字樣式
  textAlign(LEFT, TOP); // 還原一般左上角文字對齊
} // 結束按鈕繪製函式

function drawNumberButton(index, x, y, buttonW, buttonH, active, enabled) { // 繪製題號導覽按鈕
  const isHover = hoverTarget === `number-${index}` && enabled; // 判斷滑鼠是否移入題號按鈕
  const fillColor = active ? [52, 105, 174] : isHover ? [220, 235, 251] : [255, 255, 255, 235]; // 依狀態決定題號按鈕背景
  const textColor = active ? [255, 255, 255] : [60, 91, 130]; // 依狀態決定題號文字顏色
  stroke(190, 210, 235); // 設定題號按鈕邊框顏色
  strokeWeight(1); // 設定題號按鈕邊框寬度
  fill(fillColor[0], fillColor[1], fillColor[2], fillColor[3] === undefined ? 255 : fillColor[3]); // 填入題號按鈕背景
  rect(x, y, buttonW, buttonH, 10); // 繪製題號按鈕
  noStroke(); // 關閉題號按鈕外框線
  fill(textColor[0], textColor[1], textColor[2]); // 設定題號文字顏色
  textAlign(CENTER, CENTER); // 設定題號文字置中對齊
  textStyle(BOLD); // 設定題號文字使用粗體
  textSize(13); // 設定題號文字大小
  text(index + 1, x + buttonW * 0.5, y + buttonH * 0.5); // 顯示題號
  textStyle(NORMAL); // 還原一般文字樣式
  textAlign(LEFT, TOP); // 還原一般左上角文字對齊
} // 結束題號按鈕函式

function drawDraggingOption(layout) { // 繪製跟隨滑鼠移動的選項卡片
  if (dragging === null) { // 判斷目前是否沒有拖曳中的選項
    return; // 沒有拖曳內容時直接結束函式
  } // 結束無拖曳內容判斷
  const label = questions[currentQuestion].options[dragging.index]; // 取得拖曳選項文字
  const cardW = min(layout.contentWidth * 0.72, max(190, textWidth(label) + 58)); // 計算拖曳卡片寬度
  const cardH = 46; // 設定拖曳卡片高度
  const cardX = mouseX - dragging.offsetX; // 計算拖曳卡片水平位置
  const cardY = mouseY - dragging.offsetY; // 計算拖曳卡片垂直位置
  drawCard({ x: cardX, y: cardY, w: cardW, h: cardH }, 13, [52, 105, 174, 240], [28, 74, 133, 255]); // 繪製半透明拖曳卡片
  fill(255); // 設定拖曳文字顏色
  textSize(14); // 設定拖曳文字大小
  text(`拖曳中：${label}`, cardX + 15, cardY + 14); // 顯示拖曳中的選項文字
} // 結束拖曳選項函式

function mousePressed() { // 處理滑鼠按下事件
  if (submitted) { // 判斷是否已經交卷鎖定
    const layout = getLayout(); // 取得目前版面配置
    if (isInside(mouseX, mouseY, width - layout.margin - 126, layout.submitY + 10, 126, 38)) { // 判斷是否點擊重新測驗按鈕
      resetQuiz(); // 執行重新測驗
    } // 結束重新測驗按鈕判斷
    return; // 交卷後禁止其他修改操作
  } // 結束交卷鎖定判斷
  const layout = getLayout(); // 取得目前版面配置
  if (handleNavigationPress(layout)) { // 優先處理題目導覽按鈕
    return; // 點擊導覽後結束本次按下事件
  } // 結束題目導覽判斷
  if (isInside(mouseX, mouseY, layout.margin, layout.submitY + 14, 154, 38)) { // 判斷是否點擊交卷按鈕
    submitQuiz(); // 執行交卷並計算成績
    return; // 點擊交卷後結束本次按下事件
  } // 結束交卷按鈕判斷
  const selected = answers[currentQuestion]; // 取得目前題目已選取的答案索引
  const answerBox = { x: layout.margin, y: layout.answerY, w: layout.contentWidth, h: layout.answerHeight }; // 建立答案區矩形資料
  if (selected !== null && isInside(mouseX, mouseY, answerBox.x, answerBox.y, answerBox.w, answerBox.h)) { // 判斷是否從已選答案開始拖曳
    dragging = { source: "answer", index: selected, offsetX: 70, offsetY: 22 }; // 建立從答案區開始的拖曳資料
    return; // 開始拖曳後結束本次按下事件
  } // 結束答案區拖曳判斷
  for (let i = 0; i < OPTION_COUNT; i += 1) { // 逐一檢查六個選項是否被按下
    const optionRect = getOptionRect(layout, i); // 取得目前選項矩形資料
    if (isInside(mouseX, mouseY, optionRect.x, optionRect.y, optionRect.w, optionRect.h)) { // 判斷滑鼠是否位於目前選項內
      dragging = { source: "option", index: i, offsetX: mouseX - optionRect.x, offsetY: mouseY - optionRect.y }; // 建立選項拖曳資料
      return; // 開始拖曳後結束選項檢查
    } // 結束目前選項判斷
  } // 結束六個選項檢查迴圈
} // 結束滑鼠按下函式

function mouseDragged() { // 處理滑鼠拖曳事件
  if (dragging !== null) { // 判斷目前是否正在拖曳選項
    return false; // 阻止瀏覽器執行預設拖曳行為
  } // 結束拖曳狀態判斷
  return true; // 沒有拖曳時保留一般滑鼠行為
} // 結束滑鼠拖曳函式

function mouseReleased() { // 處理滑鼠放開事件
  if (dragging === null) { // 判斷是否沒有正在拖曳的資料
    return; // 沒有拖曳時直接結束事件
  } // 結束無拖曳資料判斷
  const layout = getLayout(); // 取得目前版面配置
  const droppedInAnswer = isInside(mouseX, mouseY, layout.margin, layout.answerY, layout.contentWidth, layout.answerHeight); // 判斷是否放在答案區
  if (droppedInAnswer) { // 判斷選項是否成功放入答案區
    answers[currentQuestion] = dragging.index; // 將拖曳的選項設定為目前答案
  } else if (dragging.source === "answer") { // 判斷是否把既有答案拖離答案區
    answers[currentQuestion] = null; // 拖離答案區且未放回時清除目前答案
  } // 結束答案放置判斷
  dragging = null; // 清除拖曳中的選項資料
} // 結束滑鼠放開函式

function handleNavigationPress(layout) { // 處理上一題、下一題與題號點擊
  const buttonY = layout.navY + 11; // 取得導覽按鈕垂直位置
  const buttonH = 36; // 取得導覽按鈕高度
  const sideW = min(100, max(72, layout.contentWidth * 0.12)); // 計算左右導覽按鈕寬度
  if (currentQuestion > 0 && isInside(mouseX, mouseY, layout.margin, buttonY, sideW, buttonH)) { // 判斷是否點擊上一題
    currentQuestion -= 1; // 將目前題號往前移動
    return true; // 回傳已處理導覽事件
  } // 結束上一題判斷
  if (currentQuestion < QUESTION_COUNT - 1 && isInside(mouseX, mouseY, width - layout.margin - sideW, buttonY, sideW, buttonH)) { // 判斷是否點擊下一題
    currentQuestion += 1; // 將目前題號往後移動
    return true; // 回傳已處理導覽事件
  } // 結束下一題判斷
  const numberGap = 8; // 設定題號按鈕間距
  const numberW = min(42, max(28, (layout.contentWidth - sideW * 2 - numberGap * 7) / 6)); // 計算題號按鈕寬度
  const groupW = numberW * QUESTION_COUNT + numberGap * (QUESTION_COUNT - 1); // 計算題號按鈕群總寬度
  const startX = width * 0.5 - groupW * 0.5; // 計算題號按鈕群起始水平位置
  for (let i = 0; i < QUESTION_COUNT; i += 1) { // 逐一檢查題號按鈕
    const numberX = startX + i * (numberW + numberGap); // 計算目前題號按鈕水平位置
    if (isInside(mouseX, mouseY, numberX, buttonY, numberW, buttonH)) { // 判斷是否點擊目前題號按鈕
      currentQuestion = i; // 切換到被點擊的題號
      return true; // 回傳已處理導覽事件
    } // 結束題號按鈕判斷
  } // 結束題號按鈕檢查迴圈
  return false; // 回傳未處理導覽事件
} // 結束導覽處理函式

function submitQuiz() { // 計算成績並鎖定測驗內容
  score = 0; // 重新設定答對題數為零
  for (let i = 0; i < QUESTION_COUNT; i += 1) { // 逐題檢查使用者答案
    if (answers[i] === questions[i].answer) { // 判斷目前答案是否正確
      score += 1; // 將答對題數增加一題
    } // 結束答案正確判斷
  } // 結束逐題檢查迴圈
  submitted = true; // 設定交卷狀態並禁止修改
  const percent = score / QUESTION_COUNT * 100; // 計算交卷後百分比
  if (percent > PASS_PERCENT) { // 嚴格判斷成績是否高於百分之六十
    startConfetti(); // 啟動畫布彩帶效果
  } else { // 處理未高於百分之六十的成績
    confettiActive = false; // 確保未達標時不顯示彩帶
    confetti = []; // 清除現有彩帶粒子
  } // 結束彩帶啟動判斷
} // 結束交卷函式

function resetQuiz() { // 重新設定整份測驗
  answers = Array(QUESTION_COUNT).fill(null); // 清除所有題目的答案
  currentQuestion = 0; // 回到第一題
  submitted = false; // 解除交卷鎖定狀態
  score = 0; // 清除舊的成績
  confettiActive = false; // 停止彩帶動畫
  confetti = []; // 清空彩帶粒子陣列
  dragging = null; // 清除可能殘留的拖曳資料
} // 結束重新測驗函式

function startConfetti() { // 建立並啟動彩帶粒子
  confetti = []; // 清除之前可能存在的彩帶資料
  confettiActive = true; // 開啟彩帶動畫狀態
  for (let i = 0; i < 130; i += 1) { // 建立一百三十個彩帶粒子
    confetti.push({ x: random(width), y: random(-height, 0), speed: random(1.5, 4.5), size: random(5, 11), angle: random(TWO_PI), spin: random(-0.08, 0.08), color: random([[239, 91, 112], [255, 182, 72], [77, 151, 224], [91, 190, 135], [157, 112, 214]]) }); // 加入隨機彩帶資料
  } // 結束彩帶粒子建立迴圈
} // 結束彩帶啟動函式

function drawConfetti() { // 更新並繪製畫布彩帶效果
  if (!confettiActive) { // 判斷彩帶是否尚未啟用
    return; // 未啟用時直接結束彩帶繪製
  } // 結束彩帶啟用判斷
  for (const piece of confetti) { // 逐一更新所有彩帶粒子
    piece.y += piece.speed; // 讓彩帶向下移動
    piece.x += sin(frameCount * 0.025 + piece.angle) * 0.7; // 讓彩帶產生左右飄動
    piece.angle += piece.spin; // 更新彩帶旋轉角度
    if (piece.y > height + 20) { // 判斷彩帶是否已經掉出畫布
      piece.y = random(-80, -10); // 將掉出的彩帶重新放回頂端
      piece.x = random(width); // 為重生彩帶設定隨機水平位置
    } // 結束彩帶重生判斷
    push(); // 保存單一彩帶繪圖狀態
    translate(piece.x, piece.y); // 移動到目前彩帶位置
    rotate(piece.angle); // 旋轉目前彩帶
    noStroke(); // 關閉彩帶外框線
    fill(piece.color[0], piece.color[1], piece.color[2], 220); // 設定彩帶顏色
    rect(0, 0, piece.size, piece.size * 1.8, 2); // 繪製矩形彩帶
    pop(); // 還原單一彩帶繪圖狀態
  } // 結束彩帶粒子迴圈
} // 結束彩帶繪製函式

function updateHoverTarget(layout) { // 更新滑鼠移入區域與游標樣式
  hoverTarget = ""; // 先清除上一幀的互動區域
  cursor(ARROW); // 將預設游標設定為箭頭
  if (submitted) { // 判斷是否已經交卷
    const buttonW = 126; // 設定重新測驗按鈕寬度
    if (isInside(mouseX, mouseY, width - layout.margin - buttonW, layout.submitY + 10, buttonW, 38)) { // 判斷是否移入重新測驗按鈕
      hoverTarget = "restart"; // 設定目前移入區域為重新測驗按鈕
      cursor(HAND); // 將游標變更為手指
    } // 結束重新測驗移入判斷
    return; // 交卷後不再檢查其他可修改區域
  } // 結束交卷狀態判斷
  const buttonY = layout.navY + 11; // 取得導覽按鈕垂直位置
  const buttonH = 36; // 取得導覽按鈕高度
  const sideW = min(100, max(72, layout.contentWidth * 0.12)); // 取得左右導覽按鈕寬度
  if (currentQuestion > 0 && isInside(mouseX, mouseY, layout.margin, buttonY, sideW, buttonH)) { // 判斷是否移入上一題按鈕
    hoverTarget = "prev"; // 設定目前移入區域為上一題按鈕
    cursor(HAND); // 將游標變更為手指
    return; // 結束目前游標區域檢查
  } // 結束上一題移入判斷
  if (currentQuestion < QUESTION_COUNT - 1 && isInside(mouseX, mouseY, width - layout.margin - sideW, buttonY, sideW, buttonH)) { // 判斷是否移入下一題按鈕
    hoverTarget = "next"; // 設定目前移入區域為下一題按鈕
    cursor(HAND); // 將游標變更為手指
    return; // 結束目前游標區域檢查
  } // 結束下一題移入判斷
  const numberGap = 8; // 設定題號按鈕間距
  const numberW = min(42, max(28, (layout.contentWidth - sideW * 2 - numberGap * 7) / 6)); // 計算題號按鈕寬度
  const groupW = numberW * QUESTION_COUNT + numberGap * (QUESTION_COUNT - 1); // 計算題號按鈕群總寬度
  const startX = width * 0.5 - groupW * 0.5; // 計算題號按鈕群起始水平位置
  for (let i = 0; i < QUESTION_COUNT; i += 1) { // 逐一檢查題號按鈕移入狀態
    const numberX = startX + i * (numberW + numberGap); // 計算目前題號水平位置
    if (isInside(mouseX, mouseY, numberX, buttonY, numberW, buttonH)) { // 判斷滑鼠是否移入目前題號
      hoverTarget = `number-${i}`; // 設定目前移入區域為題號按鈕
      cursor(HAND); // 將游標變更為手指
      return; // 結束題號區域檢查
    } // 結束題號移入判斷
  } // 結束題號移入迴圈
  if (isInside(mouseX, mouseY, layout.margin, layout.submitY + 14, 154, 38)) { // 判斷是否移入交卷按鈕
    hoverTarget = "submit"; // 設定目前移入區域為交卷按鈕
    cursor(HAND); // 將游標變更為手指
    return; // 結束交卷按鈕檢查
  } // 結束交卷移入判斷
  const selected = answers[currentQuestion]; // 取得目前題目答案索引
  if (selected !== null && isInside(mouseX, mouseY, layout.margin, layout.answerY, layout.contentWidth, layout.answerHeight)) { // 判斷是否移入可拖曳答案區
    hoverTarget = "answer"; // 設定目前移入區域為答案區
    cursor(HAND); // 將游標變更為手指
    return; // 結束答案區檢查
  } // 結束答案區移入判斷
  for (let i = 0; i < OPTION_COUNT; i += 1) { // 逐一檢查選項移入狀態
    const optionRect = getOptionRect(layout, i); // 取得目前選項矩形資料
    if (isInside(mouseX, mouseY, optionRect.x, optionRect.y, optionRect.w, optionRect.h)) { // 判斷滑鼠是否移入選項
      hoverTarget = `option-${i}`; // 設定目前移入區域為選項
      cursor(GRAB); // 將游標變更為可抓取樣式
      return; // 結束選項移入檢查
    } // 結束選項移入判斷
  } // 結束選項移入迴圈
} // 結束滑鼠移入區域函式

function isInside(pointX, pointY, boxX, boxY, boxW, boxH) { // 判斷座標是否位於指定矩形內
  return pointX >= boxX && pointX <= boxX + boxW && pointY >= boxY && pointY <= boxY + boxH; // 回傳矩形包含判斷結果
} // 結束矩形包含判斷函式

function windowResized() { // 處理瀏覽器視窗尺寸改變事件
  resizeCanvas(windowWidth, windowHeight); // 將畫布調整為最新視窗大小
  if (gifElement !== null && gifLoadState === "loaded") { // 判斷是否需要等待下一幀重新定位 GIF
    gifElement.hide(); // 暫時隱藏 GIF 以避免尺寸變更閃爍
    gifElement.show(); // 重新顯示 GIF 並套用新位置
  } // 結束 GIF 尺寸更新判斷
} // 結束視窗尺寸改變函式
