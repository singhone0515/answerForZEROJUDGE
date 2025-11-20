const categoryList = document.querySelector(".type-window-content");
window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/api/categories");
  const categories = await res.json();

  categories.sort((a, b) => Number(a.id) - Number(b.id));
  
  localStorage.setItem("cateResult", JSON.stringify(categories));

  categoryList.innerHTML = "";
  categories.forEach((cate) => {
    const label = document.createElement("label");
    label.classList.add("cate-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = cate.category;

    label.appendChild(checkbox);
    label.append(" " + cate.category);

    categoryList.appendChild(label);
  });
});

const inputID = document.querySelector(".form-row-id input");
const inputName = document.querySelector(".form-row-name input");
let typeList = [];
let typetmp = [];

inputID.addEventListener("input", checkInputState);
inputName.addEventListener("input", checkInputState);

/*難度條處理*/
let inputDifficulty = -1;
document.querySelectorAll(".star-selector span").forEach((star) => {
  star.addEventListener("click", () => {
    inputDifficulty = Number(star.dataset.value);
    checkInputState();
    document.querySelectorAll(".star-selector span").forEach((s) => {
      s.classList.remove("selected");
    });

    star.classList.add("selected");
  });

  star.addEventListener("mouseenter", () => {
    document.querySelectorAll(".star-selector span").forEach((s) => {
      s.classList.remove("selected");
    });
  });

  star.addEventListener("mouseleave", () => {
    let index = 10 - inputDifficulty;
    document.querySelectorAll(".star-selector span").forEach((s, i) => {
      if (i >= index) {
        s.classList.add("selected");
      }
    });
  });
});

const clearbtn = document.getElementById("clear-search-btn");

clearbtn.addEventListener("click", () => {
  inputID.value = "";
  inputName.value = "";
  document.querySelectorAll(".star-selector span").forEach((star) => {
    star.classList.remove("selected");
  });
  inputDifficulty = -1;
  const inputType = document.querySelectorAll(
    '.type-window-content input[type="checkbox"]:checked',
  );
  inputType.forEach((box) => {
    box.checked = false;
  });
  typeList = [];
  typetmp = [];
  checkcheckedState();
  checkInputState();
  checkTagState();
});

const addbtn = document.getElementById("addTag");
const tagContainer = document.getElementById("tagContainer");

function isValidId(str) {
  return /^[a-zA-Z][0-9][0-9][0-9]$/.test(str);
}

addbtn.addEventListener("click", () => {
  const idval = inputID.value.trim();
  const nameval = inputName.value.trim();
  const difficultyval = inputDifficulty;
  const typeText = typeList.join(" & ");

  if (!idval && !nameval && difficultyval === -1 && !typeText) return;
  const text = `題號：[ ${idval || "無"} ] & 名稱：[ ${nameval || "無"} ] & 難度：[ ${difficultyval === -1 ? "無" : difficultyval} ] & 題型：[ ${typeText || "無"} ]`;
  console.log(text);

  const exists = Array.from(tagContainer.children).some(
    (tag) => tag.textContent.replace("×", "").trim() === text,
  );

  if (exists) {
    const text = "⚠️ 已加入過此條目！ ⚠️";
    showAlert(text);

    return;
  }

  if (idval && !isValidId(idval)) {
    const text = "⚠️ 題號格式錯誤！ ⚠️<br>正確範例：A001 或 a001。";
    showAlert(text);
    inputID.value = "";
    return;
  }

  checkInputState();
  const tag = document.createElement("div");
  tag.className = "tag";
  tag.dataset.id = idval;
  tag.dataset.name = nameval;
  tag.dataset.difficulty = difficultyval;
  tag.dataset.inputType = JSON.stringify(typeList);
  tag.innerHTML = `<div class="textContent">${text}</div><span class="remove">×</span>`;
  tagContainer.appendChild(tag);

  inputID.value = "";
  inputName.value = "";
  document.querySelectorAll(".star-selector span").forEach((star) => {
    star.classList.remove("selected");
  });
  inputDifficulty = -1;
  const inputType = document.querySelectorAll(
    '.type-window-content input[type="checkbox"]:checked',
  );
  inputType.forEach((box) => {
    box.checked = false;
  });
  typeList = [];
  typetmp = [];
  checkcheckedState();
  checkInputState();
  checkTagState();
});

const selectAll = document.getElementById("all-search-btn");

selectAll.addEventListener("click", () => {
  const newWin = window.open("result.html", "_blank");

  localStorage.removeItem("searchResult");

  let data = [];
  const onedata = {
    id: "ALL",
    name: "",
    difficulty: -1,
    category: "[]",
  };

  data.push(onedata);
  newWin.onload = () => {
    newWin.postMessage(JSON.stringify(data), "*");
  };
});

tagContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove")) {
    e.target.parentElement.remove();
    checkcheckedState();
    checkInputState();
    checkTagState();
    return;
  }

  const tag = e.target.closest(".tag");
  if (!tag) return;

  const text = tag.textContent.replace("×", "").trim();
  inputID.value = tag.dataset.id;
  inputName.value = tag.dataset.name;
  inputDifficulty = Number(tag.dataset.difficulty);
  typeList = JSON.parse(tag.dataset.inputType);
  typetmp = JSON.parse(tag.dataset.inputType);
  document.querySelectorAll(".star-selector span").forEach((s) => {
    s.classList.remove("selected");
  });
  if (inputDifficulty !== -1) {
    document.querySelectorAll(".star-selector span").forEach((s) => {
      if (Number(s.dataset.value) <= inputDifficulty) {
        s.classList.add("selected");
      }
    });
  }

  const inputType = document.querySelectorAll(
    '.type-window-content input[type="checkbox"]:checked',
  );
  inputType.forEach((box) => {
    box.checked = false;
  });

  typeList.forEach((type) => {
    const target = document.querySelector(
      `.type-window-content input[type="checkbox"][value="${type}"]`,
    );
    target.checked = true;
  });

  checkcheckedState();
  checkInputState();
  checkTagState();
});

