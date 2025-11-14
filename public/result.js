let datatosearch = null;
let result = null;

window.addEventListener("DOMContentLoaded", () => {
  
  console.log(localStorage.getItem("searchResult"));
  let savedResult = JSON.parse(localStorage.getItem("searchResult"));
  console.log(Array.isArray(savedResult));
  if (savedResult) {
    setTimeout(() => {
      printResult(savedResult);
    }, 150);
  }
});

window.addEventListener("message", async (event) => {
  if (window._messageHandled) return;
  window._messageHandled = true;

  datatosearch = event.data;
  await sendToServer(datatosearch);
  
  // sortResult();

  console.log("搜尋結果：", result);

  setTimeout(() => {
    printResult(result);
  }, 150);
});

async function sendToServer(datatosearch) {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datatosearch),
  });
  result = await res.json();
  localStorage.setItem("searchResult", result);
}

// function sortResult() {
//   result.sort((a, b) => {
//     const letterA = a.id[0];
//     const letterB = b.id[0];

//     if (letterA !== letterB) {
//       return letterA.localeCompare(letterB); // 先照字母排
//     }

//     // 字母相同 → 排數字
//     const numA = Number(a.id.slice(1));
//     const numB = Number(b.id.slice(1));
//     return numA - numB;
//   });
// }

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
                <th>編號</th>
                <th>名稱</th>
                <th>難度</th>
                <th>類型</th>
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
            <td>${JSON.parse(item.category).join(" + ")}</td>
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
