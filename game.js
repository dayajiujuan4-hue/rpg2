let currentProvince = null;
let currentCity = null;

let currentQuestion = 0;
let correctCount = 0;

let totalExp = 0;
let questExp = 0;

let visitedCities = [];

let questionAttempts = {};

// 今回のクエストで出題する5問
let selectedQuestions = [];

// ==============================
// ゲーム開始
// ==============================

function startGame() {

```
loadGame();

updateStatus();

showProvinceScreen();
```

}

// ==============================
// 地域一覧
// ==============================

function showProvinceScreen() {

```
document.getElementById("provinceScreen").classList.remove("hidden");
document.getElementById("cityScreen").classList.add("hidden");
document.getElementById("quizScreen").classList.add("hidden");
document.getElementById("resultScreen").classList.add("hidden");

const list = document.getElementById("provinceList");

list.innerHTML = "";

const provinces = Object.keys(chinaData);

provinces.forEach(function(province) {

    const button = document.createElement("button");

    button.className = "province-button";

    button.textContent = province;

    button.addEventListener("click", function() {

        showCityScreen(province);

    });

    list.appendChild(button);

});
```

}

// ==============================
// 都市一覧
// ==============================

function showCityScreen(province) {

```
currentProvince = province;

document.getElementById("provinceScreen").classList.add("hidden");
document.getElementById("cityScreen").classList.remove("hidden");
document.getElementById("quizScreen").classList.add("hidden");
document.getElementById("resultScreen").classList.add("hidden");

document.getElementById("provinceTitle").textContent = province;

const list = document.getElementById("cityList");

list.innerHTML = "";

const cities = chinaData[province];

cities.forEach(function(city) {

    const button = document.createElement("button");

    button.className = "city-button";

    if (visitedCities.includes(city.name)) {

        button.classList.add("visited");

        button.innerHTML =
            city.name +
            '<span class="visited-mark">✓</span>';

    } else {

        button.textContent = city.name;

    }

    button.addEventListener("click", function() {

        startQuiz(city);

    });

    list.appendChild(button);

});
```

}

// ==============================
// 配列をシャッフル
// ==============================

function shuffleArray(array) {

```
const shuffled = [...array];

for (let i = shuffled.length - 1; i > 0; i--) {

    const j =
        Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] =
        [shuffled[j], shuffled[i]];

}

return shuffled;
```

}

// ==============================
// クイズ開始
// ==============================

function startQuiz(city) {

```
currentCity = city;

currentQuestion = 0;
correctCount = 0;
questExp = 0;

questionAttempts = {};


// --------------------------------
// 問題をランダムに5問選ぶ
// --------------------------------

const allQuestions = city.questions;

const shuffledQuestions =
    shuffleArray(allQuestions);

selectedQuestions =
    shuffledQuestions.slice(
        0,
        Math.min(5, shuffledQuestions.length)
    );


document.getElementById("provinceScreen").classList.add("hidden");
document.getElementById("cityScreen").classList.add("hidden");
document.getElementById("quizScreen").classList.remove("hidden");
document.getElementById("resultScreen").classList.add("hidden");

document.getElementById("cityTitle").textContent =
    city.name;

showQuestion();
```

}

// ==============================
// 問題表示
// ==============================

function showQuestion() {

```
if (currentQuestion >= selectedQuestions.length) {

    finishQuiz();

    return;

}


const questionData =
    selectedQuestions[currentQuestion];


document.getElementById("questionNumber").textContent =
    `第 ${currentQuestion + 1} 問 / ${selectedQuestions.length} 問`;


document.getElementById("question").textContent =
    questionData.question;


document.getElementById("answerMessage").textContent =
    "";


const choicesContainer =
    document.getElementById("choices");

choicesContainer.innerHTML = "";


// --------------------------------
// 選択肢も毎回シャッフル
// --------------------------------

const choices =
    shuffleArray(questionData.choices);


choices.forEach(function(choice) {

    const button =
        document.createElement("button");

    button.className =
        "choice-button";

    button.textContent =
        choice;

    button.addEventListener("click", function() {

        answerQuestion(
            choice,
            button
        );

    });

    choicesContainer.appendChild(button);

});
```

}

// ==============================
// 回答
// ==============================

