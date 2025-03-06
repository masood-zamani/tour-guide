export class iGuide {
  
  private htmlContent = /*html*/`
    <style>
      .i-guideX{
        position:fixed;
      }
    </style>
    <span class="i-guideX fa fa-info"></span>
  `
  
  private static instance: iGuide;

  constructor() {
    if (iGuide.instance) return iGuide.instance;

    iGuide.instance = this;
  }

  private internalStart() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === 1 &&
            node instanceof HTMLElement &&
            node.hasAttribute("data-tooltip")
          ) {
            this.applyDirective(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  private applyDirective(target: HTMLElement) {
    target.addEventListener("mouseover", (evt) => {
      console.log("directive added");
    });

    target.addEventListener("mouseleave", (evt) => {
      console.log("directive remove");
    });
  }
}
