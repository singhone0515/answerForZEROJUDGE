let datatosearch = null;
let result = '[]';

window.addEventListener("DOMContentLoaded", () => {
  const savedResult = JSON.parse(localStorage.getItem("searchResult"));

  if (savedResult===null) return;

  console.log("共 ", savedResult.length ," 筆");

  setTimeout(() => {
    printResult(savedResult);
  }, 50);
});

window.addEventListener("message", async (event) => {
  if (window._messageHandled) return;
  window._messageHandled = true;

  datatosearch = event.data;
  await sendToServer(datatosearch);
  
  idsortResult(result);

  console.log("搜尋結果：", result);
  console.log("共 ", result.length ," 筆");

  setTimeout(() => {
    printResult(result);
  }, 50);
});

async function sendToServer(datatosearch) {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: datatosearch,
  });
  result = await res.json();

  localStorage.setItem("searchResult", JSON.stringify(result));
}


let idAsc = true;
let diffAsc = true;
let nameAsc = true;
let categoryAsc = true;

function idsortResult(Result) {
  Result.sort((a, b) => {
    const letterA = a.id[0];
    const letterB = b.id[0];

    if (letterA !== letterB) {
      return idAsc ?
        letterA.localeCompare(letterB) :
        letterB.localeCompare(letterA);
    }

    // 字母相同 → 排數字
    const numA = Number(a.id.slice(1));
    const numB = Number(b.id.slice(1));
    return idAsc ? (numA - numB) : (numB - numA);
  });
  idAsc = !idAsc;
}

function diffsortResult(Result) {
  Result.sort((a, b) =>
    diffAsc ? (a.difficulty - b.difficulty) : (b.difficulty - a.difficulty)
  );

  diffAsc = !diffAsc;
}

function namesortResult(Result) {
  Result.sort((a, b) =>
    nameAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );

  nameAsc = !nameAsc;
}

function categorysortResult(Result) {
  Result.sort((a, b) => {
    const A = a.category;
    const B = b.category;
    const len = Math.min(A.length, B.length);

    for (let i = 0; i < len; i++) {
      const cmp = A[i].localeCompare(B[i]);
      if (cmp !== 0) return categoryAsc ? cmp : -cmp;
    }
    return categoryAsc ? (A.length - B.length) : (B.length - A.length);
  });

  // 排完以後反轉旗標
  categoryAsc = !categoryAsc;
}



function printResult(Result) {
  const tags = document.querySelector(".resultblock");
  if (Result.length === 0) {
    const text = document.querySelector(".resultblock .logdata");
    text.textContent = "查無符合資料";
    return;
  }
  tags.innerHTML = `
        <table class="resultTable">
            <tr>
                <th class="idSort">編號</th>
                <th class="nameSort">名稱</th>
                <th class="diffSort">難度</th>
                <th class="cateSort">類型</th>
                <th>題目</th>
                <th>題解</th>
            </tr>
        </table>
    `;

  const tag = document.querySelector(".resultTable");
  
  Result.forEach((item) => {
    const tr = document.createElement("tr");
    tr.classList.add("content");
    let text = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.difficulty}</td>
            <td>${item.category.join(" + ")}</td>
            <td><button class="problemsBtn problem-solution-Btn" data-id="${item.id}">點我</button></td>
            <td><button class="detailBtn problem-solution-Btn" data-id="${item.id}">點我</button></td>
        `;
    tr.innerHTML = text;
    tag.appendChild(tr);
  });
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("problemsBtn")) {
    const id = e.target.dataset.id;
    window.open(`https://zerojudge.tw/ShowProblem?problemid=${id}`, "_blank");
  }
  if (e.target.classList.contains("detailBtn")) {
    const id = e.target.dataset.id;
    window.open(`detail.html?id=${id}`, "_blank");
  }
  if (e.target.classList.contains("close")) {
    showAlert();
  }
  if (e.target.classList.contains("cencel")) {
    back();
  }
  if (e.target.classList.contains("idSort")) {
    const savedResult = JSON.parse(localStorage.getItem("searchResult"));
    idsortResult(savedResult);
    printResult(savedResult);
  }
  if (e.target.classList.contains("diffSort")) {    
    const savedResult = JSON.parse(localStorage.getItem("searchResult"));
    diffsortResult(savedResult);
    printResult(savedResult);
  }
  if (e.target.classList.contains("nameSort")) {    
    const savedResult = JSON.parse(localStorage.getItem("searchResult"));
    namesortResult(savedResult);
    printResult(savedResult);
  }
  if (e.target.classList.contains("cateSort")) {    
    const savedResult = JSON.parse(localStorage.getItem("searchResult"));
    categorysortResult(savedResult);
    printResult(savedResult);
  }
});

function showAlert() {
  const alertbox = document.getElementById("alert-window");
  const alertmsg = document.querySelector(".alert-window-content");
  alertmsg.innerHTML = "確定關閉查詢結果視窗？";
  alertbox.showModal();
  alertbox.style.display = "flex";
  document.documentElement.style.overflow = "hidden";
}

function back() {
  const alertbox = document.getElementById("alert-window");
  alertbox.classList.add("closing");
  alertbox.addEventListener(
    "animationend",
    () => {
      alertbox.classList.remove("closing");
      alertbox.close();
      alertbox.style.display = "none";
    },
    { once: true },
  );

  document.removeEventListener("animationend", () => {});
  document.documentElement.style.overflow = "auto";
}
