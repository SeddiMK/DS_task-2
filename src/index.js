import style from "./style.scss";
import loadingSpinner from "./assets/image/icon/ring-resize-spinner.svg";

const allFormats = ["image/jpeg", "image/jpg", "image/png"];
const maxFiles = 5;
const maxFileSize = 10 * 1024 * 1024; // 10 MB

let fileList = [];

function initializationDOM() {
  const app = document.getElementById("app");
  const title = document.createElement("h1");
  title.textContent = "Загрузчик изображений";
  app.appendChild(title);

  const description = document.createElement("p");
  description.textContent =
    "Вы можете загрузить до 5 файлов формата JPG, JPEG, PNG, размер одного из которых составляет до 10 МБ";
  app.appendChild(description);

  const form = document.createElement("form");
  form.id = "fileUploadForm";

  const dropZone = document.createElement("div");
  dropZone.id = "dropZone";
  dropZone.textContent = "Перетащите файлы сюда или нажмите, чтобы выбрать";
  dropZone.classList.add("drop-zone");

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.multiple = true;
  fileInput.accept = ".jpg, .jpeg, .png";
  fileInput.id = "fileInput";
  fileInput.style.display = "none";
  form.appendChild(fileInput);

  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("dragover", dragOver);
  dropZone.addEventListener("dragleave", dragLeave);
  dropZone.addEventListener("drop", fileDrop);

  form.appendChild(dropZone);

  const btnSubmit = document.createElement("button");
  btnSubmit.classList.add("btn-submit");
  btnSubmit.type = "submit";
  btnSubmit.textContent = "Загрузить файлы";
  form.appendChild(btnSubmit);

  const errorContainer = document.createElement("div");
  errorContainer.id = "errorContainer";
  errorContainer.classList.add("error");
  form.appendChild(errorContainer);

  const previewContainer = document.createElement("ul");
  previewContainer.id = "previewContainer";
  previewContainer.classList.add("app__images-list");
  app.appendChild(previewContainer);

  // Select сортировки
  const selectSort = document.createElement("select");
  selectSort.id = "selectSort";

  const optionName = document.createElement("option");
  optionName.value = "name";
  optionName.textContent = "Сортировать по имени";
  selectSort.appendChild(optionName);

  const optionSize = document.createElement("option");
  optionSize.value = "size";
  optionSize.textContent = "Сортировать по размеру";
  selectSort.appendChild(optionSize);

  const optionDate = document.createElement("option");
  optionDate.value = "date";
  optionDate.textContent = "Сортировать по дате загрузки";
  selectSort.appendChild(optionDate);

  selectSort.addEventListener("change", sortChange);
  form.appendChild(selectSort);

  app.appendChild(form);
  app.appendChild(previewContainer);

  fileInput.addEventListener("change", fileChange);
  form.addEventListener("submit", formSubmit);
}

// Предотвращаем открытие файла картинки если не попали на зону загрузки
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

//  Загрузить файлы
function formSubmit(event) {
  event.preventDefault();

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
        (index + 1) * 1000,
      );
    });
  }
}
// События drag and drop
function dragStart(event, index) {
  event.dataTransfer.setData("text/plain", index);
  event.target.classList.add(`selected`);
}
function dragEnd(event) {
  event.target.classList.remove(`selected`);
}
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
function dragOverItem(event) {
  event.preventDefault();
}

function dropItem(event, index) {
  detailsFile();
}

