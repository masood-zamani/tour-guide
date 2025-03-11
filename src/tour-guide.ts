import { TourNode } from "./model";
import { Tools } from "./tools";
const _tourConfigKey = "tour-guide";

export class TourGuide {
    private modalHtml = /*html*/`
        <style>
            .target-containerX { 
                position: fixed; 
                top: 50%; 
                left: 50%; 
                width: 1px; 
                height: 1px; 
                z-index: 1000; 
                transition: all .3s ease-out, height 0s 0s, opacity .3s 0s;
                box-shadow: rgb(20 20 21 / 42%) 0px 0px 1px 2px, rgb(20 20 21 / 60%) 0px 0px 0px 1000vh;
                border: 3px solid #333;
            }
            
            .tour-containerX { 
                position: absolute;
                z-index: 1004;
                background-color: white;
                padding: 10px;
                color: #575656;
                box-shadow: 0 2px 4px #E868A2;
                border-radius: 5px;
                width: 260px;
                height: max-content;
                overflow: hidden;
                border: 1px solid #E868A2;
                transition: all .3s ease-out, height 0s 0s, opacity .3s 0s;

                & p[content] {
                    margin-top: 10px;
                    text-align: justify;
                }
            }

            .next-buttonX{
                background-color: #E868A2;
                color: white;
                width: 78px;
                height: 25px;
                border: none;
                margin-top: 8px;
                font-size: small;
                border-radius: 3px;
            }

            span[tour-info] {
                position: absolute;
                top: 3px;
                margin-right: 4px;
                font-size: large;
                color: #E868A2;
            }

            span[tour-close] {
                position: absolute;
                top: 3px;
                right: 8px;
                color:#E868A2
            }

        </style>

        <div target-tour class="target-containerX"></div>

        <div modal-tour class="tour-containerX">
            <span tour-close class="fa fa-close"></span>
            <div style="margin-top: 4px;">
                <span tour-info class="fa fa-info-circle"></span>
                <p content>{{body}}</p>
            </div>
            <div style="display: flex;gap: 5px;">
                <button prev class="next-buttonX">
                    <span style="margin-right: 3px;" class="fa fa-arrow-left"></span>
                    Previous
                </button>
                <button next class="next-buttonX">
                    <span style="margin-right: 3px;" class="fa fa-arrow-right"></span>
                    <span btn-next-title>Next</span>
                </button>
                <button  skip-tour tour-close class="next-buttonX">
                    Skip Tour
                </button>
            </div>
        </div>
    `


    private markedAsReadData: Record<string, boolean> = {}
    private targetTour!: HTMLDivElement;
    private modalRef!: HTMLDivElement;
    private content!: HTMLParagraphElement;
    private nextButton!: HTMLButtonElement;
    private nextButtonTitle!: HTMLSpanElement;
    private prevButton!: HTMLButtonElement;
    private skipTourButton!: HTMLButtonElement;
    private ui!: HTMLDivElement;
    private node: TourNode | null = null;
    private steps: TourNode[] = [];

    private static instance: TourGuide;

    private constructor() {
        if (TourGuide.instance) return TourGuide.instance;

        TourGuide.instance = this;
        
        this.listenToResize();
        this.createUI();
    }

    public static start(steps: TourNode[]) {
        new TourGuide().internalStart(steps);
    }

    public static reset(){
        let i = new TourGuide();
        i.markedAsReadData = {};
        localStorage.removeItem(_tourConfigKey);
    }

    private listenToResize(){
        window.addEventListener("resize", ()=>{
            if(this.node?.selector && document.querySelector(this.node.selector)){
                this.setPosition(document.querySelector(this.node.selector) as HTMLElement)
            }
        })
    }


    private async internalStart(steps: TourNode[]) {
        document.body.appendChild(this.ui);
        this.markedAsReadData = JSON.parse(localStorage.getItem(_tourConfigKey) || "{}");
        this.steps.push(...steps.filter(step => !this.markedAsReadData[step.selector]));
        await this.next();
    }