const typebtn = document.getElementById("select-display");
const typemodal = document.getElementById("type-window");
const typeclear = document.getElementById("typeclear");
const typecencel = document.getElementById("typecencel");
const typecheck = document.getElementById("typecheck");

typebtn.addEventListener("click", () => {
  checkcheckedState();
  typemodal.showModal();

  const inputType = document.querySelectorAll(
    '.type-window-content input[type="checkbox"]:checked',
  );
  typetmp = Array.from(inputType).map((box) => box.value);
  document.documentElement.style.overflow = "hidden";
  typemodal.style.display = "flex";
  const checked = document.querySelectorAll(
    '.type-window-content input[type="checkbox"]',
  );

  checked.forEach((box) => {
    box.addEventListener("change", () => {
      const inputType = document.querySelectorAll(
        '.type-window-content input[type="checkbox"]:checked',
      );
      typetmp = Array.from(inputType).map((box) => box.value);
      checkcheckedState();
    });
  });
});

typeclear.addEventListener("click", () => {
  console.log("clear");

  const inputType = document.querySelectorAll(
    '.type-window-content input[type="checkbox"]:checked',
  );
  inputType.forEach((box) => {
    box.checked = false;
  });

  typetmp = [];
  checkcheckedState();
});

typecencel.addEventListener("click", () => {
  const inputType = document.querySelectorAll(
    '.type-window-content input[type="checkbox"]:checked',
  );
  inputType.forEach((box) => {
    box.checked = false;
  });

  typeList.forEach((type) => {
    const target = document.querySelector(
      `.type-window-content input[type="checkbox"][value="${type}"]`,
    );
    target.checked = true;
  });

  typetmp = [...typeList];

  typemodal.classList.add("closing");
  typemodal.addEventListener(
    "animationend",
    () => {
      typemodal.classList.remove("closing");
      typemodal.close();
      typemodal.style.display = "none";
    },
    { once: true },
  );

  console.log("cencel");

  document.documentElement.style.overflow = "auto";
  checkcheckedState();
  checkInputState();
});
typecheck.addEventListener("click", () => {
  const inputType = document.querySelectorAll(
    '.type-window-content input[type="checkbox"]:checked',
  );
  typeList = Array.from(inputType).map((box) => box.value);
  typetmp = Array.from(inputType).map((box) => box.value);
  if (typetmp.length > 5) {
    const text = "⚠️ 至多選擇五種！ ⚠️";
    showAlert(text);
    return;
  }

  typemodal.classList.add("closing");
  typemodal.addEventListener(
    "animationend",
    () => {
      typemodal.classList.remove("closing");
      typemodal.close();
      typemodal.style.display = "none";
    },
    { once: true },
  );
  console.log("check");

  document.removeEventListener("animationend", () => {});
  document.documentElement.style.overflow = "auto";
  checkInputState();
  checkcheckedState();
});

const search = document.getElementById("go-to-search");

search.addEventListener("click", () => {
  const newWin = window.open("result.html", "_blank");
  let data = [];
  const searchItem = document.querySelectorAll("#tagContainer .tag");

  localStorage.removeItem("searchResult");

  searchItem.forEach((item) => {
    data.push({
      id: item.dataset.id,
      name: item.dataset.name,
      difficulty: Number(item.dataset.difficulty),
      category: item.dataset.inputType,
    });
  });

  newWin.onload = () => {
    newWin.postMessage(JSON.stringify(data), "*");
  };
});

function checkInputState() {
  const idFilled = inputID.value.trim() !== "";
  const nameFilled = inputName.value.trim() !== "";
  const diffSelected = inputDifficulty !== -1;
  const typeSelected = typeList.length !== 0;

  if (idFilled || nameFilled || diffSelected || typeSelected) {
    addbtn.disabled = false;
    clearbtn.disabled = false;
  } else {
    addbtn.disabled = true;
    clearbtn.disabled = true;
  }
}

function checkcheckedState() {
  const status = document.getElementById("type-status");
  status.textContent =
    typetmp.length !== 0 ? `已選擇 ${typetmp.length} 種題型` : "未選擇題型";

  const typeSelected = typetmp.length !== 0;

  if (typeSelected) {
    typeclear.disabled = false;
  } else {
    typeclear.disabled = true;
  }
}

function checkTagState() {
  let exists = tagContainer.children.length !== 0;
  if (exists) {
    search.disabled = false;
  } else {
    search.disabled = true;
  }
}

document.addEventListener("mousedown", (e) => {
  if (e.target.closest("footer")) return;
  window.getSelection()?.removeAllRanges();
});

const alertbox = document.getElementById("alert-window");
const alertmsg = document.querySelector(".alert-window-content");

function showAlert(text) {
  alertmsg.innerHTML = text;
  alertbox.showModal();
  alertbox.style.display = "flex";
  document.documentElement.style.overflow = "hidden";

  setTimeout(() => {
    function closeAlert() {
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

      document.removeEventListener("click", closeAlert);
      document.removeEventListener("keydown", closeAlert);
      document.documentElement.style.overflow = "auto";
    }

    // ✅ 分開監聽兩種事件
    document.addEventListener("click", closeAlert, { once: true });
    document.addEventListener("keydown", closeAlert, { once: true });
  }, 500);
  checkTagState();
  checkInputState();
}
