// ==UserScript==
// @name         PushLinks_OKB
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://smikbr.ru/kbp*
// @match        https://smikbr.ru/okb*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @run-at document-end
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  init();

  let overlayIFrame = null;
  let textArea = null;
  let parsedData = null;

  const titleSelector = "#edit-title";
  const checkBoxesWrapper = ".form-type-checkboxes";
  const annoucmentButton = ".link-edit-summary";
  const annoucmentSourceButton = "#cke_18";
  const sourceTextareaWrapper = "#cke_1_contents";
  const sourceTextarea = ".cke_source.cke_reset.cke_enable_context_menu";

  const souceLinksButton = "#cke_97";
  const linksWrapper = "#cke_2_contents";

  const linkMenuInput = "#edit-menu-enabled";
  const editMenu = "#edit-menu";

  const menuParentSelect = "#edit-menu-parent";
  const menuWeightSelect = "#edit-menu-weight";

  const verticalTabsList = ".vertical-tabs-list";
  const inputSynonym = "#edit-path-alias";
  const dateInput = "#edit-date";

  const senFormdButton = "#edit-submit";

  function init() {
    console.log("run");
    const checkAndInit = () => {
      overlayIFrame = document.querySelector(".overlay-active");
      if (overlayIFrame) {
        const getTitleContainer =
          overlayIFrame.contentWindow.document.querySelector(
            ".form-item-title"
          );
        if (getTitleContainer) {
          getTitleContainer.style.display = "flex";
          getTitleContainer.style.flexDirection = "column";
          getTitleContainer.style.gap = "5px";
          clearInterval(interval);
          const pushButton = document.createElement("button");
          const sendButton = document.createElement("button");
          sendButton.textContent = "SEND";
          pushButton.textContent = "PUSH";
          textArea = document.createElement("textarea");
          const h3 = document.createElement("h3");
          h3.textContent = "Сюда вставить";
          textArea.style.border = "1px solid";
          pushButton.addEventListener("click", (e) => {
            e.preventDefault();
            fillAndParse();
          });

          sendButton.addEventListener("click", (e) => {
            e.preventDefault();
            const findSendButton = findInOverlay(senFormdButton);
            findSendButton.click();
          });
          getTitleContainer.append(h3, textArea, pushButton, sendButton);
        }
      }
    };

    const interval = setInterval(checkAndInit, 1000);
    console.log("run2");
  }

  function fillAndParse() {
    parseTextArea();
    fillTitle();
    fillCheckBoxes();
    fillAnnoucment();
    fillLinks();
    fillMenu();
    fillSynonym();
    fillDate();
  }

  function findInOverlay(selector) {
    return overlayIFrame.contentWindow.document.querySelector(`${selector}`);
  }

  function fillTitle() {
    const { title } = parsedData;
    const titleInput = findInOverlay(titleSelector);
    titleInput.value = title;
  }

  function fillCheckBoxes() {
    const [firstCheck, secondCheck] = parsedData.checkBoxes;
    const wrapper = findInOverlay(checkBoxesWrapper);
    const allWrapperCheckboxes = wrapper.querySelectorAll(
      ".form-type-checkbox"
    );
    allWrapperCheckboxes.forEach((parent) => {
      const [input, label] = parent.children;
      if (label.textContent == firstCheck) {
        input.checked = true;
      }
      if (label.textContent == secondCheck) {
        input.checked = true;
      }
    });
  }

  function fillAnnoucment() {
    const annoucmentBtn = findInOverlay(annoucmentButton);
    annoucmentBtn.click();

    const sourceBtn = findInOverlay(annoucmentSourceButton);
    sourceBtn.click();

    const textareaWrapper = findInOverlay(sourceTextareaWrapper);
    const textarea = textareaWrapper.children[0];
    textarea.value = parsedData.annoucment;
    sourceBtn.click();
  }

  function fillLinks() {
    const linksSourceBtn = findInOverlay(souceLinksButton);
    linksSourceBtn.click();

    const linksWrap = findInOverlay(linksWrapper);

    const updatedLinks = replaceLinks(parsedData.links);
    linksWrap.children[0].value = updatedLinks;
  }

  function fillMenu() {
    const { parent, weight } = parsedData.menuProps;
    const menuWrapper = findInOverlay(editMenu);

    const replacedParent = parent
      .toLowerCase()
      .replace(/^[-\s]+/, "")
      .replace(/[-\s]+$/, "");

    const menuInput = menuWrapper.querySelector(linkMenuInput);
    menuInput.click();

    const selectParrent = menuWrapper.querySelector(menuParentSelect);

    const optionsParent = selectParrent.querySelectorAll("option");

    const findParentOption = Array.from(optionsParent).find((option) => {
      const replacedOption = option.textContent
        .replace(/^[-\s]+/, "")
        .replace(/[-\s]+$/, "")
        .toLowerCase();
      return replacedOption.includes(replacedParent);
    });

    /* WARNING INCORRECT PARRENT */
    if (findParentOption) {
      findParentOption.selected = true;
      const selectElement = findParentOption.parentElement;
      if (selectElement) {
        selectElement.dispatchEvent(new Event("change"));
      }
    }

    const selectWeight = menuWrapper.querySelector(menuWeightSelect);
    const optionsWeight = selectWeight.querySelectorAll("option");

    const findWeightOption = Array.from(optionsWeight).find(
      (option) => option.textContent === weight
    );

    if (findWeightOption) {
      findWeightOption.selected = true;
      const selectElement = findWeightOption.parentElement;
      if (selectElement) {
        selectElement.dispatchEvent(new Event("change"));
      }
    }
  }

  function fillSynonym() {
    const { title } = parsedData;
    const [month, year] = title.split(" ");

    const getMonth = getMonthNumber(month);

    const url = `okb${year}_${getMonth}`;

    const findInputSyn = findInOverlay(inputSynonym);
    findInputSyn.value = url;
    findInputSyn.dispatchEvent(new Event("change"));
  }

  function fillDate() {
    const { date } = parsedData.authorData;
    const findDateInput = findInOverlay(dateInput);
    findDateInput.value = date;
    findDateInput.dispatchEvent(new Event("change"));
  }

  function parseTextArea() {
    parsedData = JSON.parse(textArea.value);
    console.log(parsedData);
  }

  function getMonthNumber(monthName) {
    const monthNames = {
      январь: "01",
      февраль: "02",
      март: "03",
      апрель: "04",
      май: "05",
      июнь: "06",
      июль: "07",
      август: "08",
      сентябрь: "09",
      октябрь: "10",
      ноябрь: "11",
      декабрь: "12",
    };

    const normalizedMonthName = monthName.toLowerCase().trim();

    return monthNames[normalizedMonthName] || null;
  }

  function replaceLinks(links) {
    const updatedLinks = links.replace(
      /href="http:\/\/www.kbpravda.ru\/(\d{4})\/(\d{2})\/(\d{2}d)\.pdf/g,
      'href="/arhiv/$1/kbp/$2/$3.pdf'
    );
    return updatedLinks;
  }
})();
