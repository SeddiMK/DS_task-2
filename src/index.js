import style from "./style.scss";
import loadingSpinner from "./assets/image/icon/ring-resize-spinner.svg";

const allFormats = ["image/jpeg", "image/jpg", "image/png"];
const maxFiles = 5;
const maxFileSize = 10 * 1024 * 1024; // 10 MB

let fileList = [];

function initializationDOM() {
  const app = document.getElementById("app");
  app.classList.add("app");

  const cnt = document.createElement("section");
  cnt.classList.add("app__container", "container");

  const title = document.createElement("h1");
  title.classList.add("app__title");
  title.textContent = "Загрузчик изображений";

  const description = document.createElement("p");
  description.classList.add("app__condition");
  description.textContent =
    "Вы можете загрузить до 5 файлов формата JPG, JPEG, PNG, размер одного из которых составляет до 10 МБ";

  const form = document.createElement("form");
  form.id = "fileUploadForm";
  form.classList.add("app__form", "form");

  const fileInput = document.createElement("input");
  fileInput.id = "fileInput";
  fileInput.classList.add("form__inp");
  fileInput.type = "file";
  fileInput.name = "images_upload";
  fileInput.multiple = true;
  fileInput.accept = ".jpg, .jpeg, .png";
  fileInput.style.display = "none";

  const dropZone = document.createElement("div");
  dropZone.classList.add("app__drop-zone", "drop-zone");
  dropZone.id = "dropZone";
  dropZone.textContent = "Перетащите файлы сюда или нажмите, чтобы выбрать";
  // drag and drop
  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("dragover", dragOver);
  dropZone.addEventListener("dragleave", dragLeave);
  dropZone.addEventListener("drop", fileDrop);

  const btnSubmit = document.createElement("button");
  btnSubmit.classList.add("app__btn-submit", "btn", "btn-submit");
  btnSubmit.type = "submit";
  btnSubmit.textContent = "Загрузить файлы";

  const previewContainer = document.createElement("ul");
  previewContainer.id = "previewContainer";
  previewContainer.classList.add("app__images-list", "image");

  // Select сортировки
  const selectSort = document.createElement("select");
  selectSort.classList.add("form__select", "select");
  selectSort.id = "selectSort";

  const optionName = document.createElement("option");
  optionName.value = "name";
  optionName.textContent = "Сортировать по имени";

  const optionSize = document.createElement("option");
  optionSize.value = "size";
  optionSize.textContent = "Сортировать по размеру";

  const optionDate = document.createElement("option");
  optionDate.value = "date";
  optionDate.textContent = "Сортировать по дате загрузки";

  selectSort.addEventListener("change", sortChange);

  const errorContainer = document.createElement("div");
  errorContainer.classList.add("error");
  errorContainer.id = "errorContainer";

  app.appendChild(cnt);
  cnt.appendChild(title);
  cnt.appendChild(description);
  cnt.appendChild(previewContainer);
  form.appendChild(fileInput);
  form.appendChild(dropZone);
  form.appendChild(btnSubmit);
  form.appendChild(selectSort);
  form.appendChild(errorContainer);

  selectSort.appendChild(optionName);
  selectSort.appendChild(optionSize);
  selectSort.appendChild(optionDate);

  cnt.appendChild(form);
  cnt.appendChild(previewContainer);

  fileInput.addEventListener("change", fileChange);
  form.addEventListener("submit", (event) => formSubmit(event, form));
}

// Предотвращаем открытие файла картинки если не попали на зону загрузки или отпустили в другом месте
window.addEventListener(
  "dragover",
  (event) => {
    event.preventDefault();
  },
  false,
);
window.addEventListener(
  "drop",
  (event) => {
    event.preventDefault();
  },
  false,
);

// События drag and drop
// drop input
function dragOver(event) {
  event.preventDefault();
  const dropZone = document.getElementById("dropZone");
  dropZone.classList.add("drag-over-hover");
}

function dragLeave(event) {
  event.preventDefault();
  const dropZone = document.getElementById("dropZone");
  dropZone.classList.remove("drag-over-hover");
}

