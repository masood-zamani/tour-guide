export class Tools {
  public static getModalPosition(
    modalRef: HTMLElement,
    targetRect: DOMRect | null,
    position: "top" | "right" | "left" | "bottom"
  ) {
    if (!targetRect) {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    setTimeout(() => {
      this.adjustTourContainerPosition(modalRef);
    }, 200);

    let modalRect = modalRef.getBoundingClientRect();

    const tourContainerWidth = modalRect.width;
    const tourContainerHeight = modalRect.height;
    const centerX =
      targetRect.left + targetRect.width / 2 - tourContainerWidth / 2;
    const centerY =
      targetRect.top + targetRect.height / 2 - tourContainerHeight / 2;

    const positions = {
      top: {
        left: `${Math.max(centerX, 0)}px`,
        top: `${targetRect.top - tourContainerHeight - 10}px`,
        bottom: "",
        right: "",
      },
      bottom: {
        left: `${Math.max(centerX, 0)}px`,
        top: `${targetRect.top + targetRect.height + 10}px`,
        right: "",
        bottom: "",
      },
      right: {
        left: `${targetRect.left + targetRect.width + 10}px`,
        top: `${Math.max(centerY, 0)}px`,
        right: "",
        bottom: "",
      },
      left: {
        right: `${window.innerWidth - targetRect.left + 10}px`,
        top: `${Math.max(centerY, 0)}px`,
        left: "",
        bottom: "",
      },
      default: {
        left: `${targetRect.left}px`,
        top: `${targetRect.top + targetRect.height + 10}px`,
        right: "",
        bottom: "",
      },
    };

    let pos = positions[position] || positions.default;

    return {
      ...pos,
      transform: "", //reset
    };
  }

  private static adjustTourContainerPosition(modalRef:HTMLElement) {
    const tourContainer = modalRef;
    if (!tourContainer) return;

    const tourContainerRect = tourContainer.getBoundingClientRect();
    if (tourContainerRect.left < 0) {
        tourContainer.style.left = '0px';
    } else if (tourContainerRect.right > window.innerWidth) {
        tourContainer.style.left = `${window.innerWidth - tourContainerRect.width}px`;
    } else if (tourContainerRect.top < 0) {
        tourContainer.style.top = '0px';
    } else if (tourContainerRect.bottom > window.innerHeight) {
        tourContainer.style.top = `${window.innerHeight - tourContainerRect.height}px`;
    }
}
}