function answerQuestion(
answer,
clickedButton
) {

```
const questionData =
    selectedQuestions[currentQuestion];


const correctAnswer =
    questionData.answer;


if (clickedButton.disabled) {
    return;
}


// ==============================
// 正解
// ==============================

if (answer === correctAnswer) {

    const key = currentQuestion;


    questionAttempts[key] =
        (questionAttempts[key] || 0) + 1;


    const attempt =
        questionAttempts[key];


    let earnedExp;


    if (attempt === 1) {

        earnedExp = 30;

    } else if (attempt === 2) {

        earnedExp = 10;

    } else {

        earnedExp = 5;

    }


    correctCount++;

    questExp += earnedExp;

    totalExp += earnedExp;


    clickedButton.classList.add("correct");


    document.getElementById("answerMessage").textContent =
        `○ 正解！ +${earnedExp} EXP`;


    disableChoices();


    saveGame();

    updateStatus();


    setTimeout(function() {

        currentQuestion++;

        showQuestion();

    }, 900);


}

// ==============================
// 不正解
// ==============================

else {

    clickedButton.classList.add("wrong");

    clickedButton.disabled = true;


    document.getElementById("answerMessage").textContent =
        "× 不正解！もう一度挑戦しよう。";

}
```

}

// ==============================
// 選択肢を無効化
// ==============================

function disableChoices() {

```
const buttons =
    document.querySelectorAll(".choice-button");


buttons.forEach(function(button) {

    button.disabled = true;

});
```

}

// ==============================
// クエスト終了
// ==============================

function finishQuiz() {

```
if (!visitedCities.includes(currentCity.name)) {

    visitedCities.push(currentCity.name);

}


saveGame();

updateStatus();


document.getElementById("quizScreen").classList.add("hidden");

document.getElementById("resultScreen").classList.remove("hidden");


document.getElementById("resultCity").textContent =
    currentCity.name;


document.getElementById("resultExp").textContent =
    questExp + " EXP";


document.getElementById("resultCorrect").textContent =
    correctCount +
    " / " +
    selectedQuestions.length;


document.getElementById("resultMessage").textContent =
    "5問のクエストをクリアしました！";
```

}

// ==============================
// ステータス更新
// ==============================

function updateStatus() {

```
const level =
    Math.floor(totalExp / 100) + 1;


document.getElementById("level").textContent =
    level;


document.getElementById("exp").textContent =
    totalExp;


document.getElementById("visited").textContent =
    visitedCities.length;


let title = "中国初心者";


if (level >= 20) {

    title = "中国学大师";

} else if (level >= 10) {

    title = "中国通";

} else if (level >= 5) {

    title = "中国旅行家";

} else if (level >= 3) {

    title = "中国探险家";

}


document.getElementById("title").textContent =
    title;


document.getElementById("expText").textContent =
    totalExp + " EXP";


const progress =
    totalExp % 100;


document.getElementById("expBar").style.width =
    progress + "%";
```

}

// ==============================
// 地域一覧へ
// ==============================

function backToProvinces() {

```
showProvinceScreen();
```

}

// ==============================
// 都市一覧へ
// ==============================

function backToCities() {

```
if (currentProvince) {

    showCityScreen(currentProvince);

} else {

    showProvinceScreen();

}
```

}

// ==============================
// セーブ
// ==============================

function saveGame() {

```
const saveData = {

    totalExp: totalExp,

    visitedCities: visitedCities

};


localStorage.setItem(
    "chinaQuestSave",
    JSON.stringify(saveData)
);
```

}

// ==============================
// ロード
// ==============================

function loadGame() {

```
const saved =
    localStorage.getItem("chinaQuestSave");


if (!saved) {
    return;
}


try {

    const data =
        JSON.parse(saved);


    totalExp =
        data.totalExp || 0;


    visitedCities =
        data.visitedCities || [];


} catch (error) {

    console.error(
        "セーブデータの読み込みに失敗しました。",
        error
    );

}
```

}

// ==============================
// ボタン
// ==============================

document
.getElementById("backProvince")
.addEventListener(
"click",
backToProvinces
);

document
.getElementById("backCity")
.addEventListener(
"click",
backToCities
);

document
.getElementById("resultButton")
.addEventListener(
"click",
backToCities
);

// ==============================
// 起動
// ==============================

startGame();