function fileDrop(event) {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files);
  const dropZone = document.getElementById("dropZone");
  dropZone.classList.remove("drag-over-hover");

  validationFilesAdding(files);
}

// drag and drop сортировка list image items-описание
function dragStartItem(event) {
  hoveredItems();
  if (event.target.classList.contains("image-desc__item")) {
    event.target.classList.add("selected");
    event.dataTransfer.effectAllowed = "move";
  }
}

function dropItem(event) {
  event.preventDefault();

  const previewContainer = document.getElementById("previewContainer");
  const draggedItem = document.querySelector(".image-desc__item.selected");
  const targetItem = event.target.closest("li.image-desc__item");

  if (
    targetItem &&
    targetItem !== draggedItem &&
    targetItem.classList.contains("image-desc__item")
  ) {
    // Определяем, перемещается элемент вниз или вверх
    const isMovingDown =
      draggedItem.compareDocumentPosition(targetItem) &
      Node.DOCUMENT_POSITION_FOLLOWING;

    if (isMovingDown) {
      // Двигаясь вниз, вставить перед следующим родственником
      previewContainer.insertBefore(draggedItem, targetItem.nextSibling);
    } else {
      // Двигаясь вверх, вставить непосредственно перед
      previewContainer.insertBefore(draggedItem, targetItem);
    }
  }

  draggedItem.classList.remove("selected");
  targetItem.classList.remove("hovered");
}

function dragEndItem(event) {
  event.target.classList.remove("selected");
  document
    .querySelectorAll(".image__item.hovered")
    .forEach((item) => item.classList.remove("hovered"));
}

function hoveredItems() {
  const previewContainer = document.getElementById("previewContainer");
  const listItems = previewContainer.querySelectorAll(".image-desc__item");

  listItems.forEach((el) => {
    el.ondragenter = () => setTimeout(() => el.classList.add("hovered"), 2);
    el.ondragleave = () => el.classList.remove("hovered");
  });

  const findParent = event.target.closest("li.image-desc__item");
  if (findParent) {
    findParent.classList.add("hovered");
  }
}

// Отрисовка информации о файле
function detailsFile() {
  const previewContainer = document.getElementById("previewContainer");
  previewContainer.innerHTML = "";

  if (fileList.length > 0) {
    [...fileList].forEach((file, index) => {
      const fileReader = new FileReader();
      const dataTransfer = new DataTransfer();

      let errorFlag = false;

      const fileDetails = document.createElement("div");
      fileDetails.classList.add("image-desc__description");
      const fileBlock = document.createElement("li");
      fileBlock.classList.add("image-desc__item");
      previewContainer.appendChild(fileBlock);
      fileBlock.draggable = true;

      fileReader.onerror = () => {
        errorFlag = true;
      };
      fileReader.readAsDataURL(file);

      fileReader.onloadend = (event) => {
        const img = document.createElement("img");
        img.draggable = false;
        img.classList.add("image-desc__img", "img");
        img.src = event.target.result;

        fileDetails.innerHTML = errorFlag
          ? `<p class="image-desc__text-error">Ошибка чтения файла: ${file.name}</p>`
          : `<p class="image-desc__text-name">Имя файла: ${file.name}</p>
           <p>Формат: ${file.type}</p>
           <p class="image-desc__text-size">Размер: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>`;

        const removeButton = document.createElement("button");
        removeButton.classList.add("image-desc__btn-remove", "file-remove");
        removeButton.textContent = "Удалить";

        removeButton.onclick = (e) => {
          fileBlock.remove();

          if (fileList.length > 0) {
            [...fileList].forEach((f) => {
              if (f.name !== file.name) dataTransfer.items.add(f);
            });
          }
          [...fileList] = dataTransfer.files;

          detailsFile();
        };

        fileBlock.appendChild(img);
        fileBlock.appendChild(fileDetails);
        fileBlock.appendChild(removeButton);
        previewContainer.appendChild(fileBlock);
      };

      // Drag and Drop
      previewContainer.addEventListener("dragstart", (event) =>
        dragStartItem(event, index),
      );
      fileBlock.addEventListener("dragend", (event) =>
        dragEndItem(event, index),
      );
      previewContainer.addEventListener("dragover", (event) =>
        event.preventDefault(),
      );
      previewContainer.addEventListener("drop", dropItem);

      // Для сенсоров
      previewContainer.addEventListener(
        "touchstart",
        (event) => dragStartItem(event, index),
        false,
      );
      previewContainer.addEventListener("touchmove", dropItem, false);
    });
  }
}

