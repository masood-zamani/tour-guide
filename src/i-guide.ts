import { IGuideData, IGuideHandler } from "./model";
import { Tools } from "./tools";

export class iGuide {
  private style = /*css*/ `
      [i-guide]{
          position:relative;
      }

      [i-guide]::before{
        position: absolute;
        content: '🚀';
        top: -16px;
        right: -23px;
        font-size: small;
      }
      .i-guideX{
        transform: translate(-50%, -50%);
        position: absolute;
        font-size: smaller;
        color: var(--sys-secondary-color);
        
        &:hover{
            cursor:pointer;
            font-size:large;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
      }

      .i-guide-modal{
        position: fixed;
        top: 50%;
        left: 50%;
        width: 90%;
        max-width: 500px;
        overflow:hidden;
        background: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        box-sizing: border-box;
        z-index: 1000;

        & div.i-guide-header{
          background-color: var(--sys-secondary-color);
          padding: 10px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;

          & .fa-info-circle {
            margin-right: 20px;
          }
        }

        & span.i-guide-close{
          position: absolute;
          top: 2px;
          right: 4px;
          color: white;
        }

        & div.i-guide-body{
          padding: 16px;
        }
      }
  `;

  private htmlContent = /*html*/ `<span class="fa fa-info-circle"></span>`;
  private modalHtmlContent = /*html*/ `
        <span class="i-guide-close fa fa-close"></span>
        <div class="i-guide-header">
          <span>Header</span>
          <span class="fa fa-info-circle"></span>
        </div>
        <div class="i-guide-body">
        </div>
  `;

  private static instance: iGuide;

  #handler!: IGuideHandler;
  private modalRef!: HTMLDivElement;
  private data: IGuideData[] = [];
  private modalContent!: HTMLElement;
  private modelHeader!: HTMLElement;

  public static start(data: IGuideData[]) {
    let instance = new iGuide();
    instance.data = data;
    instance.internalStart();
  }

  private constructor() {
    if (iGuide.instance) return iGuide.instance;

    iGuide.instance = this;
    this.addCSS();
    this.createUI();
  }

  private internalStart() {
    const applyToNodes = (nodes: NodeList) => {
      nodes.forEach((node) => {
        if (node instanceof HTMLElement && node.hasAttribute("i-guide")) {
          this.applyDirective(node);
        }
      });
    };

    applyToNodes(document.querySelectorAll("[i-guide]"));

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        applyToNodes(mutation.addedNodes);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  private addCSS() {
    const style = document.createElement("style");
    style.id = "i-guide";
    style.textContent = this.style;
    document.head.appendChild(style);
  }

  private createUI() {
    this.createHandler();
    this.createModal();
  }

  private applyDirective(target: HTMLElement) {
    target.addEventListener("mouseover", (evt) => {
      clearTimeout(this.#handler.__removeTimeout);
      this.addHandler(target);
    });

    target.addEventListener("mouseleave", (evt) => {
      this.removeHandler();
    });
  }

  private createHandler() {
    let div = document.createElement("div");
    div.classList.add("i-guideX");
    div.innerHTML = this.htmlContent;

    this.#handler = div as IGuideHandler;

    this.#handler.addEventListener("click", (evt) => {
      this.openModal();
    });
    this.#handler.addEventListener("mouseover", (evt) => {
      this.#handler.__isActive = true;
    });
    this.#handler.addEventListener("mouseleave", (evt) => {
      this.#handler.__isActive = false;
    });
  }

  private createModal() {
    this.modalRef = document.createElement("div");
    this.modalRef.classList.add("i-guide-modal");
    this.modalRef.innerHTML = this.modalHtmlContent;

    this.modalContent = this.modalRef.querySelector(
      ".i-guide-body"
    ) as HTMLElement;
    this.modelHeader = this.modalRef.querySelector(
      ".i-guide-header > span"
    ) as HTMLElement;

    this.modalRef
      .querySelector(".i-guide-close")
      ?.addEventListener("click", (evt) => {
        this.closeModal();
      });
  }

  private addHandler(target: HTMLElement) {
    if (this.#handler.__target === target) {
      return;
    }

    const id = target.getAttribute("i-guide");
    if (!id) {
      return;
    }
    this.#handler.__dataId = id;
    this.#handler.__target = target;
    let pos = target.getBoundingClientRect();
    this.#handler.__targetRect = pos;

    Object.assign(this.#handler.style, {
      top: pos.top + "px",
      left: pos.left + "px",
    });
    document.body.appendChild(this.#handler);
  }

  /*** we remove handler with a delay so we can check if handler is active
   *
   */
  private removeHandler() {
    if (!this.#handler.__isActive) {
      clearTimeout(this.#handler.__removeTimeout);
      this.#handler.__removeTimeout = setTimeout(() => {
        this.#handler.remove();
        this.#handler.__target = null;
        this.#handler.__dataId = null;
        this.#handler.__targetRect = null;
      }, 1000);
    }
  }

  private openModal() {
    const data = this.data.find((a) => a.id == this.#handler.__dataId);
    if (!data) {
      console.warn("there is no data with this id:", this.#handler.__dataId);
      return;
    }

    //this.modalRef.classList.add("animate__animated", "animate__zoomIn")
    document.body.appendChild(this.modalRef);
    this.modalContent.innerHTML = data.body;
    this.modelHeader.innerText = data.header;

    let modalPos = Tools.getModalPosition(
      this.modalRef,
      this.#handler.__targetRect,
      data.position
    );

    Object.assign(this.modalRef.style, modalPos);
  }

  private closeModal() {
    this.modalRef.classList.remove("animate__animated", "animate__zoomIn");
    this.modalRef.remove();
  }
}
