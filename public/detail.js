const urlParams = new URLSearchParams(window.location.search);
const problemID = urlParams.get("id");
let detail = null;
window.addEventListener("DOMContentLoaded", async () => {
  await getdetail();
  console.log("查詢結果：", detail);
  setTimeout(() => {
    printDetail(detail);
  }, 20);
});

async function getdetail() {
  const res = await fetch("/api/detail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: problemID }),
  });
  detail = await res.json();
}

function printDetail(detail) {
  const tag = document.querySelector(".detailblock");

  tag.innerHTML = `
        <h1>${detail.id}：${detail.title}</h1>
        <div class="INF">
            <div><b>難度：</b>${detail.difficulty}</div>
            <div><b>題型：</b>${detail.category.join(" 、 ")}</div>
        </div>
        <div class="CODE"><b>程式碼：</b></div>
        <div class="SOL"><b>題解：</b></div>
    `;
  const tagscode = document.querySelector(".detailblock .CODE");
  const precode = document.createElement("pre");
  const code = document.createElement("code");
  code.classList.add("language-cpp");
  code.textContent = detail.code;
  precode.appendChild(code);
  tagscode.appendChild(precode);
  hljs.highlightAll();

  const tags = document.querySelector(".detailblock .SOL");
  const presol = document.createElement("pre");
  presol.classList.add("sol");
  presol.textContent = detail.solutionNote;
  tags.appendChild(presol);
}

document.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) {
      const target = e.target.closest("code");
      if (target) {
        e.preventDefault();

        const style = window.getComputedStyle(target);
        const currentSize = parseFloat(style.fontSize);

        const delta = e.deltaY < 0 ? 1.02 : 0.98;
        const newSize = Math.min(Math.max(currentSize * delta, 8), 40);

        target.style.fontSize = newSize + "px";
      }
    }

    if (e.ctrlKey) {
      const target = e.target.closest(".sol");
      if (target) {
        e.preventDefault();

        const style = window.getComputedStyle(target);
        const currentSize = parseFloat(style.fontSize);

        const delta = e.deltaY < 0 ? 1.02 : 0.98;
        const newSize = Math.min(Math.max(currentSize * delta, 8), 40);

        target.style.fontSize = newSize + "px";
      }
    }
  },
  { passive: false },
);