// Проверка на дублирование файлов в File List загружаемого контента
function isDuplicateFileList(file) {
  if (fileList) {
    return fileList.some(
      (existingFile) =>
        existingFile.name === file.name && existingFile.size === file.size,
    );
  } else {
    const error = document.createElement("p");
    error.textContent =
      "Произошла непредвиденная ошибка :) Попробуйте обновить страницу.";
    errorContainer.appendChild(error);
  }
}

function validationFilesAdding(files) {
  const newArrFiles = [];
  const errorContainer = document.getElementById("errorContainer");
  errorContainer.innerHTML = "";

  if (files.length > 0) {
    files.forEach((file) => {
      if (!isDuplicateFileList(file)) {
        if (!allFormats.includes(file.type)) {
          const error = document.createElement("p");
          error.textContent = `Недопустимый формат файла: ${file.name}`;
          errorContainer.appendChild(error);
          return false;
        } else if (file.size > maxFileSize) {
          const error = document.createElement("p");
          error.textContent = `Превышен максимальный размер файла: ${file.name}`;
          errorContainer.appendChild(error);
          return false;
        } else if (fileList.length + newArrFiles.length < maxFiles) {
          newArrFiles.push(file);
          return true;
        } else {
          const error = document.createElement("p");
          error.textContent = `Превышено допустимое количество файлов: ${maxFiles}`;
          errorContainer.appendChild(error);
          return false;
        }
      } else {
        const error = document.createElement("p");
        error.textContent = "Вы выбирали уже этот файл";
        errorContainer.appendChild(error);
        return false;
      }
    });
  } else {
    const error = document.createElement("p");
    error.textContent = "Вы выбирали уже этот файл";
    errorContainer.appendChild(error);
    return false;
  }

  fileList.push(...newArrFiles);

  detailsFile();
}

/* eslint-disable no-param-reassign */
function fileChange(event) {
  const files = Array.from(event.target.files);

  validationFilesAdding(files);
}

// Сортировка select
function sortChange(event) {
  const sortBy = event.target.value;

  fileList.sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "size") {
      return a.size - b.size;
    }
    if (sortBy === "date") {
      return a.lastModified - b.lastModified;
    }
    return 0;
  });

  detailsFile();
}

//  Загрузить файлы
function formSubmit(event, form) {
  event.preventDefault();

  // Отправка файлов на backend
  if (form && fileList.length > 0) {
    const formData = new FormData(form);

    console.table([...formData.entries()]);

    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then(() => console.log("Файлы загружены (Имитация)"))
      .catch((reason) => console.error(reason));
  }

  const errorContainer = document.getElementById("errorContainer");
  errorContainer.innerHTML = "";
  if (fileList.length === 0) {
    errorContainer.textContent = "Файлы для загрузки не выбраны.";
    return;
  }

  // Имитация загрузки файла
  const previewContainer = document.getElementById("previewContainer");
  previewContainer.innerHTML = "";

  if (fileList.length > 0) {
    [...fileList].forEach((file, index) => {
      const fileBlock = document.createElement("li");
      fileBlock.classList.add("image__item");

      const loadingText = document.createElement("p");
      loadingText.textContent = `Загрузка ${file.name}...`;
      loadingText.classList.add("loading");

      const spinnerLoading = document.createElement("img");
      spinnerLoading.src = loadingSpinner;

      fileBlock.appendChild(loadingText);
      fileBlock.appendChild(spinnerLoading);
      previewContainer.appendChild(fileBlock);

      setTimeout(
        () => {
          spinnerLoading.src = "";
          loadingText.textContent = `Файл ${file.name} успешно загружен!`;
          fileList = [];
        },
        (index + 1) * 2000,
      );
    });
  }
}

// Инициализация DOM
document.addEventListener("DOMContentLoaded", initializationDOM);