// Отрисовка информации о файле
function detailsFile() {
  const previewContainer = document.getElementById("previewContainer");
  previewContainer.innerHTML = "";

  let fileListArray = Array.from(fileList);
  const newFiles = [];

  if (fileList.length > 0) {
    [...fileList].forEach((file, index) => {
      const fileReader = new FileReader();
      const dataTransfer = new DataTransfer();
      const errorContainer = document.getElementById("errorContainer");
      const fileInput = document.getElementById("fileInput");

      let errorFlag = false;

      const fileDetails = document.createElement("div");
      fileDetails.id = "gallery"; //!!!!
      const fileBlock = document.createElement("li");
      fileBlock.classList.add("image__item");
      previewContainer.appendChild(fileBlock);
      fileBlock.draggable = true;

      fileReader.onerror = () => {
        errorFlag = true;
      };

      fileReader.readAsDataURL(file);

      fileReader.onloadend = (event) => {
        const img = document.createElement("img");
        img.src = event.target.result;

        fileDetails.innerHTML = errorFlag
          ? `<p>Ошибка чтения файла: ${file.name}</p>`
          : `<p>Имя файла: ${file.name}</p>
           <p>Формат: ${file.type}</p>
           <p>Размер: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>`;

        const removeButton = document.createElement("button");
        removeButton.classList.add("file-remove");
        removeButton.textContent = "Удалить";

        removeButton.onclick = (e) => {
          // [...fileList].splice(index, 1);
          // fileListArray.splice(index, 1);

          fileBlock.remove();

          console.log(file, "file");

          if (fileList.length > 0) {
            [...fileList].forEach((f) => {
              // console.log(f, "f");

              if (f.name !== file.name) dataTransfer.items.add(f);
            });
          }
          [...fileList] = dataTransfer.files;
          // if (errorContainer) {
          //   errorContainer.innerHTML = "";
          // }
          // fileBlock.dispatchEvent(new Event("change"));
          // console.log([...fileList], "[...fileList] btn delete");
          detailsFile();
        };

        // console.log(fileList, "fileList -----------------");

        fileBlock.appendChild(img);
        fileBlock.appendChild(fileDetails);
        fileBlock.appendChild(removeButton);
        previewContainer.appendChild(fileBlock);
      };

      // console.log(file);

      // fileReader.readAsDataURL(file);

      // Drag and Drop
      fileBlock.addEventListener("dragstart", (event) =>
        dragStart(event, index),
      );
      fileBlock.addEventListener("dragend", (event) => dragEnd(event, index));
      fileBlock.addEventListener("dragover", (event) => dragOverItem(event));
      fileBlock.addEventListener("drop", (event) => dropItem(event, index));

      // Сортировка drag over

      if (fileList > 1 && fileBlock) {
        console.log(fileList);
        sortable(document.getElementById("previewContainer"), function (item) {
          console.log(item);
        });
        // previewContainer.addEventListener("dragover", (event) =>
        //   sortDragOver(event),
        // );
      }
    });
  }
}
// Проверка на Дублирование файлов в File List загружаемого контента
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
// Проверка на Условия в File List загружаемого контента
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
        } else if (file.size > maxFileSize) {
          const error = document.createElement("p");
          error.textContent = `Превышен максимальный размер файла: ${file.name}`;
          errorContainer.appendChild(error);
        } else if (fileList.length + newArrFiles.length < maxFiles) {
          return newArrFiles.push(file);
        } else {
          const error = document.createElement("p");
          error.textContent = `Превышено допустимое количество файлов: ${maxFiles}`;
          errorContainer.appendChild(error);
        }
      } else {
        const error = document.createElement("p");
        error.textContent = "Вы выбирали уже этот файл";
        errorContainer.appendChild(error);
      }
    });
  } else {
    const error = document.createElement("p");
    error.textContent = "Вы выбирали уже этот файл";
    errorContainer.appendChild(error);
  }

  fileList.push(...newArrFiles);

  detailsFile();
}
function fileChange(event) {
  const files = Array.from(event.target.files);

  // console.log(event.target.files, "event.target");
  // console.log(files, "files");

  validationFilesAdding(files);
  // event.target.value = ""; // Сбросить параметры ввода, чтобы при необходимости можно было снова выбрать тот же файл
}
// Инициализация DOM
document.addEventListener("DOMContentLoaded", initializationDOM);