    private createUI() {
        let container = document.createElement('div');
        container.innerHTML = this.modalHtml;

        this.targetTour = container.querySelector('div[target-tour]') as HTMLDivElement;
        this.modalRef = container.querySelector('div[modal-tour]') as HTMLDivElement
        this.content = container.querySelector('p[content]') as HTMLParagraphElement;
        this.nextButton = container.querySelector('button[next]') as HTMLButtonElement;
        this.nextButtonTitle = container.querySelector('span[btn-next-title]') as HTMLSpanElement;
        this.prevButton = container.querySelector('button[prev]') as HTMLButtonElement;
        this.skipTourButton = container.querySelector('button[skip-tour]') as HTMLButtonElement;

        container.querySelectorAll("[tour-close]").forEach((el) => {
            el.addEventListener('click', this.close.bind(this));
        });
        this.skipTourButton.addEventListener('click', this.skipTour.bind(this))
        this.nextButton.addEventListener('click', this.next.bind(this));
        this.prevButton.addEventListener('click', this.prev.bind(this));

        this.ui = container;
    }


    private render(node: TourNode) {
        this.content.innerHTML = node.body;
        let isFirst = node === this.steps[0];
        let isLast = node === this.steps[this.steps.length - 1];

        this.prevButton.style.display = isFirst ? 'none' : 'block';
        this.skipTourButton.style.display = isLast ? 'none' : 'block';
        this.nextButtonTitle.innerText = isLast ? 'Finish' : 'Next';
    }

    private async navigate(direction: 'next' | 'previous') {
        this.modalRef.style.display = "none"
        let res = await this.getNode(direction, this.node);
        this.modalRef.style.display = "block"

        if (res) {
            this.node = res.node;
            this.render(this.node);
            res?.target?.scrollIntoView({ behavior: 'instant', block: 'start' });
            await this.setPosition(res.target);
            
            if (direction === 'next') {
                this.markAsRead();
            }
        } else {
            this.close();
        }
    }

    private async next() {
        await this.navigate('next');
    }

    private async prev() {
        await this.navigate('previous');
    }

    private close() {
        this.ui.remove();
    }

    private async getNode(type: 'next' | 'previous', node: TourNode | null): Promise<{ node: TourNode, target: HTMLElement } | null> {
        if (!this.steps.length) return null;

        if (type === 'next' && node === this.steps.at(-1)) return null;
        if (type === 'previous' && node === this.steps[0]) return null;
        let newNode: TourNode;
        if (node == null) {
            newNode = this.steps[0];
        }
        else {
            newNode = this.steps.at(this.steps.indexOf(node) + (type === 'next' ? 1 : -1)) as TourNode;
        }

        let target = await this.waitForElement(newNode.selector);
        return { node: newNode, target: target as HTMLElement };
    }

    private markAsRead() {
        if (this.node == null) return;

        this.markedAsReadData[this.node.selector] = true;
        localStorage.setItem(_tourConfigKey, JSON.stringify(this.markedAsReadData));
    }

    private async setPosition(target: HTMLElement) {
        let rect = target?.getBoundingClientRect();
        
        let targetPosition = this.getTargetPosition(rect);
        Object.assign(this.targetTour.style, targetPosition);

        let modalPosition = await this.getModalPosition(rect);
        Object.assign(this.modalRef.style, modalPosition);
    }

   private getModalPosition(rect:DOMRect | null){
        return Tools.getModalPosition(this.modalRef, rect, this.node?.position || "top")
   }

    private getTargetPosition(rect: DOMRect | null) {
        if (!rect) {
            return {
                top: '50%',
                left: '50%',
                width: '0px',
                height: '0px',
            };
        }

        const padding = this.node?.padding || 10;

        return {
            left: `${rect.left - padding / 2}px`,
            top: `${rect.top - padding / 2}px`,
            width: `${rect.width + padding}px`,
            height: `${rect.height + padding}px`
        };
    }



    private skipTour(){
        this.steps?.forEach(node => this.markedAsReadData[node.selector] = true)
        localStorage.setItem(_tourConfigKey, JSON.stringify(this.markedAsReadData || {}));
        this.close();
    }


    private async waitForElement(selector: string, timeout = 100): Promise<Element | null> {
        return new Promise((resolve, reject) => {

            // Check if the element is already present
            const element = document.querySelector(selector);
            if (element && this.isVisible(element as HTMLElement)) {
                return resolve(element);
            }

            let timeoutId: any = null;

            // MutationObserver to watch for new elements
            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el && this.isVisible(el as HTMLElement)) {
                    observer.disconnect(); // Stop observing once found
                    !!timeoutId && clearTimeout(timeoutId);
                    resolve(el);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            timeoutId = setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, timeout);
        });
    }

    // Visibility check
    private isVisible(element: HTMLElement): boolean {
        const style = window.getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
    }

}