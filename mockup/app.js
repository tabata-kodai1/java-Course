(function () {
  "use strict";

  // ---- 状態（インメモリ。バックエンドなしのモックのため、リロードで初期化される） ----
  let nextColumnId = 4;
  let nextCardId = 5;

  const state = {
    columns: [
      { id: 1, title: "未着手" },
      { id: 2, title: "進行中" },
      { id: 3, title: "完了" },
    ],
    cards: [
      { id: 1, columnId: 1, title: "カードA", description: "", dueDate: "2026-10-01", priority: "high" },
      { id: 2, columnId: 1, title: "カードB", description: "", dueDate: "", priority: "low" },
      { id: 3, columnId: 2, title: "カードC", description: "", dueDate: "", priority: "medium" },
    ],
  };

  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  const PRIORITY_LABEL = { high: "高", medium: "中", low: "低" };

  // フォームが「追加」か「編集」のどちらの対象を扱っているか保持する
  let cardModalContext = null; // { mode: 'add', columnId } | { mode: 'edit', cardId }
  let dragCardId = null;

  // ---- DOM要素 ----
  const boardEl = document.getElementById("board");
  const addColumnBtn = document.getElementById("add-column-btn");
  const cardModal = document.getElementById("card-modal");
  const cardModalTitle = document.getElementById("card-modal-title");
  const cardForm = document.getElementById("card-form");
  const cardTitleInput = document.getElementById("card-title-input");
  const cardDescInput = document.getElementById("card-desc-input");
  const cardDueInput = document.getElementById("card-due-input");
  const cardPriorityInput = document.getElementById("card-priority-input");
  const cardCancelBtn = document.getElementById("card-cancel-btn");
  const sortPriorityBtn = document.getElementById("sort-priority-btn");
  const sortDueBtn = document.getElementById("sort-due-btn");

  // ---- 描画 ----
  function render() {
    boardEl.innerHTML = "";
    state.columns.forEach((column) => {
      boardEl.appendChild(renderColumn(column));
    });
  }

  function renderColumn(column) {
    const columnEl = document.createElement("section");
    columnEl.className = "column";
    columnEl.dataset.columnId = column.id;

    const header = document.createElement("div");
    header.className = "column-header";

    const titleEl = document.createElement("div");
    titleEl.className = "column-title";
    titleEl.textContent = column.title;
    titleEl.title = "クリックして編集";
    titleEl.addEventListener("click", () => startEditColumnTitle(column, titleEl, header));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "column-delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.title = "列を削除";
    deleteBtn.addEventListener("click", () => deleteColumn(column.id));

    header.appendChild(titleEl);
    header.appendChild(deleteBtn);

    const addCardBtn = document.createElement("button");
    addCardBtn.className = "add-card-btn";
    addCardBtn.textContent = "＋ カードを追加";
    addCardBtn.addEventListener("click", () => openCardModalForAdd(column.id));

    const cardList = document.createElement("div");
    cardList.className = "card-list";
    cardList.dataset.columnId = column.id;
    attachCardListDropHandlers(cardList, column.id);

    state.cards
      .filter((card) => card.columnId === column.id)
      .forEach((card) => cardList.appendChild(renderCard(card)));

    columnEl.appendChild(header);
    columnEl.appendChild(addCardBtn);
    columnEl.appendChild(cardList);
    return columnEl;
  }

  function renderCard(card) {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.draggable = true;
    cardEl.dataset.cardId = card.id;

    const titleEl = document.createElement("p");
    titleEl.className = "card-title";
    titleEl.textContent = card.title;
    cardEl.appendChild(titleEl);

    const metaEl = document.createElement("div");
    metaEl.className = "card-meta";

    const priorityEl = document.createElement("span");
    priorityEl.className = "priority-badge priority-" + card.priority;
    priorityEl.textContent = PRIORITY_LABEL[card.priority];
    metaEl.appendChild(priorityEl);

    if (card.dueDate) {
      const dueEl = document.createElement("span");
      dueEl.className = "card-due";
      dueEl.textContent = "期日: " + card.dueDate;
      metaEl.appendChild(dueEl);
    }

    cardEl.appendChild(metaEl);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "card-delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.title = "カードを削除";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteCard(card.id);
    });
    cardEl.appendChild(deleteBtn);

    cardEl.addEventListener("click", () => openCardModalForEdit(card.id));

    cardEl.addEventListener("dragstart", () => {
      dragCardId = card.id;
      cardEl.classList.add("dragging");
    });
    cardEl.addEventListener("dragend", () => {
      cardEl.classList.remove("dragging");
      dragCardId = null;
    });

    return cardEl;
  }

  // ---- 列の操作 ----
  function addColumn() {
    const title = window.prompt("新しい列の名前を入力してください");
    if (title === null) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    state.columns.push({ id: nextColumnId++, title: trimmed });
    render();
  }

  function startEditColumnTitle(column, titleEl, header) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "column-title-input";
    input.value = column.title;
    input.maxLength = 50;

    function commit() {
      const trimmed = input.value.trim();
      if (trimmed) {
        column.title = trimmed;
      }
      render();
    }

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      } else if (e.key === "Escape") {
        render();
      }
    });

    header.replaceChild(input, titleEl);
    input.focus();
    input.select();
  }

  function deleteColumn(columnId) {
    state.columns = state.columns.filter((c) => c.id !== columnId);
    state.cards = state.cards.filter((c) => c.columnId !== columnId);
    render();
  }

  // ---- カードの操作 ----
  function openCardModalForAdd(columnId) {
    cardModalContext = { mode: "add", columnId };
    cardModalTitle.textContent = "カードを追加";
    cardTitleInput.value = "";
    cardDescInput.value = "";
    cardDueInput.value = "";
    cardPriorityInput.value = "medium";
    showCardModal();
  }

  function openCardModalForEdit(cardId) {
    const card = state.cards.find((c) => c.id === cardId);
    if (!card) return;
    cardModalContext = { mode: "edit", cardId };
    cardModalTitle.textContent = "カードを編集";
    cardTitleInput.value = card.title;
    cardDescInput.value = card.description || "";
    cardDueInput.value = card.dueDate || "";
    cardPriorityInput.value = card.priority || "medium";
    showCardModal();
  }

  function showCardModal() {
    cardModal.hidden = false;
    cardTitleInput.focus();
  }

  function hideCardModal() {
    cardModal.hidden = true;
    cardModalContext = null;
    cardForm.reset();
  }

  function deleteCard(cardId) {
    state.cards = state.cards.filter((c) => c.id !== cardId);
    render();
  }

  function handleCardFormSubmit(e) {
    e.preventDefault();
    const title = cardTitleInput.value.trim();
    if (!title) return;
    const description = cardDescInput.value.trim();
    const dueDate = cardDueInput.value;
    const priority = cardPriorityInput.value;

    if (cardModalContext.mode === "add") {
      state.cards.push({
        id: nextCardId++,
        columnId: cardModalContext.columnId,
        title,
        description,
        dueDate,
        priority,
      });
    } else if (cardModalContext.mode === "edit") {
      const card = state.cards.find((c) => c.id === cardModalContext.cardId);
      if (card) {
        card.title = title;
        card.description = description;
        card.dueDate = dueDate;
        card.priority = priority;
      }
    }

    hideCardModal();
    render();
  }

  // ---- ドラッグ＆ドロップ ----
  function attachCardListDropHandlers(cardListEl, columnId) {
    cardListEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      cardListEl.classList.add("drag-over-slot");
    });
    cardListEl.addEventListener("dragleave", () => {
      cardListEl.classList.remove("drag-over-slot");
    });
    cardListEl.addEventListener("drop", (e) => {
      e.preventDefault();
      cardListEl.classList.remove("drag-over-slot");
      if (dragCardId === null) return;

      const card = state.cards.find((c) => c.id === dragCardId);
      if (!card) return;

      // ドロップ位置に一番近いカードの直前に挿入する
      const afterElement = getDragAfterElement(cardListEl, e.clientY);
      const cardsWithoutDragged = state.cards.filter((c) => c.id !== dragCardId);
      card.columnId = columnId;

      let insertIndex;
      if (afterElement == null) {
        insertIndex = cardsWithoutDragged.length;
      } else {
        const afterCardId = Number(afterElement.dataset.cardId);
        insertIndex = cardsWithoutDragged.findIndex((c) => c.id === afterCardId);
      }
      cardsWithoutDragged.splice(insertIndex, 0, card);
      state.cards = cardsWithoutDragged;

      render();
    });
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".card:not(.dragging)")];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
        return closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }

  // ---- 並び替え（ボタン押下時のみ一括で並べ替える。それ以外はD&Dで自由に並び替え可能） ----
  function sortByPriority() {
    state.cards.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    render();
  }

  function sortByDueDate() {
    state.cards.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1; // 期日未設定は後ろに回す
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
    render();
  }

  // ---- イベント登録 ----
  addColumnBtn.addEventListener("click", addColumn);
  sortPriorityBtn.addEventListener("click", sortByPriority);
  sortDueBtn.addEventListener("click", sortByDueDate);
  cardCancelBtn.addEventListener("click", hideCardModal);
  cardForm.addEventListener("submit", handleCardFormSubmit);
  cardModal.addEventListener("click", (e) => {
    if (e.target === cardModal) hideCardModal();
  });

  render();
})();
