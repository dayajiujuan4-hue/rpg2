let currentProvince = null;
let currentCity = null;

let currentQuestion = 0;
let correctCount = 0;

// 今回のクエストで獲得したEXP
let questExp = 0;

// 累積EXP
let totalExp = 0;

// 訪問済み都市
let visitedCities = new Set();

// 各問題の挑戦回数
let cityAttempts = {};


/* =========================
   ゲーム開始
========================= */

function startGame() {
    loadGame();
    showProvinceScreen();
    updateStatus();
}


/* =========================
   省・自治区・直轄市選択
========================= */

function showProvinceScreen() {
    document.getElementById("province-screen").classList.remove("hidden");
    document.getElementById("city-screen").classList.add("hidden");
    document.getElementById("quiz-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.add("hidden");

    const provinceList = document.getElementById("province-list");

    provinceList.innerHTML = "";

    Object.keys(chinaData).forEach(provinceName => {

        const button = document.createElement("button");

        button.className = "province-button";
        button.textContent = provinceName;

        button.addEventListener("click", () => {
            showCityScreen(provinceName);
        });

        provinceList.appendChild(button);
    });
}


/* =========================
   都市選択
========================= */

function showCityScreen(provinceName) {

    currentProvince = provinceName;

    document.getElementById("province-screen").classList.add("hidden");
    document.getElementById("city-screen").classList.remove("hidden");

    const cityList = document.getElementById("city-list");

    cityList.innerHTML = "";

    const cities = chinaData[provinceName].cities;

    Object.keys(cities).forEach(cityName => {

        const button = document.createElement("button");

        button.className = "city-button";

        // 訪問済みならマークを表示
        if (visitedCities.has(`${provinceName}-${cityName}`)) {
            button.textContent = `✓ ${cityName}`;
            button.classList.add("visited");
        } else {
            button.textContent = cityName;
        }

        button.addEventListener("click", () => {
            startQuiz(provinceName, cityName);
        });

        cityList.appendChild(button);
    });
}


/* =========================
   クイズ開始
========================= */

function startQuiz(provinceName, cityName) {

    currentProvince = provinceName;
    currentCity = cityName;

    currentQuestion = 0;
    correctCount = 0;
    questExp = 0;

    document.getElementById("province-screen").classList.add("hidden");
    document.getElementById("city-screen").classList.add("hidden");
    document.getElementById("quiz-screen").classList.remove("hidden");
    document.getElementById("result-screen").classList.add("hidden");

    document.getElementById("quiz-city-name").textContent = cityName;

    showQuestion();
}


/* =========================
   問題表示
========================= */

function showQuestion() {

    const cityData =
        chinaData[currentProvince].cities[currentCity];

    const q = cityData.questions[currentQuestion];

    document.getElementById("question-number").textContent =
        `第 ${currentQuestion + 1} 問 / ${cityData.questions.length} 問`;

    document.getElementById("question-text").textContent =
        q.question;

    const choicesContainer =
        document.getElementById("choices");

    choicesContainer.innerHTML = "";

    /*
       選択肢をランダムに並び替える
       Fisher-Yatesシャッフルを使用
    */

    const shuffledChoices = [...q.choices];

    for (let i = shuffledChoices.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [
            shuffledChoices[i],
            shuffledChoices[j]
        ] = [
            shuffledChoices[j],
            shuffledChoices[i]
        ];
    }


    shuffledChoices.forEach(choice => {

        const button = document.createElement("button");

        button.className = "choice-button";
        button.textContent = choice;

        button.addEventListener("click", () => {
            answerQuestion(choice, button);
        });

        choicesContainer.appendChild(button);
    });


    document.getElementById("quiz-message").textContent = "";
}


/* =========================
   問題に回答
========================= */

function answerQuestion(choice, clickedButton) {

    const cityData =
        chinaData[currentProvince].cities[currentCity];

    const q = cityData.questions[currentQuestion];

    const questionKey =
        `${currentProvince}-${currentCity}-${currentQuestion}`;


    // すでに回答済みの問題なら終了
    if (clickedButton.disabled) {
        return;
    }


    // 一度クリックしたら全選択肢を一旦無効化
    const buttons =
        document.querySelectorAll(".choice-button");

    buttons.forEach(button => {
        button.disabled = true;
    });


    /* =========================
       正解
    ========================= */

    if (choice === q.answer) {

        correctCount++;

        // この問題の挑戦回数
        if (!cityAttempts[questionKey]) {
            cityAttempts[questionKey] = 0;
        }

        cityAttempts[questionKey]++;


        let gainedExp = 0;

        if (cityAttempts[questionKey] === 1) {

            gainedExp = 30;

        } else if (cityAttempts[questionKey] === 2) {

            gainedExp = 10;

        } else {

            gainedExp = 5;

        }


        // EXPを加算
        totalExp += gainedExp;
        questExp += gainedExp;


        clickedButton.classList.add("correct");

        document.getElementById("quiz-message").textContent =
            `○ 正解！ +${gainedExp} EXP`;


        updateStatus();
        saveGame();


        // 1秒後に次の問題
        setTimeout(() => {

            currentQuestion++;

            if (currentQuestion < cityData.questions.length) {

                showQuestion();

            } else {

                finishQuiz();

            }

        }, 1000);


    }

    /* =========================
       不正解
    ========================= */

    else {

        clickedButton.classList.add("wrong");

        document.getElementById("quiz-message").textContent =
            "× 不正解！もう一度挑戦しよう。";


        // 少し待って再挑戦可能にする
        setTimeout(() => {

            buttons.forEach(button => {
                button.disabled = false;
            });

            clickedButton.classList.remove("wrong");

        }, 700);
    }
}


/* =========================
   クイズ終了
========================= */

function finishQuiz() {

    const cityKey =
        `${currentProvince}-${currentCity}`;

    visitedCities.add(cityKey);

    saveGame();

    document.getElementById("quiz-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.remove("hidden");


    document.getElementById("result-city").textContent =
        `${currentCity} クエスト完了！`;


    document.getElementById("result-exp").textContent =
        questExp;


    document.getElementById("result-correct").textContent =
        correctCount;


    updateStatus();
}


/* =========================
   省選択へ戻る
========================= */

function backToProvinces() {

    showProvinceScreen();
}


/* =========================
   都市選択へ戻る
========================= */

function backToCities() {

    showCityScreen(currentProvince);
}


/* =========================
   ステータス更新
========================= */

function updateStatus() {

    const level =
        Math.floor(totalExp / 100) + 1;


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


    document.getElementById("level").textContent =
        level;


    document.getElementById("exp").textContent =
        totalExp;


    document.getElementById("title").textContent =
        title;


    document.getElementById("visited-count").textContent =
        visitedCities.size;


    // レベル内EXP
    const currentLevelExp =
        totalExp % 100;

    const expBar =
        document.getElementById("exp-bar");

    if (expBar) {

        expBar.style.width =
            `${currentLevelExp}%`;
    }
}


/* =========================
   セーブ
========================= */

function saveGame() {

    const saveData = {

        totalExp: totalExp,

        visitedCities:
            Array.from(visitedCities),

        cityAttempts:
            cityAttempts
    };


    localStorage.setItem(
        "chinaQuestSave",
        JSON.stringify(saveData)
    );
}


/* =========================
   ロード
========================= */

function loadGame() {

    const saved =
        localStorage.getItem("chinaQuestSave");


    if (!saved) {
        return;
    }


    try {

        const saveData =
            JSON.parse(saved);


        totalExp =
            saveData.totalExp || 0;


        visitedCities =
            new Set(saveData.visitedCities || []);


        cityAttempts =
            saveData.cityAttempts || {};


    } catch (error) {

        console.error(
            "セーブデータの読み込みに失敗しました。",
            error
        );
    }
}


/* =========================
   ゲームリセット
========================= */

function resetGame() {

    const confirmed =
        confirm(
            "本当にゲームデータをすべて削除しますか？"
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem("chinaQuestSave");


    totalExp = 0;

    visitedCities = new Set();

    cityAttempts = {};


    updateStatus();

    showProvinceScreen();
}


/* =========================
   ゲーム起動
========================= */

window.addEventListener("DOMContentLoaded", () => {

    startGame();

});