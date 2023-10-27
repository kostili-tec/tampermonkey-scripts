// ==UserScript==
// @name         GetLinksSM
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://gazeta.smkbr.ru/node*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @run-at document-end
// @grant GM_setClipboard
// ==/UserScript==

(function () {
  "use strict";

  init();

  function init() {
    const checkAndInit = () => {
      const getTitleContainer = document.querySelector(".form-item-title");
      if (getTitleContainer) {
        clearInterval(interval); // Остановить интервал, когда элемент найден
        const button = document.createElement("button");
        button.addEventListener("click", (e) => {
          e.preventDefault();
          getInnerData();
        });
        button.textContent = "COPY";
        getTitleContainer.append(button);
      }
    };

    const interval = setInterval(checkAndInit, 1000); // Проверять каждую секунду
  }

  function getTitle() {
    const inputTitle = document.querySelector("#edit-title");
    const titleText = inputTitle.value;
    return titleText;
  }

  function getCheckBoxes() {
    const wrapper = document.querySelector("#edit-field-rubrikagazet-und");
    console.log(wrapper);
    const checkedInputs = wrapper.querySelectorAll("input:checked");
    const labels = [];
    checkedInputs.forEach((input) => {
      const label = wrapper.querySelector(`[for="${input.id}"]`);
      const labelText = label.textContent;
      if (labelText) labels.push(labelText);
    });
    return labels;
  }

  function getInfoFromIframes() {
    const [annoucment, links] = document.querySelectorAll(
      ".cke_wysiwyg_frame.cke_reset"
    );
    console.log("annoucment", annoucment);
    console.log("links", links);
  }

  function getAnnoucment() {
    return new Promise((resolve, reject) => {
      let annoucment = "";

      const interval = setInterval(getAnnoucmentParagraph, 1000);

      function getAnnoucmentParagraph() {
        const textArea = document.querySelector(".cke_source");
        if (textArea && textArea.value) {
          clearInterval(interval);
          annoucment = textArea.value;
          document.querySelector("#cke_18").click();
          resolve(annoucment);
        }
      }

      const switchButton = document.querySelector("#cke_18");
      switchButton.click();
    });
  }

  function getLinksWithPromise() {
    return new Promise((resolve, reject) => {
      let links = "";
      const interval = setInterval(getLinksTextarea, 1000);

      function getLinksTextarea() {
        const textArea = document.querySelector(".cke_source");
        if (textArea && textArea.value) {
          clearInterval(interval);
          links = textArea.value;
          resolve(links); // Разрешить промис с данными
        }
      }

      const switchButton = document.querySelector("#cke_93");
      switchButton.click();
    });
  }

  function getMenuProps() {
    const menuWrapper = document.querySelector("#edit-menu--2");
    const inputName = menuWrapper.querySelector("#edit-menu-link-title");

    const parentSelect = menuWrapper.querySelector("#edit-menu-parent");
    const selectedOption = parentSelect.querySelector("option:checked");

    const weightSelect = menuWrapper.querySelector("#edit-menu-weight");
    const selectedWeight = weightSelect.querySelector("option:checked");

    const result = {
      name: inputName.value,
      parent: selectedOption.textContent,
      weight: selectedWeight.value,
    };

    return result;
  }

  function getAuthorInfo() {
    const authorButton = document.querySelectorAll(".vertical-tab-button")[3];
    const summary = authorButton.querySelector(".summary");
    const [author, date] = summary.textContent.split(", ");
    return { author, date };
  }

  async function getInnerData() {
    const title = getTitle();
    const checkBoxes = getCheckBoxes();
    const menuProps = getMenuProps();
    const annoucment = await getAnnoucment();
    // getInfoFromIframes()
    const links = await getLinksWithPromise();
    const authorData = getAuthorInfo();
    const result = {
      title,
      checkBoxes,
      annoucment,
      links,
      menuProps,
      authorData,
    };
    console.log(result);

    GM_setClipboard(JSON.stringify(result));

    return result;
  }
})();
