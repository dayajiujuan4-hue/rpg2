let currentProvince = null;
let currentCity = null;

let currentQuestion = 0;
let correctCount = 0;

let totalExp = 0;
let questExp = 0;

let visitedCities = new Set();
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
   省・自治区一覧
========================= */

function showProvinceScreen() {

    document.getElementById("provinceScreen").classList.remove("hidden");
    document.getElementById("cityScreen").classList.add("hidden");
    document.getElementById("quizScreen").classList.add("hidden");
    document.getElementById("resultScreen").classList.add("hidden");


    const provinceList =
        document.getElementById("provinceList");

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
   都市一覧
========================= */

function showCityScreen(provinceName) {

    currentProvince = provinceName;


    document.getElementById("provinceScreen").classList.add("hidden");
    document.getElementById("cityScreen").classList.remove("hidden");
    document.getElementById("quizScreen").classList.add("hidden");
    document.getElementById("resultScreen").classList.add("hidden");


    document.getElementById("provinceTitle").textContent =
        provinceName;


    const cityList =
        document.getElementById("cityList");

    cityList.innerHTML = "";


    const cities =
        chinaData[provinceName].cities;


    Object.keys(cities).forEach(cityName => {

        const button = document.createElement("button");

        button.className = "city-button";


        const cityKey =
            `${provinceName}-${cityName}`;


        if (visitedCities.has(cityKey)) {

            button.textContent =
                `✓ ${cityName}`;

            button.classList.add("visited");

        } else {

            button.textContent =
                cityName;
        }


        button.addEventListener("click", () => {

            startQuiz(
                provinceName,
                cityName
            );

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


    document.getElementById("provinceScreen").classList.add("hidden");
    document.getElementById("cityScreen").classList.add("hidden");
    document.getElementById("quizScreen").classList.remove("hidden");
    document.getElementById("resultScreen").classList.add("hidden");


    document.getElementById("cityTitle").textContent =
        cityName;


    document.getElementById("rewardExp").textContent =
        "0";


    showQuestion();
}


/* =========================
   問題表示
========================= */

function showQuestion() {

    const cityData =
        chinaData[currentProvince].cities[currentCity];


    const q =
        cityData.questions[currentQuestion];


    document.getElementById("questionNumber").textContent =
        `第 ${currentQuestion + 1} 問 / ${cityData.questions.length} 問`;


    document.getElementById("question").textContent =
        q.question;


    document.getElementById("answerMessage").textContent =
        "";


    const choicesContainer =
        document.getElementById("choices");


    choicesContainer.innerHTML = "";


    /* =========================
       選択肢をランダム化
    ========================= */

    const shuffledChoices =
        [...q.choices];


    // Fisher-Yatesシャッフル
    for (
        let i = shuffledChoices.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            shuffledChoices[i],
            shuffledChoices[j]
        ] =
        [
            shuffledChoices[j],
            shuffledChoices[i]
        ];
    }


    /* =========================
       選択肢ボタン作成
    ========================= */

    shuffledChoices.forEach(choice => {

        const button =
            document.createElement("button");


        button.className =
            "choice-button";


        button.textContent =
            choice;


        button.addEventListener("click", () => {

            answerQuestion(
                choice,
                button
            );

        });


        choicesContainer.appendChild(button);

    });
}


/* =========================
   回答
========================= */

function answerQuestion(
    choice,
    clickedButton
) {

    const cityData =
        chinaData[currentProvince].cities[currentCity];


    const q =
        cityData.questions[currentQuestion];


    const questionKey =
        `${currentProvince}-${currentCity}-${currentQuestion}`;


    const buttons =
        document.querySelectorAll(
            ".choice-button"
        );


    /* =========================
       正解
    ========================= */

    if (choice === q.answer) {

        buttons.forEach(button => {

            button.disabled = true;

        });


        clickedButton.classList.add(
            "correct"
        );


        correctCount++;


        if (!cityAttempts[questionKey]) {

            cityAttempts[questionKey] = 0;

        }


        cityAttempts[questionKey]++;


        let gainedExp;


        if (
            cityAttempts[questionKey] === 1
        ) {

            gainedExp = 30;

        } else if (
            cityAttempts[questionKey] === 2
        ) {

            gainedExp = 10;

        } else {

            gainedExp = 5;

        }


        totalExp += gainedExp;
        questExp += gainedExp;


        document.getElementById(
            "answerMessage"
        ).textContent =
            `○ 正解！ +${gainedExp} EXP`;


        document.getElementById(
            "rewardExp"
        ).textContent =
            questExp;


        updateStatus();

        saveGame();


        setTimeout(() => {

            currentQuestion++;


            if (
                currentQuestion <
                cityData.questions.length
            ) {

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

        clickedButton.classList.add(
            "wrong"
        );


        clickedButton.disabled = true;


        document.getElementById(
            "answerMessage"
        ).textContent =
            "× 不正解！もう一度挑戦しよう。";


        setTimeout(() => {

            clickedButton.disabled = false;

            clickedButton.classList.remove(
                "wrong"
            );

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


    document.getElementById(
        "quizScreen"
    ).classList.add("hidden");


    document.getElementById(
        "resultScreen"
    ).classList.remove("hidden");


    document.getElementById(
        "resultCity"
    ).textContent =
        `${currentCity} クエスト完了！`;


    document.getElementById(
        "resultMessage"
    ).textContent =
        `中国の知識を ${questExp} EXP 分獲得しました。`;


    document.getElementById(
        "resultExp"
    ).textContent =
        questExp;


    document.getElementById(
        "resultCorrect"
    ).textContent =
        `${correctCount} / 3`;

}


/* =========================
   省一覧へ戻る
========================= */

function backToProvinces() {

    showProvinceScreen();

}


/* =========================
   都市一覧へ戻る
========================= */

function backToCities() {

    showCityScreen(
        currentProvince
    );

}


/* =========================
   ステータス更新
========================= */

function updateStatus() {

    const level =
        Math.floor(totalExp / 100) + 1;


    let title =
        "中国初心者";


    if (level >= 20) {

        title = "中国学大师";

    } else if (level >= 10) {

        title = "中国通";

    } else if (level >= 5) {

        title = "中国旅行家";

    } else if (level >= 3) {

        title = "中国探险家";

    }


    document.getElementById(
        "level"
    ).textContent =
        level;


    document.getElementById(
        "exp"
    ).textContent =
        totalExp;


    document.getElementById(
        "title"
    ).textContent =
        title;


    document.getElementById(
        "visited"
    ).textContent =
        visitedCities.size;


    const currentLevelExp =
        totalExp % 100;


    document.getElementById(
        "expText"
    ).textContent =
        `${currentLevelExp} / 100 EXP`;


    document.getElementById(
        "expBar"
    ).style.width =
        `${currentLevelExp}%`;

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
        localStorage.getItem(
            "chinaQuestSave"
        );


    if (!saved) {

        return;

    }


    try {

        const saveData =
            JSON.parse(saved);


        totalExp =
            saveData.totalExp || 0;


        visitedCities =
            new Set(
                saveData.visitedCities || []
            );


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


    localStorage.removeItem(
        "chinaQuestSave"
    );


    totalExp = 0;

    visitedCities =
        new Set();

    cityAttempts =
        {};


    updateStatus();

    showProvinceScreen();

}


/* =========================
   ボタンイベント
========================= */

document.getElementById(
    "backProvince"
).addEventListener(
    "click",
    backToProvinces
);


document.getElementById(
    "backCity"
).addEventListener(
    "click",
    backToCities
);


document.getElementById(
    "resultButton"
).addEventListener(
    "click",
    backToCities
);


/* =========================
   ゲーム起動
========================= */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        startGame();

    }
);
